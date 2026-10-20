import type { ReactElement } from 'react';
import { cn } from './cn';

/**
 * Decors SVG de fond des sections. Dessines pour la charte ISSTAS (sante, vert du logo, ligne de pouls) :
 * tous en `currentColor` avec une opacite douce, derriere le contenu, sans interaction, `aria-hidden`.
 * La couleur vient de la classe de texte (claire sur fond sombre, verte sur fond clair).
 */
export const DECOR_KINDS = ['pulse', 'crosses', 'dna', 'network', 'rings', 'blobs', 'dots'] as const;
export type DecorKind = (typeof DECOR_KINDS)[number];
export const isDecor = (v: unknown): v is DecorKind => typeof v === 'string' && (DECOR_KINDS as readonly string[]).includes(v);

const W = 1440;
const H = 900;

/** Croix medicale a bouts arrondis centree en (0,0), de demi-largeur r. */
const plusPath = (r: number) => {
  const t = r * 0.36;
  const c = r * 0.28;
  return `M${-t},${-r + c} q0,${-c} ${c},${-c} h${2 * t - 2 * c} q${c},0 ${c},${c} v${r - t - c} h${r - t - c} q${c},0 ${c},${c} v${2 * t - 2 * c} q0,${c} ${-c},${c} h${-(r - t - c)} v${r - t - c} q0,${c} ${-c},${c} h${-(2 * t - 2 * c)} q${-c},0 ${-c},${-c} v${-(r - t - c)} h${-(r - t - c)} q${-c},0 ${-c},${-c} v${-(2 * t - 2 * c)} q0,${-c} ${c},${-c} h${r - t - c} z`;
};

/** Trois electrocardiogrammes etages, avec un pic marque, qui traversent toute la section. */
function Pulse() {
  const beat = (y: number, x: number, s = 1) =>
    `L${x - 40 * s},${y} l${14 * s},${-10 * s} l${14 * s},${10 * s} L${x - 2 * s},${y} l${10 * s},${-96 * s} l${18 * s},${150 * s} l${12 * s},${-76 * s} l${10 * s},${22 * s} L${x + 90 * s},${y}`;
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path strokeWidth="3" d={`M-20,250 ${beat(250, 330)} L760,250 ${beat(250, 980, 0.8)} L${W + 20},250`} />
      <path strokeWidth="2" opacity=".7" d={`M-20,560 L180,560 ${beat(560, 560, 1.15)} L1220,560 ${beat(560, 1260, 0.7)} L${W + 20},560`} />
      <path strokeWidth="1.5" opacity=".45" d={`M-20,790 L420,790 ${beat(790, 700, 0.7)} L${W + 20},790`} />
    </g>
  );
}

/** Croix de tailles variees, reparties en quinconce avec quelques cercles. */
function Crosses() {
  const items: [number, number, number, number][] = [
    [70, 120, 54, 0], [250, 70, 22, 0], [520, 60, 14, 0], [880, 80, 16, 0], [1150, 60, 24, 0], [1360, 150, 58, 0],
    [40, 470, 24, 0], [1400, 450, 26, 0], [1300, 330, 16, 0], [150, 330, 14, 0],
    [90, 800, 40, 0], [330, 850, 18, 0], [640, 840, 26, 0], [960, 850, 14, 0], [1210, 820, 30, 0], [1390, 760, 52, 0],
  ];
  return (
    <g fill="currentColor">
      {items.map(([x, y, r], i) => (
        <path key={i} d={plusPath(r)} transform={`translate(${x} ${y})`} opacity={r > 35 ? 1 : r > 20 ? 0.8 : 0.55} />
      ))}
      {[[250, 270, 6], [610, 330, 8], [960, 280, 5], [1220, 360, 9], [370, 640, 7], [1000, 640, 6], [120, 620, 5]].map(([x, y, r], i) => (
        <circle key={`c${i}`} cx={x} cy={y} r={r} opacity=".5" />
      ))}
    </g>
  );
}

/** Double helice d'ADN verticale, en deux brins avec barreaux, ancree a droite. */
function Dna() {
  const cx = 1180;
  const amp = 120;
  const top = -40;
  const bottom = H + 40;
  const period = 360;
  const steps = 90;
  const pt = (i: number, phase: number) => {
    const y = top + ((bottom - top) * i) / steps;
    return [cx + amp * Math.sin(((y - top) / period) * Math.PI * 2 + phase), y] as const;
  };
  const strand = (phase: number) => Array.from({ length: steps + 1 }, (_, i) => pt(i, phase)).map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const rungs = Array.from({ length: 26 }, (_, i) => {
    const k = Math.round(((i + 0.5) * steps) / 26);
    const [x1, y1] = pt(k, 0);
    const [x2] = pt(k, Math.PI);
    return { x1, x2, y: y1, depth: Math.abs(x1 - x2) / (2 * amp) };
  });
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round">
      {rungs.map((r, i) => (
        <line key={i} x1={r.x1} x2={r.x2} y1={r.y} y2={r.y} strokeWidth="3" opacity={0.25 + r.depth * 0.6} />
      ))}
      <path d={strand(0)} strokeWidth="5" />
      <path d={strand(Math.PI)} strokeWidth="5" opacity=".7" />
      {rungs.filter((_, i) => i % 3 === 0).map((r, i) => (
        <g key={`n${i}`} fill="currentColor" stroke="none"><circle cx={r.x1} cy={r.y} r="7" /><circle cx={r.x2} cy={r.y} r="7" opacity=".7" /></g>
      ))}
    </g>
  );
}

/** Reseau de molecules : noeuds relies, quelques-uns evides, pour evoquer biologie et recherche. */
function Network() {
  const n: [number, number, number][] = [
    [980, 120, 14], [1180, 230, 22], [1380, 110, 10], [1080, 410, 12], [1290, 470, 26], [880, 330, 9], [1380, 640, 14],
    [1130, 700, 18], [930, 600, 11], [740, 150, 8], [780, 500, 15], [1240, 840, 10], [600, 340, 7], [1420, 820, 8],
  ];
  const e: [number, number][] = [[0, 1], [1, 2], [1, 3], [3, 4], [0, 5], [5, 3], [4, 6], [3, 8], [8, 7], [7, 4], [0, 9], [5, 10], [10, 8], [7, 11], [6, 13], [11, 13], [9, 12], [12, 10], [5, 12]];
  return (
    <g>
      <g stroke="currentColor" strokeWidth="2" opacity=".55">{e.map(([a, b], i) => <line key={i} x1={n[a]![0]} y1={n[a]![1]} x2={n[b]![0]} y2={n[b]![1]} />)}</g>
      {n.map(([x, y, r], i) => (i % 3 === 1
        ? <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="currentColor" strokeWidth="3" />
        : <circle key={i} cx={x} cy={y} r={r} fill="currentColor" opacity={0.65} />))}
    </g>
  );
}

/** Cercles concentriques qui debordent du coin, dont un en pointilles. */
function Rings() {
  return (
    <g fill="none" stroke="currentColor">
      {[120, 210, 300, 390, 480, 570].map((r, i) => (
        <circle key={r} cx={W - 60} cy={H - 120} r={r} strokeWidth={i % 2 ? 2 : 3} opacity={0.85 - i * 0.1} strokeDasharray={i === 3 ? '3 14' : undefined} strokeLinecap="round" />
      ))}
      {[90, 170, 250].map((r, i) => (
        <circle key={`l${r}`} cx={120} cy={110} r={r} strokeWidth="2" opacity={0.5 - i * 0.12} />
      ))}
      <circle cx={W - 60} cy={H - 120} r="26" fill="currentColor" stroke="none" opacity=".7" />
    </g>
  );
}

/** Deux formes organiques en feuille, rappelant la coupe asymetrique des photos. */
function Blobs() {
  return (
    <g fill="currentColor">
      <path opacity=".9" d="M1160,60 C1330,-10 1500,120 1470,300 C1440,470 1250,520 1110,450 C960,380 960,140 1160,60 Z" />
      <path opacity=".6" d="M-60,520 C80,430 280,470 340,620 C400,780 280,940 100,930 C-90,920 -190,640 -60,520 Z" />
      <path opacity=".35" d="M640,700 C760,640 900,700 900,810 C900,930 740,990 640,930 C540,870 530,760 640,700 Z" />
    </g>
  );
}

/** Trame de points qui se densifie vers un coin. */
function Dots() {
  const dots: ReactElement[] = [];
  for (let gx = 0; gx < 30; gx++) {
    for (let gy = 0; gy < 12; gy++) {
      const x = W - 40 - gx * 36;
      const y = 40 + gy * 36;
      const falloff = 1 - gx / 30;
      const r = 1.2 + falloff * 3.4;
      if (r > 1.5) dots.push(<circle key={`${gx}-${gy}`} cx={x} cy={y} r={r.toFixed(2)} opacity={(0.25 + falloff * 0.75).toFixed(2)} />);
    }
  }
  return <g fill="currentColor">{dots}</g>;
}

const SHAPES: Record<DecorKind, () => ReactElement> = { pulse: Pulse, crosses: Crosses, dna: Dna, network: Network, rings: Rings, blobs: Blobs, dots: Dots };

/** Opacite par decor : les formes pleines restent plus discretes que les traits fins. */
const OPACITY: Record<DecorKind, [number, number]> = {
  pulse: [0.2, 0.2], crosses: [0.24, 0.2], dna: [0.22, 0.2], network: [0.22, 0.22], rings: [0.2, 0.18], blobs: [1, 0.14], dots: [0.3, 0.22],
};

export function Decor({ kind, dark = false, className }: { kind: DecorKind; dark?: boolean; className?: string }) {
  const Shape = SHAPES[kind];
  const [light, onDark] = OPACITY[kind];
  const opacity = dark ? onDark : light;
  // Les blobs sur fond clair prennent un vert tres pale plein, pas de transparence grise.
  const color = dark ? 'text-white' : kind === 'blobs' ? 'text-green-200' : 'text-green-500';
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', color, className)} style={{ opacity }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="size-full">
        <Shape />
      </svg>
    </div>
  );
}
