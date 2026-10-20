import { useEffect, useRef, useState } from 'react';
import { api, ApiError } from './api';

type State<T> = { data: T | null; loading: boolean; error: ApiError | null };
const cache = new Map<string, unknown>();

/** Delai entre deux verifications silencieuses quand l'onglet est visible (l'ETag rend la verification quasi gratuite). */
const REFRESH_MS = 30_000;

/**
 * Lecture d'une ressource publique, toujours a jour : donnees du cache affichees tout de suite, puis revalidation
 * au retour sur l'onglet et toutes les 30 s. Une modification faite dans l'admin apparait donc sans recharger la page.
 */
export function useApi<T>(path: string | null, locale: string, params?: Record<string, string | number | undefined>): State<T> {
  const key = path ? `${locale}|${path}|${JSON.stringify(params ?? {})}` : null;
  const [state, setState] = useState<State<T>>(() => ({
    data: key && cache.has(key) ? (cache.get(key) as T) : null,
    loading: !!key && !cache.has(key),
    error: null,
  }));
  const last = useRef<string>('');

  useEffect(() => {
    if (!path || !key) return;
    let live = true;
    const cached = cache.has(key);
    if (cached) {
      last.current = JSON.stringify(cache.get(key));
      setState({ data: cache.get(key) as T, loading: false, error: null });
    } else {
      setState((s) => ({ ...s, loading: true, error: null }));
    }

    const load = (silent: boolean) =>
      api<T>(path, { locale, params })
        .then((data) => {
          if (!live) return;
          const sig = JSON.stringify(data);
          cache.set(key, data);
          if (sig !== last.current) {
            last.current = sig;
            setState({ data, loading: false, error: null });
          } else if (!silent) {
            setState((s) => ({ ...s, loading: false, error: null }));
          }
        })
        .catch((error: ApiError) => {
          // Une revalidation qui echoue ne doit jamais effacer ce qui est deja affiche.
          if (live && !silent) setState({ data: null, loading: false, error });
        });

    void load(cached); // revalidation immediate meme si le cache memoire est present

    const refresh = () => {
      if (document.visibilityState === 'visible') void load(true);
    };
    const timer = window.setInterval(refresh, REFRESH_MS);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      live = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
