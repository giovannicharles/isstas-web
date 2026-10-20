import { cn } from './cn';

/** Bloc de chargement : fond menthe avec un reflet qui balaie (fixe en mode « reduire les animations »). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('rounded-[var(--radius-panel)] bg-mint-200 [animation:shimmer_1.6s_linear_infinite]', className)}
      style={{ backgroundImage: 'linear-gradient(100deg, transparent 30%, rgb(255 255 255 / .65) 50%, transparent 70%)', backgroundSize: '200% 100%' }}
    />
  );
}
