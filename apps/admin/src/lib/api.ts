export class ApiError extends Error {
  constructor(
    public status: number,
    public type: string,
    message: string,
    public details?: Record<string, string[]>,
    /** Secondes avant de pouvoir reessayer (429, en-tete Retry-After). */
    public retryAfter?: number,
  ) {
    super(message);
  }
}

const BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';
const ORIGIN: string = import.meta.env.VITE_API_ORIGIN ?? BASE.replace(/\/api\/v1$/, '');

function xsrf(): string {
  const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
  return m ? decodeURIComponent(m[1]!) : '';
}

let csrfReady = false;
async function ensureCsrf() {
  if (csrfReady) return;
  await fetch(`${ORIGIN}/sanctum/csrf-cookie`, { credentials: 'include' });
  csrfReady = true;
}

/** Une session est-elle ouverte ? Evite d'annoncer « session expiree » sur la page de connexion. */
let sessionActive = false;
export const markSession = (active: boolean) => { sessionActive = active; };

/** Requetes en cours : alimente la barre de progression en haut de l'ecran. */
let inflight = 0;
const busy = (delta: number) => {
  inflight = Math.max(0, inflight + delta);
  window.dispatchEvent(new CustomEvent('isstas:busy', { detail: inflight }));
};

type Query = Record<string, string | number | boolean | undefined | null>;

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown; params?: Query; raw?: boolean } = {}): Promise<T> {
  const method = opts.method ?? 'GET';
  const q = opts.params ? '?' + new URLSearchParams(Object.entries(opts.params).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => [k, String(v)])).toString() : '';
  const isForm = opts.body instanceof FormData;

  let res: Response;
  busy(1);
  try {
    if (method !== 'GET') await ensureCsrf();
    res = await fetch(`${BASE}/admin${path}${q}`, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(method !== 'GET' ? { 'X-XSRF-TOKEN': xsrf() } : {}),
        ...(opts.body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      },
      body: opts.body ? (isForm ? (opts.body as FormData) : JSON.stringify(opts.body)) : undefined,
    });
  } catch {
    busy(-1);
    throw new ApiError(0, 'network', navigator.onLine ? 'Le serveur ne répond pas. Réessayez dans un instant.' : 'Vous êtes hors connexion. Vérifiez votre accès internet.');
  }

  const json = res.status === 204 ? null : await res.json().catch(() => null);
  busy(-1);
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    if (res.status === 401 && sessionActive) {
      sessionActive = false;
      window.dispatchEvent(new Event('isstas:unauthenticated'));
    }
    const e = json?.error;
    const retry = Number(res.headers.get('Retry-After'));
    throw new ApiError(res.status, e?.type ?? 'http_error', e?.message ?? res.statusText, e?.details, Number.isFinite(retry) && retry > 0 ? retry : undefined);
  }
  return opts.raw ? (json as T) : ((json && 'data' in json ? json.data : json) as T);
}