import { Check } from 'lucide-react';
import { cloneElement, useId, useState, type ButtonHTMLAttributes, type LabelHTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { cn } from './cn';

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('font-display text-sm font-bold text-green-900', className)} {...props} />;
}

type CheckProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean; onCheckedChange?: (v: boolean) => void };

/** Case a cocher shadcn (role=checkbox, clavier : espace). */
export function Checkbox({ checked = false, onCheckedChange, className, ...props }: CheckProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      data-state={checked ? 'checked' : 'unchecked'}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn('grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors', checked ? 'border-green-600 bg-green-600' : 'border-green-700 bg-white hover:bg-mint-100', className)}
      {...props}
    >
      {checked ? <Check className="size-4 text-white" strokeWidth={3.5} aria-hidden="true" /> : null}
    </button>
  );
}

export function Switch({ checked = false, onCheckedChange, className, ...props }: CheckProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', checked ? 'bg-green-600' : 'bg-line', className)}
      {...props}
    >
      <span className={cn('absolute top-1 block size-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  );
}

export function Progress({ value = 0, className, ...props }: { value?: number; className?: string; 'aria-label'?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} className={cn('relative h-3 overflow-hidden rounded-full bg-green-100', className)} {...props}>
      <div className="h-full origin-left rounded-full bg-gradient-to-r from-green-500 to-green-700 transition-transform duration-700 ease-out" style={{ transform: `scaleX(${v / 100})` }} />
    </div>
  );
}

export function Separator({ className, orientation = 'horizontal' }: { className?: string; orientation?: 'horizontal' | 'vertical' }) {
  return <div role="separator" aria-orientation={orientation} className={cn('shrink-0 bg-line', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)} />;
}

export function TooltipProvider({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

/** Info-bulle shadcn : affichee au survol et au focus, liee par aria-describedby. */
export function Tooltip({ content, children }: { content: ReactNode; children: ReactElement<Record<string, unknown>> }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      {cloneElement(children, { 'aria-describedby': id })}
      <span id={id} role="tooltip" className={cn('pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-lift transition-opacity', open ? 'opacity-100' : 'opacity-0')}>
        {content}
      </span>
    </span>
  );
}