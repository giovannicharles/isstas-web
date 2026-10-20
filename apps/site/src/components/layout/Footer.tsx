import { Container, PulseLine, WaveTop } from '@isstas/ui';
import { LLink, useLocale, useT } from '@/lib/i18n';
import { useSettings } from '@/lib/settings';
import { useApi } from '@/lib/useApi';
import { telHref } from '@/lib/format';
import type { MenuItem, Partner } from '@/lib/types';
import { NewsletterForm } from '../NewsletterForm';
import { SocialLinks } from '../SocialLinks';
import { Brand } from './Brand';

export function Footer() {
  const { get } = useSettings();
  const { locale } = useLocale();
  const t = useT();
  const { data: menu } = useApi<{ items: MenuItem[] }>('/menus/footer', locale);
  const { data: header } = useApi<{ items: MenuItem[] }>('/menus/header', locale);
  const { data: partners } = useApi<Partner[]>('/partners', locale);

  const phones = get<string[]>('contact.phones', []);
  const email = get<string | null>('contact.email', null);
  const address = get<string | null>('contact.address', null);
  const box = get<string | null>('contact.postal_box', null);
  const website = get<string | null>('contact.website', null);
  const access = get<string[]>('contact.access_plan', []);
  const supervision = get<string[]>('institution.supervision', []);
  const authorization = get<string | null>('institution.authorization', null);
  const about = get<string | null>('institution.about', null);
  const motto = get<string | null>('institution.motto', null);
  const links = (menu?.items?.length ? menu.items : header?.items ?? []).filter((i) => i.url);

  return (
    <footer className="on-dark relative bg-brown-900 text-white">
      <WaveTop className="text-brown-900" />
      
      <Container className="grid gap-12 pb-14 pt-20 lg:grid-cols-[1.3fr_1fr_0.8fr] lg:pt-24">
        <div>
          <Brand tone="dark" />
          {motto ? <p className="mt-5 font-display text-2xl font-black leading-tight">{motto}</p> : null}
          {about ? <p className="mt-4 max-w-[52ch] text-[0.98rem] leading-relaxed text-white/80">{about}</p> : null}
          {authorization ? <p className="mt-4 max-w-[48ch] text-sm text-white/60">{authorization}</p> : null}
          <SocialLinks className="mt-7" />
        </div>

        <div>
          <h2 className="font-display text-lg font-extrabold">{t('footer.contact')}</h2>
          <ul className="mt-4 grid gap-2 text-white/90">
            {phones.map((p) => (
              <li key={p}><a href={telHref(p)} className="font-semibold no-underline hover:text-white hover:underline">{p}</a></li>
            ))}
            {email ? <li><a href={`mailto:${email}`} className="no-underline hover:text-white hover:underline">{email}</a></li> : null}
            {website ? <li><a href={`https://${website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer noopener" className="no-underline hover:text-white hover:underline">{website}</a></li> : null}
            {box ? <li>{box}</li> : null}
            {address ? <li>{address}</li> : null}
          </ul>
          {access.length ? (
            <>
              <h3 className="mt-8 font-display text-base font-extrabold">{t('footer.access')}</h3>
              <ol className="mt-3 grid gap-1.5 border-l-2 border-green-400 pl-4 text-sm text-white/85">
                {access.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </>
          ) : null}
        </div>

        <div>
          {links.length ? (
            <>
              <h2 className="font-display text-lg font-extrabold">{t('footer.links')}</h2>
              <ul className="mt-4 grid gap-2">
                {links.map((l) => (
                  <li key={l.id}><LLink to={l.url as string} className="no-underline hover:text-white hover:underline">{l.label}</LLink></li>
                ))}
              </ul>
            </>
          ) : null}
          <div className="mt-8"><NewsletterForm /></div>
        </div>
      </Container>

      {(supervision.length || partners?.length) ? (
        <div className="border-t border-white/15">
          <Container className="grid gap-6 py-8 text-sm text-white/75 md:grid-cols-[auto_1fr] md:items-start">
            <h2 className="font-display text-sm font-extrabold text-white">{t('footer.supervision')}</h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {(partners?.length ? partners.map((p) => p.name) : supervision).map((n) => <li key={n}>{n}</li>)}
            </ul>
          </Container>
        </div>
      ) : null}

      <div className="border-t border-white/15">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-5 text-sm text-white/70">
          <p>{t('footer.rights', { year: new Date().getFullYear(), name: get<string>('institution.name', get<string>('institution.short_name', '')) })}{get<string | null>('institution.credit', null) ? <span className="ml-2 font-semibold text-white">· {get<string>('institution.credit')}</span> : null}</p>
          <ul className="flex gap-5">
            <li><LLink to="/a-propos/mentions-legales" className="no-underline hover:text-white hover:underline">{t('footer.legal')}</LLink></li>
            <li><LLink to="/a-propos/confidentialite" className="no-underline hover:text-white hover:underline">{t('footer.privacy')}</LLink></li>
          </ul>
        </Container>
      </div>
    </footer>
  );
}