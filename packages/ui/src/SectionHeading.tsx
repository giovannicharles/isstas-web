import type { ReactNode } from 'react';
import { cn } from './cn';

/**
 * Titre de section : grand titre Montserrat 800 (clamp(2rem,4vw,3.5rem)), chapo optionnel (mesure <= 60 car.)
 * et action alignee a droite sur grand ecran. Pas d'etiquette en capitales au-dessus.
 */
export function SectionHeading({
  title,
  lead,
  action,
  as: Tag = 'h2',
  align = 'left',
  className,
}: {
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  align?: 'left' | 'center';
  accent?: boolean;
  className?: string;
}) {
  if (!title) return null;
  const centered = align === 'center';
  return (
    <header className={cn('flex flex-wrap items-end gap-x-10 gap-y-5', centered ? 'justify-center text-center' : 'justify-between', className)}>
      <div className={cn('max-w-[46rem]', centered && 'mx-auto')}>
        <Tag className="h-section">{title}</Tag>
        {lead ? <p className={cn('mt-5 max-w-[60ch] text-[1.125rem] leading-relaxed text-ink-muted [.on-dark_&]:text-white/85', centered && 'mx-auto')}>{lead}</p> : null}
      </div>
      {action && !centered ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}