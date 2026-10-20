import { useState, type FormEvent } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Badge, Button, Container, PulseLine } from '@isstas/ui';
import { api } from '@/lib/api';
import { LLink, useLocale, useT } from '@/lib/i18n';
import { money } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import type { Fee, Level } from '@/lib/types';
import type { Shell } from '@/components/SectionShell';
import { SectionSkeleton } from '@/components/Skeletons';

type Option = { code: string; label: string };
type Result = {
  program: { slug: string; name: string; summary: string | null };
  level: { slug: string; name: string };
  duration_months: number | null;
  fees: Fee | null;
};

/**
 * « Trouver ma filiere » : bandeau flottant qui chevauche le bas du hero (carte blanche, forte ombre),
 * 3 selecteurs + bouton ; les resultats se deplient dans la carte, sans quitter l'accueil.
 */
export function ProgramFinder({ data, shell }: { data: { title?: string }; shell: Shell }) {
  const { locale } = useLocale();
  const t = useT();
  const { data: options, loading: optionsLoading } = useApi<Option[]>('/programs/finder/options', locale);
  const { data: levels } = useApi<Level[]>('/levels', locale);
  const [diploma, setDiploma] = useState('');
  const [max, setMax] = useState('');
  const [level, setLevel] = useState('');
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);

  if (optionsLoading && !options) return <SectionSkeleton shell={shell} variant="finder" />;
  if (!options?.length) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!diploma) return;
    setLoading(true);
    try {
      setResults(await api<Result[]>('/programs/finder', { locale, method: 'POST', body: { diploma, max_duration_months: max ? Number(max) : undefined } }));
    } finally {
      setLoading(false);
    }
  }
  const shown = (results ?? []).filter((r) => !level || r.level.slug === level);

  return (
    // la moitie haute reste transparente : la carte chevauche le hero ; le bas est blanc
    <section className="relative z-20 -mt-14 pb-14 sm:-mt-20 sm:pb-20" style={{ background: 'linear-gradient(to bottom, transparent 56px, #fff 56px)' }}>
      <Container>
        <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-lift ring-1 ring-line sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h2 className="h-sub">{data.title ?? t('finder.title')}</h2>
            <p className="text-ink-muted">{t('finder.lead')}</p>
          </div>

          <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:items-end">
            <label className="grid gap-1.5 font-display text-sm font-bold">
              {t('finder.diploma')}
              <select className="field" value={diploma} onChange={(e) => setDiploma(e.target.value)} required>
                <option value="">{t('finder.choose')}</option>
                {options.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 font-display text-sm font-bold">
              {t('finder.level')}
              <select className="field" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">{t('finder.any_level')}</option>
                {(levels ?? []).map((l) => <option key={l.id} value={l.slug}>{l.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 font-display text-sm font-bold">
              {t('finder.duration')}
              <select className="field" value={max} onChange={(e) => setMax(e.target.value)}>
                <option value="">{t('finder.any_duration')}</option>
                <option value="12">{t('finder.up_to_1y')}</option>
                <option value="24">{t('finder.up_to_2y')}</option>
                <option value="36">{t('finder.up_to_3y')}</option>
              </select>
            </label>
            <Button type="submit" size="lg" disabled={!diploma || loading} className="md:col-span-2 lg:col-span-1">
              <Search className="size-5" aria-hidden="true" /> {t('finder.submit')}
            </Button>
          </form>

          <div aria-live="polite">
            {results === null ? null : shown.length === 0 ? (
              <div className="mt-8 grid place-items-center gap-3 rounded-2xl bg-mint-100 p-8 text-center">
                <PulseLine color="var(--color-green-300)" strokeWidth={4} className="h-12 w-44" />
                <p>{t('finder.none')}</p>
              </div>
            ) : (
              <ul className="mt-8 grid gap-3 md:grid-cols-2">
                {shown.map((r) => (
                  <li key={`${r.level.slug}-${r.program.slug}`}>
                    <LLink to={`/formations/${r.level.slug}/${r.program.slug}`} className="card-lift group flex h-full items-center justify-between gap-4 rounded-2xl bg-mint-100 p-5 no-underline">
                      <span className="min-w-0">
                        <span className="block font-display text-lg font-extrabold leading-snug">{r.program.name}</span>
                        <span className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                          <Badge tone="green">{r.level.name}</Badge>
                          {r.duration_months ? <span>{r.duration_months} {t('unit.months')}</span> : null}
                          {r.fees ? <span>· {money(r.fees.registration_fee + r.fees.tuition_fee, locale)}</span> : null}
                        </span>
                      </span>
                      <ArrowRight className="size-5 shrink-0 text-green-500 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </LLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}