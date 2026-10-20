import { useEffect, useRef, useState, type ComponentType } from 'react';
import { useLocale } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import { usePageMeta } from '@/lib/usePageMeta';
import type { HomeSection } from '@/lib/types';
import { isBackground, type BackgroundToken, type SectionStyle, type Shell } from '@/components/SectionShell';
import { HomeSkeleton } from '@/components/Skeletons';
import { AdmissionSteps } from './home/AdmissionSteps';
import { Director } from './home/Director';
import { FeaturedPrograms } from './home/FeaturedPrograms';
import { FinalCta } from './home/FinalCta';
import { Hero } from './home/Hero';
import { Levels } from './home/Levels';
import { NewsEvents } from './home/NewsEvents';
import { Partners } from './home/Partners';
import { ProgramFinder } from './home/ProgramFinder';
import { Stats } from './home/Stats';
import { Strengths } from './home/Strengths';
import { Testimonials } from './home/Testimonials';
import { Video } from './home/Video';

/** Type de section (home_sections, admin) -> composant. Ordre, visibilite et style viennent de l'API. */
const REGISTRY: Record<string, ComponentType<{ data: any; shell: Shell }>> = {
  program_finder: ProgramFinder,
  levels: Levels,
  strengths: Strengths,
  stats: Stats,
  featured_programs: FeaturedPrograms,
  director_word: Director,
  video: Video,
  admission: AdmissionSteps,
  testimonials: Testimonials,
  news_events: NewsEvents,
  partners: Partners,
  final_cta: FinalCta,
};

/** Repli si l'admin n'a rien regle : le fond alterne pour que chaque section soit lisible. */
const FALLBACK: Record<string, BackgroundToken> = {
  program_finder: 'white', levels: 'mint', strengths: 'white', stats: 'green', featured_programs: 'white', director_word: 'mint',
  video: 'mint', admission: 'white', news_events: 'mint', testimonials: 'white', partners: 'mint', final_cta: 'brown',
};

type ApiSection = HomeSection & { style?: SectionStyle };

/** Brouillon envoye par l'admin a l'apercu : { type, style, data } deja resolu pour la langue de l'apercu. */
type Draft = { type: string; style?: SectionStyle; data?: Record<string, any> };

/**
 * Mode apercu (admin) : la page est chargee dans un iframe avec ?preview=1. Elle accepte les brouillons envoyes par
 * l'admin (meme origine uniquement), les affiche a la place de la section enregistree et se place sur la section editee.
 */
function usePreview() {
  const active = typeof window !== 'undefined' && window.parent !== window && new URLSearchParams(window.location.search).get('preview') === '1';
  const [draft, setDraft] = useState<Draft | null>(null);
  useEffect(() => {
    if (!active) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== 'isstas:preview') return;
      setDraft(e.data.section as Draft);
    };
    // Dans l'apercu, un clic ne doit jamais quitter la page en cours d'edition.
    const block = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a[href]')) e.preventDefault();
    };
    window.addEventListener('message', onMessage);
    document.addEventListener('click', block, true);
    window.parent.postMessage({ type: 'isstas:preview-ready' }, window.location.origin);
    return () => { window.removeEventListener('message', onMessage); document.removeEventListener('click', block, true); };
  }, [active]);
  return { active, draft };
}

export default function Home() {
  const { locale } = useLocale();
  const { data: sections, loading } = useApi<ApiSection[]>('/home', locale);
  const { data: seo } = useApi<{ title: string | null; description: string | null }>('/seo/home', locale);
  usePageMeta({ title: seo?.title, description: seo?.description, alternates: { fr: '/', en: '/' } });
  const { active: preview, draft } = usePreview();
  const scrolled = useRef(false);
  const focus = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('focus') : null;

  // Premier affichage de l'apercu : se placer sur la section en cours d'edition.
  useEffect(() => {
    if (!preview || !focus || scrolled.current || !sections) return;
    const el = document.querySelector(`[data-section="${focus}"]`)?.firstElementChild;
    if (el) { scrolled.current = true; window.setTimeout(() => el.scrollIntoView({ block: 'start' }), 300); }
  }, [preview, focus, sections, draft]);

  if (loading && !sections) return <HomeSkeleton />;

  return (
    <>
      {(sections ?? []).map((original, i) => {
        // En apercu, la section editee est remplacee par le brouillon (visible meme si elle est masquee).
        const s = preview && draft && draft.type === original.type ? { ...original, style: { ...original.style, ...draft.style }, data: draft.data ?? original.data } : original;
        if (s.type === 'hero') return <div key={`hero-${i}`} data-section="hero" className="contents"><Hero data={s.data ?? {}} /></div>;
        const Section = REGISTRY[s.type];
        if (!Section) return null;
        const shell: Shell = {
          background: isBackground(s.style?.background) ? (s.style!.background as BackgroundToken) : (FALLBACK[s.type] ?? 'white'),
          wave: s.style?.wave ?? 'soft',
          decor: s.style?.decor ?? 'none',
          flip: !!s.style?.flip,
          hiddenOnMobile: preview ? false : !!s.style?.hidden_on_mobile,
        };
        return <div key={`${s.type}-${i}`} data-section={s.type} className="contents"><Section data={s.data ?? {}} shell={shell} /></div>;
      })}
    </>
  );
}
