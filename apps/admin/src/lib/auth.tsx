import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, markSession } from './api';

export type Me = { id: number; name: string; email: string; roles: string[]; permissions: string[] };
type Ctx = { me: Me | null; loading: boolean; can: (p: string) => boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void> };

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Me>('/auth/me').then((m) => { markSession(true); setMe(m); }).catch(() => setMe(null)).finally(() => setLoading(false));
    const out = () => setMe(null);
    window.addEventListener('isstas:unauthenticated', out);
    return () => window.removeEventListener('isstas:unauthenticated', out);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const m = await api<Me>('/auth/login', { method: 'POST', body: { email, password } });
    markSession(true);
    setMe(m);
  }, []);
  const logout = useCallback(async () => {
    markSession(false);
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    setMe(null);
  }, []);

  const can = (p: string) => !!me && (me.roles.includes('super-admin') || me.permissions.includes(p));
  return <AuthContext.Provider value={{ me, loading, can, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth hors AuthProvider');
  return c;
};