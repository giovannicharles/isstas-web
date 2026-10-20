type Part = string | number | false | null | undefined | Part[];

/**
 * Familles d'utilitaires Tailwind qui se remplacent entre elles (la derniere gagne), a la maniere de
 * tailwind-merge mais limitees aux cas courants. Le prefixe de variante (sm:, hover:...) fait partie de la cle.
 */
const GROUPS: [string, RegExp][] = [
  ['display', /^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden|contents|table)$/],
  ['position', /^(static|fixed|absolute|relative|sticky)$/],
  ['p', /^p-/], ['px', /^px-/], ['py', /^py-/], ['pt', /^pt-/], ['pb', /^pb-/], ['pl', /^pl-/], ['pr', /^pr-/],
  ['m', /^-?m-/], ['mx', /^-?mx-/], ['my', /^-?my-/], ['mt', /^-?mt-/], ['mb', /^-?mb-/], ['ml', /^-?ml-/], ['mr', /^-?mr-/],
  ['w', /^w-/], ['h', /^h-/], ['min-h', /^min-h-/], ['max-w', /^max-w-/], ['gap', /^gap-/],
  ['rounded', /^rounded(-\[|-(none|sm|md|lg|xl|2xl|3xl|full))?/],
  ['bg', /^bg-(?!gradient|\[url|none|clip|cover|center|no-repeat|fixed|local|opacity)/],
  ['shadow', /^shadow(-|$)/],
];

function groupOf(token: string): string | null {
  const i = token.lastIndexOf(':');
  const variant = i === -1 ? '' : token.slice(0, i + 1);
  const base = (i === -1 ? token : token.slice(i + 1)).replace(/^!/, '');
  for (const [name, re] of GROUPS) if (re.test(base)) return variant + name + (token.includes('!') ? '!' : '');
  return null;
}

/** Assemble des classes conditionnelles et resout les conflits courants : cn('p-6', cond && 'p-8') -> 'p-8'. */
export function cn(...parts: Part[]): string {
  const tokens: string[] = [];
  const walk = (p: Part) => {
    if (!p && p !== 0) return;
    if (Array.isArray(p)) p.forEach(walk);
    else String(p).split(/\s+/).filter(Boolean).forEach((t) => tokens.push(t));
  };
  parts.forEach(walk);

  const lastIndex = new Map<string, number>();
  tokens.forEach((t, i) => {
    const g = groupOf(t);
    if (g) lastIndex.set(g, i);
  });
  return tokens.filter((t, i) => {
    const g = groupOf(t);
    return !g || lastIndex.get(g) === i;
  }).join(' ');
}