import type { ReactNode } from 'react';
import { cn } from './cn';

const tones = {
  green: 'bg-green-100 text-green-800',
  brown: 'bg-green-500 text-white',
  mint: 'bg-mint-100 text-green-800 ring-1 ring-green-200',
  outline: 'ring-1 ring-current text-ink-muted',
  warn: 'bg-amber-100 text-amber-900',
} as const;

export function Badge({ tone = 'green', children, className }: { tone?: keyof typeof tones; children?: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <span className={cn('inline-flex items-center rounded-[var(--radius-pill)] px-3 py-1 font-display text-[0.8rem] font-bold leading-none', tones[tone], className)}>
      {children}
    </span>
  );
}