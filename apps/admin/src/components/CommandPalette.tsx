import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, FileText, Globe, History, Home, Inbox, Loader2, MessagesSquare, Search, Settings2, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { api } from '@admin/lib/api';
import { useAuth } from '@admin/lib/auth';
import { CHATBOT_TABS, GROUPS, HOME_SECTIONS, SETTING_GROUPS, resourceByKey } from '@admin/lib/resources';

type Entry = { id: string; label: string; hint: string; to: string; icon: LucideIcon; keywords?: string };

/** Ressources interrogees en direct quand on tape (les autres modules restent trouvables par leur nom). */
const SEARCHABLE = ['programs', 'levels', 'pages', 'news', 'faqs', 'downloads', 'partners', 'testimonials', 'events'] as const;
const RECENT_KEY = 'isstas.admin.recent';
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const titleOf = (v: unknown): string => (v && typeof v === 'object' ? String((v as Record<string, string>).fr ?? Object.values(v as object)[0] ?? '') : v == null ? '' : String(v));

function readRecent(): Entry[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as Entry[];
  } catch {
    return [];
  }
}

/**
 * Palette de commandes (Ctrl + K) : un seul champ pour aller n'importe ou — modules, sections de l'accueil, reglages —
 * et retrouver un contenu precis (filiere, page, actualite...) sans naviguer dans les menus.
 */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { can } = useAuth();
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [remote, setRemote] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState<Entry[]>(readRecent);

  const pages = useMemo<Entry[]>(() => {
    const out: Entry[] = [{ id: 'dash', label: 'Tableau de bord', hint: 'Accueil de l\'administration', to: '/admin', icon: Home, keywords: 'accueil dashboard' }];
    if (can('applications.view')) out.push({ id: 'cand', label: 'Candidatures', hint: 'Admissions', to: '/admin/candidatures', icon: Inbox, keywords: 'admissions dossiers pre-inscription' });
    if (can('home.view')) {
      out.push({ id: 'home', label: "Page d'accueil · vue d'ensemble", hint: 'Ordre et visibilité des sections', to: '/admin/accueil', icon: Home });
      HOME_SECTIONS.forEach((h) => out.push({ id: `home-${h.type}`, label: h.label, hint: "Page d'accueil · section", to: `/admin/accueil/${h.type}`, icon: Home, keywords: 'section fond vague decor' }));
    }
    if (can('chatbot.view')) CHATBOT_TABS.forEach((t) => out.push({ id: `chat-${t.key}`, label: `Chatbot · ${t.label}`, hint: 'Chatbot', to: `/admin/chatbot/${t.key}`, icon: MessagesSquare }));
    GROUPS.forEach((g) => g.keys.forEach((k) => {
      const r = resourceByKey(k);
      if (r && can(`${r.module}.view`)) out.push({ id: `r-${k}`, label: r.label, hint: g.label, to: `/admin/r/${k}`, icon: FileText, keywords: k });
    }));
    if (can('settings.view')) {
      out.push({ id: 'wa', label: 'WhatsApp et boutons flottants', hint: 'Réglages du site', to: '/admin/actions', icon: SlidersHorizontal, keywords: 'whatsapp chatbot retour haut' });
      SETTING_GROUPS.forEach((g) => out.push({ id: `set-${g.key}`, label: g.label, hint: 'Réglages du site', to: `/admin/reglages/${g.key}`, icon: Settings2 }));
    }
    out.push({ id: 'site', label: 'Voir le site public', hint: 'Ouvre un nouvel onglet', to: 'site:/fr', icon: Globe, keywords: 'visiter' });
    return out;
  }, [can]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { d.showModal(); setQ(''); setActive(0); setRemote([]); setRecent(readRecent()); }
    if (!open && d.open) d.close();
  }, [open]);

  // Recherche de contenus : 250 ms apres la derniere frappe, une requete par ressource accessible.
  useEffect(() => {
    const term = q.trim();
    if (!open || term.length < 2) { setRemote([]); setBusy(false); return; }
    let live = true;
    setBusy(true);
    const t = window.setTimeout(async () => {
      const lists = await Promise.all(SEARCHABLE.map(async (key) => {
        const def = resourceByKey(key);
        if (!def || !can(`${def.module}.view`)) return [] as Entry[];
        try {
          const rows = await api<Record<string, unknown>[]>(`/${key}`, { params: { 'filter[search]': term, per_page: 4 } });
          return rows.map((row) => ({ id: `${key}-${row.id}`, label: titleOf(row[def.titleField]) || `#${row.id}`, hint: def.label, to: `/admin/r/${key}/${row.id}`, icon: FileText }));
        } catch {
          return [] as Entry[];
        }
      }));
      if (live) { setRemote(lists.flat()); setBusy(false); }
    }, 250);
    return () => { live = false; window.clearTimeout(t); };
  }, [q, open, can]);

  const local = useMemo(() => {
    const needle = norm(q.trim());
    if (!needle) return [];
    return pages.filter((p) => norm(`${p.label} ${p.hint} ${p.keywords ?? ''}`).includes(needle)).slice(0, 8);
  }, [q, pages]);

  const sections = useMemo(() => {
    if (!q.trim()) return [{ title: recent.length ? 'Récemment ouverts' : 'Accès rapide', items: recent.length ? recent : pages.slice(0, 8) }];
    return [{ title: 'Pages et modules', items: local }, { title: 'Contenus', items: remote }].filter((s) => s.items.length);
  }, [q, recent, pages, local, remote]);
  const flat = sections.flatMap((s) => s.items);

  const go = useCallback((e: Entry) => {
    onClose();
    const next = [e, ...readRecent().filter((r) => r.id !== e.id)].slice(0, 6);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next.map(({ icon: _i, ...rest }) => rest))); } catch { /* navigation privee */ }
    if (e.to.startsWith('site:')) window.open(e.to.slice(5), '_blank', 'noopener');
    else navigate(e.to);
  }, [navigate, onClose]);

  // Les icones ne se serialisent pas : les entrees « recentes » retrouvent leur icone par leur identifiant.
  const withIcon = (e: Entry): Entry => ({ ...e, icon: e.icon ?? pages.find((p) => p.id === e.id)?.icon ?? FileText });
  let cursor = -1;

  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }} aria-label="Palette de commandes"
      className="m-0 mx-auto mt-[12vh] w-[min(40rem,calc(100vw-1.5rem))] rounded-[1.5rem] border-0 bg-white p-0 text-ink shadow-lift backdrop:bg-brown-900/60 backdrop:backdrop-blur-sm">
      <div className="relative border-b border-line">
        <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} placeholder="Aller à… (filière, page, module, réglage)" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-activedescendant={flat[active] ? `pal-${flat[active]!.id}` : undefined}
          className="min-h-14 w-full border-0 bg-transparent pl-14 pr-14 text-base outline-none"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === 'Enter' && flat[active]) { e.preventDefault(); go(withIcon(flat[active]!)); }
          }} />
        {busy ? <Loader2 className="absolute right-5 top-1/2 size-5 -translate-y-1/2 animate-spin text-ink-muted" aria-hidden="true" /> : <kbd className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md bg-mint-100 px-2 py-1 text-xs font-bold text-ink-muted">Échap</kbd>}
      </div>

      <div id="palette-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
        {sections.map((s) => (
          <div key={s.title} className="mb-1">
            <p className="flex items-center gap-2 px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wider text-ink-muted">{s.title === 'Récemment ouverts' ? <History className="size-3.5" aria-hidden="true" /> : null}{s.title}</p>
            {s.items.map((raw) => {
              const item = withIcon(raw);
              cursor += 1;
              const i = cursor;
              const Icon = item.icon;
              return (
                <button key={item.id} id={`pal-${item.id}`} role="option" aria-selected={i === active} type="button" onMouseEnter={() => setActive(i)} onClick={() => go(item)}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors ${i === active ? 'bg-green-500 text-white' : 'hover:bg-mint-100'}`}>
                  <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${i === active ? 'bg-white/20' : 'bg-mint-100 text-green-600'}`}><Icon className="size-4" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{item.label}</span><span className={`block truncate text-xs ${i === active ? 'text-white/80' : 'text-ink-muted'}`}>{item.hint}</span></span>
                  {i === active ? <CornerDownLeft className="size-4 shrink-0 opacity-80" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        ))}
        {q.trim().length >= 2 && !busy && !flat.length ? <p className="px-4 py-10 text-center text-ink-muted">Aucun résultat pour « {q} ».</p> : null}
      </div>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-5 py-3 text-xs text-ink-muted">
        <span><kbd className="rounded bg-mint-100 px-1.5 py-0.5 font-bold">↑</kbd> <kbd className="rounded bg-mint-100 px-1.5 py-0.5 font-bold">↓</kbd> naviguer</span>
        <span><kbd className="rounded bg-mint-100 px-1.5 py-0.5 font-bold">Entrée</kbd> ouvrir</span>
        <span className="ml-auto">Astuce : tapez le nom d'une filière ou d'une page</span>
      </footer>
    </dialog>
  );
}
