import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowUpRight, Bell, Download, Home, Inbox, Languages, MessageCircleQuestion, MessagesSquare, Newspaper, Pencil, PlusCircle, SlidersHorizontal, Trash2, type LucideIcon } from 'lucide-react';
import { Decor } from '@isstas/ui';
import { useAuth } from '@admin/lib/auth';
import { api } from '@admin/lib/api';
import { describeError } from '@admin/lib/errors';
import { Alert } from '@admin/components/Alert';
import { StatArt, WelcomeArt } from '@admin/components/AdminArt';
import { APPLICATION_STATUSES } from '@admin/lib/resources';

type Dash = {
  applications_by_status?: Record<string, number>;
  unread_messages?: number;
  top_downloads?: { id: number; title: string; count: number }[];
  chatbot?: { conversations: number; unanswered: number };
  incomplete_translations?: number;
};
type Log = { id: number; description: string; event: string | null; subject_type: string | null; subject_id: number | null; created_at: string; causer?: { name: string } | null };

/** Couleur par statut : chaque barre porte aussi son libelle et son nombre (jamais la couleur seule). */
const STATUS_TONE: Record<string, string> = {
  received: 'bg-green-500', under_review: 'bg-green-300', missing_documents: 'bg-amber-400', accepted: 'bg-green-700', waitlisted: 'bg-brown-700', rejected: 'bg-danger',
};

const SUBJECTS: Record<string, string> = {
  Level: 'un niveau', Program: 'une filière', Page: 'une page', NewsPost: 'une actualité', Event: 'un événement', Faq: 'une question de la FAQ', FaqCategory: 'une catégorie de FAQ',
  Partner: 'un partenaire', Testimonial: 'un témoignage', Download: 'un téléchargement', FeeSchedule: 'des frais', HomeSection: "une section de l'accueil", Stat: 'un chiffre clé',
  SiteSetting: 'un réglage', UiString: "un texte de l'interface", Application: 'une candidature', FloatingAction: 'un bouton flottant', MenuItem: 'un lien de menu',
};
const EVENTS: Record<string, [string, LucideIcon]> = { created: ['a créé', PlusCircle], updated: ['a modifié', Pencil], deleted: ['a supprimé', Trash2] };

function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return `il y a ${Math.floor(s / 86400)} j`;
}

function Stat({ label, value, to, icon: Icon, alert = false, hint }: { label: string; value: number | string; to?: string; icon: LucideIcon; alert?: boolean; hint?: string }) {
  const urgent = alert && Number(value) > 0;
  const body = (
    <div className={`group relative h-full overflow-hidden rounded-[var(--radius-card)] p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-card ${urgent ? 'bg-amber-50 ring-1 ring-amber-300' : 'bg-white ring-1 ring-line'}`}>
      <StatArt className={`pointer-events-none absolute -right-4 -top-4 size-28 ${urgent ? 'text-amber-500' : 'text-green-500'}`} />
      <div className="flex items-start justify-between">
        <span className={`grid size-11 place-items-center rounded-xl ${urgent ? 'bg-amber-100 text-amber-700' : 'bg-green-500/10 text-green-700'}`}><Icon className="size-5" aria-hidden="true" /></span>
        {to ? <ArrowUpRight className="size-4 text-ink-muted opacity-0 transition group-hover:opacity-100" aria-hidden="true" /> : null}
      </div>
      <p className="mt-4 font-display text-4xl font-black leading-none tabular-nums">{value}</p>
      <p className="mt-1.5 font-semibold text-ink-muted">{label}</p>
      {urgent && hint ? <p className="mt-2 text-sm font-bold text-amber-700">{hint}</p> : null}
    </div>
  );
  return to ? <Link to={to} className="block no-underline">{body}</Link> : body;
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[var(--radius-card)] bg-white p-6 shadow-soft ring-1 ring-line">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const { can, me } = useAuth();
  const [d, setD] = useState<Dash | null>(null);
  const [logs, setLogs] = useState<Log[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Dash>('/dashboard').then(setD).catch((e) => { setError(describeError(e).message); setD({}); });
  }, []);
  useEffect(() => {
    if (!can('activity.view')) { setLogs([]); return; }
    api<Log[]>('/activity-log', { params: { per_page: 8 } }).then(setLogs).catch(() => setLogs([]));
  }, [can]);

  const statuses = d?.applications_by_status ?? {};
  const total = Object.values(statuses).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...Object.values(statuses));
  const hour = new Date().getHours();
  const hello = hour < 5 || hour >= 18 ? 'Bonsoir' : 'Bonjour';
  const quick = [
    { to: '/admin/candidatures', label: 'Traiter les candidatures', icon: Inbox, show: can('applications.view') },
    { to: '/admin/r/news/nouveau', label: 'Publier une actualité', icon: Newspaper, show: can('news.create') },
    { to: '/admin/accueil', label: "Modifier l'accueil", icon: Home, show: can('home.view') },
    { to: '/admin/actions', label: 'WhatsApp et boutons', icon: SlidersHorizontal, show: can('settings.view') },
  ].filter((a) => a.show);

  return (
    <div className="grid gap-6 lg:gap-8">
      <header className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-green-100 via-mint-100 to-white p-6 shadow-soft ring-1 ring-line sm:p-8">
        <Decor kind="dots" className="[mask-image:linear-gradient(to_right,transparent,black_70%)]" />
        <WelcomeArt className="pointer-events-none absolute -right-6 bottom-0 -z-10 hidden h-full w-auto text-green-500/80 md:block" />
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-600">Administration ISSTAS</p>
        <h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">{hello} {me?.name?.split(' ')[0] ?? ''}</h1>
        <p className="mt-2 max-w-xl text-ink-muted">Voici ce qui demande votre attention aujourd'hui. Chaque modification que vous enregistrez apparaît sur le site en quelques secondes.</p>
        {d && (d.unread_messages || d.chatbot?.unanswered || statuses.received) ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-green-800 shadow-soft ring-1 ring-line"><Bell className="size-4" aria-hidden="true" />
            {[statuses.received ? `${statuses.received} candidature${statuses.received > 1 ? 's' : ''} reçue${statuses.received > 1 ? 's' : ''}` : '', d.unread_messages ? `${d.unread_messages} message${d.unread_messages > 1 ? 's' : ''} non lu${d.unread_messages > 1 ? 's' : ''}` : '', d.chatbot?.unanswered ? `${d.chatbot.unanswered} question${d.chatbot.unanswered > 1 ? 's' : ''} sans réponse` : ''].filter(Boolean).join(' · ')}
          </p>
        ) : null}
      </header>

      {error ? <Alert tone="warning" title="Indicateurs indisponibles">{error}</Alert> : null}

      {quick.length ? (
        <section aria-label="Actions rapides" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quick.map((a) => (
            <Link key={a.to} to={a.to} className="group flex min-h-16 items-center gap-3 rounded-[var(--radius-card)] bg-white p-4 font-display font-extrabold text-ink no-underline shadow-soft ring-1 ring-line transition hover:-translate-y-0.5 hover:bg-green-500/10 hover:text-green-800 hover:shadow-card">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mint-100 text-green-600 transition group-hover:bg-white"><a.icon className="size-5" aria-hidden="true" /></span>
              <span className="leading-tight">{a.label}</span>
            </Link>
          ))}
        </section>
      ) : null}

      {!d && !error ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true"><span className="sr-only">Chargement des indicateurs…</span>
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-[var(--radius-card)] bg-white ring-1 ring-line" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {d?.applications_by_status ? <Stat label="Candidatures reçues" value={statuses.received ?? 0} to="/admin/candidatures" icon={Inbox} alert hint="À traiter" /> : null}
          {d?.unread_messages !== undefined ? <Stat label="Messages non lus" value={d.unread_messages} to="/admin/r/contact-messages" icon={Bell} alert hint="À lire" /> : null}
          {d?.chatbot ? <Stat label="Questions sans réponse (chatbot)" value={d.chatbot.unanswered} to="/admin/chatbot/questions" icon={MessageCircleQuestion} alert hint="À valider" /> : null}
          {d?.chatbot ? <Stat label="Conversations du chatbot" value={d.chatbot.conversations} to="/admin/chatbot" icon={MessagesSquare} /> : null}
          {d?.incomplete_translations !== undefined ? <Stat label="Contenus à traduire en anglais" value={d.incomplete_translations} icon={Languages} alert hint="Traduction à compléter" /> : null}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {d?.applications_by_status ? (
          <div className="lg:col-span-2">
            <Panel title="Candidatures par statut" action={<Link to="/admin/candidatures" className="text-sm font-bold">Ouvrir le pipeline</Link>}>
              {total === 0 ? (
                <p className="rounded-xl bg-mint-100 p-4 text-ink-muted">Aucune candidature pour le moment. Les pré-inscriptions du site apparaîtront ici.</p>
              ) : (
                <ul className="grid gap-3.5">
                  {APPLICATION_STATUSES.map((s) => (
                    <li key={s.key} className="grid grid-cols-[minmax(7rem,10rem)_1fr_2.5rem] items-center gap-4">
                      <span className="text-sm font-semibold">{s.label}</span>
                      <span className="h-3 overflow-hidden rounded-full bg-mint-200" role="img" aria-label={`${s.label} : ${statuses[s.key] ?? 0} sur ${total}`}>
                        <span className={`block h-full rounded-full ${STATUS_TONE[s.key] ?? 'bg-green-500'} transition-[width] duration-700`} style={{ width: `${((statuses[s.key] ?? 0) / max) * 100}%` }} />
                      </span>
                      <span className="text-right font-display font-extrabold tabular-nums">{statuses[s.key] ?? 0}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        ) : null}

        {d?.top_downloads?.length ? (
          <Panel title="Téléchargements populaires">
            <ol className="grid gap-1">
              {d.top_downloads.map((t, i) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-mint-100">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-mint-100 font-display text-sm font-extrabold text-green-700">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{t.title}</span>
                  <span className="flex items-center gap-1 font-display text-sm font-extrabold tabular-nums"><Download className="size-3.5 text-ink-muted" aria-hidden="true" />{t.count}</span>
                </li>
              ))}
            </ol>
          </Panel>
        ) : null}
      </div>

      {can('activity.view') ? (
        <Panel title="Activité récente">
          {logs === null ? (
            <div className="grid gap-3" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-mint-100" />)}</div>
          ) : logs.length === 0 ? (
            <p className="rounded-xl bg-mint-100 p-4 text-ink-muted">Aucune modification enregistrée pour le moment.</p>
          ) : (
            <ul className="divide-y divide-line">
              {logs.map((l) => {
                const [verb, Icon] = EVENTS[l.event ?? 'updated'] ?? ['a modifié', Pencil];
                const subject = SUBJECTS[(l.subject_type ?? '').split('\\').pop() ?? ''] ?? 'un contenu';
                return (
                  <li key={l.id} className="flex items-center gap-3 py-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mint-100 text-green-600"><Icon className="size-4" aria-hidden="true" /></span>
                    <p className="min-w-0 flex-1 text-sm"><strong className="font-bold">{l.causer?.name ?? 'Le système'}</strong> {verb} {subject}{l.subject_id ? <span className="text-ink-muted"> · n° {l.subject_id}</span> : null}</p>
                    <time dateTime={l.created_at} className="shrink-0 text-xs text-ink-muted">{ago(l.created_at)}</time>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      ) : (
        <p className="flex items-center gap-2 text-sm text-ink-muted"><Activity className="size-4" aria-hidden="true" /> Le journal d'activité est réservé aux administrateurs.</p>
      )}
    </div>
  );
}
