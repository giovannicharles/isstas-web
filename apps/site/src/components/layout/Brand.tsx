import { useState } from 'react';
import { LLink } from '@/lib/i18n';
import { useSettings } from '@/lib/settings';

/**
 * Logo : fichier de l'admin (brand_assets) ; a defaut public/brand/logo-light.svg|png, logo.svg|png|jpg ;
 * a defaut encore, le sigle texte. Le logo officiel est un JPEG a fond blanc : il est pose sur une pastille blanche.
 */
export function Brand({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const { data, get } = useSettings();
  const [failed, setFailed] = useState<string[]>([]);
  const name = get<string>('institution.short_name', '');
  const full = get<string>('institution.name', '');

  const candidates = [
    data?.brand?.[tone === 'dark' ? 'logo_light' : 'logo_dark'],
    data?.brand?.logo_light,
    '/brand/logo-light.svg',
    '/brand/logo-light.png',
    '/brand/logo.svg',
    '/brand/logo.png',
    '/brand/logo.jpg',
  ].filter((s): s is string => !!s && !failed.includes(s));
  const logo = candidates[0];
  const opaque = !!logo && /\.(jpe?g)(\?|$)/i.test(logo);

  return (
    <LLink to="/" className="flex items-center gap-3 no-underline" aria-label={full || name || undefined}>
      {logo ? (
        <img
          src={logo}
          alt=""
          onError={() => setFailed((f) => [...f, logo])}
          className={`h-10 w-auto sm:h-12 ${opaque && tone === 'dark' ? 'rounded-lg bg-white p-1' : ''}`}
        />
      ) : (
        <span className={`font-display text-[1.7rem] font-black leading-none tracking-[-0.04em] ${tone === 'dark' ? 'text-white' : 'text-green-700'}`}>{name}</span>
      )}
    </LLink>
  );
}