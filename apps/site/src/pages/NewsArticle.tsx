import { useParams } from 'react-router-dom';
import { Container } from '@isstas/ui';
import { useLocale } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import { usePageMeta } from '@/lib/usePageMeta';
import type { NewsItem } from '@/lib/types';
import { PageBanner } from '@/components/PageBanner';
import { ErrorState, PageSkeleton } from '@/components/States';
import NotFound from './NotFound';

export default function NewsArticle() {
  const { slug = '' } = useParams();
  const { locale } = useLocale();
  const { data: post, loading, error } = useApi<NewsItem & { seo?: { title: string | null; description: string | null } }>(`/news/${slug}`, locale);
  usePageMeta({
    title: post?.seo?.title || post?.title,
    description: post?.seo?.description || post?.excerpt,
    alternates: post ? Object.fromEntries(Object.entries(post.slugs).filter(([, s]) => s).map(([l, s]) => [l, `/actualites/${s}`])) : {},
  });

  if (loading && !post) return <PageSkeleton />;
  if (error?.status === 404) return <NotFound />;
  if (!post) return <ErrorState message={error?.message} />;

  return (
    <>
      <PageBanner title={post.title} lead={post.excerpt} crumbs={[{ label: post.category?.name ?? '', to: '/actualites' }, { label: post.title }]} />
      <Container size="reading" className="py-14 sm:py-20">
        {post.cover ? <img src={post.cover} alt="" className="cut-leaf mb-10 aspect-[16/9] w-full object-cover" /> : null}
        <div className="prose-isstas" dangerouslySetInnerHTML={{ __html: post.body ?? '' }} />
      </Container>
    </>
  );
}