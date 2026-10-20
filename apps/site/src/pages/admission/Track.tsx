import { useState, type FormEvent } from 'react';
import { Button, Container, TextField } from '@isstas/ui';
import { api, ApiError } from '@/lib/api';
import { useLocale, useT } from '@/lib/i18n';
import { usePageMeta } from '@/lib/usePageMeta';
import { PageBanner } from '@/components/PageBanner';

type Result = { tracking_number: string; status: string; status_label: string; message: string | null; submitted_at: string | null };

export default function Track() {
  const { locale } = useLocale();
  const t = useT();
  const [number, setNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  usePageMeta({ title: t('admission.track'), alternates: { fr: '/admission/suivi', en: '/admission/suivi' } });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await api<Result>('/applications/track', { locale, params: { number, phone } }));
    } catch (ex) {
      setError(ex instanceof ApiError && ex.status === 404 ? t('track.not_found') : t('error.generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageBanner title={t('admission.track')} lead={t('track.lead')} crumbs={[{ label: t('admission.title'), to: '/admission' }, { label: t('admission.track') }]} />
      <Container size="narrow" className="grid gap-12 py-16 sm:py-24">
        <form onSubmit={submit} className="grid gap-6 sm:grid-cols-2">
          <TextField label={t('track.number')} value={number} onChange={(e) => setNumber(e.target.value)} placeholder={t('track.placeholder')} required />
          <TextField label={t('form.phone')} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <div className="sm:col-span-2"><Button type="submit" size="lg" disabled={loading}>{t('track.submit')}</Button></div>
        </form>

        <div aria-live="polite">
          {error ? <p role="alert" className="border-l-4 border-danger pl-5 text-lg font-semibold">{error}</p> : null}
          {result ? (
            <div className="cut-leaf-sm bg-mint-100 p-8">
              <p className="font-display text-sm font-bold text-green-700">{result.tracking_number}</p>
              <p className="mt-1 font-display text-4xl font-black">{result.status_label}</p>
              {result.message ? <p className="mt-4 text-lg">{result.message}</p> : null}
            </div>
          ) : null}
        </div>
      </Container>
    </>
  );
}