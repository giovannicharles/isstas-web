import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, type LinkProps } from 'react-router-dom';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@isstas/i18n';
import { useApi } from './useApi';

type UiStrings = Record<string, string>;
type Alternates = Partial<Record<Locale, string>>;

type Ctx = {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
  ready: boolean;
  /** chemins equivalents dans les autres langues (slugs localises), enregistres par la page courante */
  alternates: Alternates;
  setAlternates: (a: Alternates) => void;
  path: (to: string) => string;
  /** URL complete dans l'autre langue (slugs localises) ou null si la page n'en declare pas. */
  switchTo: (l: Locale) => string | null;
};

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const { data: strings } = useApi<UiStrings>('/ui-strings', locale);
  const [alternates, setAlternates] = useState<Alternates>({});

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let s = strings?.[key] ?? '';
      if (!s && import.meta.env.DEV && strings) s = `⟦${key}⟧`; // cle manquante visible en developpement
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
      return s;
    },
    [strings],
  );

  const value = useMemo<Ctx>(
    () => ({
      locale,
      t,
      ready: !!strings,
      alternates,
      setAlternates,
      path: (to) => `/${locale}${to === '/' ? '' : to}`,
      switchTo: (l) => (alternates[l] === undefined ? null : `/${l}${alternates[l] === '/' ? '' : alternates[l]}`),
    }),
    [locale, t, strings, alternates],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale hors LocaleProvider');
  return ctx;
}

export const useT = () => useLocale().t;

/** Lien interne : prefixe automatiquement la langue courante. */
export function LLink({ to, ...props }: Omit<LinkProps, 'to'> & { to: string }) {
  const { path } = useLocale();
  return <Link to={path(to)} {...props} />;
}

export function useLocalizedNavigate() {
  const nav = useNavigate();
  const { path } = useLocale();
  return (to: string) => nav(path(to));
}