import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@isstas/ui';

/** Dernier filet : une erreur de rendu n'affiche jamais une page blanche, mais un message et un moyen de repartir. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[admin] erreur de rendu', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid min-h-dvh place-items-center bg-mint-50 p-6">
        <div role="alert" className="w-full max-w-md rounded-[var(--radius-card)] bg-white p-8 text-center shadow-card">
          <h1 className="font-display text-2xl font-black">Un problème est survenu</h1>
          <p className="mt-3 text-ink-muted">Cette page n'a pas pu s'afficher. Vos données ne sont pas perdues : rechargez la page pour repartir.</p>
          <details className="mt-4 text-left text-xs text-ink-muted">
            <summary className="cursor-pointer font-semibold">Détail technique</summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap rounded-lg bg-mint-50 p-3">{this.state.error.message}</pre>
          </details>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => window.location.reload()}><RotateCcw className="size-4" aria-hidden="true" /> Recharger</Button>
            <Button variant="outline" onClick={() => { window.location.href = '/admin'; }}>Tableau de bord</Button>
          </div>
        </div>
      </div>
    );
  }
}
