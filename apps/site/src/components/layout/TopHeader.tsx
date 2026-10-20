import { ArrowUpRight, ChevronDown, Download, Mail, Phone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Container } from '@isstas/ui';
import { useLocale, useT } from '@/lib/i18n';
import { useSettings } from '@/lib/settings';
import { telHref } from '@/lib/format';
import { SocialLinks } from '../SocialLinks';
import { LocaleSwitch } from './LocaleSwitch';

type Announcement = { enabled: boolean; text: string | null; link: string | null; starts_at: string | null; ends_at: string | null };

function isActive(a?: Announcement): a is Announcement {
  if (!a?.enabled || !a.text) return false;
  const now = Date.now();
  if (a.starts_at && Date.parse(a.starts_at) > now) return false;
  if (a.ends_at && Date.parse(a.ends_at) < now) return false;
  return true;
}

/** Numero principal + liste deroulante des autres numeros (clavier : Echap ferme, clic exterieur ferme). */
function Phones({ phones }: { phones: string[] }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);
  if (!phones.length) return null;
  const [first, ...others] = phones as [string, ...string[]];

  return (
    <div ref={box} className="relative flex items-center" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      <a href={telHref(first)} className="inline-flex min-h-10 items-center gap-2 font-semibold no-underline hover:text-white hover:underline">
        <Phone className="size-4 shrink-0" aria-hidden="true" />
        <span>{first}</span>
      </a>
      {others.length ? (
        <>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t('top.more_phones')} className="ml-1 grid size-8 place-items-center rounded-full hover:bg-white/15">
            <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {open ? (
            <ul className="absolute left-0 top-full z-50 mt-1 min-w-[12rem] rounded-xl bg-white p-2 text-ink shadow-lift">
              {others.map((p) => (
                <li key={p}><a href={telHref(p)} className="block rounded-lg px-3 py-2.5 font-semibold no-underline hover:bg-mint-100">{p}</a></li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

/**
 * Top header : contacts a gauche (telephones deroulants, e-mail), annonce au centre (texte, lien, dates et
 * activation geres dans l'admin), langue, reseaux et brochure a droite. Sur mobile : annonce + appel + langue.
 */
export function TopHeader() {
  const { get } = useSettings();
  const { locale, path } = useLocale();
  const t = useT();

  const phones = get<string[]>('contact.phones', []);
  const email = get<string | null>('contact.email', null);
  const announcement = get<Announcement | undefined>('top_header.announcement');
  const brochureId = get<number | null>('top_header.brochure_download_id', null);
  const live = isActive(announcement) ? announcement : null;
  const base = import.meta.env.VITE_API_URL ?? '/api/v1';
  const link = live?.link ? (live.link.startsWith('/') ? path(live.link) : live.link) : null;

  return (
    <div className="on-dark relative z-50 bg-brown-800 text-[0.85rem] text-white/90">
      <Container className="flex min-h-10 items-center justify-between gap-3 sm:gap-5">
        {/* contacts (>= lg) */}
        <div className="hidden items-center gap-5 lg:flex">
          <Phones phones={phones} />
          {email ? (
            <a href={`mailto:${email}`} className="inline-flex min-h-10 items-center gap-2 no-underline hover:text-white hover:underline">
              <Mail className="size-4" aria-hidden="true" />{email}
            </a>
          ) : null}
        </div>

        {/* annonce : en pastille, prend la place restante et se tronque proprement */}
        <div className="flex min-w-0 flex-1 justify-start lg:justify-center">
          {live ? (
            (link ? (
              <a href={link} className="group inline-flex min-w-0 max-w-full items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 font-semibold text-white no-underline ring-1 ring-white/20 transition-colors hover:bg-white/20">
                <span className="relative flex size-2 shrink-0"><span className="absolute inline-flex size-full animate-ping rounded-full bg-white/70" /><span className="relative inline-flex size-2 rounded-full bg-white" /></span>
                <span className="truncate">{live.text}</span>
                <ArrowUpRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </a>
            ) : (
              <p className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 font-semibold text-white ring-1 ring-white/20"><span className="truncate">{live.text}</span></p>
            ))
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {phones[0] ? (
            <a href={telHref(phones[0])} aria-label={`${t('top.call')} ${phones[0]}`} className="grid size-9 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/20 lg:hidden">
              <Phone className="size-4" aria-hidden="true" />
            </a>
          ) : null}
          {brochureId ? (
            <a href={`${base}/downloads/${brochureId}/file?lang=${locale}`} className="hidden min-h-9 items-center gap-1.5 rounded-full px-3 font-semibold no-underline ring-1 ring-white/30 hover:bg-white hover:text-green-700 md:inline-flex">
              <Download className="size-4" aria-hidden="true" />
              <span className="hidden xl:inline">{t('cta.download_brochure')}</span>
              <span className="xl:hidden">{t('cta.download')}</span>
            </a>
          ) : null}
          <SocialLinks size="sm" className="hidden md:flex" />
          <LocaleSwitch />
        </div>
      </Container>
    </div>
  );
}