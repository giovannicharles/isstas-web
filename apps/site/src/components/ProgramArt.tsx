import { Activity, Baby, Brain, FlaskConical, HeartPulse, LineChart, Microscope, Pill, ScanLine, Stethoscope, Users, type LucideIcon } from 'lucide-react';

/** Mot-cle du nom de la filiere -> pictogramme. Repli : cœur + pouls. */
const ICONS: [RegExp, LucideIcon][] = [
  [/sage|maïeut|maieut|midwi/i, Baby],
  [/infirmi|nurs/i, Stethoscope],
  [/kin[eé]|r[eé][eé]ducation|physio|th[eé]rapie|therapy|rehab/i, Activity],
  [/laborato|biolog|analys|microbio|biochim/i, Microscope],
  [/radiolog|imagerie|imaging/i, ScanLine],
  [/pharma/i, Pill],
  [/[eé]pid[eé]m|statist|recherche/i, LineChart],
  [/communaut|public|sant[eé] publique/i, Users],
  [/psych|neuro/i, Brain],
  [/chimie|chemis/i, FlaskConical],
];
export const iconForProgram = (name: string): LucideIcon => ICONS.find(([re]) => re.test(name))?.[1] ?? HeartPulse;

/** Trois palettes de la charte (vert du logo, vert profond, brun du logo) pour varier les cartes sans photo. */
const TONES = [
  { bg: 'from-green-500 to-green-700', ring: 'text-white', chip: 'bg-white/15' },
  { bg: 'from-green-700 to-green-900', ring: 'text-green-100', chip: 'bg-white/10' },
  { bg: 'from-brown-800 to-brown-900', ring: 'text-green-300', chip: 'bg-white/10' },
];

/**
 * Visuel de repli d'une filiere sans photo propre (au lieu de repeter la photo du niveau) :
 * pictogramme du metier, cercles concentriques et croix medicales dessines en SVG.
 */
export function ProgramArt({ name, seed = 0, className = '' }: { name: string; seed?: number; className?: string }) {
  const Icon = iconForProgram(name);
  const tone = TONES[Math.abs(seed) % TONES.length]!;
  return (
    <span aria-hidden="true" className={`${className.includes('absolute') ? '' : 'relative'} isolate grid size-full place-items-center overflow-hidden bg-gradient-to-br ${tone.bg} ${className}`}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 -z-10 size-full ${tone.ring}`} fill="none" stroke="currentColor">
        <g opacity=".16" strokeWidth="2">
          {[70, 120, 170, 220].map((r) => <circle key={r} cx="300" cy="230" r={r} />)}
        </g>
        <g opacity=".12" strokeWidth="2">
          <circle cx="40" cy="40" r="60" />
          <circle cx="40" cy="40" r="95" />
        </g>
        <g fill="currentColor" stroke="none" opacity=".16">
          <path d="M70 215h12v-12h10v12h12v10h-12v12h-10v-12h-12z" />
          <path d="M335 48h9v-9h8v9h9v8h-9v9h-8v-9h-9z" />
          <path d="M200 270h7v-7h6v7h7v6h-7v7h-6v-7h-7z" />
        </g>
        <path d="M0 262h120l14-26 22 52 18-40 14 14h212" strokeWidth="2.5" opacity=".22" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`grid size-24 place-items-center rounded-[2rem] ${tone.chip} text-white shadow-lift ring-1 ring-white/25 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
        <Icon className="size-12" strokeWidth={1.6} />
      </span>
    </span>
  );
}
