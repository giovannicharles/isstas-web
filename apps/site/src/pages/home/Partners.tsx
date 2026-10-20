import { Container, SectionHeading } from '@isstas/ui';
import { useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import type { Partner } from '@/lib/types';
import { SectionShell, type Shell } from '@/components/SectionShell';
import { SectionSkeleton } from '@/components/Skeletons';

/** Partenaires et tutelles : logos alignes, niveaux de gris puis couleur au survol ; a defaut, le nom. */
export function Partners({ data, shell }: { data: { title?: string }; shell: Shell }) {
  const { locale } = useLocale();
  const t = useT();
  const { data: partners, loading } = useApi<Partner[]>('/partners', locale);
  if (loading && !partners) return <SectionSkeleton shell={shell} variant="logos" />;
  if (!partners?.length) return null;

  return (
    <SectionShell shell={shell}>
      <Container>
        <SectionHeading title={data.title ?? t('partners.title')} />
        <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {partners.map((p) => {
            const inner = p.logo ? (
              <img src={p.logo} alt={p.name} loading="lazy" className="max-h-14 w-auto max-w-full object-contain opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0" />
            ) : (
              <span className="font-display text-sm font-extrabold leading-snug text-green-800 sm:text-base">{p.name}</span>
            );
            return (
              <li key={p.name} className="card-lift group grid min-h-28 place-items-center rounded-[var(--radius-card)] bg-white p-5 text-center shadow-soft ring-1 ring-line">
                {p.website ? <a href={p.website} target="_blank" rel="noreferrer noopener" className="no-underline">{inner}</a> : inner}
              </li>
            );
          })}
        </ul>
      </Container>
    </SectionShell>
  );
}