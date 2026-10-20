import { useEffect, useState } from 'react';
import { Container, SectionHeading, SelectField } from '@isstas/ui';
import { api } from '@/lib/api';
import { useLocale, useT } from '@/lib/i18n';
import { money } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { usePageMeta } from '@/lib/usePageMeta';
import type { Fee } from '@/lib/types';
import { FeeTable } from '@/components/FeeTable';
import { PageBanner } from '@/components/PageBanner';

type Sim = { registration_fee: number; tuition_fee: number; application_fee: number; installments: number; installment_amount: number; schedule: { number: number; amount: number }[]; total: number; notes: string | null };
type FeeRow = Fee & { level: { id: number; slug: string; name: string } };

/** Tarifs + simulateur : niveau et nombre de mensualites -> echeancier. */
export default function Fees() {
  const { locale } = useLocale();
  const t = useT();
  const { data: fees } = useApi<FeeRow[]>('/fees', locale);
  const [levelId, setLevelId] = useState('');
  const [n, setN] = useState('');
  const [sim, setSim] = useState<Sim | null>(null);
  usePageMeta({ title: t('admission.fees'), alternates: { fr: '/admission/frais', en: '/admission/frais' } });

  const current = fees?.find((f) => String(f.level.id) === levelId);
  const allowed = current?.allowed_installments?.length ? current.allowed_installments : [1, 2, 3, 4, 5, 6, 8, 10];

  useEffect(() => {
    if (!levelId || !n) return setSim(null);
    let live = true;
    api<Sim>('/fees/simulate', { locale, method: 'POST', body: { level_id: Number(levelId), installments: Number(n) } })
      .then((s) => live && setSim(s))
      .catch(() => live && setSim(null));
    return () => { live = false; };
  }, [levelId, n, locale]);

  return (
    <>
      <PageBanner title={t('admission.fees')} lead={t('fees.lead')} crumbs={[{ label: t('admission.title'), to: '/admission' }, { label: t('admission.fees') }]} />
      <Container className="grid gap-20 py-16 sm:py-24">
        {fees?.length ? <section><FeeTable rows={fees} /></section> : null}

        {fees?.length ? (
          <section className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div>
              <SectionHeading title={t('simulator.title')} lead={t('simulator.lead')} />
              <div className="mt-10 grid gap-5">
                <SelectField label={t('simulator.level')} value={levelId} onChange={(e) => { setLevelId(e.target.value); setN(''); }}>
                  <option value="">{t('finder.choose')}</option>
                  {fees.map((f) => <option key={f.level.id} value={f.level.id}>{f.level.name}</option>)}
                </SelectField>
                <SelectField label={t('simulator.installments')} value={n} onChange={(e) => setN(e.target.value)} disabled={!levelId}>
                  <option value="">{t('finder.choose')}</option>
                  {allowed.map((k) => <option key={k} value={k}>{t('simulator.n_installments', { n: k })}</option>)}
                </SelectField>
              </div>
            </div>

            <div aria-live="polite" className="cut-leaf-sm bg-mint-100 p-8">
              {sim ? (
                <>
                  <p className="font-display text-sm font-bold text-green-700">{t('simulator.per_installment')}</p>
                  <p className="font-display text-[clamp(2.4rem,5vw,3.6rem)] font-black leading-none">{money(sim.installment_amount, locale)}</p>
                  <dl className="mt-6 grid gap-2">
                    <div className="flex justify-between gap-4 border-b border-green-200 pb-2"><dt>{t('fees.registration')}</dt><dd className="font-semibold">{money(sim.registration_fee, locale)}</dd></div>
                    <div className="flex justify-between gap-4 border-b border-green-200 pb-2"><dt>{t('fees.tuition')}</dt><dd className="font-semibold">{money(sim.tuition_fee, locale)}</dd></div>
                    <div className="flex justify-between gap-4 pt-1 text-lg"><dt className="font-bold">{t('simulator.total')}</dt><dd className="font-black">{money(sim.total, locale)}</dd></div>
                  </dl>
                  <ol className="mt-6 grid gap-1 text-sm text-ink-muted">
                    {sim.schedule.map((s) => <li key={s.number} className="flex justify-between"><span>{t('simulator.installment', { n: s.number })}</span><span>{money(s.amount, locale)}</span></li>)}
                  </ol>
                  <p className="mt-6 text-sm">{t('simulator.extra_costs')}</p>
                </>
              ) : (
                <p className="text-lg text-ink-muted">{t('simulator.hint')}</p>
              )}
            </div>
          </section>
        ) : null}
      </Container>
    </>
  );
}