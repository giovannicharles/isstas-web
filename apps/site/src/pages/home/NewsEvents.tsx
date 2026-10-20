import { ArrowRight } from 'lucide-react';
import { Container, SectionHeading } from '@isstas/ui';
import { LLink, useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import type { EventItem, NewsItem } from '@/lib/types';
import { SectionShell, type Shell } from '@/components/SectionShell';
import { SectionSkeleton } from '@/components/Skeletons';

const fmt = (iso: string, locale: string) => new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

/** Actualites : une grande a la une et deux petites, evenements a venir en colonne datee. */
export function NewsEvents({ data, shell }: { data: { title?: string }; shell: Shell }) {
  const { locale } = useLocale();
  const t = useT();
  const { data: news, loading } = useApi<{ items: NewsItem[] }>('/news', locale, { per_page: 3 });
  const { data: events } = useApi<EventItem[]>('/events', locale, { limit: 4 });
  const [lead, ...rest] = news?.items ?? [];
  if (loading && !news) return <SectionSkeleton shell={shell} variant="cards" />;
  if (!lead && !events?.length) return null;

  return (
    <SectionShell shell={shell}>
      <Container>
        <SectionHeading title={data.title ?? t('news.title')} action={<LLink to="/actualites" className="link-arrow">{t('news.all')} <ArrowRight className="size-4" aria-hidden="true" /></LLink>} />
        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16">
          {lead ? (
            <div className="grid gap-10">
              <LLink to={`/actualites/${lead.slug}`} className="group block no-underline">
                {lead.cover ? <span className="photo block overflow-hidden shadow-card"><img src={lead.cover} alt={lead.cover_alt ?? ''} loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105" /></span> : null}
                <p className="mt-6 text-sm font-semibold text-green-700">{[lead.category?.name, lead.published_at ? fmt(lead.published_at, locale) : ''].filter(Boolean).join(' · ')}</p>
                <h3 className="h-sub mt-2 group-hover:underline">{lead.title}</h3>
                {lead.excerpt ? <p className="mt-3 max-w-[60ch] text-ink-muted">{lead.excerpt}</p> : null}
              </LLink>
              {rest.length ? (
                <ul className="grid gap-8 sm:grid-cols-2">
                  {rest.map((p) => (
                    <li key={p.id}>
                      <LLink to={`/actualites/${p.slug}`} className="group block border-t-2 border-green-500 pt-5 no-underline">
                        <p className="text-sm font-semibold text-green-700">{p.published_at ? fmt(p.published_at, locale) : ''}</p>
                        <h3 className="mt-2 font-display text-lg font-extrabold leading-snug group-hover:underline">{p.title}</h3>
                      </LLink>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : <span />}

          {events?.length ? (
            <ol className="self-start rounded-[var(--radius-card)] bg-white p-6 shadow-card sm:p-8">
              {events.map((e) => (
                <li key={e.id} className="grid grid-cols-[4rem_1fr] gap-4 border-b border-line py-5 first:pt-0 last:border-0 last:pb-0">
                  <time dateTime={e.starts_at} className="rounded-xl bg-green-500 py-2.5 text-center font-display font-black leading-none text-white">
                    <span className="block text-2xl">{new Date(e.starts_at).getDate()}</span>
                    <span className="mt-1 block text-xs font-bold uppercase">{new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { month: 'short' }).format(new Date(e.starts_at))}</span>
                  </time>
                  <div className="min-w-0">
                    <p className="font-display text-base font-extrabold leading-snug">{e.title}</p>
                    {e.location ? <p className="text-sm text-ink-muted">{e.location}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </Container>
    </SectionShell>
  );
}