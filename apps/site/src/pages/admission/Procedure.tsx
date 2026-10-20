import { Container } from '@isstas/ui';
import { useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import { usePageMeta } from '@/lib/usePageMeta';
import { PageBanner } from '@/components/PageBanner';
import { EmptyState } from '@/components/States';

type Step = { title: string; description: string | null };
type CalendarEvent = { title: string; description: string | null; type: string; starts_on: string; ends_on: string | null };

export default function Procedure() {
  const { locale } = useLocale();
  const t = useT();
  const { data: steps } = useApi<Step[]>('/admission/steps', locale);
  const { data: calendar } = useApi<CalendarEvent[]>('/calendar', locale);
  usePageMeta({ title: t('admission.procedure'), alternates: { fr: '/admission/procedure', en: '/admission/procedure' } });
  const fmt = (d: string) => new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));

  return (
    <>
      <PageBanner title={t('admission.procedure')} lead={t('admission.admission_note')} crumbs={[{ label: t('admission.title'), to: '/admission' }, { label: t('admission.procedure') }]} />
      <Container size="narrow" className="py-16 sm:py-24">
        {steps?.length ? (
          <ol className="grid gap-10">
            {steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[3.5rem_1fr] gap-5">
                <span className="grid size-14 place-items-center rounded-full bg-green-600 font-display text-2xl font-black text-white">{i + 1}</span>
                <div>
                  <h2 className="font-display text-2xl font-extrabold">{s.title}</h2>
                  {s.description ? <p className="mt-2 text-lg text-ink-muted">{s.description}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        ) : <EmptyState />}

        {calendar?.length ? (
          <section className="mt-20">
            <h2 className="font-display text-3xl font-black">{t('admission.calendar')}</h2>
            <ul className="mt-6 border-t-2 border-green-700">
              {calendar.map((e) => (
                <li key={`${e.title}-${e.starts_on}`} className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line py-4">
                  <span className="font-display text-lg font-extrabold">{e.title}</span>
                  <time dateTime={e.starts_on} className="font-semibold text-green-700">{fmt(e.starts_on)}{e.ends_on ? ` – ${fmt(e.ends_on)}` : ''}</time>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </>
  );
}