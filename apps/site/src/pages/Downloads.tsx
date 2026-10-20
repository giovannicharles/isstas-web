import { useState } from 'react';
import { Download } from 'lucide-react';
import { Badge, Container } from '@isstas/ui';
import { useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import { usePageMeta } from '@/lib/usePageMeta';
import type { DownloadItem } from '@/lib/types';
import { PageBanner } from '@/components/PageBanner';
import { EmptyState } from '@/components/States';

const CATEGORIES = ['', 'brochure', 'form', 'fees', 'guide'];

export default function Downloads() {
  const { locale } = useLocale();
  const t = useT();
  const [category, setCategory] = useState('');
  const [lang, setLang] = useState('');
  const { data: items } = useApi<DownloadItem[]>('/downloads', locale, { category, lang });
  const base = import.meta.env.VITE_API_URL ?? '/api/v1';
  usePageMeta({ title: t('downloads.title'), alternates: { fr: '/telechargements', en: '/telechargements' } });

  return (
    <>
      <PageBanner title={t('downloads.title')} lead={t('downloads.lead')} crumbs={[{ label: t('downloads.title') }]} />
      <Container className="py-14 sm:py-20">
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <div role="group" aria-label={t('downloads.category')} className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)} className={`rounded-full border-2 px-4 py-2 font-display text-sm font-bold ${category === c ? 'border-green-600 bg-green-600 text-white' : 'border-line hover:border-green-600'}`}>
                {t(`downloads.cat_${c || 'all'}`)}
              </button>
            ))}
          </div>
          <div role="group" aria-label={t('downloads.language')} className="flex gap-2">
            {['', 'fr', 'en'].map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} className={`rounded-full border-2 px-4 py-2 font-display text-sm font-bold uppercase ${lang === l ? 'border-green-700 bg-green-500 text-white' : 'border-line hover:border-green-700'}`}>
                {l || t('downloads.cat_all')}
              </button>
            ))}
          </div>
        </div>

        {!items?.length ? <div className="mt-10"><EmptyState /></div> : (
          <ul className="mt-10 border-t-2 border-green-700">
            {items.map((d) => (
              <li key={d.id} className="grid items-center gap-4 border-b border-line py-5 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-display text-xl font-extrabold">{d.title}</p>
                  {d.description ? <p className="text-ink-muted">{d.description}</p> : null}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {d.languages.map((l) => (
                    <a key={l} href={`${base}/downloads/${d.id}/file?lang=${l}`} className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border-2 border-green-600 px-4 py-2.5 font-display text-sm font-bold uppercase text-green-800 no-underline hover:bg-green-600 hover:text-white">
                      <Download className="size-4" aria-hidden="true" /> {l}
                    </a>
                  ))}
                  <Badge tone="mint">{t(`downloads.cat_${d.category}`)}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}