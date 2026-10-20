import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button, Container, SelectField, TextField } from '@isstas/ui';
import { api, ApiError } from '@/lib/api';
import { LLink, useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import { usePageMeta } from '@/lib/usePageMeta';
import type { Level, Program, RequiredDoc } from '@/lib/types';
import { PageBanner } from '@/components/PageBanner';

type Form = Record<string, string>;
const DRAFT = 'isstas.prereg.draft';
const STEPS = ['identity', 'education', 'program', 'documents'] as const;

type DocWithId = RequiredDoc & { id?: number };

/**
 * Pre-inscription en 4 etapes : brouillon sauvegarde sur l'appareil, erreurs annoncees, pieces glissees-deposees.
 * Envoi en multipart ; le numero de suivi est affiche a la fin.
 */
export default function PreRegistration() {
  const { locale } = useLocale();
  const t = useT();
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({ level_id: params.get('level') ?? '', program_id: params.get('program') ?? '' });
  const [files, setFiles] = useState<Record<string, File>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [tracking, setTracking] = useState<string | null>(null);

  const { data: levels } = useApi<Level[]>('/levels', locale);
  const { data: programs } = useApi<Program[]>('/programs', locale, { level: levels?.find((l) => String(l.id) === form.level_id)?.slug });
  const { data: docs } = useApi<DocWithId[]>(form.level_id ? '/admission/documents' : null, locale, { level: levels?.find((l) => String(l.id) === form.level_id)?.slug });
  usePageMeta({ title: t('admission.preregister'), alternates: { fr: '/admission/pre-inscription', en: '/admission/pre-inscription' } });

  useEffect(() => {
    try { const d = JSON.parse(localStorage.getItem(DRAFT) ?? 'null'); if (d) setForm((f) => ({ ...d, ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)) })); } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(DRAFT, JSON.stringify(form)); } catch { /* ignore */ }
  }, [form]);

  const set = (k: string) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const err = (k: string) => errors[k]?.[0];
  const uploadable = (docs ?? []).filter((d) => d.id !== undefined);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) return setStep(step + 1);
    setSending(true);
    setErrors({});
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && !k.startsWith('education_') && fd.append(k, v));
      if (form.education_school || form.education_diploma || form.education_year) {
        fd.append('education[0][school]', form.education_school ?? '');
        fd.append('education[0][diploma]', form.education_diploma ?? '');
        fd.append('education[0][year]', form.education_year ?? '');
      }
      fd.append('consent', consent ? '1' : '0');
      fd.append('locale', locale);
      Object.entries(files).forEach(([id, file]) => fd.append(`documents[${id}]`, file));
      const res = await api<{ tracking_number: string | null }>('/applications', { locale, method: 'POST', body: fd });
      try { localStorage.removeItem(DRAFT); } catch { /* ignore */ }
      setTracking(res.tracking_number ?? '');
    } catch (ex) {
      if (ex instanceof ApiError && ex.details) {
        setErrors(ex.details);
        // retourne a la premiere etape en erreur
        const keys = Object.keys(ex.details);
        if (keys.some((k) => ['first_name', 'last_name', 'phone', 'email', 'birth_date'].includes(k))) setStep(0);
        else if (keys.some((k) => ['level_id', 'program_id'].includes(k))) setStep(2);
      } else setErrors({ _: [t('error.generic')] });
    } finally {
      setSending(false);
    }
  }

  if (tracking !== null) {
    return (
      <>
        <PageBanner title={t('prereg.done_title')} crumbs={[{ label: t('admission.title'), to: '/admission' }, { label: t('admission.preregister') }]} />
        <Container size="narrow" className="py-20">
          <div className="cut-leaf-sm bg-mint-100 p-10">
            <p className="font-display text-sm font-bold text-green-700">{t('prereg.tracking')}</p>
            <p className="mt-2 font-display text-[clamp(2rem,6vw,3.5rem)] font-black tracking-tight">{tracking || '—'}</p>
            <p className="mt-4 text-lg">{t('prereg.keep_number')}</p>
            <LLink to="/admission/suivi" className="link-arrow mt-6">{t('admission.track')}</LLink>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageBanner title={t('admission.preregister')} lead={t('prereg.lead')} crumbs={[{ label: t('admission.title'), to: '/admission' }, { label: t('admission.preregister') }]} />
      <Container size="narrow" className="py-14 sm:py-20">
        <ol className="mb-10 grid grid-cols-4 gap-2" aria-label={t('prereg.steps')}>
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? 'step' : undefined}>
              <span className={`block h-1.5 rounded-full ${i <= step ? 'bg-green-600' : 'bg-green-100'}`} />
              <span className={`mt-2 flex items-center gap-1.5 font-display text-[0.8rem] font-bold sm:text-sm ${i === step ? 'text-green-900' : 'text-ink-muted'}`}>
                {i < step ? <Check className="size-4 text-green-600" aria-hidden="true" /> : null}
                {t(`prereg.step_${s}`)}
              </span>
            </li>
          ))}
        </ol>

        <form onSubmit={submit} className="grid gap-6" noValidate={false}>
          {step === 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField label={t('form.first_name')} value={form.first_name ?? ''} onChange={set('first_name')} error={err('first_name')} required autoComplete="given-name" />
                <TextField label={t('form.last_name')} value={form.last_name ?? ''} onChange={set('last_name')} error={err('last_name')} required autoComplete="family-name" />
                <TextField label={t('form.birth_date')} type="date" value={form.birth_date ?? ''} onChange={set('birth_date')} error={err('birth_date')} />
                <TextField label={t('form.birth_place')} value={form.birth_place ?? ''} onChange={set('birth_place')} />
                <TextField label={t('form.phone')} type="tel" value={form.phone ?? ''} onChange={set('phone')} error={err('phone')} required autoComplete="tel" />
                <TextField label={t('form.email')} type="email" value={form.email ?? ''} onChange={set('email')} error={err('email')} autoComplete="email" />
                <TextField label={t('form.city')} value={form.city ?? ''} onChange={set('city')} />
                <TextField label={t('form.nationality')} value={form.nationality ?? ''} onChange={set('nationality')} />
              </div>
            </>
          )}

          {step === 1 && (
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField label={t('form.last_school')} value={form.education_school ?? ''} onChange={set('education_school')} />
              <TextField label={t('form.last_diploma')} value={form.education_diploma ?? ''} onChange={set('education_diploma')} />
              <TextField label={t('form.graduation_year')} value={form.education_year ?? ''} onChange={set('education_year')} inputMode="numeric" />
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6">
              <SelectField label={t('form.level')} value={form.level_id ?? ''} onChange={(e) => setForm((f) => ({ ...f, level_id: e.target.value, program_id: '' }))} error={err('level_id')} required>
                <option value="">{t('finder.choose')}</option>
                {(levels ?? []).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </SelectField>
              <SelectField label={t('form.program')} value={form.program_id ?? ''} onChange={set('program_id')} error={err('program_id')} disabled={!form.level_id}>
                <option value="">{t('form.program_any')}</option>
                {(programs ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </SelectField>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6">
              {uploadable.length ? (
                <ul className="grid gap-4">
                  {uploadable.map((d) => (
                    <li key={d.id} className="rounded-[var(--radius-panel)] border-2 border-dashed border-green-600/60 p-4">
                      <label className="grid gap-2">
                        <span className="font-display font-bold">{d.label}{d.is_additional ? <span className="text-danger"> *</span> : null}</span>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" required={d.is_additional} onChange={(e) => { const f = e.target.files?.[0]; setFiles((s) => { const n = { ...s }; if (f) n[String(d.id)] = f; else delete n[String(d.id)]; return n; }); }} className="text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-green-600 file:px-4 file:py-2 file:font-bold file:text-white" />
                        {files[String(d.id)] ? <span className="text-sm text-green-700">{files[String(d.id)]!.name}</span> : null}
                      </label>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-ink-muted">{t('prereg.no_uploads')}</p>}
              {err('documents') ? <p role="alert" className="font-semibold text-danger">{err('documents')}</p> : null}
              <label className="flex items-start gap-3">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required className="mt-1 size-5 accent-green-600" />
                <span>{t('prereg.consent')}</span>
              </label>
              {err('consent') ? <p role="alert" className="font-semibold text-danger">{err('consent')}</p> : null}
              {errors._ ? <p role="alert" className="font-semibold text-danger">{errors._[0]}</p> : null}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-4">
            <Button variant="ghost" type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>{t('cta.back')}</Button>
            <Button type="submit" size="lg" disabled={sending}>{step === STEPS.length - 1 ? t('cta.submit') : t('cta.next')}</Button>
          </div>
        </form>
      </Container>
    </>
  );
}