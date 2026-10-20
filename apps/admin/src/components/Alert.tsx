import type { ReactNode } from 'react';
import { TONES } from './Notify';

/** Message en ligne (formulaires, pages) : meme langage visuel que les notifications, reste affiche jusqu'a correction. */
export function Alert({ tone = 'info', title, children, action, className = '' }: {
  tone?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const t = TONES[tone];
  const Icon = t.icon;
  const surface = { success: 'bg-green-50', error: 'bg-danger/5', warning: 'bg-amber-50', info: 'bg-mint-50' }[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-2xl border-2 p-4 ${t.box.replace('bg-white', surface)} ${className}`}>
      <Icon className={`mt-0.5 size-5 shrink-0 ${t.icon_cls}`} aria-hidden="true" />
      <div className="min-w-0 flex-1 text-sm leading-snug">
        {title ? <p className="font-display font-extrabold text-ink">{title}</p> : null}
        {children ? <div className={title ? 'mt-0.5 text-ink-muted' : 'text-ink'}>{children}</div> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
