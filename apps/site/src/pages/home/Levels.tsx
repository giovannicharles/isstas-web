import { ArrowRight, Clock } from 'lucide-react';
import { Badge, Button, Container, SectionHeading } from '@isstas/ui';
import { LLink, useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import type { Level, Program } from '@/lib/types';
import { SectionShell, type Shell } from '@/components/SectionShell';
import { SectionSkeleton } from '@/components/Skeletons';

/** Les niveaux : mise en page editoriale en alternance gauche/droite (photo a coin asymetrique, duree et acces en grand). */
export function Levels({ data, shell }: { data: { title?: string }; shell: Shell }) {
  const { locale } = useLocale();
  const t = useT();
  const { data: levels, loading } = useApi<Level[]>('/levels', locale);
  const { data: programs } = useApi<Program[]>('/programs', locale);
  if (loading && !levels) return <SectionSkeleton shell={shell} variant="split" />;
  if (!levels?.length) return null;

  return (
    <SectionShell shell={shell}>
      <Container>
        <SectionHeading title={data.title ?? t('levels.title')} />
        <div className="mt-14 grid gap-20 md:gap-24 lg:gap-32">
          {levels.map((l, i) => {
            const flip = i % 2 === 1;
            const chips = (programs ?? []).filter((p) => p.levels?.some((x) => x.id === l.id)).slice(0, 5);
            return (
              <article key={l.id} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-20">
                <LLink to={`/formations/${l.slug}`} aria-label={l.name} className={`group block no-underline ${flip ? 'lg:order-2' : ''}`}>
                  <span className={`block overflow-hidden bg-green-100 shadow-card ${flip ? 'photo-flip' : 'photo'}`}>
                    {l.cover ? <img src={l.cover} alt={l.cover_alt ?? ''} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <span className="block aspect-[4/3] bg-gradient-to-br from-green-300 to-green-600" />}
                  </span>
                </LLink>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    {l.english_equivalent ? <Badge tone="green">{l.english_equivalent}</Badge> : null}
                    {l.programs_count ? <span className="text-sm font-semibold text-ink-muted">{t('levels.programs_count', { n: l.programs_count })}</span> : null}
                  </div>
                  <h3 className="mt-3 text-[clamp(2rem,3.4vw,3rem)] font-black leading-[1.04] tracking-[-0.025em]">{l.name}</h3>

                  {l.duration ? (
                    <p className="mt-6 flex items-start gap-3 font-display text-[clamp(1.4rem,2.2vw,1.75rem)] font-extrabold leading-tight text-green-500">
                      <Clock className="mt-1 size-6 shrink-0" aria-hidden="true" />
                      <span>{l.duration}</span>
                    </p>
                  ) : null}
                  {l.access_conditions ? (
                    <p className="mt-4 max-w-[52ch] border-l-4 border-green-500 pl-4 text-ink-muted">
                      <span className="mb-1 block font-display text-sm font-bold text-green-700">{t('level.access')}</span>
                      {l.access_conditions}
                    </p>
                  ) : null}

                  {chips.length ? (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {chips.map((p) => (
                        <li key={p.id}>
                          <LLink to={`/formations/${l.slug}/${p.slug}`} className="inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-green-700 no-underline shadow-soft ring-1 ring-green-200 transition-colors hover:bg-green-500 hover:text-white">{p.name}</LLink>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <Button asChild className="mt-8">
                    <LLink to={`/formations/${l.slug}`}>{t('cta.view_programs')} <ArrowRight className="size-5" aria-hidden="true" /></LLink>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </SectionShell>
  );
}