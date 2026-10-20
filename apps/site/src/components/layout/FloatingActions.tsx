import { useEffect, useState } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { useLocale, useT } from '@/lib/i18n';
import { useSettings } from '@/lib/settings';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { SocialIcon } from '../icons';
import { ChatPanel } from '../chat/ChatPanel';

const RING = 2 * Math.PI * 20;

/**
 * Pile verticale unique en bas a droite : retour en haut (anneau de progression), WhatsApp, chatbot.
 * Seuil, numero, message et activation viennent de l'admin (actions flottantes).
 */
export function FloatingActions() {
  const { data } = useSettings();
  const { locale } = useLocale();
  const t = useT();
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [chat, setChat] = useState(false);
  const [seenInvite, setSeenInvite] = useState(() => {
    try { return sessionStorage.getItem('isstas.chat.invite') === '1'; } catch { return true; }
  });

  const actions = data?.floating_actions ?? {};
  const top = actions.back_to_top;
  const wa = actions.whatsapp;
  const bot = actions.chatbot;
  const threshold = Number(top?.settings?.threshold_px ?? 400);

  useEffect(() => {
    const on = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(el.scrollTop > threshold && max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [threshold]);

  const phone = wa?.settings?.phone as string | null | undefined;
  const waText = (wa?.texts?.message as string | undefined) ?? '';
  const waUrl = phone ? `https://wa.me/${phone.replace(/[^\d]/g, '')}${waText ? `?text=${encodeURIComponent(waText)}` : ''}` : null;
  const showTop = !!top && progress > 0;

  const openChat = () => {
    setChat(true);
    setSeenInvite(true);
    try { sessionStorage.setItem('isstas.chat.invite', '1'); } catch { /* ignore */ }
  };

  return (
    <>
      {chat && bot ? (
        <ChatPanel
          name={(bot.settings?.name as string) ?? ''}
          welcome={(bot.texts?.welcome as string) ?? ''}
          suggestions={(bot.texts?.suggestions as string[]) ?? []}
          whatsappUrl={waUrl}
          onClose={() => setChat(false)}
        />
      ) : null}

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 pb-[env(safe-area-inset-bottom)] sm:bottom-6 sm:right-6">
        {top ? (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
            aria-label={(top.texts?.label as string) ?? t('common.back_to_top')}
            tabIndex={showTop ? 0 : -1}
            className={`pointer-events-auto relative grid size-12 place-items-center rounded-full bg-white text-green-900 shadow-lift transition-[opacity,transform] duration-300 ${showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
          >
            <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
              <circle cx="24" cy="24" r="20" fill="none" stroke="var(--color-green-100)" strokeWidth="3" />
              <circle cx="24" cy="24" r="20" fill="none" stroke="var(--color-green-600)" strokeWidth="3" strokeLinecap="round" strokeDasharray={RING} strokeDashoffset={RING * (1 - progress)} />
            </svg>
            <ArrowUp className="relative size-5" aria-hidden="true" />
          </button>
        ) : null}

        {waUrl ? (
          <a href={waUrl} target="_blank" rel="noreferrer noopener" aria-label="WhatsApp" className="pointer-events-auto grid size-14 place-items-center rounded-full bg-[#1fa855] text-white shadow-lift transition-transform hover:scale-105">
            <SocialIcon name="whatsapp" className="size-7" />
          </a>
        ) : null}

        {bot ? (
          <div className="pointer-events-auto flex items-center gap-3">
            {!seenInvite && !chat ? (
              <p className="max-w-[12rem] animate-fade-in rounded-xl bg-white px-4 py-2.5 text-sm font-semibold shadow-lift">{t('chat.invite')}</p>
            ) : null}
            <button type="button" onClick={chat ? () => setChat(false) : openChat} aria-label={(bot.settings?.name as string) ?? t('chat.open')} aria-expanded={chat} className="grid size-14 place-items-center rounded-full bg-green-600 text-white shadow-lift transition-transform hover:scale-105 hover:bg-green-700">
              <MessageCircle className="size-7" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
      <span hidden lang={locale} />
    </>
  );
}