import { useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button, Container, SectionHeading } from '@isstas/ui';
import { LLink, useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import { usePageMeta } from '@/lib/usePageMeta';
import type { DownloadItem, Level } from '@/lib/types';
import { FeeTable } from '@/components/FeeTable';
import { PageBanner } from '@/components/PageBanner';
import { ErrorState, PageSkeleton } from '@/components/States';
import NotFound from './NotFound';

export default function LevelPage() {
  const { level: slug = '' } = useParams();
  const { locale, path } = useLocale();
  const t = useT();
  const { data: level, loading, error } = useApi<Level>(`/levels/${slug}`, locale);
  const { data: downloads } = useApi<DownloadItem[]>(level ? '/downloads' : null, locale, { level_id: level?.id, category: 'brochure' });

  usePageMeta({
    title: level?.seo?.title || level?.name,
    description: level?.seo?.description || level?.summary,
    alternates: level ? Object.fromEntries(Object.entries(level.slugs).filter(([, s]) => s).map(([l, s]) => [l, `/formations/${s}`])) : {},
  });

  if (loading && !level) return <PageSkeleton />;
  if (error?.status === 404) return <NotFound />;
  if (!level) return <ErrorState message={error?.message} />;

  const brochure = downloads?.find((d) => d.languages.includes(locale as 'fr' | 'en')) ?? downloads?.[0];
  const base = import.meta.env.VITE_API_URL ?? '/api/v1';

  return (
    <>
      <PageBanner title={level.name} lead={level.summary} crumbs={[{ label: t('programs.title'), to: '/formations' }, { label: level.name }]} />
      <Container className="grid gap-16 py-16 sm:py-24">
        <dl className="grid gap-8 border-y-2 border-green-700 py-8 sm:grid-cols-3">
          {level.duration ? <div><dt className="font-display text-sm font-bold text-green-700">{t('level.duration')}</dt><dd className="mt-1 font-display text-xl font-extrabold">{level.duration}</dd></div> : null}
          {level.access_conditions ? <div className="sm:col-span-2"><dt className="font-display text-sm font-bold text-green-700">{t('level.access')}</dt><dd className="mt-1 text-lg">{level.access_conditions}</dd></div> : null}
        </dl>

        {level.programs?.length ? (
          <section>
            <SectionHeading title={t('level.programs')} as="h2" />
            <ul className="mt-8 border-t-2 border-green-700">
              {level.programs.map((p) => (
                <li key={p.slug} className="border-b border-line">
                  <LLink to={`/formations/${level.slug}/${p.slug}`} className="group flex items-center justify-between gap-6 py-5 no-underline hover:bg-mint-100 md:px-4">
                    <span><span className="font-display text-xl font-extrabold">{p.name}</span>{p.duration_months ? <span className="ml-3 text-sm text-ink-muted">{p.duration_months} {t('unit.months')}</span> : null}</span>
                    <ArrowRight className="size-5 text-green-600 transition-transform group-hover:translate-x-2" aria-hidden="true" />
                  </LLink>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {level.fees ? (
          <section>
            <SectionHeading title={t('fees.title')} />
            <div className="mt-8"><FeeTable rows={[{ ...level.fees, level: { id: level.id, slug: level.slug, name: level.name } }]} /></div>
            <LLink to="/admission/frais" className="link-arrow mt-6">{t('admission.simulator')} <ArrowRight className="size-4" aria-hidden="true" /></LLink>
          </section>
        ) : null}

        {level.required_documents?.length ? (
          <section>
            <SectionHeading title={t('documents.title')} />
            <ul className="prose-isstas mt-8">
              {level.required_documents.map((d) => <li key={d.label}>{d.label}{d.is_additional ? <span className="ml-2 text-sm font-bold text-green-700">{t('documents.extra')}</span> : null}</li>)}
            </ul>
          </section>
        ) : null}

        <div className="flex flex-wrap items-center gap-5">
          <Button to={path(`/admission/pre-inscription?level=${level.id}`)} size="lg">{t('cta.apply')}</Button>
          {brochure ? <a className="link-arrow" href={`${base}/downloads/${brochure.id}/file?lang=${locale}`}>{t('cta.download_brochure')}</a> : null}
        </div>
      </Container>
    </>
  );
}