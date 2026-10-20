import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Container, Reveal } from '@isstas/ui';
import { LLink, useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import { usePageMeta } from '@/lib/usePageMeta';
import type { PageData } from '@/lib/types';
import { PageBanner } from '@/components/PageBanner';
import { ErrorState, PageSkeleton } from '@/components/States';
import NotFound from './NotFound';

type Block = { type: string; data: Record<string, any> };

/** Blocs de contenu geres dans l'admin : texte riche (HTML), liste a coches, citation, image. */
function BlockView({ block }: { block: Block }) {
  const d = block.data;
  switch (block.type) {
    case 'checklist':
      return (
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {((d.items as string[]) ?? []).map((i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl bg-mint-100 p-4"><Check className="mt-0.5 size-5 shrink-0 text-green-600" strokeWidth={3} aria-hidden="true" />{i}</li>
          ))}
        </ul>
      );
    case 'quote':
      return <blockquote className="cut-leaf-sm bg-mint-100 p-8 font-display text-2xl font-extrabold leading-snug">{d.text}</blockquote>;
    case 'image':
      return d.url ? <img src={d.url} alt={d.alt ?? ''} loading="lazy" className="cut-leaf w-full object-cover" /> : null;
    default:
      return <div className="prose-isstas" dangerouslySetInnerHTML={{ __html: (d.html as string) ?? (d.text as string) ?? '' }} />;
  }
}

export default function ContentPage() {
  const { slug = '' } = useParams();
  const { locale } = useLocale();
  const t = useT();
  const { data: page, loading, error } = useApi<PageData>(`/pages/${slug}`, locale);
  const [portrait, setPortrait] = useState(false);
  const { data: siblings } = useApi<{ slug: string; title: string; group: string | null }[]>('/pages', locale, { group: 'about' });
  usePageMeta({
    title: page?.seo?.title || page?.title,
    description: page?.seo?.description || page?.summary,
    alternates: page ? Object.fromEntries(Object.entries(page.slugs).filter(([, s]) => s).map(([l, s]) => [l, `/a-propos/${s}`])) : {},
  });

  if (loading && !page) return <PageSkeleton />;
  if (error?.status === 404) return <NotFound />;
  if (!page) return <ErrorState message={error?.message} />;

  const nav = (siblings ?? []).filter((s) => s.slug !== 'a-propos' || page.slug === 'a-propos');

  return (
    <>
      <PageBanner title={page.title} lead={page.summary} crumbs={[{ label: page.title }]} />
      <Container className="grid gap-14 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <article className={portrait ? "grid min-w-0 content-start gap-10 md:grid-cols-[17rem_minmax(0,1fr)] md:gap-14" : "grid min-w-0 content-start gap-10"}>
          {page.cover ? (
            <Reveal className={portrait ? "md:row-span-2 md:sticky md:top-28 md:self-start" : ""}>
              <div className="relative">
                <div aria-hidden="true" className="cut-leaf absolute -bottom-4 -right-4 size-full bg-green-300/60" />
                <img
                  src={page.cover}
                  alt=""
                  onLoad={(e) => setPortrait(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth)}
                  className={portrait ? "cut-leaf relative aspect-[4/5] w-full max-w-xs object-cover shadow-lift" : "cut-leaf relative aspect-[16/8] w-full object-cover shadow-lift"}
                />
              </div>
            </Reveal>
          ) : null}
          <div className="grid min-w-0 content-start gap-10">
            {page.blocks.map((b, i) => <Reveal key={i}><BlockView block={b} /></Reveal>)}
          </div>
        </article>

        {nav.length > 1 ? (
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav aria-label={t('about.nav')} className="rounded-[var(--radius-panel)] bg-mint-100 p-5">
              <p className="font-display text-sm font-extrabold text-green-700">{t('about.nav')}</p>
              <ul className="mt-3 grid gap-1">
                {nav.map((s) => (
                  <li key={s.slug}>
                    <LLink to={`/a-propos/${s.slug}`} aria-current={s.slug === page.slug ? 'page' : undefined} className={`block rounded-lg px-3 py-2 font-semibold no-underline transition-colors hover:bg-white ${s.slug === page.slug ? 'bg-white text-green-700 shadow-soft' : ''}`}>
                      {s.title}
                    </LLink>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        ) : null}
      </Container>
    </>
  );
}