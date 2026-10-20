import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Ctx = { dark: boolean; toggle: () => void };
const ThemeContext = createContext<Ctx>({ dark: false, toggle: () => undefined });
export const useTheme = () => useContext(ThemeContext);

const KEY = 'isstas.admin.theme';

/**
 * Theme clair/sombre de l'administration. La classe `admin-dark` est posee sur <html> (les fenetres modales
 * et notifications en profitent aussi) et retiree en quittant l'admin : le site public n'est jamais affecte.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) return saved === 'dark';
    } catch { /* navigation privee */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('admin-dark', dark);
    return () => document.documentElement.classList.remove('admin-dark');
  }, [dark]);

  const toggle = useCallback(() => setDark((v) => {
    try { localStorage.setItem(KEY, v ? 'light' : 'dark'); } catch { /* navigation privee */ }
    return !v;
  }), []);

  const value = useMemo(() => ({ dark, toggle }), [dark, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
