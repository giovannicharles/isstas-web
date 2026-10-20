import { useEffect, useState } from 'react';
import { Button, Switch } from '@isstas/ui';
import { api } from '@admin/lib/api';
import { Alert } from '@admin/components/Alert';
import { useNotify } from '@admin/components/Notify';
import { describeError } from '@admin/lib/errors';

type L = { fr?: string; en?: string };
type Action = {
  id: number;
  key: 'whatsapp' | 'back_to_top' | 'chatbot' | string;
  is_enabled: boolean;
  settings: Record<string, any> | null;
  texts: Record<string, any> | null;
};

const TITLES: Record<string, string> = {
  whatsapp: 'Bouton WhatsApp flottant',
  back_to_top: 'Bouton « retour en haut »',
  chatbot: 'Assistant (chatbot)',
};

/** Actions flottantes (bas droite du site) : numero WhatsApp et message, seuil du retour en haut, chatbot. */
export default function FloatingActions() {
  const [items, setItems] = useState<Action[]>([]);
  const [status, setStatus] = useState<Record<number, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const notify = useNotify();

  useEffect(() => {
    api<Action[]>('/floating-actions', { raw: true })
      .then((res) => setItems((res as unknown as { data: Action[] }).data))
      .catch((e) => setLoadError(describeError(e).message));
  }, []);

  const patch = (id: number, fn: (a: Action) => Action) => setItems((list) => list.map((a) => (a.id === id ? fn(a) : a)));
  const setText = (a: Action, field: string, lang: 'fr' | 'en', value: string) =>
    patch(a.id, (x) => ({ ...x, texts: { ...(x.texts ?? {}), [field]: { ...((x.texts?.[field] as L) ?? {}), [lang]: value } } }));
  const setSetting = (a: Action, field: string, value: unknown) => patch(a.id, (x) => ({ ...x, settings: { ...(x.settings ?? {}), [field]: value } }));

  async function save(a: Action) {
    setSaving(a.id);
    setStatus((s) => ({ ...s, [a.id]: '' }));
    try {
      await api(`/floating-actions/${a.id}`, { method: 'PUT', body: { is_enabled: a.is_enabled, settings: a.settings, texts: a.texts } });
      notify.success('Bouton enregistré', TITLES[a.key] ?? 'Modification prise en compte sur le site.');
    } catch (e) {
      const d = notify.fromError(e, 'Enregistrement impossible');
      setStatus((s) => ({ ...s, [a.id]: Object.values(d.fields)[0]?.[0] ?? d.message }));
    } finally {
      setSaving(null);
    }
  }

  const lines = (v: unknown): string => (Array.isArray(v) ? (v as L[]).map((x) => x.fr ?? '').join('\n') : '');

  return (
    <div className="grid max-w-3xl gap-8">
      <h1 className="font-display text-3xl font-black">Actions flottantes</h1>
      {loadError ? <Alert tone="error" title="Chargement impossible">{loadError}</Alert> : null}
      <p className="text-ink-muted">Ces boutons s'affichent en bas à droite du site, empilés. Tout se règle ici.</p>

      {items.map((a) => (
        <section key={a.id} className="grid gap-5 rounded-[var(--radius-card)] bg-white shadow-soft ring-1 ring-line p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-extrabold">{TITLES[a.key] ?? a.key}</h2>
            <label className="flex items-center gap-3 font-semibold">
              <span>{a.is_enabled ? 'Activé' : 'Désactivé'}</span>
              <Switch checked={a.is_enabled} onCheckedChange={(v) => patch(a.id, (x) => ({ ...x, is_enabled: v }))} aria-label="Activer" />
            </label>
          </div>

          {a.key === 'whatsapp' ? (
            <>
              <Field label="Numéro WhatsApp (format international)" hint="Ex. +237 695 292 287">
                <input className="field" value={(a.settings?.phone as string) ?? ''} onChange={(e) => setSetting(a, 'phone', e.target.value)} />
              </Field>
              <Field label="Message prérempli (français)"><textarea rows={2} className="field" value={(a.texts?.message as L)?.fr ?? ''} onChange={(e) => setText(a, 'message', 'fr', e.target.value)} /></Field>
              <Field label="Message prérempli (anglais)"><textarea rows={2} className="field" value={(a.texts?.message as L)?.en ?? ''} onChange={(e) => setText(a, 'message', 'en', e.target.value)} /></Field>
            </>
          ) : null}

          {a.key === 'back_to_top' ? (
            <Field label="Apparaît après (pixels de défilement)">
              <input type="number" min={0} className="field" value={Number(a.settings?.threshold_px ?? 400)} onChange={(e) => setSetting(a, 'threshold_px', Number(e.target.value))} />
            </Field>
          ) : null}

          {a.key === 'chatbot' ? (
            <>
              <Field label="Nom de l'assistant"><input className="field" value={(a.settings?.name as string) ?? ''} onChange={(e) => setSetting(a, 'name', e.target.value)} /></Field>
              <Field label="Message d'accueil (français)"><textarea rows={2} className="field" value={(a.texts?.welcome as L)?.fr ?? ''} onChange={(e) => setText(a, 'welcome', 'fr', e.target.value)} /></Field>
              <Field label="Message d'accueil (anglais)"><textarea rows={2} className="field" value={(a.texts?.welcome as L)?.en ?? ''} onChange={(e) => setText(a, 'welcome', 'en', e.target.value)} /></Field>
              <Field label="Questions suggérées (français, une par ligne)" hint="Les traductions anglaises se règlent dans le module « Actions flottantes » avancé.">
                <textarea
                  rows={3}
                  className="field"
                  value={lines(a.texts?.suggestions)}
                  onChange={(e) => patch(a.id, (x) => ({ ...x, texts: { ...(x.texts ?? {}), suggestions: e.target.value.split('\n').filter(Boolean).map((fr, i) => ({ fr, en: ((x.texts?.suggestions as L[])?.[i]?.en) ?? '' })) } }))}
                />
              </Field>
            </>
          ) : null}

          <div className="flex items-center gap-4">
            <Button onClick={() => void save(a)} disabled={saving === a.id}>{saving === a.id ? 'Enregistrement…' : 'Enregistrer'}</Button>
            {status[a.id] ? <span role="alert" className="font-semibold text-danger">{status[a.id]}</span> : null}
          </div>
        </section>
      ))}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="font-display text-sm font-bold">{label}</span>
      {children}
      {hint ? <span className="text-sm text-ink-muted">{hint}</span> : null}
    </label>
  );
}