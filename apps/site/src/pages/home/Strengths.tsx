import { Activity, BookOpen, Briefcase, Building2, Camera, FlaskConical, GraduationCap, HeartPulse, MonitorPlay, Stethoscope, Users, UtensilsCrossed, Wifi, type LucideIcon } from 'lucide-react';
import { Container, SectionHeading } from '@isstas/ui';
import { useLocale } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import type { PageData } from '@/lib/types';
import { SectionShell, type Shell } from '@/components/SectionShell';
import { SectionSkeleton } from '@/components/Skeletons';

const ICONS: [RegExp, LucideIcon][] = [
  [/campus/i, Building2], [/laborato/i, FlaskConical], [/internet|wifi/i, Wifi], [/restaurant/i, UtensilsCrossed],
  [/multim/i, MonitorPlay], [/biblioth|library/i, BookOpen], [/stage|internship/i, Stethoscope], [/emploi|job/i, Briefcase],
  [/cam[eé]ra|surveillance/i, Camera], [/ancien|alumni/i, Users], [/bourse|scholarship/i, GraduationCap],
  [/infirmerie|infirmary/i, HeartPulse], [/cabinet|clinic|r[eé][eé]ducation|physio/i, Activity],
];
const iconFor = (text: string): LucideIcon => ICONS.find(([re]) => re.test(text))?.[1] ?? HeartPulse;

/**
 * Pourquoi ISSTAS : mosaique asymetrique sur fond blanc. A gauche, une grande photo ; a droite, un atout mis en avant
 * puis des tuiles menthe de deux largeurs. Textes et photo viennent de la page « Points forts » (admin).
 */
export function Strengths({ data, shell }: { data: { title?: string }; shell: Shell }) {
  const { locale } = useLocale();
  const { data: page, loading } = useApi<PageData>('/pages/points-forts', locale);
  const items = (page?.blocks ?? []).flatMap((b) => (Array.isArray(b.data?.items) ? (b.data.items as string[]) : []));
  if (loading && !page) return <SectionSkeleton shell={shell} variant="split" />;
  if (!items.length) return null;

  const [featured, ...rest] = items as [string, ...string[]];
  const FeaturedIcon = iconFor(featured);

  return (
    <SectionShell shell={shell}>
      <Container>
        <SectionHeading title={data.title ?? page?.title ?? ''} />
        <div className="mt-14 grid gap-5 lg:grid-cols-12 lg:gap-6">
          {page?.cover ? (
            <div className="relative lg:col-span-5">
              <div className="photo h-full min-h-[22rem] overflow-hidden shadow-card">
                <img src={page.cover} alt={page.cover_alt ?? ''} loading="lazy" className="size-full object-cover" />
              </div>
            </div>
          ) : null}
          <ul className={`grid gap-2.5 sm:gap-4 sm:grid-cols-2 ${page?.cover ? 'lg:col-span-7' : 'lg:col-span-12 lg:grid-cols-3'}`}>
            <li className="sm:col-span-2 lg:col-span-full">
              <div className="flex h-full items-center gap-5 rounded-[var(--radius-card)] bg-green-500 p-6 text-white shadow-card sm:p-8">
                <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/15"><FeaturedIcon className="size-8" aria-hidden="true" /></span>
                <span className="h-sub text-white">{featured}</span>
              </div>
            </li>
            {rest.map((item, i) => {
              const Icon = iconFor(item);
              const wide = rest.length % 2 === 1 && i === rest.length - 1;
              return (
                <li key={item} className={wide ? 'sm:col-span-2' : ''}>
                  <div className="card-lift flex h-full items-center gap-3 rounded-[var(--radius-card)] bg-mint-100 p-3 sm:gap-4 sm:p-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white sm:size-12 text-green-500 shadow-soft"><Icon className="size-6" aria-hidden="true" /></span>
                    <span className="text-[1.0625rem] font-semibold leading-snug">{item}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </SectionShell>
  );
}