import { useEffect, useRef, type RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@isstas/ui';
import { useLocale, useT } from '@/lib/i18n';
import type { MenuItem } from '@/lib/types';
import { LocaleSwitch } from './LocaleSwitch';

/** Tiroir lateral mobile : <dialog> natif (focus piege, Echap), fermeture au clic hors panneau. */
export function MobileDrawer({ open, onClose, items, returnFocus }: { open: boolean; onClose: () => void; items: MenuItem[]; returnFocus: RefObject<HTMLButtonElement | null> }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { path } = useLocale();
  const t = useT();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={t('nav.main')}
      onClose={() => {
        onClose();
        returnFocus.current?.focus();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      className="on-dark m-0 ml-auto h-dvh max-h-none w-[min(24rem,100vw)] max-w-none bg-green-500 p-0 text-white backdrop:bg-green-900/70 open:animate-slide-in"
    >
      <div className="flex h-full flex-col overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <LocaleSwitch />
          <button type="button" onClick={onClose} aria-label={t('nav.close_menu')} className="grid size-11 place-items-center rounded-[var(--radius-button)] hover:bg-white/12">
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label={t('nav.main')} className="mt-8">
          <ul className="grid gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <NavLink to={path(item.url ?? '/')} end={item.url === '/'} onClick={onClose} className="block rounded-lg px-3 py-3 font-display text-xl font-extrabold no-underline hover:bg-white/10">
                  {item.label}
                </NavLink>
                {item.children.length ? (
                  <ul className="mb-2 ml-3 grid gap-0.5 border-l-2 border-green-500 pl-4">
                    {item.children.map((c) => (
                      <li key={c.id}>
                        <NavLink to={path(c.url ?? '/')} onClick={onClose} className="block py-1.5 text-[0.98rem] text-white/85 no-underline hover:text-green-400">
                          {c.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-8">
          <Button to={path('/admission/pre-inscription')} tone="dark" size="lg" fullWidth onClick={onClose}>
            {t('cta.apply')}
          </Button>
        </div>
      </div>
    </dialog>
  );
}