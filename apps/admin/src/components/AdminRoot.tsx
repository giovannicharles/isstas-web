import type { ReactNode } from 'react';
import { AuthProvider } from '../lib/auth';
import { ErrorBoundary } from './ErrorBoundary';
import { NotifyProvider } from './Notify';
import { ThemeProvider } from './Theme';
import { TopProgress } from './TopProgress';

/** Racine de l'admin : garde-fou d'erreurs, notifications, session Sanctum, fond et typographie propres a l'administration. */
export function AdminRoot({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
      <NotifyProvider>
        <TopProgress />
        <AuthProvider>
          <div className="min-h-dvh bg-mint-50 text-[0.95rem] leading-normal text-ink">{children}</div>
        </AuthProvider>
      </NotifyProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
