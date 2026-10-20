import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2, ChevronDown, ChevronsLeft, ChevronsRight, Download, ExternalLink, FileText, GraduationCap, Home, Inbox, LayoutDashboard, LogOut, Menu,
  MessageSquare, MessagesSquare, Moon, Search, Settings2, SlidersHorizontal, Sun, X, type LucideIcon,
} from 'lucide-react';
import { PulseLine } from '@isstas/ui';
import { api } from '@admin/lib/api';
import { useAuth } from '@admin/lib/auth';
import { CHATBOT_TABS, GROUPS, HOME_SECTIONS, SETTING_GROUPS, resourceByKey } from '@admin/lib/resources';
import { AdminBoot } from './AdminBoot';
import { CommandPalette } from './CommandPalette';
import { useTheme } from './Theme';

type Child = { to: string; label: string; end?: boolean };
type Badges = Record<string, number>;

const GROUP_ICONS: Record<string, LucideIcon> = {
  Contenu: FileText, Formations: GraduationCap, Médias: Download, Institution: Building2, Interactions: MessageSquare, Chatbot: MessagesSquare, Paramètres: Settings2,
};

const linkBase = 'relative flex min-h-10 items-center rounded-xl font-semibold no-underline transition-colors';
const linkState = (isActive: boolean) => (isActive ? 'bg-green-500/10 text-green-700 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-green-500' : 'text-ink-muted hover:bg-mint-100 hover:text-ink');

/** Pastille de compteur (texte + couleur : l'information n'est jamais portee par la couleur seule). */
function Count({ n, collapsed }: { n?: number; collapsed: boolean }) {
  if (!n) return null;
  return (
    <span className={collapsed ? 'absolute right-1.5 top-1 grid min-w-4 place-items-center rounded-full bg-amber-400 px-1 text-[0.65rem] font-extrabold leading-4 text-brown-900' : 'ml-auto grid min-w-5 place-items-center rounded-full bg-amber-400 px-1.5 text-xs font-extrabold leading-5 text-brown-900'}>
      <span aria-hidden="true">{n > 99 ? '99+' : n}</span>
      <span className="sr-only">{n} à traiter</span>
    </span>
  );
}

/** Lien de menu : icone seule (avec infobulle) quand la barre est repliee. */
function Item({ to, label, icon: Icon, end, collapsed, count }: { to: string; label: string; icon: LucideIcon; end?: boolean; collapsed: boolean; count?: number }) {
  return (
    <NavLink to={to} end={end} aria-label={collapsed ? label : undefined} className={({ isActive }) => `group ${linkBase} ${collapsed ? 'justify-center' : 'gap-3 px-3 py-2'} ${linkState(isActive)}`}>
      <Icon className="size-[1.1rem] shrink-0" aria-hidden="true" />
      {collapsed ? <span role="tooltip" className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-brown-900 px-3 py-1.5 text-sm font-semibold text-white shadow-lift group-hover:block group-focus-visible:block">{label}</span> : <span className="truncate">{label}</span>}
      <Count n={count} collapsed={collapsed} />
    </NavLink>
  );
}

/** Entree avec sous-menu : s'ouvre toute seule dans l'une de ses pages ; en mode replie, un clic deplie la barre. */
function NavParent({ to, label, icon: Icon, children, filter, collapsed, onExpand, count }: { to: string; label: string; icon: LucideIcon; children: Child[]; filter: string; collapsed: boolean; onExpand: () => void; count?: number }) {
  const { pathname } = useLocation();
  const within = pathname === to || pathname.startsWith(`${to}/`);
  const [open, setOpen] = useState(within);
  useEffect(() => { if (within) setOpen(true); }, [within]);
  const shown = filter ? children.filter((c) => c.label.toLowerCase().includes(filter) || label.toLowerCase().includes(filter)) : children;
  if (filter && !shown.length) return null;
  if (collapsed) return <li><Item to={to} label={label} icon={Icon} collapsed count={count} /></li>;
  const expanded = filter ? true : open;
  void onExpand;
  return (
    <li>
      <div className={`flex items-center rounded-xl ${within ? 'bg-mint-100/70' : ''}`}>
        <NavLink to={to} end className={({ isActive }) => `${linkBase} flex-1 gap-3 px-3 py-2 ${linkState(isActive)}`}><Icon className="size-[1.1rem]" aria-hidden="true" /> {label}<Count n={count} collapsed={false} /></NavLink>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={expanded} aria-label={`${expanded ? 'Replier' : 'Déplier'} ${label}`} className="grid size-10 place-items-center rounded-lg text-ink-muted hover:text-ink"><ChevronDown className={`size-4 transition-transform ${expanded ? '' : '-rotate-90'}`} aria-hidden="true" /></button>
      </div>
      {expanded ? (
        <ul className="ml-[1.35rem] mt-1 grid gap-0.5 border-l border-line pl-3">
          {shown.map((c) => <li key={c.to}><NavLink to={c.to} end={c.end} className={({ isActive }) => `block rounded-lg px-3 py-1.5 text-[0.86rem] font-semibold no-underline transition-colors ${isActive ? 'bg-green-500/10 text-green-700' : 'text-ink-muted hover:bg-mint-100 hover:text-ink'}`}>{c.label}</NavLink></li>)}
        </ul>
      ) : null}
    </li>
  );
}

const OPEN_KEY = 'isstas.admin.nav';
const RAIL_KEY = 'isstas.admin.rail';
const readJson = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '') as T;
  } catch {
    return fallback;
  }
};
const writeJson = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* navigation privee */ }
};

/** Titre lisible de la page courante (fil d'ariane de la barre superieure). */
function useCrumbs(): { section: string; page: string } {
  const { pathname } = useLocation();
  const parts = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  if (!parts.length) return { section: 'Administration', page: 'Tableau de bord' };
  if (parts[0] === 'r') {
    const def = resourceByKey(parts[1] ?? '');
    const group = GROUPS.find((g) => g.keys.includes(parts[1] ?? ''))?.label ?? 'Contenu';
    return { section: group, page: parts[2] ? `${def?.label ?? ''} · ${parts[2] === 'nouveau' ? 'Création' : `n° ${parts[2]}`}` : def?.label ?? 'Module' };
  }
  if (parts[0] === 'reglages') return { section: 'Réglages du site', page: SETTING_GROUPS.find((g) => g.key === parts[1])?.label ?? 'Réglages' };
  if (parts[0] === 'accueil') return { section: "Page d'accueil", page: parts[1] ? HOME_SECTIONS.find((h) => h.type === parts[1])?.label ?? 'Section' : "Vue d'ensemble" };
  if (parts[0] === 'chatbot') return { section: 'Chatbot', page: CHATBOT_TABS.find((t) => t.key === (parts[1] ?? 'apercu'))?.label ?? 'Chatbot' };
  const named: Record<string, [string, string]> = { candidatures: ['Admissions', 'Candidatures'], actions: ['Réglages du site', 'WhatsApp et boutons flottants'] };
  const [section, page] = named[parts[0]!] ?? ['Administration', 'Page'];
  return { section, page };
}

/** Compteurs « a traiter » (candidatures recues, messages non lus, questions du chatbot) : rafraichis toutes les 60 s. */
function useBadges(enabled: boolean): Badges {
  const [badges, setBadges] = useState<Badges>({});
  const load = useCallback(() => {
    api<{ applications_by_status?: Record<string, number>; unread_messages?: number; chatbot?: { unanswered: number } }>('/dashboard')
      .then((d) => setBadges({ candidatures: d.applications_by_status?.received ?? 0, messages: d.unread_messages ?? 0, chatbot: d.chatbot?.unanswered ?? 0 }))
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    if (!enabled) return;
    load();
    const t = window.setInterval(() => { if (document.visibilityState === 'visible') load(); }, 60_000);
    return () => window.clearInterval(t);
  }, [enabled, load]);
  return badges;
}

/** Coquille : menu lateral repliable en icones (groupes, sous-menus, compteurs), barre superieure avec fil d'ariane et theme. */
export function Shell() {
  const { me, loading, can, logout } = useAuth();
  const { dark, toggle: toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState('');
  const [rail, setRail] = useState<boolean>(() => readJson(RAIL_KEY, false));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => readJson(OPEN_KEY, {}));
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const crumbs = useCrumbs();
  const menuRef = useRef<HTMLDivElement>(null);
  const badges = useBadges(Boolean(me));

  useEffect(() => {
    if (!loading && !me) navigate('/admin/login', { replace: true });
  }, [loading, me, navigate]);

  useEffect(() => {
    setOpen(false);
    setMenu(false);
    window.scrollTo({ top: 0 });
    document.title = `${crumbs.page} · Administration ISSTAS`;
  }, [pathname, crumbs.page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setMenu(false); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((v) => !v); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); setRail((v) => { writeJson(RAIL_KEY, !v); return !v; }); }
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, []);

  const q = query.trim().toLowerCase();
  // Sur mobile (tiroir) la barre n'est jamais repliee ; le mode icones ne concerne que le bureau.
  const isRail = rail && !open;
  const groups = useMemo(() => GROUPS.map((g) => ({
    label: g.label,
    items: g.keys.map(resourceByKey).filter((r): r is NonNullable<typeof r> => !!r && can(`${r.module}.view`) && (!q || r.label.toLowerCase().includes(q))),
  })).filter((g) => g.items.length), [can, q]);

  if (loading) return <AdminBoot />;
  if (!me) return <Navigate to="/admin/login" replace />;

  const setRailPersist = (v: boolean) => { setRail(v); writeJson(RAIL_KEY, v); };
  const toggleGroup = (label: string) => setCollapsed((c) => { const next = { ...c, [label]: !c[label] }; writeJson(OPEN_KEY, next); return next; });
  const initials = me.name.split(/\s+/).map((w) => w.charAt(0)).slice(0, 2).join('').toUpperCase() || 'A';
  const showSettings = can('settings.view') && (!q || 'whatsapp réglages coordonnées réseaux sociaux'.includes(q) || SETTING_GROUPS.some((g) => g.label.toLowerCase().includes(q)));
  const quick = [
    { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true, show: true, match: 'tableau bord dashboard', count: 0 },
    { to: '/admin/candidatures', label: 'Candidatures', icon: Inbox, show: can('applications.view'), match: 'candidatures admissions dossiers', count: badges.candidatures },
  ].filter((i) => i.show && (!q || i.label.toLowerCase().includes(q) || i.match.includes(q)));
  const homeChildren: Child[] = [{ to: '/admin/accueil', label: "Vue d'ensemble", end: true }, ...HOME_SECTIONS.map((h) => ({ to: `/admin/accueil/${h.type}`, label: h.label }))];
  const chatChildren: Child[] = CHATBOT_TABS.map((t) => ({ to: `/admin/chatbot/${t.key}`, label: t.label }));
  const countFor = (key: string): number => (key === 'contact-messages' ? badges.messages ?? 0 : 0);
  const sideW = isRail ? 'lg:grid-cols-[4.75rem_1fr]' : 'lg:grid-cols-[17.5rem_1fr]';

  return (
    <div className={`min-h-dvh bg-mint-50 transition-[grid-template-columns] duration-300 lg:grid ${sideW}`}>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[110] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-bold">Aller au contenu</a>

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[17.5rem] flex-col border-r border-line bg-white text-ink shadow-[0_0_32px_rgb(14_42_31/.06)] transition-[transform,width] duration-300 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${isRail ? 'lg:w-[4.75rem]' : 'lg:w-[17.5rem]'} ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* identite */}
        <div className={`flex items-center border-b border-line ${isRail ? 'justify-center px-2 py-4' : 'justify-between px-4 py-4'}`}>
          <Link to="/admin" className="flex items-center gap-3 no-underline" aria-label="ISSTAS, tableau de bord">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint-100 p-1.5"><img src="/brand/logo.jpg" alt="" width={40} height={40} className="size-full object-contain" /></span>
            {!isRail ? (
              <span className="leading-tight">
                <span className="block font-display text-xl font-black tracking-[-0.03em] text-green-800">ISSTAS</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-green-600">Administration</span>
              </span>
            ) : null}
          </Link>
          <button type="button" onClick={() => setOpen(false)} aria-label="Fermer le menu" className="grid size-10 place-items-center rounded-lg hover:bg-mint-100 lg:hidden"><X className="size-5" /></button>
        </div>

        {/* recherche */}
        <div className={isRail ? 'px-3 pt-3' : 'px-4 pt-3'}>
          {isRail ? (
            <button type="button" onClick={() => setRailPersist(false)} aria-label="Ouvrir le menu et rechercher" className="group relative grid min-h-10 w-full place-items-center rounded-xl bg-mint-100 text-ink-muted hover:bg-mint-200 hover:text-ink"><Search className="size-[1.1rem]" aria-hidden="true" /></button>
          ) : (
            <label className="relative block">
              <span className="sr-only">Rechercher dans le menu</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un module…" className="min-h-10 w-full rounded-xl border-0 bg-mint-100 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:bg-white focus:outline-2 focus:outline-green-500" />
            </label>
          )}
        </div>

        <nav aria-label="Navigation de l'administration" className={`mt-3 min-h-0 flex-1 overflow-y-auto pb-4 text-[0.92rem] [scrollbar-color:rgba(61,122,95,.25)_transparent] [scrollbar-width:thin] ${isRail ? 'px-3' : 'px-4'}`}>
          <ul className="grid gap-1">
            {quick.map((i) => <li key={i.to}><Item to={i.to} label={i.label} icon={i.icon} end={i.end} collapsed={isRail} count={i.count} /></li>)}
            {can('home.view') ? <NavParent to="/admin/accueil" label="Page d'accueil" icon={Home} children={homeChildren} filter={q} collapsed={isRail} onExpand={() => setRailPersist(false)} /> : null}
            {can('chatbot.view') ? <NavParent to="/admin/chatbot" label="Chatbot" icon={MessagesSquare} children={chatChildren} filter={q} collapsed={isRail} onExpand={() => setRailPersist(false)} count={badges.chatbot} /> : null}
          </ul>

          {groups.map((g) => {
            const hasActive = g.items.some((r) => pathname.startsWith(`/admin/r/${r.key}`));
            const isOpen = q ? true : hasActive || !collapsed[g.label];
            const GroupIcon = GROUP_ICONS[g.label] ?? FileText;
            const groupCount = g.items.reduce((n, r) => n + countFor(r.key), 0);
            if (isRail) {
              // Un seul pictogramme par groupe : mene au premier module (la barre se deplie pour naviguer plus finement).
              return (
                <div key={g.label} className="mt-2 border-t border-line pt-2">
                  <Item to={`/admin/r/${g.items[0]!.key}`} label={g.label} icon={GroupIcon} collapsed count={groupCount} />
                </div>
              );
            }
            return (
              <div key={g.label} className="mt-4">
                <button type="button" onClick={() => toggleGroup(g.label)} aria-expanded={isOpen} className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 font-display text-[0.72rem] font-bold uppercase tracking-wider text-ink-muted hover:text-ink">
                  <span className="flex items-center gap-2"><GroupIcon className="size-3.5" aria-hidden="true" /> {g.label}</span>
                  <ChevronDown className={`size-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} aria-hidden="true" />
                </button>
                {isOpen ? (
                  <ul className="mt-1 grid gap-0.5">
                    {g.items.map((r) => <li key={r.key}><NavLink to={`/admin/r/${r.key}`} className={({ isActive }) => `${linkBase} gap-3 px-3 py-2 ${linkState(isActive)}`}><span className="truncate">{r.label}</span><Count n={countFor(r.key)} collapsed={false} /></NavLink></li>)}
                  </ul>
                ) : null}
              </div>
            );
          })}

          {showSettings ? (
            <div className={`mt-4 ${isRail ? 'border-t border-line pt-2' : ''}`}>
              {!isRail ? <p className="px-3 pb-1 font-display text-[0.72rem] font-bold uppercase tracking-wider text-ink-muted">Réglages du site</p> : null}
              <ul className="grid gap-0.5">
                <li><Item to="/admin/actions" label="WhatsApp et boutons" icon={SlidersHorizontal} collapsed={isRail} /></li>
                {!isRail ? SETTING_GROUPS.map((g) => <li key={g.key}><Item to={`/admin/reglages/${g.key}`} label={g.label} icon={Settings2} collapsed={false} /></li>) : (
                  <li><Item to={`/admin/reglages/${SETTING_GROUPS[0]!.key}`} label="Réglages du site" icon={Settings2} collapsed /></li>
                )}
              </ul>
            </div>
          ) : null}

          {q && !quick.length && !groups.length && !showSettings ? <p className="px-3 py-6 text-center text-sm text-ink-muted">Aucun module ne correspond à « {query} ».</p> : null}
        </nav>

        {/* pied : voir le site + replier */}
        <div className={`border-t border-line ${isRail ? 'px-3 py-3' : 'p-4'}`}>
          <a href="/fr" target="_blank" rel="noopener" aria-label={isRail ? 'Voir le site' : undefined} className={`group relative flex min-h-10 items-center rounded-xl bg-mint-100 text-sm font-semibold text-ink no-underline hover:bg-mint-200 ${isRail ? 'justify-center' : 'justify-center gap-2 px-3'}`}>
            <ExternalLink className="size-4" aria-hidden="true" />
            {isRail ? <span role="tooltip" className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-brown-900 px-3 py-1.5 text-sm font-semibold shadow-lift group-hover:block">Voir le site</span> : 'Voir le site'}
          </a>
          <button type="button" onClick={() => setRailPersist(!rail)} aria-pressed={rail} title="Réduire ou agrandir le menu (Ctrl + B)" className={`mt-2 hidden min-h-10 w-full items-center rounded-xl text-sm font-semibold text-ink-muted hover:bg-mint-100 hover:text-ink lg:flex ${isRail ? 'justify-center' : 'gap-2 px-3'}`}>
            {rail ? <ChevronsRight className="size-4" aria-hidden="true" /> : <><ChevronsLeft className="size-4" aria-hidden="true" /> Réduire le menu</>}
            {rail ? <span className="sr-only">Agrandir le menu</span> : null}
          </button>
        </div>
      </aside>
      {open ? <button type="button" aria-label="Fermer le menu" className="fixed inset-0 z-30 bg-brown-900/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} /> : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-white/90 px-4 py-2.5 shadow-soft backdrop-blur sm:px-8">
          <button type="button" className="grid size-10 place-items-center rounded-lg hover:bg-mint-100 lg:hidden" aria-label="Ouvrir le menu" onClick={() => setOpen(true)}><Menu className="size-5" /></button>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wider text-ink-muted">{crumbs.section}</p>
            <p className="truncate font-display text-lg font-extrabold leading-tight">{crumbs.page}</p>
          </div>

          <button type="button" onClick={() => setPalette(true)} aria-label="Rechercher dans l'administration (Ctrl + K)" className="ml-auto hidden min-h-10 w-72 items-center gap-3 rounded-full bg-mint-100 px-4 text-sm text-ink-muted transition hover:bg-mint-200 md:flex">
            <Search className="size-4" aria-hidden="true" /> <span className="flex-1 text-left">Rechercher…</span>
            <kbd className="rounded-md bg-white px-2 py-0.5 text-xs font-bold">Ctrl K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1.5 md:ml-2">
            <button type="button" onClick={() => setPalette(true)} aria-label="Rechercher dans l'administration" className="grid size-10 place-items-center rounded-full text-ink-muted hover:bg-mint-100 hover:text-ink md:hidden"><Search className="size-[1.15rem]" aria-hidden="true" /></button>
            <button type="button" onClick={toggleTheme} aria-pressed={dark} aria-label={dark ? 'Passer au thème clair' : 'Passer au thème sombre'} title={dark ? 'Thème clair' : 'Thème sombre'} className="grid size-10 place-items-center rounded-full text-ink-muted hover:bg-mint-100 hover:text-ink">
              {dark ? <Sun className="size-[1.15rem]" aria-hidden="true" /> : <Moon className="size-[1.15rem]" aria-hidden="true" />}
            </button>
            <div ref={menuRef} className="relative">
              <button type="button" onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-haspopup="menu" className="flex min-h-11 items-center gap-2.5 rounded-full py-1 pl-1 pr-3 hover:bg-mint-100">
                <span className="grid size-9 place-items-center rounded-full bg-green-500 font-display text-sm font-extrabold text-white">{initials}</span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block max-w-40 truncate text-sm font-bold">{me.name}</span>
                  <span className="block text-xs text-ink-muted">{me.roles.join(', ')}</span>
                </span>
                <ChevronDown className="size-4 text-ink-muted" aria-hidden="true" />
              </button>
              {menu ? (
                <div role="menu" className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-line [animation:sheet-up_.18s_ease-out]">
                  <div className="border-b border-line px-4 py-3">
                    <p className="truncate font-bold">{me.name}</p>
                    <p className="truncate text-sm text-ink-muted">{me.email}</p>
                  </div>
                  <a role="menuitem" href="/fr" target="_blank" rel="noopener" className="flex min-h-11 items-center gap-3 px-4 text-sm font-semibold no-underline hover:bg-mint-100"><ExternalLink className="size-4" aria-hidden="true" /> Voir le site</a>
                  <button role="menuitem" type="button" onClick={() => void logout()} className="flex min-h-11 w-full items-center gap-3 px-4 text-left text-sm font-semibold text-danger hover:bg-red-50"><LogOut className="size-4" aria-hidden="true" /> Se déconnecter</button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <CommandPalette open={palette} onClose={() => setPalette(false)} />
        <main id="contenu" className="mx-auto w-full max-w-[88rem] p-4 sm:p-8"><Outlet /></main>
      </div>
    </div>
  );
}

