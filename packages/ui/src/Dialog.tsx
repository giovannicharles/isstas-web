import { X } from 'lucide-react';
import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { cn } from './cn';

/** Dialog / Sheet shadcn (sans dependance) : <dialog> natif (focus piege, Echap, role ARIA). */
type Ctx = { open: boolean; onOpenChange: (o: boolean) => void };
const DialogContext = createContext<Ctx>({ open: false, onOpenChange: () => undefined });

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (o: boolean) => void; children?: ReactNode }) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}

function Panel({ className, children, label }: { className: string; children?: ReactNode; label?: string }) {
  const { open, onOpenChange } = useContext(DialogContext);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={() => onOpenChange(false)}
      onClick={(e) => e.target === ref.current && onOpenChange(false)}
      className={cn('m-0 max-h-none bg-white p-0 shadow-lift backdrop:bg-green-900/60 backdrop:backdrop-blur-sm', className)}
    >
      {open ? (
        <div className="relative size-full overflow-y-auto p-6">
          {children}
          <button type="button" onClick={() => onOpenChange(false)} aria-label="Fermer" className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg hover:bg-mint-100">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </dialog>
  );
}

export function DialogContent({ className, children, label }: { className?: string; children?: ReactNode; label?: string }) {
  return (
    <Panel label={label} className={cn('fixed left-1/2 top-1/2 max-h-[90dvh] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl open:animate-sheet-up', className)}>
      {children}
    </Panel>
  );
}

/** Panneau lateral (shadcn Sheet) : fiche candidat, menu mobile... */
export function SheetContent({ className, children, label, side = 'right' }: { className?: string; children?: ReactNode; label?: string; side?: 'right' | 'left' }) {
  return (
    <Panel label={label} className={cn('fixed inset-y-0 h-dvh w-[min(28rem,100vw)] open:animate-slide-in', side === 'right' ? 'left-auto right-0' : 'left-0 right-auto', className)}>
      {children}
    </Panel>
  );
}

export const DialogTitle = ({ className, children }: { className?: string; children?: ReactNode }) => <h2 className={cn('font-display text-2xl font-black', className)}>{children}</h2>;
export const DialogDescription = ({ className, children }: { className?: string; children?: ReactNode }) => <p className={cn('mt-1 text-ink-muted', className)}>{children}</p>;