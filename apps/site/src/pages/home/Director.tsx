import { ArrowRight, Quote } from 'lucide-react';
import { Container, SectionHeading } from '@isstas/ui';
import { LLink, useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import type { PageData } from '@/lib/types';
import { SectionShell, type Shell } from '@/components/SectionShell';
import { SectionSkeleton } from '@/components/Skeletons';

/** Mot de la Directrice : portrait a coin asymetrique et citation en grand. Masque tant que la page est vide. */
export function Director({ data, shell }: { data: { title?: string }; shell: Shell }) {
  const { locale } = useLocale();
  const t = useT();
  const { data: page, loading } = useApi<PageData>('/pages/mot-de-la-directrice', locale);
  const excerpt = page?.summary || (page?.blocks ?? []).map((b) => (b.data?.text as string | undefined) ?? '').find(Boolean);
  if (loading && !page) return <SectionSkeleton shell={shell} variant="split" />;
  if (!page || !excerpt) return null;

  return (
    <SectionShell shell={shell}>
      <Container className="grid items-center gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 lg:gap-24">
        {page.cover ? (
          <div className="relative mx-auto w-full max-w-sm md:max-w-none">
            <span aria-hidden="true" className="photo absolute -bottom-5 -left-5 size-full bg-green-300/60" />
            <img src={page.cover} alt={page.cover_alt ?? ''} loading="lazy" className="photo relative aspect-[4/5] w-full object-cover shadow-lift" />
          </div>
        ) : null}
        <div className={page.cover ? '' : 'md:col-span-2'}>
          <SectionHeading title={data.title ?? page.title} />
          <Quote className="mt-8 size-10 text-green-500" aria-hidden="true" />
          <p className="measure mt-3 text-[clamp(1.2rem,1.7vw,1.5rem)] font-medium leading-relaxed text-ink">{excerpt}</p>
          <LLink to={`/a-propos/${page.slug}`} className="link-arrow mt-8">
            {t('cta.read_more')} <ArrowRight className="size-4" aria-hidden="true" />
          </LLink>
        </div>
      </Container>
    </SectionShell>
  );
}