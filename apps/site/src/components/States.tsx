import { Skeleton } from '@isstas/ui';
import { useT } from '@/lib/i18n';

export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[84rem] space-y-6 px-5 py-16 sm:px-8 lg:px-12" aria-busy="true">
      <Skeleton className="h-14 w-2/3" />
      <Skeleton className="h-6 w-1/2" />
      <div className="grid gap-4 pt-6 md:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  const t = useT();
  return (
    <div role="alert" className="mx-auto max-w-[46rem] px-5 py-20">
      <h2 className="font-display text-3xl font-black">{t('error.title')}</h2>
      <p className="mt-3 text-ink-muted">{message || t('error.network')}</p>
    </div>
  );
}

export function EmptyState({ message }: { message?: string }) {
  const t = useT();
  return <p className="rounded-[var(--radius-panel)] bg-mint-100 p-6 text-ink-muted">{message || t('common.empty')}</p>;
}