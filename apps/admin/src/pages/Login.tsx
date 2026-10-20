import { useEffect, useId, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Decor, PulseLine } from '@isstas/ui';
import { api } from '@admin/lib/api';
import { useAuth } from '@admin/lib/auth';
import { describeError, fieldError, formatWait, type Described } from '@admin/lib/errors';
import { Alert } from '@admin/components/Alert';

type Mode = 'login' | 'forgot' | 'reset';

/**
 * Connexion de l'administration : une carte centree sur fond de marque (un seul bloc, pas de colonnes).
 * Trois ecrans dans la meme carte : connexion, mot de passe oublie, nouveau mot de passe (lien recu par e-mail).
 */
export default function Login({ mode }: { mode: Mode }) {
  const { me } = useAuth();
  if (me) return <Navigate to="/admin" replace />;

  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-brown-800 px-4 py-10 text-white">
      <img src="/brand/hero.jpg" alt="" aria-hidden="true" className="absolute inset-0 -z-20 size-full object-cover opacity-30 mix-blend-luminosity" />
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-b from-brown-800/90 via-brown-800/80 to-brown-900" />
      <a href="/fr" className="absolute left-4 top-4 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white/80 no-underline ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/10 hover:text-white sm:left-8 sm:top-6">
        <ArrowLeft className="size-4" aria-hidden="true" /> Retour au site <ExternalLink className="size-3.5 opacity-70" aria-hidden="true" />
      </a>
      <Decor kind="pulse" dark />
      <Decor kind="network" dark className="[mask-image:linear-gradient(to_left,black,transparent_70%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-green-900/70 to-transparent" />

      <div className="w-full max-w-[27rem]">
        <header className="mb-7 text-center [animation:hero-in_.6s_ease-out_both]">
          <img src="/brand/logo.jpg" alt="ISSTAS" width={72} height={72} className="mx-auto size-[4.5rem] rounded-2xl bg-white object-contain p-1.5 shadow-lift" />
          <p className="mt-4 font-display text-sm font-extrabold uppercase tracking-[0.2em] text-green-300">Administration</p>
          <PulseLine className="mx-auto mt-1 h-5 w-28 text-green-300" strokeWidth={2} />
        </header>

        <section className="rounded-[1.75rem] bg-white p-7 text-ink shadow-lift [animation:sheet-up_.55s_.1s_ease-out_both] sm:p-9" aria-live="polite">
          {mode === 'login' ? <LoginForm /> : mode === 'forgot' ? <ForgotForm /> : <ResetForm />}
        </section>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-white/70 [animation:fade-in_.8s_.3s_ease-out_both]">
          <ShieldCheck className="size-4" aria-hidden="true" /> Espace réservé au personnel autorisé de l'ISSTAS.
        </p>
        <p className="mt-2 text-center text-xs text-white/50">© {new Date().getFullYear()} Institut Supérieur des Sciences et Techniques Appliquées à la Santé</p>
      </div>
    </main>
  );
}

/* ---------- connexion ---------- */

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(() => readRemembered());
  const [remember, setRemember] = useState(() => readRemembered() !== '');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [caps, setCaps] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<Described | null>(null);
  const wait = useCountdown(problem?.kind === 'throttle' ? problem.retryAfter : undefined);
  const blocked = problem?.kind === 'throttle' && wait > 0;
  const notice = params.get('reset') === 'ok' ? 'Mot de passe modifié. Vous pouvez vous connecter.' : params.get('expired') ? 'Votre session a expiré. Reconnectez-vous.' : null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || blocked) return;
    setBusy(true);
    setProblem(null);
    try {
      await login(email.trim(), password);
      rememberEmail(remember ? email.trim() : '');
      navigate('/admin', { replace: true });
    } catch (ex) {
      setProblem(describeError(ex));
      setPassword('');
    } finally {
      setBusy(false);
    }
  }

  const emailError = problem?.kind === 'validation' ? fieldError(problem.fields, 'email') : undefined;
  const passwordError = problem?.kind === 'validation' ? fieldError(problem.fields, 'password') : undefined;

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <div>
        <h1 className="font-display text-[1.75rem] font-black leading-tight">Connexion</h1>
        <p className="mt-1 text-ink-muted">Accédez à la gestion du site et des admissions.</p>
      </div>

      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {problem ? (
        <Alert tone={problem.kind === 'throttle' ? 'warning' : 'error'} title={problem.kind === 'validation' ? 'Connexion refusée' : problem.title}>
          {problem.kind === 'throttle' && wait > 0
            ? `Trop de tentatives. Patientez ${formatWait(wait)} avant de réessayer.`
            : problem.kind === 'validation'
              ? emailError ?? passwordError ?? problem.message
              : problem.message}
        </Alert>
      ) : null}

      <Field label="Adresse e-mail" icon={<Mail className="size-[1.15rem]" aria-hidden="true" />} invalid={problem?.kind === 'validation'}>
        {(id, aria) => (
          <input id={id} {...aria} type="email" inputMode="email" autoComplete="username" autoFocus={!email} required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@isstas-cameroun.com" className="field !pl-11" />
        )}
      </Field>

      <Field label="Mot de passe" icon={<Lock className="size-[1.15rem]" aria-hidden="true" />} invalid={problem?.kind === 'validation'} hint={caps ? 'Verrouillage majuscules activé' : undefined} hintTone="warn"
        trailing={<button type="button" onClick={() => setReveal((v) => !v)} aria-label={reveal ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={reveal} className="grid size-10 place-items-center rounded-lg text-ink-muted hover:bg-mint-100 hover:text-ink">{reveal ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}</button>}>
        {(id, aria) => (
          <input id={id} {...aria} type={reveal ? 'text' : 'password'} autoComplete="current-password" autoFocus={Boolean(email)} required value={password}
            onChange={(e) => setPassword(e.target.value)} onKeyUp={(e) => setCaps(e.getModifierState?.('CapsLock') ?? false)} onBlur={() => setCaps(false)} className="field !pl-11 !pr-12" />
        )}
      </Field>

      <div className="-mt-1 flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-semibold">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-[1.15rem] accent-green-500" />
          Mémoriser mon e-mail
        </label>
        <Link to="/admin/forgot-password" className="text-sm font-semibold">Mot de passe oublié ?</Link>
      </div>

      <SubmitButton busy={busy} disabled={!email || !password || blocked}>
        {blocked ? `Réessayer dans ${formatWait(wait)}` : 'Se connecter'}
      </SubmitButton>
    </form>
  );
}

/* ---------- mot de passe oublie ---------- */

function ForgotForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [problem, setProblem] = useState<Described | null>(null);
  const wait = useCountdown(problem?.kind === 'throttle' ? problem.retryAfter : undefined);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      await api('/auth/forgot-password', { method: 'POST', body: { email: email.trim() } });
      setSent(true);
    } catch (ex) {
      setProblem(describeError(ex));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="grid gap-5 text-center">
        <CheckCircle2 className="mx-auto size-12 text-green-500" aria-hidden="true" />
        <div>
          <h1 className="font-display text-[1.6rem] font-black leading-tight">Vérifiez votre boîte mail</h1>
          <p className="mt-2 text-ink-muted">Si un compte existe pour <strong className="text-ink">{email}</strong>, un lien de réinitialisation vient d'être envoyé. Il est valable une heure.</p>
        </div>
        <Alert tone="info">Rien reçu ? Vérifiez les courriers indésirables, puis réessayez dans quelques minutes.</Alert>
        <BackToLogin />
      </div>
    );
  }

  const emailError = problem?.kind === 'validation' ? fieldError(problem.fields, 'email') : undefined;
  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <div>
        <h1 className="font-display text-[1.75rem] font-black leading-tight">Mot de passe oublié</h1>
        <p className="mt-1 text-ink-muted">Saisissez votre adresse e-mail : nous vous envoyons un lien pour choisir un nouveau mot de passe.</p>
      </div>
      {problem && !emailError ? <Alert tone={problem.kind === 'throttle' ? 'warning' : 'error'} title={problem.title}>{problem.kind === 'throttle' && wait > 0 ? `Patientez ${formatWait(wait)} avant de réessayer.` : problem.message}</Alert> : null}
      <Field label="Adresse e-mail" icon={<Mail className="size-[1.15rem]" aria-hidden="true" />} error={emailError}>
        {(id, aria) => <input id={id} {...aria} type="email" inputMode="email" autoComplete="username" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} className="field !pl-11" />}
      </Field>
      <SubmitButton busy={busy} disabled={!email || (problem?.kind === 'throttle' && wait > 0)}>Envoyer le lien</SubmitButton>
      <BackToLogin />
    </form>
  );
}

/* ---------- nouveau mot de passe (lien recu par e-mail) ---------- */

function ResetForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';
  const email = params.get('email') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<Described | null>(null);

  const rules = useMemo(() => [
    { ok: password.length >= 10, label: '10 caractères minimum' },
    { ok: /[A-Za-z]/.test(password), label: 'Au moins une lettre' },
    { ok: /\d/.test(password), label: 'Au moins un chiffre' },
    { ok: password.length > 0 && password === confirm, label: 'Les deux saisies sont identiques' },
  ], [password, confirm]);
  const valid = rules.every((r) => r.ok);

  if (!token || !email) {
    return (
      <div className="grid gap-5">
        <Alert tone="error" title="Lien incomplet">Ce lien de réinitialisation est invalide ou a été tronqué. Demandez-en un nouveau.</Alert>
        <Link to="/admin/forgot-password" className="link-arrow justify-self-start">Demander un nouveau lien <ArrowRight className="size-4" aria-hidden="true" /></Link>
      </div>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setProblem(null);
    try {
      await api('/auth/reset-password', { method: 'POST', body: { token, email, password, password_confirmation: confirm } });
      navigate('/admin/login?reset=ok', { replace: true });
    } catch (ex) {
      setProblem(describeError(ex));
    } finally {
      setBusy(false);
    }
  }

  const expired = problem?.kind === 'validation' && Boolean(fieldError(problem.fields, 'email'));
  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <div>
        <h1 className="font-display text-[1.75rem] font-black leading-tight">Nouveau mot de passe</h1>
        <p className="mt-1 break-all text-ink-muted">Compte : <strong className="text-ink">{email}</strong></p>
      </div>
      {problem ? (
        <Alert tone="error" title={expired ? 'Lien expiré ou déjà utilisé' : problem.title}
          action={expired ? <Link to="/admin/forgot-password" className="link-arrow">Demander un nouveau lien <ArrowRight className="size-4" aria-hidden="true" /></Link> : undefined}>
          {expired ? fieldError(problem.fields, 'email') : problem.kind === 'validation' ? fieldError(problem.fields, 'password') ?? problem.message : problem.message}
        </Alert>
      ) : null}
      <Field label="Nouveau mot de passe" icon={<Lock className="size-[1.15rem]" aria-hidden="true" />}
        trailing={<button type="button" onClick={() => setReveal((v) => !v)} aria-label={reveal ? 'Masquer' : 'Afficher'} aria-pressed={reveal} className="grid size-10 place-items-center rounded-lg text-ink-muted hover:bg-mint-100">{reveal ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}</button>}>
        {(id, aria) => <input id={id} {...aria} type={reveal ? 'text' : 'password'} autoComplete="new-password" autoFocus required value={password} onChange={(e) => setPassword(e.target.value)} className="field !pl-11 !pr-12" />}
      </Field>
      <Field label="Confirmer le mot de passe" icon={<Lock className="size-[1.15rem]" aria-hidden="true" />}>
        {(id, aria) => <input id={id} {...aria} type={reveal ? 'text' : 'password'} autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="field !pl-11" />}
      </Field>
      <ul className="grid gap-1.5 text-sm" aria-label="Critères du mot de passe">
        {rules.map((r) => (
          <li key={r.label} className={`flex items-center gap-2 ${r.ok ? 'text-green-600' : 'text-ink-muted'}`}>
            <CheckCircle2 className={`size-4 ${r.ok ? '' : 'opacity-30'}`} aria-hidden="true" /> {r.label}
          </li>
        ))}
      </ul>
      <SubmitButton busy={busy} disabled={!valid}>Enregistrer le mot de passe</SubmitButton>
      <BackToLogin />
    </form>
  );
}

/* ---------- briques ---------- */

const REMEMBER_KEY = 'isstas.admin.email';
function readRemembered(): string {
  try {
    return localStorage.getItem(REMEMBER_KEY) ?? '';
  } catch {
    return '';
  }
}
function rememberEmail(value: string) {
  try {
    if (value) localStorage.setItem(REMEMBER_KEY, value);
    else localStorage.removeItem(REMEMBER_KEY);
  } catch {
    /* navigation privee : on ignore */
  }
}

function Field({ label, icon, error, invalid, hint, hintTone, trailing, children }: {
  label: string;
  invalid?: boolean;
  icon: ReactNode;
  error?: string;
  hint?: string;
  hintTone?: 'warn';
  trailing?: ReactNode;
  children: (id: string, aria: { 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode;
}) {
  const id = useId();
  const note = error ?? hint;
  const aria = { 'aria-invalid': error || invalid ? (true as const) : undefined, 'aria-describedby': note ? `${id}-note` : undefined };
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-bold">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">{icon}</span>
        {children(id, aria)}
        {trailing ? <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</span> : null}
      </div>
      {note ? <p id={`${id}-note`} role={error ? 'alert' : undefined} className={`text-sm font-semibold ${error ? 'text-danger' : hintTone === 'warn' ? 'text-amber-600' : 'text-ink-muted'}`}>{note}</p> : null}
    </div>
  );
}

function SubmitButton({ busy, disabled, children }: { busy: boolean; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="submit" disabled={busy || disabled} className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-full bg-green-500 px-7 font-display font-extrabold text-white shadow-card transition hover:bg-green-600 hover:shadow-lift disabled:cursor-not-allowed disabled:bg-green-300 disabled:shadow-none">
      {busy ? <><Loader2 className="size-5 animate-spin" aria-hidden="true" /> Un instant…</> : children}
    </button>
  );
}

function BackToLogin() {
  return <Link to="/admin/login" className="inline-flex items-center justify-center gap-2 text-sm font-semibold"><ArrowLeft className="size-4" aria-hidden="true" /> Retour à la connexion</Link>;
}

/** Compte a rebours en secondes (0 quand termine ou sans delai). */
function useCountdown(seconds?: number): number {
  const [left, setLeft] = useState(seconds ?? 0);
  useEffect(() => {
    setLeft(seconds ?? 0);
    if (!seconds) return;
    const t = window.setInterval(() => setLeft((s) => (s <= 1 ? (window.clearInterval(t), 0) : s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [seconds]);
  return left;
}
