import { Container, Skeleton } from '@isstas/ui';
import { useT } from '@/lib/i18n';
import { SectionShell, type Shell } from './SectionShell';

type Variant = 'cards' | 'split' | 'band' | 'logos' | 'finder' | 'quote';

/**
 * Squelette d'une section de l'accueil pendant le chargement de ses donnees : meme fond, memes marges
 * et meme gabarit que la section reelle, pour que la page ne saute pas quand le contenu arrive.
 */
export function SectionSkeleton({ shell, variant = 'cards' }: { shell: Shell; variant?: Variant }) {
  const t = useT();
  return (
    <SectionShell shell={{ ...shell, wave: 'none' }} className="min-h-[18rem]">
      <Container>
        <div aria-busy="true" aria-live="polite">
          <span className="sr-only">{t('common.loading')}</span>
          {variant === 'finder' ? (
            <Skeleton className="h-44 w-full !rounded-[1.5rem]" />
          ) : (
            <>
              <Skeleton className="h-12 w-2/3 max-w-lg" />
              <div className="mt-12">{body(variant)}</div>
            </>
          )}
        </div>
      </Container>
    </SectionShell>
  );
}

function body(variant: Variant) {
  switch (variant) {
    case 'split':
      return (
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full !rounded-[2rem]" />
          <div className="grid gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="mt-4 h-[3.25rem] w-48 !rounded-full" />
          </div>
        </div>
      );
    case 'band':
      return (
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="grid gap-3"><Skeleton className="h-14 w-24 !bg-white/25" /><Skeleton className="h-4 w-32 !bg-white/20" /></div>)}
        </div>
      );
    case 'logos':
      return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 !rounded-[1.25rem]" />)}</div>;
    case 'quote':
      return <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-52 !rounded-[1.25rem]" />)}</div>;
    default:
      return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-[1.25rem] bg-white/60 ring-1 ring-line">
              <Skeleton className="aspect-[4/3] w-full !rounded-none" />
              <div className="grid gap-3 p-6"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="mt-3 h-5 w-28" /></div>
            </div>
          ))}
        </div>
      );
  }
}

/** Squelette de l'accueil entier : hero sombre avec titre et boutons, carte de recherche, puis une section de cartes. */
export function HomeSkeleton() {
  const t = useT();
  const shell: Shell = { background: 'mint', wave: 'none', decor: 'none', flip: false, hiddenOnMobile: false };
  return (
    <div aria-busy="true">
      <span className="sr-only">{t('common.loading')}</span>
      <div className="relative min-h-[min(92vh,40rem)] bg-green-900 py-24">
        <Container>
          <Skeleton className="h-9 w-64 !rounded-full !bg-white/15" />
          <Skeleton className="mt-8 h-24 w-full max-w-3xl !bg-white/15" />
          <Skeleton className="mt-6 h-6 w-full max-w-xl !bg-white/10" />
          <div className="mt-10 flex gap-4"><Skeleton className="h-[3.25rem] w-52 !rounded-full !bg-white/20" /><Skeleton className="h-[3.25rem] w-36 !rounded-full !bg-white/10" /></div>
        </Container>
      </div>
      <SectionSkeleton shell={shell} variant="split" />
    </div>
  );
}
