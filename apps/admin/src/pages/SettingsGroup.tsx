import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@isstas/ui';
import { api } from '@admin/lib/api';
import { describeError } from '@admin/lib/errors';
import { Alert } from '@admin/components/Alert';
import { useNotify } from '@admin/components/Notify';
import { SETTING_GROUPS } from '@admin/lib/resources';

const isPlain = (v: unknown) => typeof v === 'string' || typeof v === 'number' || v === null;

const LABELS: Record<string, string> = {
  'social.facebook': 'Facebook : URL complète ou identifiant',
  'social.instagram': 'Instagram : URL complète ou @identifiant',
  'social.tiktok': 'TikTok : URL complète ou @identifiant',
  'social.youtube': 'YouTube : URL complète ou @identifiant',
  'social.linkedin': 'LinkedIn : URL complète ou identifiant de la page',
  'social.whatsapp': 'WhatsApp (utiliser plutôt « WhatsApp et boutons flottants »)',
  'contact.phones': 'Téléphones (liste JSON)',
  'contact.email': 'E-mail de contact',
  'contact.postal_box': 'Boîte postale',
  'contact.address': 'Adresse',
  'contact.website': 'Site web',
  'contact.access_plan': 'Plan d’accès (étapes, JSON)',
  'institution.credit': 'Mention de réalisation (pied de page)',
  'institution.about': 'Texte « À propos de nous » (pied de page)',
  'top_header.announcement': 'Bannière d’annonce (enabled, text, link, starts_at, ends_at)',
};

/** Reglages d'un groupe : texte simple en champ, valeurs structurees (fr/en, listes) en JSON. */
export default function SettingsGroup() {
  const { group = '' } = useParams();
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [raw, setRaw] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<{ title: string; message: string; fields: Record<string, string[]> } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const notify = useNotify();
  const label = SETTING_GROUPS.find((g) => g.key === group)?.label ?? group;

  useEffect(() => {
    setLoadError(null);
    setProblem(null);
    api<{ values: Record<string, unknown> }>(`/settings/${group}`)
      .then((res) => {
        setValues(res.values);
        setRaw(Object.fromEntries(Object.entries(res.values).map(([k, v]) => [k, isPlain(v) ? String(v ?? '') : JSON.stringify(v, null, 2)])));
      })
      .catch((e) => setLoadError(describeError(e).message));
  }, [group]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setProblem(null);
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(values)) {
        const text = raw[k] ?? '';
        if (isPlain(v)) {
          payload[k] = typeof v === 'number' ? Number(text) : text === '' ? null : text;
        } else {
          try {
            payload[k] = JSON.parse(text);
          } catch {
            setProblem({ title: 'Valeur à corriger', message: `« ${LABELS[k] ?? k} » n'est pas un JSON valide (vérifiez accolades, guillemets et virgules).`, fields: { [k]: ['JSON invalide'] } });
            notify.warning('Valeur à corriger', `${LABELS[k] ?? k} : JSON invalide.`);
            return;
          }
        }
      }
      await api(`/settings/${group}`, { method: 'PUT', body: { values: payload } });
      notify.success('Réglages enregistrés', `« ${label} » est à jour sur le site.`);
    } catch (ex) {
      const d = notify.fromError(ex, 'Enregistrement impossible');
      setProblem({ title: d.title, message: d.message, fields: d.fields });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid max-w-3xl gap-6">
      <h1 className="font-display text-3xl font-black">{label}</h1>
      {loadError ? <Alert tone="error" title="Chargement impossible">{loadError}</Alert> : null}
      {problem ? <Alert tone="error" title={problem.title}>{problem.message}</Alert> : null}
      <div className="grid gap-5 rounded-[var(--radius-card)] bg-white shadow-soft ring-1 ring-line p-6">
        {Object.entries(values).map(([k, v]) => (
          <div key={k} className="grid gap-1.5">
            <label htmlFor={k} className="text-sm font-bold">{LABELS[k] ?? k}<span className="ml-2 font-mono text-xs font-normal text-ink-muted">{k}</span></label>
            {isPlain(v) ? (
              <input id={k} value={raw[k] ?? ''} onChange={(e) => setRaw((r) => ({ ...r, [k]: e.target.value }))} className="field" aria-invalid={problem?.fields[`values.${k}`] || problem?.fields[k] ? true : undefined} />
            ) : (
              <textarea id={k} rows={Math.min(12, (raw[k] ?? '').split('\n').length + 1)} value={raw[k] ?? ''} onChange={(e) => setRaw((r) => ({ ...r, [k]: e.target.value }))} className="field font-mono text-sm" />
            )}
          </div>
        ))}
      </div>
      {problem && Object.keys(problem.fields).length ? (
        <ul className="grid gap-1 text-sm font-semibold text-danger">{Object.entries(problem.fields).map(([k, m]) => <li key={k}>{LABELS[k.replace(/^values\./, '')] ?? k} : {m[0]}</li>)}</ul>
      ) : null}
      <div><Button type="submit" size="lg" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</Button></div>
    </form>
  );
}