import { ChevronRight } from 'lucide-react';
import { Container, PulseLine, WaveDivider } from '@isstas/ui';
import { LLink, useT } from '@/lib/i18n';
import { useSettings } from '@/lib/settings';

export type Crumb = { label: string; to?: string };

/**
 * En-tete des pages interieures : photo en fond (reglage « page_banner » de l'admin), voile vert de lisibilite,
 * fil d'Ariane, tres gros titre et vague de raccord en bas.
 */
export function PageBanner({ title, lead, crumbs = [], image }: { title: string; lead?: string | null; crumbs?: Crumb[]; image?: string | null }) {
  const t = useT();
  const { data } = useSettings();
  const src = image ?? data?.brand?.page_banner ?? '/images/banner.jpg';
  return (
    <section className="on-dark relative isolate overflow-hidden bg-green-700 pb-28 pt-14 text-white sm:pb-36 sm:pt-20 lg:pb-40 lg:pt-24">
      {src ? <img src={src} alt="" loading="eager" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} className="absolute inset-0 -z-30 size-full object-cover" /> : null}
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-r from-green-900/90 via-green-800/75 to-green-700/55" />
      <PulseLine color="rgb(255 255 255 / 0.35)" strokeWidth={3} className="pointer-events-none absolute inset-x-0 bottom-14 -z-10 h-12 w-full sm:bottom-20" />
      <Container>
        <nav aria-label={t('nav.breadcrumb')} className="mb-7 text-sm text-white/80">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><LLink to="/" className="no-underline hover:text-white hover:underline">{t('nav.home')}</LLink></li>
            {crumbs.map((c, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5" aria-hidden="true" />
                {c.to ? <LLink to={c.to} className="no-underline hover:text-white hover:underline">{c.label}</LLink> : <span aria-current="page" className="font-semibold text-white">{c.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="h-hero max-w-[20ch] text-white" style={{ fontSize: 'clamp(2.25rem,5.5vw,4.5rem)' }}>{title}</h1>
        {lead ? <p className="mt-6 max-w-[56ch] text-[1.125rem] text-white/90 sm:text-[1.25rem]">{lead}</p> : null}
      </Container>
      <div className="absolute inset-x-0 bottom-[-1px] z-10"><WaveDivider variant="soft" className="text-white" /></div>
    </section>
  );
}