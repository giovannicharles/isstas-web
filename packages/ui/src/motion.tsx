import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/**
 * Conserves pour compatibilite des pages interieures : plus d'apparition animee au defilement
 * (le mouvement est reserve au hero, aux vagues, aux compteurs et aux reponses aux gestes).
 */
export function Reveal({ children, className, as: Tag = 'div' }: { children?: ReactNode; className?: string; as?: ElementType; delay?: number; y?: number; x?: number }) {
  return <Tag className={className}>{children}</Tag>;
}
export function Stagger({ children, className, as: Tag = 'div' }: { children?: ReactNode; className?: string; as?: ElementType; gap?: number }) {
  return <Tag className={className}>{children}</Tag>;
}
export function StaggerItem({ children, className, as: Tag = 'div' }: { children?: ReactNode; className?: string; as?: ElementType; y?: number; index?: number }) {
  return <Tag className={className}>{children}</Tag>;
}

/** Compteur : monte jusqu'a la valeur quand il entre a l'ecran ("1 200+" -> 1 200 puis "+"). */
export function CountUp({ value, className, duration = 1800 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const match = /^([^\d]*)([\d\s.,]+)(.*)$/.exec(value.trim());
  const target = match ? Number((match[2] ?? '').replace(/[\s,]/g, '')) : NaN;
  const [n, setN] = useState(reduced || Number.isNaN(target) ? target : 0);

  useEffect(() => {
    if (reduced || Number.isNaN(target)) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setN(target);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setN(Math.round(target * (1 - Math.pow(1 - t, 4))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { rootMargin: '-30px' });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced, target, duration]);

  if (!match || Number.isNaN(target)) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={className}>
      {match[1]}
      {new Intl.NumberFormat('fr-FR').format(n)}
      {match[3]}
    </span>
  );
}