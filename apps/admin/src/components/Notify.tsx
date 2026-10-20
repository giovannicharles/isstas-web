import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { describeError } from '@admin/lib/errors';

type Tone = 'success' | 'error' | 'warning' | 'info';
type Toast = { id: number; tone: Tone; title: string; message?: string; duration: number };

type Notifier = {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  /** Affiche une erreur API/reseau avec un message clair ; renvoie la description pour afficher les champs. */
  fromError: (error: unknown, fallbackTitle?: string) => ReturnType<typeof describeError>;
  dismiss: (id: number) => void;
};

const Ctx = createContext<Notifier | null>(null);

type ConfirmOptions = { title: string; message?: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean };
const ConfirmCtx = createContext<((o: ConfirmOptions) => Promise<boolean>) | null>(null);

/** Confirmation accessible (remplace window.confirm) : `if (!(await confirm({ title: 'Supprimer ?', danger: true }))) return;` */
export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error('useConfirm doit etre utilise dans <NotifyProvider>');
  return ctx;
}

export function useNotify(): Notifier {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useNotify doit etre utilise dans <NotifyProvider>');
  return ctx;
}

export const TONES: Record<Tone, { icon: typeof Info; box: string; icon_cls: string; bar: string }> = {
  success: { icon: CheckCircle2, box: 'border-green-500/40 bg-white', icon_cls: 'text-green-500', bar: 'bg-green-500' },
  error: { icon: XCircle, box: 'border-danger/40 bg-white', icon_cls: 'text-danger', bar: 'bg-danger' },
  warning: { icon: AlertTriangle, box: 'border-amber-400 bg-white', icon_cls: 'text-amber-500', bar: 'bg-amber-400' },
  info: { icon: Info, box: 'border-green-300 bg-white', icon_cls: 'text-green-600', bar: 'bg-green-300' },
};

const DURATION: Record<Tone, number> = { success: 4500, info: 6000, warning: 8000, error: 10000 };
const MAX_VISIBLE = 4;

/** Zone de notifications : empilees en haut a droite, annoncees aux lecteurs d'ecran, fermables, a duree adaptee. */
export function NotifyProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [asking, setAsking] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const seq = useRef(0);
  const confirm = useCallback((o: ConfirmOptions) => new Promise<boolean>((resolve) => setAsking({ ...o, resolve })), []);
  const answer = (ok: boolean) => { asking?.resolve(ok); setAsking(null); };

  const dismiss = useCallback((id: number) => setToasts((l) => l.filter((t) => t.id !== id)), []);

  const push = useCallback((tone: Tone, title: string, message?: string) => {
    const id = ++seq.current;
    setToasts((l) => {
      // Evite les doublons visibles (meme titre + message) lors d'erreurs repetees.
      const next = l.filter((t) => !(t.title === title && t.message === message));
      return [...next, { id, tone, title, message, duration: DURATION[tone] }].slice(-MAX_VISIBLE);
    });
  }, []);

  const api = useMemo<Notifier>(() => ({
    success: (t, m) => push('success', t, m),
    error: (t, m) => push('error', t, m),
    warning: (t, m) => push('warning', t, m),
    info: (t, m) => push('info', t, m),
    fromError: (error, fallbackTitle) => {
      const d = describeError(error);
      push(d.kind === 'throttle' || d.kind === 'validation' ? 'warning' : 'error', fallbackTitle && d.kind === 'unknown' ? fallbackTitle : d.title, d.message);
      return d;
    },
    dismiss,
  }), [push, dismiss]);

  // Session perdue pendant l'utilisation : prevenir l'utilisateur (la redirection vers la connexion est faite par la coquille).
  useEffect(() => {
    const onLogout = () => push('warning', 'Session expirée', 'Reconnectez-vous pour continuer.');
    window.addEventListener('isstas:unauthenticated', onLogout);
    return () => window.removeEventListener('isstas:unauthenticated', onLogout);
  }, [push]);

  return (
    <Ctx.Provider value={api}>
      <ConfirmCtx.Provider value={confirm}>
      {children}
      {asking ? <ConfirmDialog options={asking} onAnswer={answer} /> : null}
      <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-4 top-4 z-[100] grid justify-items-end gap-3 sm:left-auto sm:right-6 sm:top-6 sm:w-[26rem]">
        {toasts.map((t) => <ToastCard key={t.id} toast={t} onClose={() => dismiss(t.id)} />)}
      </div>
      </ConfirmCtx.Provider>
    </Ctx.Provider>
  );
}

function ConfirmDialog({ options, onAnswer }: { options: ConfirmOptions; onAnswer: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onAnswer(false); }} onClick={(e) => { if (e.target === ref.current) onAnswer(false); }}
      aria-labelledby="confirm-title" className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-[1.5rem] border-0 bg-white p-0 text-ink shadow-lift backdrop:bg-brown-900/60 backdrop:backdrop-blur-sm">
      <div className="p-7">
        <div className={`mb-4 grid size-12 place-items-center rounded-2xl ${options.danger ? 'bg-danger/10 text-danger' : 'bg-mint-100 text-green-600'}`}>
          {options.danger ? <AlertTriangle className="size-6" aria-hidden="true" /> : <Info className="size-6" aria-hidden="true" />}
        </div>
        <h2 id="confirm-title" className="font-display text-xl font-black leading-snug">{options.title}</h2>
        {options.message ? <p className="mt-2 text-ink-muted">{options.message}</p> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" autoFocus onClick={() => onAnswer(false)} className="min-h-11 rounded-full px-5 font-display font-bold ring-2 ring-line hover:bg-mint-100">{options.cancelLabel ?? 'Annuler'}</button>
          <button type="button" onClick={() => onAnswer(true)} className={`min-h-11 rounded-full px-5 font-display font-extrabold text-white ${options.danger ? 'bg-danger hover:bg-danger/90' : 'bg-green-500 hover:bg-green-600'}`}>{options.confirmLabel ?? 'Confirmer'}</button>
        </div>
      </div>
    </dialog>
  );
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const tone = TONES[toast.tone];
  const Icon = tone.icon;
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const left = useRef(toast.duration);
  const started = useRef(Date.now());

  useEffect(() => {
    if (paused) return;
    started.current = Date.now();
    timer.current = window.setTimeout(onClose, left.current);
    return () => {
      window.clearTimeout(timer.current);
      left.current -= Date.now() - started.current;
    };
  }, [paused, onClose]);

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl border-2 p-4 pr-11 shadow-lift animate-[slide-in_.25s_ease-out] ${tone.box}`}
    >
      <div className="flex gap-3">
        <Icon className={`mt-0.5 size-5 shrink-0 ${tone.icon_cls}`} aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-display font-extrabold leading-snug text-ink">{toast.title}</p>
          {toast.message ? <p className="mt-0.5 text-sm leading-snug text-ink-muted">{toast.message}</p> : null}
        </div>
      </div>
      <button type="button" onClick={onClose} aria-label="Fermer la notification" className="absolute right-2 top-2 grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-mint-100 hover:text-ink">
        <X className="size-4" aria-hidden="true" />
      </button>
      <span aria-hidden="true" className={`absolute bottom-0 left-0 h-1 ${tone.bar}`} style={{ width: '100%', transformOrigin: 'left', animation: `fill ${toast.duration}ms linear forwards`, animationPlayState: paused ? 'paused' : 'running' }} />
    </div>
  );
}
