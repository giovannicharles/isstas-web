import { useEffect, useId, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu } from 'lucide-react';
import { Button, Container, ScrollPulse } from '@isstas/ui';
import { useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import type { Level, MenuItem, Program } from '@/lib/types';
import { Brand } from './Brand';
import { MobileDrawer } from './MobileDrawer';

function useScrolled(offset = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > offset);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [offset]);
  return scrolled;
}

/** Panneau « Formations » : les niveaux avec leurs filieres (donnees de l'API). */
function MegaPanel({ onNavigate }: { onNavigate: () => void }) {
  const { locale, path } = useLocale();
  const { data: levels } = useApi<Level[]>('/levels', locale);
  const { data: programs } = useApi<Program[]>('/programs', locale);
  if (!levels) return null;

  return (
    <div className="grid gap-x-8 gap-y-6 p-6 md:grid-cols-2 xl:grid-cols-4">
      {levels.map((level) => {
        const items = (programs ?? []).filter((p) => p.levels?.some((l) => l.id === level.id));
        return (
          <div key={level.id}>
            <NavLink to={path(`/formations/${level.slug}`)} onClick={onNavigate} className="block font-display text-lg font-extrabold text-green-900 no-underline hover:text-green-700">
              {level.name}
              {level.duration ? <span className="mt-0.5 block text-[0.8rem] font-semibold text-ink-muted">{level.duration}</span> : null}
            </NavLink>
            <ul className="mt-3 grid gap-1.5 border-l-2 border-green-500 pl-4">
              {items.map((p) => (
                <li key={p.id}>
                  <NavLink to={path(`/formations/${level.slug}/${p.slug}`)} onClick={onNavigate} className="text-[0.92rem] text-ink no-underline hover:text-green-700 hover:underline">
                    {p.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function Dropdown({ item, open, setOpen, mega }: { item: MenuItem; open: number | null; setOpen: (id: number | null) => void; mega: boolean }) {
  const { path } = useLocale();
  const { pathname } = useLocation();
  const li = useRef<HTMLLIElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const isOpen = open === item.id;
  const active = item.children.some((c) => c.url && pathname.startsWith(path(c.url)));

  const links = () => [...(li.current?.querySelectorAll('a') ?? [])] as HTMLAnchorElement[];
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      setOpen(null);
      trigger.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setOpen(item.id);
        setTimeout(() => links()[0]?.focus(), 0);
      } else {
        const all = links();
        all[Math.min(all.indexOf(document.activeElement as HTMLAnchorElement) + 1, all.length - 1)]?.focus();
      }
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      const all = links();
      const at = all.indexOf(document.activeElement as HTMLAnchorElement);
      if (at <= 0) trigger.current?.focus();
      else all[at - 1]?.focus();
    }
  };

  return (
    <li
      ref={li}
      className={mega ? 'static' : 'relative'}
      onMouseEnter={() => setOpen(item.id)}
      onMouseLeave={() => setOpen(null)}
      onBlur={(e) => !li.current?.contains(e.relatedTarget as Node) && setOpen(null)}
      onKeyDown={onKeyDown}
    >
      <button ref={trigger} type="button" className={`nav-link ${active ? 'text-green-500' : ''}`} aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? null : item.id)}>
        {item.label}
        <ChevronDown className={`size-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <div
        id={panelId}
        className={`absolute top-full pt-3 transition-[opacity,transform,visibility] duration-200 ${
          mega ? 'inset-x-0 mx-auto w-[min(76rem,calc(100vw-2rem))]' : 'left-1/2 w-72 -translate-x-1/2'
        } ${isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'}`}
      >
        <div className="rounded-[var(--radius-panel)] bg-white text-ink shadow-lift">
          {mega ? (
            <MegaPanel onNavigate={() => setOpen(null)} />
          ) : (
            <ul className="p-2">
              {item.children.map((c) => (
                <li key={c.id}>
                  <NavLink to={path(c.url ?? '/')} onClick={() => setOpen(null)} className="block rounded-lg px-4 py-3 text-[0.95rem] font-semibold text-ink no-underline hover:bg-mint-100">
                    {c.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

/** Barre de navigation collante : transparente sur le hero, pleine au defilement ; filet de pouls en bas. */
export function Navbar(_props: { transparentAtTop?: boolean }) {
  const { locale, path } = useLocale();
  const t = useT();
  const { data: menu } = useApi<{ items: MenuItem[] }>('/menus/header', locale);
  const scrolled = useScrolled();
  const [open, setOpen] = useState<number | null>(null);
  const [drawer, setDrawer] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);

  return (
    <header className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-card' : 'border-b border-line'}`}>
      <Container className={`relative flex items-center justify-between gap-4 transition-[height] duration-300 ${scrolled ? 'h-16' : 'h-[4.5rem] xl:h-20'}`}>
        <Brand tone="light" />

        <nav aria-label={t('nav.main')} className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {(menu?.items ?? []).map((item) =>
              item.children.length || item.url === '/formations' ? (
                <Dropdown key={item.id} item={item} open={open} setOpen={setOpen} mega={item.url === '/formations'} />
              ) : (
                <li key={item.id}>
                  <NavLink to={path(item.url ?? '/')} end={item.url === '/'} className={({ isActive }) => `nav-link ${isActive ? 'text-green-500' : ''}`}>
                    {item.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Button to={path('/admission/pre-inscription')} size="sm" className="hidden sm:inline-flex">
            {t('cta.apply')}
          </Button>
          <button ref={burger} type="button" onClick={() => setDrawer(true)} aria-label={t('nav.open_menu')} aria-haspopup="dialog" className="grid size-11 place-items-center rounded-full text-green-800 hover:bg-mint-100 xl:hidden">
            <Menu className="size-6" aria-hidden="true" />
          </button>
        </div>
      </Container>
      {scrolled ? <ScrollPulse /> : null}
      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} items={menu?.items ?? []} returnFocus={burger} />
    </header>
  );
}