import type { ElementType, ReactNode } from 'react';
import { cn } from './cn';

const sizes = {
  default: 'max-w-[calc(1240px+3rem)]',
  narrow: 'max-w-[calc(980px+3rem)]',
  reading: 'max-w-[calc(760px+3rem)]',
} as const;

/** Conteneur 1240 px, gouttiere 24 px sur mobile (32 px des 640 px, 40 px des 1024 px). */
export function Container({ as: Tag = 'div', size = 'default', className, children }: { as?: ElementType; size?: keyof typeof sizes; className?: string; children?: ReactNode }) {
  return <Tag className={cn('mx-auto w-full px-6 sm:px-8 lg:px-10', sizes[size], className)}>{children}</Tag>;
}