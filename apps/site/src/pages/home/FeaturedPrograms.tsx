import { useRef } from 'react';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Badge, Button, Container, SectionHeading } from '@isstas/ui';
import { LLink, useLocale, useT } from '@/lib/i18n';
import { money } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import type { Program } from '@/lib/types';
import { SectionShell, type Shell } from '@/components/SectionShell';
import { ProgramArt } from '@/components/ProgramArt';
import { SectionSkeleton } from '@/components/Skeletons';

/** Filieres a la une : carrousel de cartes riches (photo, niveau, duree, cout, bouton), defilement par aimantation. */
export function FeaturedPrograms({ data, shell }: { data: { title?: string }; shell: Shell }) {
  const { locale } = useLocale();
  const t = useT();
  const track = useRef<HTMLUListElement>(null);
  const { data: programs, loading } = useApi<(Program & { from_tuition_fee?: number | null })[]>('/programs', locale, { featured: 1 });
  if (loading && !programs) return <SectionSkeleton shell={shell} variant="cards" />;
  if (!programs?.length) return null;

  const scrollBy = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * (track.current.clientWidth * 0.8), behavior: 'smooth' });

  return (
    <SectionShell shell={shell}>
      <Container>
        <SectionHeading
          title={data.title ?? t('featured.title')}
          action={
            <div className="hidden gap-3 md:flex">
              <button type="button" onClick={() => scrollBy(-1)} aria-label={t('carousel.prev')} className="grid size-12 place-items-center rounded-full border-2 border-green-500 text-green-500 transition-colors hover:bg-green-500 hover:text-white"><ArrowLeft className="size-5" aria-hidden="true" /></button>
              <button type="button" onClick={() => scrollBy(1)} aria-label={t('carousel.next')} className="grid size-12 place-items-center rounded-full border-2 border-green-500 text-green-500 transition-colors hover:bg-green-500 hover:text-white"><ArrowRight className="size-5" aria-hidden="true" /></button>
            </div>
          }
        />
      </Container>
      <ul
        ref={track}
        style={{ paddingInline: 'max(1.5rem, calc((100vw - 1240px) / 2))', scrollPaddingInline: 'max(1.5rem, calc((100vw - 1240px) / 2))' }}
        className="mt-14 flex w-full snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-10 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={t('featured.title')}
      >
        {programs.map((p) => {
          const level = p.levels?.[0];
          return (
            <li key={p.id} className="w-[min(82vw,22rem)] shrink-0 snap-start">
              <LLink to={`/formations/${level?.slug ?? ''}/${p.slug}`} className="card-lift group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white no-underline shadow-card ring-1 ring-line">
                <span className="relative block aspect-[4/3] overflow-hidden bg-green-100">
                  {p.cover && p.has_own_cover !== false ? <img src={p.cover} alt={p.cover_alt ?? ''} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <ProgramArt name={p.name} seed={p.id} />}
                  {level ? <span className="absolute left-4 top-4"><Badge tone="mint" className="!bg-white !text-green-700 shadow-soft">{level.name}</Badge></span> : null}
                </span>
                <span className="flex flex-1 flex-col p-6">
                  <span className="font-display text-xl font-extrabold leading-snug">{p.name}</span>
                  <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
                    {level?.duration_months ? <span className="inline-flex items-center gap-1.5"><Clock className="size-4 text-green-500" aria-hidden="true" />{level.duration_months} {t('unit.months')}</span> : null}
                    {p.from_tuition_fee ? <span>{t('featured.from')} <strong className="text-green-700">{money(p.from_tuition_fee, locale)}</strong></span> : null}
                  </span>
                  <span className="mt-auto pt-6"><span className="link-arrow">{t('cta.view_program')} <ArrowRight className="size-4" aria-hidden="true" /></span></span>
                </span>
              </LLink>
            </li>
          );
        })}
      </ul>
      <Container className="mt-4">
        <Button asChild variant="outline">
          <LLink to="/formations">{t('cta.view_programs')} <ArrowRight className="size-5" aria-hidden="true" /></LLink>
        </Button>
      </Container>
    </SectionShell>
  );
}