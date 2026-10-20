import { useEffect, useRef } from 'react';
import { cn } from './cn';

/** Tracé d'électrocardiogramme : la signature graphique unique du site. */
const PATH =
  'M0 110 H250 l18 -14 l18 14 H400 l14 22 l30 -128 l38 188 l24 -82 H640 l24 -26 l28 26 H880 l16 -10 l16 10 H1200';

/**
 * Ligne de pouls dessinee. `draw` joue l'animation une fois (hero de l'accueil) ; sinon trace statique.
 * C'est un trait, jamais un remplissage ; elle est rognee par les bords de la section.
 */
export function PulseLine({ draw = false, className, strokeWidth = 5, color = 'var(--color-green-400)' }: { draw?: boolean; className?: string; strokeWidth?: number; color?: string }) {
  return (
    <svg viewBox="0 0 1200 220" fill="none" className={className} aria-hidden="true" focusable="false" preserveAspectRatio="none">
      <path
        d={PATH}
        pathLength={1}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        strokeDasharray={1}
        strokeDashoffset={draw ? undefined : 0}
        className={draw ? 'animate-pulse-draw' : undefined}
        style={draw ? { strokeDashoffset: 1 } : undefined}
      />
    </svg>
  );
}

/**
 * Filet de progression de lecture : la ligne de pouls se prolonge sous la barre de navigation.
 * Transform uniquement, mis a jour au defilement via requestAnimationFrame.
 */
export function ScrollPulse({ className }: { className?: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${ratio})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-green-500/15', className)} aria-hidden="true">
      <div ref={bar} className="h-full origin-left bg-green-500" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
}