import { useState } from 'react';
import { Button, Container } from '@isstas/ui';
import { LLink, useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import { usePageMeta } from '@/lib/usePageMeta';
import type { NewsItem } from '@/lib/types';
import { PageBanner } from '@/components/PageBanner';
import { EmptyState } from '@/components/States';

type Page = { items: NewsItem[]; meta: { current_page: number; last_page: number } };

export default function News() {
  const { locale } = useLocale();
  const t = useT();
  const [page, setPage] = useState(1);
  const { data } = useApi<Page>('/news', locale, { page, per_page: 9 });
  usePageMeta({ title: t('news.title'), alternates: { fr: '/actualites', en: '/actualites' } });
  const fmt = (d: string | null) => (d ? new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { dateStyle: 'long' }).format(new Date(d)) : '');

  return (
    <>
      <PageBanner title={t('news.title')} crumbs={[{ label: t('news.title') }]} />
      <Container className="py-14 sm:py-20">
        {!data?.items.length ? <EmptyState /> : (
          <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((p) => (
              <li key={p.id}>
                <LLink to={`/actualites/${p.slug}`} className="group block no-underline">
                  {p.cover ? <img src={p.cover} alt="" loading="lazy" className="aspect-[16/10] w-full rounded-[var(--radius-photo)] object-cover" /> : null}
                  <p className="mt-4 text-sm font-semibold text-green-700">{[p.category?.name, fmt(p.published_at)].filter(Boolean).join(' · ')}</p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight group-hover:underline">{p.title}</h2>
                  {p.excerpt ? <p className="mt-2 text-ink-muted">{p.excerpt}</p> : null}
                </LLink>
              </li>
            ))}
          </ul>
        )}
        {data && data.meta.last_page > 1 ? (
          <nav aria-label={t('news.pagination')} className="mt-14 flex items-center justify-between">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('cta.back')}</Button>
            <span className="font-semibold">{page} / {data.meta.last_page}</span>
            <Button variant="outline" disabled={page >= data.meta.last_page} onClick={() => setPage(page + 1)}>{t('cta.next')}</Button>
          </nav>
        ) : null}
      </Container>
    </>
  );
}