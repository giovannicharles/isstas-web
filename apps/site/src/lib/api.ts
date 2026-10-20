export class ApiError extends Error {
  constructor(
    public status: number,
    public type: string,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
  }
}

const BASE: string = import.meta.env.VITE_API_URL ?? '/api/v1';

type Query = Record<string, string | number | boolean | undefined | null>;

function qs(params: Query = {}): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return entries.length ? '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString() : '';
}

/** Appel JSON a l'API publique. La langue est toujours transmise. */
export async function api<T>(path: string, opts: { locale: string; params?: Query; method?: 'GET' | 'POST'; body?: unknown | FormData } = { locale: 'fr' }): Promise<T> {
  const { locale, params, method = 'GET', body } = opts;

  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const res = await fetch(`${BASE}${path}${qs({ ...params, locale })}`, {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Accept-Language': locale,
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? (isForm ? (body as FormData) : JSON.stringify(body)) : undefined,
  });

  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const e = json?.error;
    throw new ApiError(res.status, e?.type ?? 'http_error', e?.message ?? res.statusText, e?.details);
  }
  return (json && 'data' in json ? json.data : json) as T;
}

export const eur = undefined; // (reserve)