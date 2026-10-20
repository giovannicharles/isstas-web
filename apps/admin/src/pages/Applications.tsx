import { useCallback, useEffect, useState } from 'react';
import { FileText, X } from 'lucide-react';
import { api } from '@admin/lib/api';
import { describeError } from '@admin/lib/errors';
import { Alert } from '@admin/components/Alert';
import { useNotify } from '@admin/components/Notify';
import { APPLICATION_STATUSES } from '@admin/lib/resources';

type App = { id: number; tracking_number: string; first_name: string; last_name: string; phone: string; level_id: number; status: string; submitted_at: string | null };
type Detail = {
  application: App & { email: string | null; public_message: string | null; internal_notes: string | null };
  level: Record<string, string> | null;
  program: Record<string, string> | null;
  documents: { id: number; name: string; size: number }[];
  history: { from: string | null; to: string; note: string | null; at: string }[];
};

/** Pipeline des candidatures : colonnes par statut (kanban), fiche detaillee, changement de statut avec historique. */
export default function Applications() {
  const [cols, setCols] = useState<Record<string, App[]>>({});
  const [detail, setDetail] = useState<Detail | null>(null);
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const notify = useNotify();

  const load = useCallback(async () => {
    try {
      const entries = await Promise.all(APPLICATION_STATUSES.map(async (s) => {
        const res = await api<App[]>('/applications', { params: { 'filter[status]': s.key, per_page: 50, sort: '-submitted_at' } });
        return [s.key, res] as const;
      }));
      setCols(Object.fromEntries(entries));
      setLoadError(null);
    } catch (e) {
      setLoadError(describeError(e).message);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const open = async (id: number) => {
    try {
      setDetail(await api<Detail>(`/applications/${id}/detail`));
      setMessage('');
      setNote('');
    } catch (e) {
      notify.fromError(e, 'Dossier introuvable');
    }
  };
  const move = async (status: string) => {
    if (!detail) return;
    try {
      setDetail(await api<Detail>(`/applications/${detail.application.id}/status`, { method: 'PUT', body: { status, public_message: message || undefined, note: note || undefined, notify: !!message } }));
      notify.success('Statut mis à jour', message ? 'Le candidat a été prévenu par e-mail.' : undefined);
      void load();
    } catch (e) {
      notify.fromError(e, 'Changement de statut impossible');
    }
  };
  const openDocument = async (docId: number) => {
    if (!detail) return;
    try {
      const res = await api<{ url: string }>(`/applications/${detail.application.id}/documents/${docId}/url`);
      window.open(res.url, '_blank', 'noopener');
    } catch (e) {
      notify.fromError(e, 'Ouverture du document impossible');
    }
  };

  return (
    <div className="grid gap-6">
      <h1 className="font-display text-3xl font-black">Candidatures</h1>
      {loadError ? <Alert tone="error" title="Chargement impossible">{loadError}</Alert> : null}
      <div className="grid auto-cols-[17rem] grid-flow-col gap-4 overflow-x-auto pb-4">
        {APPLICATION_STATUSES.map((s) => (
          <section key={s.key} aria-label={s.label} className="rounded-xl bg-mint-100 p-3">
            <h2 className="flex items-center justify-between px-1 pb-3 font-display text-sm font-extrabold">{s.label}<span className="rounded-full bg-white px-2 py-0.5">{cols[s.key]?.length ?? 0}</span></h2>
            <ul className="grid gap-2">
              {(cols[s.key] ?? []).map((a) => (
                <li key={a.id}>
                  <button type="button" onClick={() => void open(a.id)} className="block w-full rounded-lg bg-white p-3 text-left shadow-soft hover:ring-2 hover:ring-green-600">
                    <span className="block font-display font-bold">{a.first_name} {a.last_name}</span>
                    <span className="block text-xs text-ink-muted">{a.tracking_number} · {a.phone}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {detail ? (
        <aside role="dialog" aria-label="Fiche candidat" className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white p-6 shadow-lift">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-black">{detail.application.first_name} {detail.application.last_name}</h2>
              <p className="text-sm text-ink-muted">{detail.application.tracking_number}</p>
            </div>
            <button type="button" onClick={() => setDetail(null)} aria-label="Fermer" className="grid size-10 place-items-center rounded-lg hover:bg-mint-100"><X className="size-5" /></button>
          </div>
          <dl className="mt-5 grid gap-2 text-sm">
            <div><dt className="font-bold text-green-700">Téléphone</dt><dd>{detail.application.phone}</dd></div>
            {detail.application.email ? <div><dt className="font-bold text-green-700">E-mail</dt><dd>{detail.application.email}</dd></div> : null}
            <div><dt className="font-bold text-green-700">Niveau visé</dt><dd>{detail.level?.fr ?? '—'}</dd></div>
            {detail.program ? <div><dt className="font-bold text-green-700">Filière</dt><dd>{detail.program.fr}</dd></div> : null}
          </dl>

          <h3 className="mt-6 font-display font-extrabold">Pièces jointes</h3>
          <ul className="mt-2 grid gap-1">
            {detail.documents.map((d) => <li key={d.id}><button type="button" onClick={() => void openDocument(d.id)} className="inline-flex items-center gap-2 font-semibold text-green-700 hover:underline"><FileText className="size-4" aria-hidden="true" /> {d.name}</button></li>)}
            {!detail.documents.length ? <li className="text-ink-muted">Aucune pièce.</li> : null}
          </ul>

          <h3 className="mt-6 font-display font-extrabold">Changer le statut</h3>
          <label className="mt-2 block text-sm font-semibold" htmlFor="msg">Message au candidat (envoyé par e-mail)</label>
          <textarea id="msg" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} className="field" />
          <label className="mt-3 block text-sm font-semibold" htmlFor="note">Note interne</label>
          <textarea id="note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="field" />
          <div className="mt-3 flex flex-wrap gap-2">
            {APPLICATION_STATUSES.map((s) => (
              <button key={s.key} type="button" disabled={s.key === detail.application.status} onClick={() => void move(s.key)} className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold ${s.key === detail.application.status ? 'border-green-600 bg-green-600 text-white' : 'border-line hover:border-green-600'}`}>{s.label}</button>
            ))}
          </div>

          <h3 className="mt-6 font-display font-extrabold">Historique</h3>
          <ol className="mt-2 grid gap-2 border-l-2 border-green-500 pl-4 text-sm">
            {detail.history.map((h, i) => <li key={i}><strong>{h.to}</strong>{h.from ? ` (← ${h.from})` : ''} · {new Date(h.at).toLocaleString('fr-FR')}{h.note ? <span className="block text-ink-muted">{h.note}</span> : null}</li>)}
          </ol>
        </aside>
      ) : null}
    </div>
  );
}