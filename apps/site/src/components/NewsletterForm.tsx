import { useState, type FormEvent } from 'react';
import { Button } from '@isstas/ui';
import { api, ApiError } from '@/lib/api';
import { useLocale, useT } from '@/lib/i18n';

/** Newsletter avec double opt-in : l'API envoie le lien de confirmation. */
export function NewsletterForm() {
  const { locale } = useLocale();
  const t = useT();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [consent, setConsent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState('sending');
    try {
      await api('/newsletter', { locale, method: 'POST', body: { email, consent, locale } });
      setState('done');
    } catch (err) {
      setState(err instanceof ApiError ? 'error' : 'error');
    }
  }

  if (state === 'done') return <p role="status" className="font-semibold text-green-400">{t('newsletter.done')}</p>;

  return (
    <form onSubmit={submit} className="grid gap-3">
      <label htmlFor="nl-email" className="font-display text-base font-extrabold">{t('newsletter.title')}</label>
      <div className="grid gap-3">
        <input id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('newsletter.placeholder')} className="field min-w-0 flex-1 !border-white/40 !bg-transparent text-white placeholder:text-white/60" />
        <Button type="submit" variant="white" disabled={state === 'sending' || !consent}>{t('newsletter.subscribe')}</Button>
      </div>
      <label className="flex items-start gap-2 text-sm text-white/80">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-4 accent-green-500" />
        <span>{t('newsletter.consent')}</span>
      </label>
      {state === 'error' ? <p role="alert" className="text-sm font-semibold text-amber-300">{t('error.generic')}</p> : null}
    </form>
  );
}