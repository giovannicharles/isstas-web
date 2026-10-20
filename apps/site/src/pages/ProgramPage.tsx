import { useParams } from 'react-router-dom';
import { Badge, Button, Container } from '@isstas/ui';
import { LLink, useLocale, useT } from '@/lib/i18n';
import { money } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { usePageMeta } from '@/lib/usePageMeta';
import type { DownloadItem, Program } from '@/lib/types';
import { FeeTable } from '@/components/FeeTable';
import { PageBanner } from '@/components/PageBanner';
import { ErrorState, PageSkeleton } from '@/components/States';
import NotFound from './NotFound';

function Block({ title, text }: { title: string; text?: string | null }) {
  if (!text) return null;
  return (
    <section>
      <h2 className="font-display text-3xl font-black tracking-[-0.02em]">{title}</h2>
      <div className="prose-isstas mt-4 whitespace-pre-line">{text}</div>
    </section>
  );
}

export default function ProgramPage() {
  const { level: levelSlug = '', program: slug = '' } = useParams();
  const { locale, path } = useLocale();
  const t = useT();
  const { data: p, loading, error } = useApi<Program>(`/programs/${slug}`, locale);
  const { data: downloads } = useApi<DownloadItem[]>(p ? '/downloads' : null, locale, { program_id: p?.id, category: 'brochure' });

  usePageMeta({
    title: p?.seo?.title || p?.name,
    description: p?.seo?.description || p?.summary,
    alternates: p ? Object.fromEntries(Object.entries(p.slugs).filter(([, s]) => s).map(([l, s]) => [l, `/formations/${levelSlug}/${s}`])) : {},
  });

  if (loading && !p) return <PageSkeleton />;
  if (error?.status === 404) return <NotFound />;
  if (!p) return <ErrorState message={error?.message} />;

  const level = p.levels?.find((l) => l.slug === levelSlug) ?? p.levels?.[0];
  const brochure = downloads?.find((d) => d.languages.includes(locale as 'fr' | 'en')) ?? downloads?.[0];
  const base = import.meta.env.VITE_API_URL ?? '/api/v1';
  const feeRows = (p.fees ?? []).map((f) => ({ ...f, level_name: p.levels?.find((l) => l.id === f.level_id)?.name }));
  const rules = (p.access_rules ?? []).filter((r) => !level || r.level_id === level.id);

  const hasContent = Boolean(p.description || p.careers || p.curriculum || p.internship);
  const minFee = p.from_tuition_fee ?? (feeRows.length ? Math.min(...feeRows.map((f) => f.tuition_fee ?? Infinity).filter(Number.isFinite)) : null);
  const facts = [
    level?.duration_months ? { label: t('program.facts.duration'), value: `${level.duration_months} ${t('unit.months')}` } : null,
    level ? { label: t('program.facts.level'), value: level.name } : null,
    minFee ? { label: t('program.facts.fee'), value: money(minFee, locale) } : null,
    { label: t('program.facts.admission'), value: t('program.facts.admission_value') },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <PageBanner title={p.name} lead={p.summary} crumbs={[{ label: t('programs.title'), to: '/formations' }, ...(level ? [{ label: level.name, to: `/formations/${level.slug}` }] : []), { label: p.name }]} />
      <Container className="grid gap-16 py-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20 lg:py-24">
        <div className="grid gap-14">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="rounded-[var(--radius-card)] bg-mint-100 p-5">
                <dt className="text-sm font-semibold text-ink-muted">{f.label}</dt>
                <dd className="mt-1 font-display text-xl font-extrabold leading-snug text-green-800">{f.value}</dd>
              </div>
            ))}
          </dl>
          <Block title={t('program.presentation')} text={p.description} />
          <Block title={t('program.careers')} text={p.careers} />
          <Block title={t('program.curriculum')} text={p.curriculum} />
          <Block title={t('program.internship')} text={p.internship} />

          {!hasContent ? (
            <section className="rounded-[var(--radius-card)] bg-green-500 p-8 text-white shadow-card">
              <h2 className="font-display text-2xl font-extrabold text-white">{t('program.more.title')}</h2>
              <p className="mt-3 max-w-[60ch] text-white/90">{t('program.more.text')}</p>
              <Button asChild variant="white" className="mt-6"><LLink to="/contact">{t('cta.contact_us')}</LLink></Button>
            </section>
          ) : null}

          {rules.length ? (
            <section>
              <h2 className="font-display text-3xl font-black tracking-[-0.02em]">{t('program.access')}</h2>
              <ul className="mt-5 grid gap-3">
                {rules.map((r) => (
                  <li key={r.diploma_code} className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
                    <span className="font-semibold">{r.diploma_label}</span>
                    {r.duration_months ? <Badge tone="mint">{r.duration_months} {t('unit.months')}</Badge> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {feeRows.length ? (
            <section>
              <h2 className="font-display text-3xl font-black tracking-[-0.02em]">{t('fees.title')}</h2>
              <div className="mt-6"><FeeTable rows={feeRows} /></div>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="cut-leaf-sm bg-mint-100 p-7">
            <Button to={path(`/admission/pre-inscription?program=${p.id}${level ? `&level=${level.id}` : ''}`)} size="lg" fullWidth>{t('cta.apply')}</Button>
            {brochure ? <a className="link-arrow mt-5" href={`${base}/downloads/${brochure.id}/file?lang=${locale}`}>{t('cta.download_brochure')}</a> : null}
            <LLink to={`/comparateur?ids=${p.id}`} className="link-arrow mt-4">{t('program.compare')}</LLink>
          </div>
        </aside>
      </Container>
    </>
  );
}