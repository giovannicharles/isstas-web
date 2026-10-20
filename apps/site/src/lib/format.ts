/** 500000 -> "500 000 FCFA" (fr) / "500,000 XAF" (en) : la devise vient de l'API (XAF). */
export function money(amount: number, locale: string, currencyLabel = 'FCFA'): string {
  const n = new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'fr-FR', { maximumFractionDigits: 0 }).format(amount);
  return locale === 'en' ? `${n} ${currencyLabel === 'FCFA' ? 'XAF' : currencyLabel}` : `${n} ${currencyLabel}`;
}

export function months(n: number | null | undefined, unit: string): string {
  return n ? `${n} ${unit}` : '';
}

/** Un lien telephonique : "+237 695 292 287" -> "tel:+237695292287". */
export function telHref(phone: string): string {
  return 'tel:' + phone.replace(/[^\d+]/g, '');
}

export function isUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}
const SOCIAL_BASE: Record<string, string> = {
  facebook: 'https://www.facebook.com/',
  instagram: 'https://www.instagram.com/',
  tiktok: 'https://www.tiktok.com/@',
  youtube: 'https://www.youtube.com/@',
  linkedin: 'https://www.linkedin.com/company/',
};

/** Lien d'un reseau : URL complete telle quelle, ou identifiant (@isstascameroun) converti en URL. */
export function socialUrl(network: string, value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const v = value.trim();
  if (isUrl(v)) return v;
  const handle = String(v).replace(/^@/, '').replace(/\s+/g, '-');
  const base = SOCIAL_BASE[network];
  return base ? base + handle : null;
}

/** Lien WhatsApp (wa.me) depuis un numero ; message prerempli facultatif. */
export function whatsappUrl(phone: unknown, text?: string): string | null {
  if (typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}` : null;
}

/** Identifiant YouTube depuis une URL (youtu.be/ID, watch?v=ID, embed/ID). */
export function youtubeId(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const m = /(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/.exec(url);
  return m?.[1] ?? null;
}