import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Badge, Button } from '@isstas/ui';
import { api } from '@admin/lib/api';
import { describeError } from '@admin/lib/errors';
import { Alert } from '@admin/components/Alert';
import { RelationSelect } from '@admin/components/RelationSelect';
import { useConfirm, useNotify } from '@admin/components/Notify';
import { useAuth } from '@admin/lib/auth';
import { resourceByKey, type FieldDef } from '@admin/lib/resources';

type Values = Record<string, any>;
const LOCALES = ['fr', 'en'] as const;

/** Editeur generique : champs a onglets FR | EN, completude, suggestion de traduction (jamais enregistree seule). */
export default function ResourceEdit() {
  const { resource = '', id } = useParams();
  const def = resourceByKey(resource);
  const navigate = useNavigate();
  const { can } = useAuth();
  const [values, setValues] = useState<Values>({});
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [baseline, setBaseline] = useState('{}');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const notify = useNotify();
  const confirm = useConfirm();
  const [completeness, setCompleteness] = useState<number | null>(null);
  const creating = !id;

  useEffect(() => {
    if (!id || !def) return;
    setLoadError(null);
    api<Values>(`/${resource}/${id}`)
      .then((row) => {
        setValues(row);
        setBaseline(JSON.stringify(row));
        setCompleteness(row._translation?.percent ?? null);
      })
      .catch((ex) => setLoadError(describeError(ex).message));
  }, [id, def, resource]);

  const fields = useMemo(() => def?.fields ?? [], [def]);

  // Prevenir avant de fermer l'onglet avec des modifications non enregistrees.
  const dirtyRef = useRef(false);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirtyRef.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);
  if (!def) return <Alert tone="error" title="Module inconnu">Ce module n'existe pas ou n'est plus disponible.</Alert>;
  if (!creating && baseline === '{}' && !loadError) {
    return (
      <div className="grid max-w-3xl gap-6" aria-busy="true">
        <span className="sr-only">Chargement de l'élément…</span>
        <div className="h-9 w-64 animate-pulse rounded-lg bg-mint-200" />
        <div className="grid gap-5 rounded-[var(--radius-card)] bg-white p-6 shadow-soft ring-1 ring-line">
          {Array.from({ length: 5 }, (_, i) => <div key={i} className="grid gap-2"><div className="h-4 w-32 animate-pulse rounded bg-mint-200" /><div className={`${i % 2 ? 'h-28' : 'h-11'} animate-pulse rounded-xl bg-mint-100`} /></div>)}
        </div>
      </div>
    );
  }
  if (loadError) return <Alert tone="error" title="Chargement impossible" action={<button type="button" className="font-semibold underline" onClick={() => navigate(`/admin/r/${resource}`)}>Retour à la liste</button>}>{loadError}</Alert>;
  const hasTranslatable = fields.some((f) => f.tr);
  const dirty = JSON.stringify(values) !== baseline && (creating ? Object.keys(values).length > 0 : baseline !== '{}');
  dirtyRef.current = dirty;

  const setValue = (f: FieldDef, value: unknown, locale?: string) =>
    setValues((v) => (f.tr ? { ...v, [f.name]: { ...(v[f.name] ?? {}), [locale ?? lang]: value } } : { ...v, [f.name]: value }));

  /** Langues qui portent au moins une erreur : l'onglet correspondant est signale. */
  const langsWithErrors = LOCALES.filter((l) => Object.keys(errors).some((k) => k.endsWith(`.${l}`)));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setSummary(null);
    try {
      const payload: Values = {};
      for (const f of fields) {
        let v = values[f.name];
        if (f.type === 'json' && typeof v === 'string') {
          try {
            v = v.trim() ? JSON.parse(v) : null;
          } catch {
            setErrors({ [f.name]: ["Le contenu n'est pas un JSON valide (vérifiez accolades, guillemets et virgules)."] });
            setSummary(`Le champ « ${f.label} » contient un JSON invalide.`);
            notify.warning('Champ à corriger', `« ${f.label} » : JSON invalide.`);
            return;
          }
        }
        if (v !== undefined) payload[f.name] = v;
      }
      const row = creating
        ? await api<Values>(`/${resource}`, { method: 'POST', body: payload })
        : await api<Values>(`/${resource}/${id}`, { method: 'PUT', body: payload });
      setValues(row);
      setBaseline(JSON.stringify(row));
      setCompleteness(row._translation?.percent ?? null);
      notify.success(creating ? 'Élément créé' : 'Modifications enregistrées', def?.label);
      if (creating) navigate(`/admin/r/${resource}/${row.id}`, { replace: true });
    } catch (ex) {
      const d = describeError(ex);
      if (d.kind === 'validation' && Object.keys(d.fields).length) {
        setErrors(d.fields);
        const labels = Object.keys(d.fields).map((k) => fields.find((f) => f.name === k.split('.')[0])?.label ?? k).filter((v, i, all) => all.indexOf(v) === i);
        setSummary(`${labels.length > 1 ? 'Champs à corriger' : 'Champ à corriger'} : ${labels.join(', ')}.`);
        // Bascule sur la langue qui contient la premiere erreur.
        const firstLang = Object.keys(d.fields).map((k) => k.split('.')[1]).find((l) => l === 'fr' || l === 'en');
        if (firstLang) setLang(firstLang as 'fr' | 'en');
        notify.warning(d.title, d.message);
      } else {
        notify.fromError(ex, "Enregistrement impossible");
      }
    } finally {
      setBusy(false);
    }
  }

  async function suggest(f: FieldDef) {
    const fr = values[f.name]?.fr;
    if (!fr) {
      notify.info('Rien à traduire', `Renseignez d'abord « ${f.label} » en français.`);
      return;
    }
    try {
      const res = await api<{ suggestion: string }>('/translate', { method: 'POST', body: { text: fr, context: f.label } });
      setValue(f, res.suggestion, 'en');
      notify.info('Suggestion insérée', "Relisez la traduction avant d'enregistrer : elle n'est pas sauvegardée automatiquement.");
    } catch (ex) {
      const d = describeError(ex);
      if (d.kind === 'server' || (ex as { status?: number }).status === 503) notify.warning('Traduction indisponible', "L'assistant de traduction n'est pas configuré ou ne répond pas.");
      else notify.fromError(ex, 'Traduction impossible');
    }
  }

  const err = (name: string, locale?: string) => errors[locale ? `${name}.${locale}` : name]?.[0] ?? errors[name]?.[0];
  const jsonText = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : JSON.stringify(v, null, 2));

  return (
    <form onSubmit={submit} className="grid max-w-3xl gap-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-black">{creating ? `Créer : ${def.label}` : def.label}</h1>
        {completeness !== null ? <Badge tone={completeness === 100 ? 'green' : 'warn'}>Anglais {completeness}%</Badge> : null}
      </div>

      {hasTranslatable ? (
        <div role="tablist" aria-label="Langue d'édition" className="inline-flex gap-1 rounded-lg bg-white p-1 ring-2 ring-line">
          {LOCALES.map((l) => (
            <button key={l} type="button" role="tab" aria-selected={lang === l} onClick={() => setLang(l)} className={`relative rounded-md px-5 py-2 font-display font-bold uppercase ${lang === l ? 'bg-green-500 text-white' : 'hover:bg-mint-100'}`}>{l}{langsWithErrors.includes(l) ? <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger" aria-label="contient des erreurs" /> : null}</button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 rounded-[var(--radius-card)] bg-white shadow-soft ring-1 ring-line p-6">
        {fields.map((f) => {
          const id = `f-${f.name}`;
          const value = f.tr ? (values[f.name]?.[lang] ?? '') : (values[f.name] ?? '');
          return (
            <div key={f.name} className="grid gap-1.5">
              <label htmlFor={id} className="flex items-center justify-between gap-3 font-display text-sm font-bold">
                <span>{f.label}{f.required && (!f.tr || lang === 'fr') ? <span className="text-danger"> *</span> : null}</span>
                {f.tr && lang === 'en' && can('pages.update') ? (
                  <button type="button" onClick={() => void suggest(f)} className="inline-flex items-center gap-1 text-xs font-bold text-green-700 hover:underline"><Sparkles className="size-3.5" aria-hidden="true" /> Suggérer depuis le français</button>
                ) : null}
              </label>
              {f.type === 'relation' && f.rel ? (
                <RelationSelect id={id} resource={f.rel.resource} labelField={f.rel.labelField} emptyLabel={f.rel.empty} required={f.required} invalid={Boolean(err(f.name))}
                  value={(values[f.name] as number | null | undefined) ?? null} onChange={(v) => setValue(f, v)} />
              ) : f.type === 'boolean' ? (
                <input id={id} type="checkbox" checked={!!values[f.name]} onChange={(e) => setValue(f, e.target.checked)} className="size-5 accent-green-600" />
              ) : f.type === 'textarea' || f.type === 'json' ? (
                <textarea id={id} rows={f.type === 'json' ? 8 : 5} value={f.type === 'json' ? jsonText(value) : value} onChange={(e) => setValue(f, e.target.value)} className={`field ${f.type === 'json' ? 'font-mono text-sm' : ''}`} aria-invalid={err(f.name, f.tr ? lang : undefined) ? true : undefined} />
              ) : (
                <input id={id} type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'datetime' ? 'datetime-local' : 'text'} value={value ?? ''} onChange={(e) => setValue(f, f.type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)} className="field" aria-invalid={err(f.name, f.tr ? lang : undefined) ? true : undefined} />
              )}
              {err(f.name, f.tr ? lang : undefined) ? <p role="alert" className="text-sm font-semibold text-danger">{err(f.name, f.tr ? lang : undefined)}</p> : null}
            </div>
          );
        })}
      </div>

      {summary ? <Alert tone="error" title="L'enregistrement n'a pas abouti">{summary}</Alert> : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:left-[17.5rem]">
        <div className="mx-auto flex max-w-[88rem] flex-wrap items-center gap-3 sm:px-4">
          <Button type="submit" size="md" disabled={busy || !dirty || !can(`${def.module}.${creating ? 'create' : 'update'}`)}>{busy ? 'Enregistrement…' : 'Enregistrer'}</Button>
          <Button variant="ghost" onClick={async () => {
            if (dirty && !(await confirm({ title: 'Quitter sans enregistrer ?', message: 'Vos modifications seront perdues.', confirmLabel: 'Quitter', danger: true }))) return;
            navigate(`/admin/r/${resource}`);
          }}>Retour à la liste</Button>
          <span role="status" className={`ml-auto flex items-center gap-2 text-sm font-semibold ${dirty ? 'text-amber-600' : 'text-ink-muted'}`}>
            <span aria-hidden="true" className={`size-2.5 rounded-full ${dirty ? 'bg-amber-400' : 'bg-green-500'}`} />
            {dirty ? 'Modifications non enregistrées' : creating ? 'Nouveau' : 'Tout est enregistré'}
          </span>
        </div>
      </div>
    </form>
  );
}