import { Link } from 'react-router-dom';
import { LOCALES } from '@isstas/i18n';
import { useLocale, useT } from '@/lib/i18n';

/** FR | EN : conserve la page courante grace aux slugs alternatifs fournis par l'API. */
export function LocaleSwitch({ className }: { className?: string }) {
  const { locale, switchTo } = useLocale();
  const t = useT();
  const { pathname } = typeof window !== 'undefined' ? window.location : { pathname: '/' };

  return (
    <nav aria-label={t('nav.language')} className={className}>
      <ul className="flex items-center gap-1 font-display text-[0.85rem] font-bold">
        {LOCALES.map((l, i) => (
          <li key={l} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden="true" className="opacity-40">|</span>}
            <Link
              to={switchTo(l) ?? pathname.replace(/^\/(fr|en)/, `/${l}`)}
              hrefLang={l}
              lang={l}
              aria-current={l === locale ? 'true' : undefined}
              className={`rounded px-1.5 py-1 uppercase no-underline ${l === locale ? 'bg-white text-green-900' : 'hover:text-green-400'}`}
            >
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}