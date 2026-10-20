import { ChevronDown } from 'lucide-react';
import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import { cn } from './cn';

/** Accordion shadcn (sans dependance) : un panneau ouvert a la fois, ARIA complet. */
type Ctx = { open: string | null; toggle: (v: string) => void };
const AccordionContext = createContext<Ctx>({ open: null, toggle: () => undefined });
const ItemContext = createContext<{ value: string; id: string }>({ value: '', id: '' });

export function Accordion({ className, children, defaultValue = null }: { className?: string; children?: ReactNode; type?: 'single'; collapsible?: boolean; defaultValue?: string | null }) {
  const [open, setOpen] = useState<string | null>(defaultValue);
  return (
    <AccordionContext.Provider value={{ open, toggle: (v) => setOpen((o) => (o === v ? null : v)) }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, className, children }: { value: string; className?: string; children?: ReactNode }) {
  const id = useId();
  const { open } = useContext(AccordionContext);
  return (
    <ItemContext.Provider value={{ value, id }}>
      <div data-state={open === value ? 'open' : 'closed'} className={cn('border-b border-line transition-colors data-[state=open]:bg-mint-50', className)}>
        {children}
      </div>
    </ItemContext.Provider>
  );
}

export function AccordionTrigger({ className, children }: { className?: string; children?: ReactNode }) {
  const { open, toggle } = useContext(AccordionContext);
  const { value, id } = useContext(ItemContext);
  const isOpen = open === value;
  return (
    <h3>
      <button
        type="button"
        id={`${id}-trigger`}
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        onClick={() => toggle(value)}
        className={cn('group flex w-full items-center justify-between gap-4 px-1 py-5 text-left font-display text-lg font-extrabold transition-colors hover:text-green-700 sm:px-3', className)}
      >
        {children}
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-full transition-all duration-300', isOpen ? 'rotate-180 bg-green-600 text-white' : 'bg-mint-100 text-green-700')}>
          <ChevronDown className="size-5" aria-hidden="true" />
        </span>
      </button>
    </h3>
  );
}

export function AccordionContent({ className, children }: { className?: string; children?: ReactNode }) {
  const { open } = useContext(AccordionContext);
  const { value, id } = useContext(ItemContext);
  const isOpen = open === value;
  return (
    <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-trigger`} className={cn('grid transition-[grid-template-rows] duration-300 ease-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
      <div className="overflow-hidden">
        <div className={cn('px-1 pb-6 sm:px-3', className)} inert={!isOpen}>{children}</div>
      </div>
    </div>
  );
}