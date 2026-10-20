import { useSettings } from '@/lib/settings';
import { socialUrl, whatsappUrl } from '@/lib/format';
import { SOCIALS, SocialIcon, type SocialName } from './icons';

const LABELS: Record<SocialName, string> = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn', youtube: 'YouTube', tiktok: 'TikTok', whatsapp: 'WhatsApp' };

/**
 * Reseaux sociaux de l'institut : liens et activation geres depuis l'admin (Reglages > Reseaux sociaux ;
 * numero WhatsApp dans Actions flottantes). Seuls les reseaux renseignes s'affichent.
 */
export function useSocialLinks(): { name: SocialName; label: string; href: string }[] {
  const { get, data } = useSettings();
  const links = SOCIALS.map((s) => ({ name: s, label: LABELS[s], href: socialUrl(s, get(`social.${s}`)) })).filter((l): l is { name: SocialName; label: string; href: string } => !!l.href);
  const wa = whatsappUrl(data?.floating_actions?.whatsapp?.settings?.phone ?? get('social.whatsapp'));
  if (wa) links.push({ name: 'whatsapp', label: LABELS.whatsapp ?? 'WhatsApp', href: wa });
  return links;
}

export function SocialLinks({ className = '', size = 'md', tone = 'dark' }: { className?: string; size?: 'sm' | 'md'; tone?: 'dark' | 'light' }) {
  const links = useSocialLinks();
  if (!links.length) return null;
  const box = size === 'sm' ? 'size-8' : 'size-11';
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map((l) => (
        <li key={l.name}>
          <a
            href={l.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={l.label}
            title={l.label}
            className={`grid ${box} place-items-center rounded-full transition-all duration-300 hover:-translate-y-0.5 ${
              tone === 'dark' ? 'bg-white/10 text-white ring-1 ring-white/25 hover:bg-white hover:text-green-900' : 'bg-green-100 text-green-700 hover:bg-green-500 hover:text-white'
            }`}
          >
            <SocialIcon name={l.name} className={size === 'sm' ? 'size-4' : 'size-5'} />
          </a>
        </li>
      ))}
    </ul>
  );
}