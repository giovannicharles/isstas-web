import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Eye, EyeOff, Plus, Search, Trash2, X } from 'lucide-react';
import { Badge, Button } from '@isstas/ui';
import { api } from '@admin/lib/api';
import { describeError } from '@admin/lib/errors';
import { Alert } from '@admin/components/Alert';
import { EmptyArt, SearchArt } from '@admin/components/AdminArt';
import { useConfirm, useNotify } from '@admin/components/Notify';
import { useAuth } from '@admin/lib/auth';
import { resourceByKey } from '@admin/lib/resources';

type Row = Record<string, any>;
type Meta = { current_page: number; last_page: number; total: number };

const display = (v: unknown): string => (v && typeof v === 'object' ? ((v as Record<string, string>).fr ?? Object.values(v as object)[0] ?? '') : v == null ? '' : String(v));

/** Liste generique : recherche, pagination serveur, publication, suppression, completude anglaise. */
export default function ResourceList() {
  const { resource = '' } = useParams();
  const def = resourceByKey(resource);
  const { can } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [typed, setTyped] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const notify = useNotify();
  const confirm = useConfirm();

  const load = useCallback(async () => {
    if (!def) return;
    setLoading(true);
    try {
      const res = await api<Row[]>(`/${resource}`, { params: { page, 'filter[search]': search || undefined, per_page: 25 }, raw: true }) as unknown as { data: Row[]; meta: Meta };
      setRows(res.data);
      setMeta(res.meta);
      setError(null);
    } catch (e) {
      setError(describeError(e).message);
    } finally {
      setLoading(false);
    }
  }, [def, resource, page, search]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setPage(1); }, [resource, search]);
  // Recherche declenchee 300 ms apres la derniere frappe (pas un appel API par lettre).
  useEffect(() => { const t = window.setTimeout(() => setSearch(typed.trim()), 300); return () => window.clearTimeout(t); }, [typed]);
  useEffect(() => { setTyped(''); }, [resource]);

  if (!def) return <Alert tone="error" title="Module inconnu">Ce module n'existe pas ou n'est plus disponible.</Alert>;

  const toggle = async (row: Row) => {
    const publishing = !row.is_published;
    try {
      await api(`/${resource}/${row.id}/${publishing ? 'publish' : 'unpublish'}`, { method: 'POST' });
      notify.success(publishing ? 'Élément publié' : 'Élément dépublié', display(row[def.titleField === 'Nom' ? 'name' : 'title']) || undefined);
      void load();
    } catch (e) {
      notify.fromError(e, publishing ? 'Publication impossible' : 'Dépublication impossible');
    }
  };
  const remove = async (row: Row) => {
    const ok = await confirm({ title: 'Supprimer cet élément ?', message: "Il disparaîtra du site. Vous pourrez le restaurer depuis la corbeille si ce module la propose.", confirmLabel: 'Supprimer', danger: true });
    if (!ok) return;
    try {
      await api(`/${resource}/${row.id}`, { method: 'DELETE' });
      notify.success('Élément supprimé');
      void load();
    } catch (e) {
      notify.fromError(e, 'Suppression impossible');
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black">{def.label}</h1>
          <p className="mt-1 text-sm text-ink-muted">{meta ? `${meta.total} élément${meta.total > 1 ? 's' : ''}${search ? ` pour « ${search} »` : ''}` : loading ? 'Chargement…' : ' '}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="relative block" htmlFor="q">
            <span className="sr-only">Rechercher</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input id="q" type="search" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Rechercher…" className="field !min-h-10 w-64 !pl-9" />
          </label>
          {!def.readonly && can(`${def.module}.create`) && def.fields.length ? <Button to={`/admin/r/${resource}/nouveau`} size="sm"><Plus className="size-4" aria-hidden="true" /> Créer</Button> : null}
        </div>
      </div>

      {error ? <Alert tone="error" title="Chargement impossible" action={<Button variant="outline" size="sm" onClick={() => void load()}>Réessayer</Button>}>{error}</Alert> : null}

      <div className="overflow-x-auto rounded-[var(--radius-card)] bg-white shadow-soft ring-1 ring-line">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead className="bg-mint-100 font-display text-sm">
            <tr>
              <th scope="col" className="px-4 py-3">{def.titleField}</th>
              <th scope="col" className="px-4 py-3">Anglais</th>
              {def.publishable ? <th scope="col" className="px-4 py-3">Publication</th> : null}
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const pct = row._translation?.percent as number | undefined;
              return (
                <tr key={row.id} className="border-t border-line hover:bg-mint-50">
                  <td className="px-4 py-3"><Link to={`/admin/r/${resource}/${row.id}`} className="font-semibold">{display(row[def.titleField]) || `#${row.id}`}</Link></td>
                  <td className="px-4 py-3">{pct === undefined ? <span className="text-ink-muted">—</span> : <Badge tone={pct === 100 ? 'green' : 'warn'}>{pct}%</Badge>}</td>
                  {def.publishable ? (
                    <td className="px-4 py-3">
                      {can(`${def.module}.publish`) ? (
                        <button type="button" onClick={() => void toggle(row)} className="inline-flex items-center gap-2 font-semibold hover:underline">
                          {row.is_published ? <><Eye className="size-4 text-green-600" aria-hidden="true" /> Publié</> : <><EyeOff className="size-4 text-ink-muted" aria-hidden="true" /> Brouillon</>}
                        </button>
                      ) : <Badge tone={row.is_published ? 'green' : 'outline'}>{row.is_published ? 'Publié' : 'Brouillon'}</Badge>}
                    </td>
                  ) : null}
                  <td className="px-4 py-3 text-right">
                    {can(`${def.module}.delete`) ? <button type="button" onClick={() => void remove(row)} aria-label="Supprimer" className="grid size-9 place-items-center rounded-lg text-danger hover:bg-red-50"><Trash2 className="size-4" /></button> : null}
                  </td>
                </tr>
              );
            })}
            {loading && !rows.length
              ? Array.from({ length: 5 }, (_, i) => (
                  <tr key={`sk${i}`} className="border-t border-line" aria-hidden="true">
                    {Array.from({ length: def.publishable ? 4 : 3 }, (_, j) => <td key={j} className="px-4 py-4"><span className="block h-4 animate-pulse rounded bg-mint-200" style={{ width: j === 0 ? '70%' : '40%' }} /></td>)}
                  </tr>
                ))
              : null}
            {!loading && !rows.length && !error ? (
              <tr>
                <td colSpan={4} className="px-4 py-14 text-center">
                  {search ? <SearchArt className="mx-auto h-32 w-auto" /> : <EmptyArt className="mx-auto h-32 w-auto" />}
                  <p className="mt-4 font-display text-lg font-extrabold">{search ? 'Aucun résultat' : 'Rien ici pour le moment'}</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">{search ? `Aucun élément ne correspond à « ${search} ».` : 'Ajoutez le premier élément : il apparaîtra sur le site dès sa publication.'}</p>
                  <div className="mt-5 flex justify-center gap-3">
                    {search ? <Button variant="outline" size="sm" onClick={() => setTyped('')}><X className="size-4" aria-hidden="true" /> Effacer la recherche</Button> : null}
                    {!search && !def.readonly && can(`${def.module}.create`) && def.fields.length ? <Button to={`/admin/r/${resource}/nouveau`} size="sm"><Plus className="size-4" aria-hidden="true" /> Créer</Button> : null}
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 ? (
        <nav aria-label="Pagination" className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</Button>
          <span className="font-semibold">{page} / {meta.last_page} · {meta.total} éléments</span>
          <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>Suivant</Button>
        </nav>
      ) : null}
    </div>
  );
}