import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, SelectField } from '@isstas/ui';
import { useLocale, useT } from '@/lib/i18n';
import { money } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { usePageMeta } from '@/lib/usePageMeta';
import type { Fee, Program } from '@/lib/types';
import { PageBanner } from '@/components/PageBanner';

type Compared = Program & { access_rules: { diploma_label: string; duration_months: number | null }[]; fees: Fee[] };

/** Comparateur : 2 a 3 filieres cote a cote ; la selection vit dans l'URL (lien partageable). */
export default function Compare() {
  const { locale } = useLocale();
  const t = useT();
  const [params, setParams] = useSearchParams();
  const ids = useMemo(() => (params.get('ids') ?? '').split(',').filter(Boolean).slice(0, 3), [params]);
  const { data: all } = useApi<Program[]>('/programs', locale);
  const { data: rows } = useApi<Compared[]>(ids.length >= 2 ? '/programs/compare' : null, locale, { ids: ids.join(',') });
  usePageMeta({ title: t('compare.title'), alternates: { fr: '/comparateur', en: '/comparateur' } });

  const setSlot = (i: number, value: string) => {
    const next = [...ids];
    next[i] = value;
    setParams({ ids: next.filter(Boolean).join(',') });
  };

  return (
    <>
      <PageBanner title={t('compare.title')} lead={t('compare.lead')} crumbs={[{ label: t('compare.title') }]} />
      <Container className="py-14 sm:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <SelectField key={i} label={t('compare.slot', { n: i + 1 })} value={ids[i] ?? ''} onChange={(e) => setSlot(i, e.target.value)}>
              <option value="">{t('finder.choose')}</option>
              {(all ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </SelectField>
          ))}
        </div>

        {rows?.length ? (
          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <thead>
                <tr><th className="w-40" />{rows.map((p) => <th key={p.id} scope="col" className="border-b-2 border-green-700 px-4 py-3 font-display text-xl font-black">{p.name}</th>)}</tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-b border-line">
                  <th scope="row" className="px-4 py-4 text-sm font-bold text-green-700">{t('compare.levels')}</th>
                  {rows.map((p) => <td key={p.id} className="px-4 py-4">{(p.levels ?? []).map((l) => `${l.name}${l.duration_months ? ` (${l.duration_months} ${t('unit.months')})` : ''}`).join(' · ')}</td>)}
                </tr>
                <tr className="border-b border-line">
                  <th scope="row" className="px-4 py-4 text-sm font-bold text-green-700">{t('program.access')}</th>
                  {rows.map((p) => <td key={p.id} className="px-4 py-4">{p.access_rules.map((r) => r.diploma_label).join(' ; ') || '—'}</td>)}
                </tr>
                <tr className="border-b border-line">
                  <th scope="row" className="px-4 py-4 text-sm font-bold text-green-700">{t('fees.tuition')}</th>
                  {rows.map((p) => <td key={p.id} className="px-4 py-4 font-semibold">{p.fees[0] ? money(p.fees[0].tuition_fee, locale) : '—'}</td>)}
                </tr>
                <tr className="border-b border-line">
                  <th scope="row" className="px-4 py-4 text-sm font-bold text-green-700">{t('program.careers')}</th>
                  {rows.map((p) => <td key={p.id} className="px-4 py-4">{p.careers || '—'}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        ) : <p className="mt-12 border-l-4 border-green-500 pl-5 text-lg text-ink-muted">{t('compare.hint')}</p>}
      </Container>
    </>
  );
}