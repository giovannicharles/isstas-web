import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge, Container } from '@isstas/ui';
import { LLink, useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import { usePageMeta } from '@/lib/usePageMeta';
import type { Level, Program } from '@/lib/types';
import { PageBanner } from '@/components/PageBanner';
import { ProgramArt } from '@/components/ProgramArt';
import { EmptyState, PageSkeleton } from '@/components/States';

/** /formations : tous les niveaux et toutes les filieres, avec filtre par niveau et recherche. */
export default function Programs() {
  const { locale } = useLocale();
  const t = useT();
  const [level, setLevel] = useState('');
  const [search, setSearch] = useState('');
  const { data: levels } = useApi<Level[]>('/levels', locale);
  const { data: programs, loading } = useApi<Program[]>('/programs', locale, { level, search });
  usePageMeta({ title: t('programs.title'), alternates: { fr: '/formations', en: '/formations' } });

  return (
    <>
      <PageBanner title={t('programs.title')} lead={t('programs.lead')} crumbs={[{ label: t('programs.title') }]} />
      <Container className="py-14 sm:py-20">
        <div className="flex flex-wrap items-end gap-6">
          <div role="group" aria-label={t('programs.filter_level')} className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setLevel('')} aria-pressed={level === ''} className={`rounded-full border-2 px-4 py-2 font-display text-sm font-bold ${level === '' ? 'border-green-600 bg-green-600 text-white' : 'border-line hover:border-green-600'}`}>{t('programs.all')}</button>
            {(levels ?? []).map((l) => (
              <button key={l.id} type="button" onClick={() => setLevel(l.slug)} aria-pressed={level === l.slug} className={`rounded-full border-2 px-4 py-2 font-display text-sm font-bold ${level === l.slug ? 'border-green-600 bg-green-600 text-white' : 'border-line hover:border-green-600'}`}>{l.name}</button>
            ))}
          </div>
          <div className="ml-auto w-full sm:w-72">
            <label htmlFor="program-search" className="sr-only">{t('programs.search')}</label>
            <input id="program-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('programs.search')} className="field" />
          </div>
        </div>

        {loading && !programs ? <PageSkeleton /> : !programs?.length ? <div className="mt-10"><EmptyState message={t('programs.none')} /></div> : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => {
              const to = `/formations/${(level && p.levels?.find((l) => l.slug === level)?.slug) || p.levels?.[0]?.slug || ''}/${p.slug}`;
              return (
                <li key={p.id}>
                  <LLink to={to} className="group relative flex h-full min-h-[18rem] flex-col justify-end overflow-hidden rounded-[1.5rem] bg-green-600 p-6 text-white no-underline shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                    {p.cover && p.has_own_cover !== false ? <img src={p.cover} alt={p.cover_alt ?? ''} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <ProgramArt name={p.name} seed={p.id} className="absolute inset-0" />}
                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-green-800/40 to-transparent" />
                    <span className="relative">
                      <span className="flex flex-wrap gap-1.5">
                        {(p.levels ?? []).map((l) => (
                          <Badge key={l.id} tone="outline" className="!bg-white/15 !text-white ring-white/40">{l.name}{l.duration_months ? ` · ${l.duration_months} ${t('unit.months')}` : ''}</Badge>
                        ))}
                      </span>
                      <span className="mt-3 block font-display text-2xl font-black leading-tight tracking-[-0.02em]">{p.name}</span>
                      {/* au survol : le resume de la filiere se deploie */}
                      <span className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
                        <span className="overflow-hidden">
                          <span className="mt-2 flex items-center gap-2 font-display text-sm font-bold">
                            {p.summary ? <span className="line-clamp-2 font-normal text-white/90">{p.summary}</span> : t('cta.view_program')}
                            <ArrowRight className="ml-auto size-5 shrink-0" aria-hidden="true" />
                          </span>
                        </span>
                      </span>
                    </span>
                  </LLink>
                </li>
              );
            })}
          </ul>        )}
      </Container>
    </>
  );
}