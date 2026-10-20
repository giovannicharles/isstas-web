import { useEffect } from 'react';
import { useLocale } from './i18n';
import type { Locale } from '@isstas/i18n';

type Meta = {
  title?: string | null;
  description?: string | null;
  alternates?: Partial<Record<Locale, string>>;
};

/**
 * Titre, description et alternates (selecteur de langue + hreflang) de la page courante.
 * Les valeurs viennent de l'API (SEO par page) ; rien n'est ecrit en dur.
 */
export function usePageMeta({ title, description, alternates }: Meta) {
  const { setAlternates, locale } = useLocale();

  useEffect(() => {
    if (title) document.title = title;
    document.documentElement.lang = locale;
    const el = document.querySelector('meta[name="description"]') ?? Object.assign(document.createElement('meta'), { name: 'description' });
    if (description) {
      el.setAttribute('content', description);
      document.head.appendChild(el);
    }
  }, [title, description, locale]);

  const key = JSON.stringify(alternates ?? {});
  useEffect(() => {
    setAlternates(alternates ?? {});
    return () => setAlternates({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}