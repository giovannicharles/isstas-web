import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@isstas/ui';
import { api } from '@admin/lib/api';
import { describeError } from '@admin/lib/errors';
import { Alert } from '@admin/components/Alert';
import { useNotify } from '@admin/components/Notify';
import { SubNav } from '@admin/components/SubNav';
import { CHATBOT_TABS } from '@admin/lib/resources';

type Stats = { conversations: number; messages: number; unanswered_conversations: number; rated: number; satisfaction_percent: number | null };
type Unanswered = { message_id: number; question: string; bot_answer: string; at: string };

/** Chatbot : statistiques, questions sans reponse a transformer en reponses validees, test du bot. */
export default function Chatbot() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [items, setItems] = useState<Unanswered[]>([]);
  const [answers, setAnswers] = useState<Record<number, { fr: string; en: string }>>({});
  const [test, setTest] = useState({ message: '', answer: '' });
  const [testing, setTesting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const notify = useNotify();
  const { tab = 'apercu' } = useParams();

  const load = () => {
    setLoadError(null);
    api<Stats>('/chat/stats').then(setStats).catch((e) => setLoadError(describeError(e).message));
    api<Unanswered[]>('/chat/unanswered').then(setItems).catch((e) => setLoadError(describeError(e).message));
  };
  useEffect(load, []);

  const promote = async (u: Unanswered) => {
    const a = answers[u.message_id];
    if (!a?.fr) {
      notify.warning('Réponse manquante', 'Rédigez au moins la réponse en français.');
      return;
    }
    try {
      await api('/chat/promote', { method: 'POST', body: { question: u.question, answer: a, source_message_id: u.message_id } });
      setItems((l) => l.filter((x) => x.message_id !== u.message_id));
      notify.success('Réponse validée', "Le chatbot l'utilisera en priorité.");
    } catch (e) {
      notify.fromError(e, 'Validation impossible');
    }
  };
  const runTest = async () => {
    if (!test.message.trim()) return;
    setTesting(true);
    try {
      const res = await api<{ answer: string }>('/chat/test', { method: 'POST', body: { message: test.message } });
      setTest((t) => ({ ...t, answer: res.answer }));
    } catch (e) {
      const d = describeError(e);
      const off = (e as { status?: number }).status === 503;
      setTest((t) => ({ ...t, answer: '' }));
      notify.error(off ? 'Chatbot indisponible' : d.title, off ? "Le chatbot n'est pas configuré (clé IA) ou est désactivé." : d.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="grid max-w-4xl gap-8">
      <h1 className="font-display text-3xl font-black">Chatbot</h1>
      <SubNav label="Sections du chatbot" items={CHATBOT_TABS.map((t) => ({ to: `/admin/chatbot/${t.key}`, label: t.key === 'questions' && items.length ? `${t.label} (${items.length})` : t.label }))} />
      {loadError ? <Alert tone="error" title="Chargement impossible" action={<Button variant="outline" size="sm" onClick={load}>Réessayer</Button>}>{loadError}</Alert> : null}
      {tab === 'apercu' && !stats && !loadError ? <div className="grid gap-4 sm:grid-cols-4" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-[var(--radius-card)] bg-white ring-1 ring-line" />)}</div> : null}
      {tab === 'apercu' && stats ? (
        <dl className="grid gap-4 sm:grid-cols-4">
          {[['Conversations', stats.conversations], ['Messages', stats.messages], ['Sans réponse', stats.unanswered_conversations], ['Satisfaction', stats.satisfaction_percent === null ? '—' : `${stats.satisfaction_percent}%`]].map(([l, v]) => (
            <div key={l as string} className="rounded-[var(--radius-card)] bg-white shadow-soft ring-1 ring-line p-4"><dd className="font-display text-3xl font-black">{v}</dd><dt className="text-ink-muted">{l}</dt></div>
          ))}
        </dl>
      ) : null}

      {tab === 'questions' ? <section>
        <h2 className="font-display text-xl font-extrabold">Questions sans réponse</h2>
        <ul className="mt-4 grid gap-4">
          {items.map((u) => (
            <li key={u.message_id} className="grid gap-3 rounded-[var(--radius-card)] bg-white shadow-soft ring-1 ring-line p-5">
              <p className="font-semibold">« {u.question} »</p>
              <label className="text-sm font-bold" htmlFor={`fr-${u.message_id}`}>Réponse validée (FR)</label>
              <textarea id={`fr-${u.message_id}`} rows={2} className="field" value={answers[u.message_id]?.fr ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, [u.message_id]: { fr: e.target.value, en: a[u.message_id]?.en ?? '' } }))} />
              <label className="text-sm font-bold" htmlFor={`en-${u.message_id}`}>Réponse validée (EN, optionnel)</label>
              <textarea id={`en-${u.message_id}`} rows={2} className="field" value={answers[u.message_id]?.en ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, [u.message_id]: { fr: a[u.message_id]?.fr ?? '', en: e.target.value } }))} />
              <div><Button size="sm" onClick={() => void promote(u)}>Ajouter à la base de connaissances</Button></div>
            </li>
          ))}
          {!items.length ? <li className="text-ink-muted">Rien à traiter.</li> : null}
        </ul>
      </section> : null}

      {tab === 'test' ? <section className="rounded-[var(--radius-card)] bg-white shadow-soft ring-1 ring-line p-5">
        <h2 className="font-display text-xl font-extrabold">Tester le bot</h2>
        <div className="mt-3 flex gap-3">
          <input aria-label="Message de test" className="field" value={test.message} onChange={(e) => setTest({ ...test, message: e.target.value })} />
          <Button onClick={() => void runTest()} disabled={testing}>{testing ? 'Réflexion…' : 'Tester'}</Button>
        </div>
        {test.answer ? <p className="mt-4 whitespace-pre-wrap rounded-lg bg-mint-100 p-4">{test.answer}</p> : null}
      </section> : null}
    </div>
  );
}