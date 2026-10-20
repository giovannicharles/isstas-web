import { ArrowRight } from 'lucide-react';
import { Container } from '@isstas/ui';
import { LLink, useT } from '@/lib/i18n';
import { usePageMeta } from '@/lib/usePageMeta';
import { PageBanner } from '@/components/PageBanner';

const LINKS = [
  { to: '/admission/procedure', title: 'admission.procedure', text: 'admission.procedure_text' },
  { to: '/admission/dossier', title: 'admission.checklist', text: 'admission.checklist_text' },
  { to: '/admission/frais', title: 'admission.fees', text: 'admission.fees_text' },
  { to: '/admission/pre-inscription', title: 'admission.preregister', text: 'admission.preregister_text' },
  { to: '/admission/suivi', title: 'admission.track', text: 'admission.track_text' },
];

export default function AdmissionHub() {
  const t = useT();
  usePageMeta({ title: t('admission.title'), alternates: { fr: '/admission', en: '/admission' } });
  return (
    <>
      <PageBanner title={t('admission.title')} lead={t('admission.admission_note')} crumbs={[{ label: t('admission.title') }]} />
      <Container className="py-16 sm:py-24">
        <ul className="border-t-2 border-green-700">
          {LINKS.map((l) => (
            <li key={l.to} className="border-b border-line">
              <LLink to={l.to} className="group grid items-center gap-x-10 gap-y-1 py-7 no-underline hover:bg-mint-100 md:grid-cols-[1fr_1.2fr_auto] md:px-4">
                <span className="font-display text-3xl font-black tracking-[-0.02em]">{t(l.title)}</span>
                <span className="text-ink-muted">{t(l.text)}</span>
                <ArrowRight className="size-6 text-green-600 transition-transform group-hover:translate-x-2" aria-hidden="true" />
              </LLink>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}