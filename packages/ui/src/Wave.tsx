import type { CSSProperties } from 'react';
import { cn } from './cn';

export type WaveVariant = 'soft' | 'double' | 'asymmetric' | 'arc' | 'pulse';

/** Courbes sur un repere 1440 x 120 ; la partie pleine est toujours en bas (couleur de la section qui suit). */
const SHAPES: Record<WaveVariant, string> = {
  soft: 'M0,74 C240,30 480,104 720,66 S1200,30 1440,70 L1440,121 L0,121 Z',
  double: 'M0,62 C300,18 560,96 840,52 S1260,20 1440,58 L1440,121 L0,121 Z',
  asymmetric: 'M0,30 C380,112 940,6 1440,84 L1440,121 L0,121 Z',
  arc: 'M0,121 C0,121 360,18 720,18 C1080,18 1440,121 1440,121 Z',
  // silhouette d'electrocardiogramme : signature, a reserver a 1 ou 2 jonctions cles
  pulse: 'M0,78 H470 l22,-14 l22,14 H600 l16,26 l30,-92 l34,112 l24,-60 H900 l26,-16 l26,16 H1440 L1440,121 L0,121 Z',
};

/** Reflet de la double vague : une vague de fond plus claire, teintee de vert clair. */
const BACK: Partial<Record<WaveVariant, string>> = {
  double: 'M0,50 C260,100 620,10 900,56 S1280,92 1440,44 L1440,121 L0,121 Z',
};

const HEIGHT = 'clamp(48px, 7vw, 120px)';

/**
 * Separateur en vague : SVG inline en pleine largeur, hauteur fluide clamp(48px, 7vw, 120px).
 * viewBox + preserveAspectRatio="none" ; le trace deborde de 1 unite en bas (aucun filet parasite).
 * Couleur = `text-<fond de la section suivante>`. Une seule animation : derive horizontale tres lente,
 * coupee par prefers-reduced-motion.
 */
export function WaveDivider({ variant = 'soft', flip = false, className, style }: { variant?: WaveVariant; flip?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <div className={cn('pointer-events-none block w-full overflow-hidden leading-[0]', flip && 'rotate-180', className)} style={{ height: HEIGHT, ...style }} aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" shapeRendering="geometricPrecision" className="block h-full w-[104%] -translate-x-[2%] fill-current motion-safe:animate-[wave-drift_52s_ease-in-out_infinite_alternate]">
        {BACK[variant] ? <path d={BACK[variant]} style={{ fill: 'color-mix(in srgb, currentColor 35%, var(--color-green-300))' }} /> : null}
        <path d={SHAPES[variant]} />
      </svg>
    </div>
  );
}

/**
 * Bord superieur ondule d'une section : la vague (couleur de CETTE section) est posee au-dessus,
 * avec 1 px de recouvrement vers le bas. La section doit etre `relative`.
 */
export function WaveTop({ variant = 'soft', flip, className }: { variant?: WaveVariant; flip?: boolean; className?: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(100%-1px)] z-10">
      <WaveDivider variant={variant} flip={flip} className={className} />
    </div>
  );
}

/** Bord inferieur ondule (vague retournee, posee sous la section) : pour fermer une section sombre. */
export function WaveBottom({ variant = 'soft', className }: { variant?: WaveVariant; className?: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[calc(100%-1px)] z-10">
      <WaveDivider variant={variant} flip className={className} />
    </div>
  );
}

/** Compatibilite : ancien nom. */
export const Wave = WaveDivider;