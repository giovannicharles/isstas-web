import { ArrowRight, MapPin, Phone } from 'lucide-react';
import { Button, Container } from '@isstas/ui';
import { useLocale, useT } from '@/lib/i18n';
import { useSettings } from '@/lib/settings';
import { telHref, whatsappUrl } from '@/lib/format';
import { SocialIcon } from '@/components/icons';
import { SectionShell, type Shell } from '@/components/SectionShell';

/** Appel final sur fond brun du logo : grand titre, bouton, WhatsApp et coordonnees directes. */
export function FinalCta({ data, shell }: { data: { title?: string }; shell: Shell }) {
  const { path } = useLocale();
  const t = useT();
  const { data: settings, get } = useSettings();
  const phones = get<string[]>('contact.phones', []);
  const address = get<string | null>('contact.address', null);
  const box = get<string | null>('contact.postal_box', null);
  const wa = whatsappUrl(settings?.floating_actions?.whatsapp?.settings?.phone);
  if (!data.title) return null;

  return (
    <SectionShell shell={shell}>
      <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
        <div>
          <h2 className="h-section max-w-[18ch] text-white">{data.title}</h2>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button to={path('/admission/pre-inscription')} size="lg" tone="dark">{t('cta.apply')} <ArrowRight className="size-5" aria-hidden="true" /></Button>
            {wa ? (
              <Button href={wa} target="_blank" rel="noreferrer noopener" size="lg" variant="outline" tone="dark">
                <SocialIcon name="whatsapp" className="size-5" /> WhatsApp
              </Button>
            ) : (
              <Button to={path('/contact')} size="lg" variant="outline" tone="dark">{t('cta.contact_us')}</Button>
            )}
          </div>
        </div>
        {phones.length || address ? (
          <ul className="grid gap-5 rounded-[var(--radius-card)] bg-white/10 p-7 ring-1 ring-white/20 sm:p-9">
            {phones.slice(0, 3).map((p) => (
              <li key={p}>
                <a href={telHref(p)} className="flex items-center gap-4 font-display text-lg font-extrabold text-white no-underline hover:underline sm:text-xl">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-brown-800"><Phone className="size-5" aria-hidden="true" /></span>
                  {p}
                </a>
              </li>
            ))}
            {address ? (
              <li className="flex items-start gap-4 text-white/90">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-brown-800"><MapPin className="size-5" aria-hidden="true" /></span>
                <span className="pt-2">{[address, box].filter(Boolean).join(' · ')}</span>
              </li>
            ) : null}
          </ul>
        ) : null}
      </Container>
    </SectionShell>
  );
}