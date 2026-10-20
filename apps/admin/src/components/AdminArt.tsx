import type { SVGProps } from 'react';

/**
 * Illustrations SVG de l'administration, dessinees pour la charte ISSTAS (vert du logo, brun, menthe).
 * Elles utilisent `currentColor` pour le trait principal : la couleur vient de la classe de texte du parent.
 */

/** Cartable vide + ligne de pouls : etat vide d'une liste. */
export function EmptyArt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 220 160" fill="none" aria-hidden="true" {...props}>
      <ellipse cx="110" cy="146" rx="78" ry="8" className="fill-green-500/10" />
      <circle cx="170" cy="48" r="26" className="fill-mint-200" />
      <circle cx="46" cy="60" r="12" className="fill-mint-200" />
      <rect x="52" y="34" width="116" height="100" rx="14" className="fill-white stroke-green-500" strokeWidth="3" />
      <rect x="52" y="34" width="116" height="26" rx="14" className="fill-green-500" />
      <rect x="52" y="48" width="116" height="12" className="fill-green-500" />
      <circle cx="68" cy="47" r="3.5" fill="#fff" opacity=".9" />
      <circle cx="80" cy="47" r="3.5" fill="#fff" opacity=".6" />
      <circle cx="92" cy="47" r="3.5" fill="#fff" opacity=".35" />
      <path d="M68 100h24l8-20 12 38 10-26 6 8h20" className="stroke-green-500" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="68" y="72" width="40" height="5" rx="2.5" className="fill-mint-200" />
      <rect x="68" y="122" width="66" height="5" rx="2.5" className="fill-mint-200" />
      <path d="M176 100h10v-10h8v10h10v8h-10v10h-8v-10h-10z" className="fill-green-300" />
      <path d="M30 108h7v-7h6v7h7v6h-7v7h-6v-7h-7z" className="fill-green-300" opacity=".7" />
    </svg>
  );
}

/** Loupe sur une liste : recherche sans resultat. */
export function SearchArt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 220 160" fill="none" aria-hidden="true" {...props}>
      <ellipse cx="110" cy="146" rx="74" ry="8" className="fill-green-500/10" />
      <rect x="34" y="40" width="108" height="14" rx="7" className="fill-mint-200" />
      <rect x="34" y="66" width="84" height="14" rx="7" className="fill-mint-200" />
      <rect x="34" y="92" width="96" height="14" rx="7" className="fill-mint-200" />
      <circle cx="140" cy="84" r="34" className="fill-white stroke-green-500" strokeWidth="5" />
      <path d="M164 108l24 24" className="stroke-green-500" strokeWidth="9" strokeLinecap="round" />
      <path d="M122 86h10l6-14 8 26 6-16h8" className="stroke-green-300" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Bandeau du tableau de bord : croix medicale, livre ouvert et ligne de pouls, en trait clair sur fond vert. */
export function WelcomeArt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 420 220" fill="none" aria-hidden="true" {...props}>
      <circle cx="320" cy="110" r="96" stroke="currentColor" strokeOpacity=".14" strokeWidth="2" />
      <circle cx="320" cy="110" r="70" stroke="currentColor" strokeOpacity=".18" strokeWidth="2" strokeDasharray="3 10" strokeLinecap="round" />
      <circle cx="320" cy="110" r="44" fill="currentColor" fillOpacity=".1" />
      <path d="M308 84h24v20h20v24h-20v20h-24v-20h-20v-24h20z" fill="currentColor" fillOpacity=".92" />
      <path d="M150 168c28-12 52-12 76 2v-62c-24-14-48-14-76-2z" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeOpacity=".5" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M302 168c-28-12-52-12-76 2v-62c24-14 48-14 76-2z" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeOpacity=".5" strokeWidth="2.5" strokeLinejoin="round" transform="translate(-76 0)" />
      <path d="M0 196h110l14-22 20 46 18-34 12 10h246" stroke="currentColor" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <g fill="currentColor" fillOpacity=".4">
        <circle cx="40" cy="40" r="5" />
        <circle cx="96" cy="70" r="3" />
        <circle cx="388" cy="40" r="4" />
        <path d="M360 168h8v-8h7v8h8v7h-8v8h-7v-8h-8z" />
      </g>
    </svg>
  );
}

/** Jeton rond decoratif pour les cartes de statistiques : cercles concentriques + croix. */
export function StatArt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <circle cx="84" cy="36" r="52" stroke="currentColor" strokeOpacity=".12" strokeWidth="2" />
      <circle cx="84" cy="36" r="34" stroke="currentColor" strokeOpacity=".16" strokeWidth="2" />
      <path d="M78 22h12v14h14v12H90v14H78V48H64V36h14z" fill="currentColor" fillOpacity=".1" />
    </svg>
  );
}
