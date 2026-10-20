import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useId } from 'react';
import { cn } from './cn';

type Shared = { label: string; hint?: string; error?: string; className?: string; required?: boolean };

function Wrapper({ id, label, hint, error, required, className, children }: Shared & { id: string; children: ReactNode }) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="font-display text-[0.95rem] font-bold text-green-900">
        {label}
        {required ? <span className="text-danger" aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {hint && !error ? <p id={`${id}-hint`} className="text-sm text-ink-muted">{hint}</p> : null}
      {error ? <p id={`${id}-error`} role="alert" className="text-sm font-semibold text-danger">{error}</p> : null}
    </div>
  );
}

const describe = (id: string, hint?: string, error?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export function TextField({ label, hint, error, className, required, ...props }: Shared & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Wrapper id={id} {...{ label, hint, error, className, required }}>
      <input id={id} required={required} aria-invalid={error ? true : undefined} aria-describedby={describe(id, hint, error)} className="field" {...props} />
    </Wrapper>
  );
}

export function TextArea({ label, hint, error, className, required, ...props }: Shared & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Wrapper id={id} {...{ label, hint, error, className, required }}>
      <textarea id={id} required={required} rows={5} aria-invalid={error ? true : undefined} aria-describedby={describe(id, hint, error)} className="field" {...props} />
    </Wrapper>
  );
}

export function SelectField({ label, hint, error, className, required, children, ...props }: Shared & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Wrapper id={id} {...{ label, hint, error, className, required }}>
      <select id={id} required={required} aria-invalid={error ? true : undefined} aria-describedby={describe(id, hint, error)} className="field" {...props}>
        {children}
      </select>
    </Wrapper>
  );
}