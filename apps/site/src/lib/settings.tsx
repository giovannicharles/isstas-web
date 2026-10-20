import { createContext, useContext, type ReactNode } from 'react';
import { useApi } from './useApi';
import { useLocale } from './i18n';
import type { Settings } from './types';

type Ctx = { data: Settings | null; get: <T = any>(key: string, fallback?: T) => T };
const SettingsContext = createContext<Ctx>({ data: null, get: (_k, f) => f as never });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const { data } = useApi<Settings>('/settings', locale);
  const value: Ctx = {
    data,
    get: (key, fallback) => ((data?.settings?.[key] ?? fallback) as never),
  };
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);