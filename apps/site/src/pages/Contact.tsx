import { useState, type FormEvent } from 'react';
import { Container, TextArea, TextField, Button } from '@isstas/ui';
import { api, ApiError } from '@/lib/api';
import { useLocale, useT } from '@/lib/i18n';
import { telHref } from '@/lib/format';
import { useSettings } from '@/lib/settings';
import { usePageMeta } from '@/lib/usePageMeta';
import { PageBanner } from '@/components/PageBanner';

/** Contact : formulaire (champ piege + captcha cote serveur), coordonnees et plan d'acces issus des reglages. */
export default function Contact({ kind = 'contact' }: { kind?: 'contact' | 'appointment' }) {
  const { locale } = useLocale();
  const t = useT();
  const { get } = useSettings();
  const [form, setForm] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  usePageMeta({ title: t(kind === 'contact' ? 'contact.title' : 'appointment.title'), alternates: kind === 'contact' ? { fr: '/contact', en: '/contact' } : { fr: '/cabinet', en: '/cabinet' } });

  const phones = get<string[]>('contact.phones', []);
  const email = get<string | null>('contact.email', null);
  const address = get<string | null>('contact.address', null);
  const box = get<string | null>('contact.postal_box', null);
  const access = get<string[]>('contact.access_plan', []);
  const set = (k: string) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState('sending');
    setErrors({});
    try {
      await api(kind === 'contact' ? '/contact' : '/appointments', { locale, method: 'POST', body: { ...form, consent, locale } });
      setState('done');
    } catch (ex) {
      setErrors(ex instanceof ApiError && ex.details ? ex.details : { _: [t('error.generic')] });
      setState('idle');
    }
  }

  const title = t(kind === 'contact' ? 'contact.title' : 'appointment.title');

  return (
    <>
      <PageBanner title={title} lead={t(kind === 'contact' ? 'contact.lead' : 'appointment.lead')} crumbs={[{ label: title }]} />
      <Container className="grid gap-16 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-24">
        {state === 'done' ? (
          <p role="status" className="cut-leaf-sm bg-mint-100 p-10 font-display text-2xl font-extrabold">{t('form.sent')}</p>
        ) : (
          <form onSubmit={submit} className="grid gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField label={t('form.name')} value={form.name ?? ''} onChange={set('name')} error={errors.name?.[0]} required autoComplete="name" />
              <TextField label={t('form.phone')} type="tel" value={form.phone ?? ''} onChange={set('phone')} error={errors.phone?.[0]} required={kind === 'appointment'} autoComplete="tel" />
              {kind === 'contact' ? <TextField label={t('form.email')} type="email" value={form.email ?? ''} onChange={set('email')} error={errors.email?.[0]} required autoComplete="email" /> : null}
              {kind === 'contact' ? <TextField label={t('form.subject')} value={form.subject ?? ''} onChange={set('subject')} /> : <TextField label={t('appointment.preferred')} type="datetime-local" value={form.preferred_at ?? ''} onChange={set('preferred_at')} error={errors.preferred_at?.[0]} />}
            </div>
            <TextArea label={t(kind === 'contact' ? 'form.message' : 'appointment.reason')} value={form[kind === 'contact' ? 'message' : 'reason'] ?? ''} onChange={set(kind === 'contact' ? 'message' : 'reason')} error={errors.message?.[0]} required={kind === 'contact'} />
            {/* champ piege : invisible pour les humains */}
            <input type="text" name="website" value={form.website ?? ''} onChange={set('website')} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <label className="flex items-start gap-3">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required className="mt-1 size-5 accent-green-600" />
              <span>{t('form.consent')}</span>
            </label>
            {errors._ ? <p role="alert" className="font-semibold text-danger">{errors._[0]}</p> : null}
            <div><Button type="submit" size="lg" disabled={state === 'sending'}>{t('cta.submit')}</Button></div>
          </form>
        )}

        <aside className="grid content-start gap-10">
          <div>
            <h2 className="font-display text-2xl font-black">{t('footer.contact')}</h2>
            <ul className="mt-4 grid gap-2 text-lg">
              {phones.map((p) => <li key={p}><a href={telHref(p)} className="font-semibold">{p}</a></li>)}
              {email ? <li><a href={`mailto:${email}`}>{email}</a></li> : null}
              {box ? <li>{box}</li> : null}
              {address ? <li>{address}</li> : null}
            </ul>
          </div>
          {access.length ? (
            <div>
              <h2 className="font-display text-2xl font-black">{t('footer.access')}</h2>
              <ol className="mt-4 grid gap-3 border-l-4 border-green-500 pl-6">
                {access.map((a, i) => <li key={a}><span className="font-display font-black text-green-700">{i + 1}.</span> {a}</li>)}
              </ol>
            </div>
          ) : null}
        </aside>
      </Container>
    </>
  );
}