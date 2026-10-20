import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import { cn } from './cn';

type Ctx = { value: string; set: (v: string) => void; id: string };
const TabsContext = createContext<Ctx>({ value: '', set: () => undefined, id: '' });

/** Tabs shadcn (sans dependance) ; controlees (value/onValueChange) ou non (defaultValue). */
export function Tabs({ value, defaultValue = '', onValueChange, className, children }: { value?: string; defaultValue?: string; onValueChange?: (v: string) => void; className?: string; children?: ReactNode }) {
  const [inner, setInner] = useState(defaultValue);
  const id = useId();
  const current = value ?? inner;
  return (
    <TabsContext.Provider value={{ value: current, set: (v) => { setInner(v); onValueChange?.(v); }, id }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, label }: { className?: string; children?: ReactNode; label?: string }) {
  return (
    <div role="tablist" aria-label={label} className={cn('inline-flex gap-1 rounded-lg bg-white p-1 ring-2 ring-line', className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }: { value: string; className?: string; children?: ReactNode }) {
  const { value: current, set, id } = useContext(TabsContext);
  const active = current === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${id}-t-${value}`}
      aria-selected={active}
      aria-controls={`${id}-p-${value}`}
      tabIndex={active ? 0 : -1}
      onClick={() => set(value)}
      className={cn('rounded-md px-5 py-2 font-display font-bold uppercase transition-colors', active ? 'bg-green-500 text-white' : 'hover:bg-mint-100', className)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }: { value: string; className?: string; children?: ReactNode }) {
  const { value: current, id } = useContext(TabsContext);
  if (current !== value) return null;
  return <div role="tabpanel" id={`${id}-p-${value}`} aria-labelledby={`${id}-t-${value}`} className={className}>{children}</div>;
}