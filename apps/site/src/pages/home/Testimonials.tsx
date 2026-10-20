import { Quote } from 'lucide-react';
import { Container, SectionHeading } from '@isstas/ui';
import { useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import type { Testimonial } from '@/lib/types';
import { SectionShell, type Shell } from '@/components/SectionShell';
import { SectionSkeleton } from '@/components/Skeletons';

/** Temoignages d'etudiants et d'anciens (module Temoignages). Masque tant qu'il n'y en a pas. */
export function Testimonials({ data, shell }: { data: { title?: string }; shell: Shell }) {
  const { locale } = useLocale();
  const t = useT();
  const { data: items, loading } = useApi<Testimonial[]>('/testimonials', locale);
  if (loading && !items) return <SectionSkeleton shell={shell} variant="quote" />;
  if (!items?.length) return null;

  return (
    <SectionShell shell={shell}>
      <Container>
        <SectionHeading title={data.title ?? t('testimonials.title')} />
        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((it, i) => (
            <li key={`${it.name}-${i}`}>
              <figure className="card-lift flex h-full flex-col rounded-[var(--radius-card)] bg-mint-100 p-7 sm:p-8">
                <Quote className="size-9 text-green-400" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-[1.0625rem] leading-relaxed">{it.quote}</blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-green-200 pt-5">
                  {it.photo ? <img src={it.photo} alt="" loading="lazy" className="size-12 rounded-full object-cover" /> : <span className="grid size-12 place-items-center rounded-full bg-white font-display font-black text-green-700">{it.name.slice(0, 1)}</span>}
                  <span>
                    <span className="block font-display font-extrabold">{it.name}</span>
                    {it.cohort ? <span className="block text-sm text-ink-muted">{it.cohort}</span> : null}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </SectionShell>
  );
}