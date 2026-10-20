import type { ReactNode } from 'react';
import { Decor, WaveTop, isDecor, type WaveVariant } from '@isstas/ui';

/** Jetons de fond de la charte (geres dans l'admin : style.background). */
export const BACKGROUNDS = {
  white: { cls: 'bg-white', wave: 'text-white', dark: false },
  mint: { cls: 'bg-mint-100', wave: 'text-mint-100', dark: false },
  green: { cls: 'bg-green-500', wave: 'text-green-500', dark: true },
  deep: { cls: 'bg-green-700', wave: 'text-green-700', dark: true },
  brown: { cls: 'bg-brown-800', wave: 'text-brown-800', dark: true },
} as const;

export type BackgroundToken = keyof typeof BACKGROUNDS;
export type SectionStyle = { background?: string | null; wave?: string | null; decor?: string | null; flip?: boolean; hidden_on_mobile?: boolean };
/** Reglage de presentation transmis par l'accueil a chaque section. */
export type Shell = { background: BackgroundToken; wave: string; decor: string; flip: boolean; hiddenOnMobile: boolean };

export const isBackground = (v: unknown): v is BackgroundToken => typeof v === 'string' && v in BACKGROUNDS;
const WAVES = ['soft', 'double', 'asymmetric', 'arc', 'pulse'];

/**
 * Habillage d'une section : fond (jeton), vague de raccord posee au-dessus (couleur de CETTE section,
 * donc invisible quand le fond est identique), texte clair sur fond sombre, rythme vertical 72 / 96 / 128 px.
 */
export function SectionShell({ shell, className = '', children }: { shell: Shell; className?: string; children: ReactNode }) {
  const bg = BACKGROUNDS[shell.background];
  const wave = WAVES.includes(shell.wave);

  return (
    <section className={`relative isolate ${bg.cls} ${bg.dark ? 'on-dark text-white' : ''} section-y ${shell.hiddenOnMobile ? 'max-md:hidden' : ''} ${className}`}>
      {isDecor(shell.decor) ? <Decor kind={shell.decor} dark={bg.dark} /> : null}
      {wave ? <WaveTop variant={shell.wave as WaveVariant} flip={shell.flip} className={bg.wave} /> : null}
      {children}
    </section>
  );
}