import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react';
import { api } from '@admin/lib/api';
import { describeError } from '@admin/lib/errors';

type Row = Record<string, unknown> & { id: number };
const cache = new Map<string, Row[]>();

const labelOf = (row: Row, field: string): string => {
  const v = row[field];
  if (v && typeof v === 'object') return String((v as Record<string, string>).fr ?? Object.values(v as object)[0] ?? `#${row.id}`);
  return v == null || v === '' ? `#${row.id}` : String(v);
};

/**
 * Liste deroulante avec recherche pour choisir un element lie (niveau, filiere, categorie...).
 * Remplace la saisie d'un identifiant : on voit le nom, jamais le numero.
 */
export function RelationSelect({ id, resource, labelField, value, onChange, emptyLabel, required, invalid }: {
  id: string; resource: string; labelField: string; value: number | null | undefined; onChange: (v: number | null) => void; emptyLabel?: string; required?: boolean; invalid?: boolean;
}) {
  const [rows, setRows] = useState<Row[] | null>(cache.get(resource) ?? null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const list = useId();

  useEffect(() => {
    if (cache.has(resource)) return;
    let live = true;
    api<Row[]>(`/${resource}`, { params: { per_page: 100 } })
      .then((r) => { cache.set(resource, r); if (live) setRows(r); })
      .catch((e) => live && setError(describeError(e).message));
    return () => { live = false; };
  }, [resource]);

  useEffect(() => {
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, []);

  const options = useMemo(() => {
    const all = (rows ?? []).map((r) => ({ id: r.id, label: labelOf(r, labelField) }));
    const needle = q.trim().toLowerCase();
    return needle ? all.filter((o) => o.label.toLowerCase().includes(needle)) : all;
  }, [rows, q, labelField]);
  const current = rows?.find((r) => r.id === value);
  const choose = (v: number | null) => { onChange(v); setOpen(false); setQ(''); };

  return (
    <div ref={box} className="relative">
      <button type="button" id={id} onClick={() => { setOpen((v) => !v); setActive(0); }} aria-haspopup="listbox" aria-expanded={open} aria-controls={list} aria-invalid={invalid ? true : undefined} aria-required={required}
        className="field flex w-full items-center justify-between gap-3 text-left">
        <span className={`truncate ${current ? '' : 'text-ink-muted'}`}>{!rows && !error ? 'Chargement…' : current ? labelOf(current, labelField) : value ? `#${value}` : emptyLabel ?? 'Choisir…'}</span>
        {!rows && !error ? <Loader2 className="size-4 animate-spin text-ink-muted" aria-hidden="true" /> : <ChevronDown className={`size-4 shrink-0 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />}
      </button>

      {open ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-line [animation:sheet-up_.15s_ease-out]">
          <label className="relative block border-b border-line">
            <span className="sr-only">Filtrer la liste</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} placeholder="Rechercher…" className="min-h-11 w-full border-0 bg-transparent pl-10 pr-3 outline-none"
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, options.length - (required ? 1 : 0))); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
                else if (e.key === 'Enter') { e.preventDefault(); const i = required ? active : active - 1; if (!required && active === 0) choose(null); else if (options[i]) choose(options[i]!.id); }
                else if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); }
              }} />
          </label>
          <ul id={list} role="listbox" className="max-h-64 overflow-y-auto py-1">
            {error ? <li className="px-4 py-3 text-sm font-semibold text-danger">{error}</li> : null}
            {!required ? (
              <li role="option" aria-selected={value == null} onMouseEnter={() => setActive(0)} onClick={() => choose(null)} className={`flex min-h-10 cursor-pointer items-center gap-2 px-4 text-sm text-ink-muted ${active === 0 ? 'bg-mint-100' : ''}`}>
                <X className="size-4" aria-hidden="true" /> {emptyLabel ?? 'Aucun'}
              </li>
            ) : null}
            {options.map((o, i) => {
              const idx = required ? i : i + 1;
              return (
                <li key={o.id} role="option" aria-selected={o.id === value} onMouseEnter={() => setActive(idx)} onClick={() => choose(o.id)}
                  className={`flex min-h-10 cursor-pointer items-center justify-between gap-3 px-4 text-sm font-semibold ${active === idx ? 'bg-mint-100' : ''}`}>
                  <span className="truncate">{o.label}</span>
                  {o.id === value ? <Check className="size-4 shrink-0 text-green-600" aria-hidden="true" /> : null}
                </li>
              );
            })}
            {rows && !options.length ? <li className="px-4 py-4 text-center text-sm text-ink-muted">Aucun résultat pour « {q} ».</li> : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
