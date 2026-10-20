import type { ComponentProps } from 'react';
import { cn } from './cn';

/** shadcn Card : trois traitements, jamais une seule boite repetee partout. */
const tones = {
  panel: 'bg-white shadow-soft ring-1 ring-line',
  mint: 'bg-mint-100',
  dark: 'on-dark bg-green-600 text-white',
  glass: 'on-dark bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md',
  lined: 'border-t-4 border-green-600 bg-white shadow-soft',
} as const;

export function Card({ className, tone = 'panel', ...props }: ComponentProps<'div'> & { tone?: keyof typeof tones }) {
  return <div className={cn('rounded-[var(--radius-panel)] p-6', tones[tone], className)} {...props} />;
}
export const CardTitle = ({ className, ...props }: ComponentProps<'h3'>) => <h3 className={cn('font-display text-2xl font-extrabold leading-tight', className)} {...props} />;
export const CardText = ({ className, ...props }: ComponentProps<'p'>) => <p className={cn('mt-2 text-ink-muted', className)} {...props} />;