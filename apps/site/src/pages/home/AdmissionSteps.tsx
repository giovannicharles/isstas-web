import { ArrowRight } from 'lucide-react';
import { Button, Container, SectionHeading } from '@isstas/ui';
import { LLink, useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import { SectionShell, type Shell } from '@/components/SectionShell';

type Step = { title: string; description: string | null };

/** Admission en 3 etapes (vraie sequence, donc numerotee) + acces simulateur, checklist, telechargements. */
export function AdmissionSteps({ data, shell }: { data: { title?: string }; shell: Shell }) {
  const { locale, path } = useLocale();
  const t = useT();
  const { data: steps } = useApi<Step[]>('/admission/steps', locale);

  return (
    <SectionShell shell={shell}>
      <Container>
        <SectionHeading title={data.title ?? t('admission.title')} lead={t('admission.admission_note')} />
        {steps?.length ? (
          <ol className="mt-14 grid gap-5 md:grid-cols-3 md:gap-6">
            {steps.map((s, i) => (
              <li key={s.title} className="relative overflow-hidden rounded-[var(--radius-card)] bg-mint-100 p-7 sm:p-9">
                <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-8 font-display text-[9rem] font-black leading-none text-green-500/15">{i + 1}</span>
                <span className="relative grid size-12 place-items-center rounded-full bg-green-500 font-display text-xl font-black text-white">{i + 1}</span>
                <h3 className="h-sub relative mt-6">{s.title}</h3>
                {s.description ? <p className="relative mt-3 text-ink-muted">{s.description}</p> : null}
              </li>
            ))}
          </ol>
        ) : null}
        <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-5">
          <Button to={path('/admission/pre-inscription')} size="lg">{t('cta.apply')} <ArrowRight className="size-5" aria-hidden="true" /></Button>
          <LLink to="/admission/frais" className="link-arrow">{t('admission.simulator')}</LLink>
          <LLink to="/admission/dossier" className="link-arrow">{t('admission.checklist')}</LLink>
          <LLink to="/telechargements" className="link-arrow">{t('admission.downloads')}</LLink>
        </div>
      </Container>
    </SectionShell>
  );
}