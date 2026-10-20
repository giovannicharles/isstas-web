import { useEffect, useState } from 'react';
import { ArrowRight, Pause, Play, Sparkles } from 'lucide-react';
import { Button, Container, KineticText, PulseLine, WaveDivider, useReducedMotion } from '@isstas/ui';
import { useLocale, useT } from '@/lib/i18n';
import { useSettings } from '@/lib/settings';

type Slide = { title?: string; subtitle?: string; image?: string | null; image_alt?: string | null };
type Data = { badge?: string; title?: string; subtitle?: string; primary_cta?: string; secondary_cta?: string; slides?: Slide[]; image?: string | null };

const DURATION = 7000;

/**
 * Hero plein ecran : photo reelle en fond (diaporama gere dans l'admin), degrade de lisibilite, titre immense a gauche,
 * deux boutons, mention de rentree en pastille, vague vers la suite. Unique moment fort : la ligne de pouls se trace
 * une fois a l'arrivee et le titre se compose mot a mot.
 */
export function Hero({ data }: { data: Data }) {
  const { path } = useLocale();
  const t = useT();
  const reduced = useReducedMotion();
  const { data: settings } = useSettings();
  const fallbackImage = settings?.brand?.hero_background ?? data.image ?? null;

  const slides: Slide[] = (data.slides?.length ? data.slides : [{ title: data.title, subtitle: data.subtitle, image: fallbackImage }]).filter((s) => s.title || s.image);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [paused, setPaused] = useState(false);
  const auto = playing && !paused && !reduced && slides.length > 1;

  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % slides.length), DURATION);
    return () => clearTimeout(id);
  }, [auto, index, slides.length]);

  if (!slides.length) return null;

  return (
    <section
      className="on-dark relative isolate flex min-h-[min(92vh,56rem)] flex-col justify-center overflow-hidden bg-green-700 pb-28 pt-20 text-white sm:pb-36 lg:pb-44"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={t('hero.label')}
    >
      {/* photos en fond, fondu enchaine */}
      {slides.map((s, i) =>
        s.image ? (
          <img
            key={i}
            src={s.image}
            alt=""
            fetchPriority={i === 0 ? 'high' : 'auto'}
            decoding="async"
            className={`absolute inset-0 -z-30 size-full object-cover transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : null,
      )}
      {/* degrade de lisibilite : fort a gauche (texte), leger a droite (photo) */}
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-r from-green-900/90 via-green-800/65 to-green-700/15 max-md:from-green-900/85 max-md:via-green-800/70 max-md:to-green-800/60" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-20 h-1/3 bg-gradient-to-t from-green-900/50 to-transparent" />
      <PulseLine draw color="rgb(255 255 255 / 0.9)" strokeWidth={4} className="pointer-events-none absolute -left-[3%] bottom-12 -z-10 h-16 w-[106%] sm:bottom-16 sm:h-24" />

      <Container className="relative">
        {data.badge ? (
          <p className="mb-6 inline-flex max-w-full animate-hero-in items-center gap-2 rounded-full bg-white/15 px-4 py-2 font-display text-sm font-bold text-white ring-1 ring-white/30 backdrop-blur" style={{ animationDelay: '150ms' }}>
            <Sparkles className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{data.badge}</span>
          </p>
        ) : null}

        <div className="grid max-w-[46rem]" aria-live={auto ? 'off' : 'polite'}>
          {slides.map((s, i) => {
            const Tag = i === 0 ? 'h1' : 'p';
            const active = i === index;
            return (
              <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${slides.length}`} inert={!active} className={`col-start-1 row-start-1 transition-opacity duration-700 ${active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
                <Tag className="h-hero text-white">{i === 0 && s.title ? <KineticText text={s.title} delay={350} step={80} /> : s.title}</Tag>
                {s.subtitle ? <p className="mt-6 max-w-[48ch] text-[1.125rem] leading-relaxed text-white/90 sm:text-[1.25rem]">{s.subtitle}</p> : null}
              </div>
            );
          })}
        </div>

        <div className="mt-9 flex animate-hero-in flex-wrap items-center gap-3 sm:gap-4" style={{ animationDelay: '1300ms' }}>
          <Button to={path('/formations')} tone="dark" size="lg">
            {t(data.primary_cta ?? 'cta.view_programs')} <ArrowRight className="size-5" aria-hidden="true" />
          </Button>
          <Button to={path('/admission/pre-inscription')} variant="outline" tone="dark" size="lg">
            {t(data.secondary_cta ?? 'cta.apply')}
          </Button>
        </div>

        {slides.length > 1 ? (
          <div className="mt-10 flex items-center gap-4">
            <ul className="flex flex-1 gap-2 sm:max-w-xs">
              {slides.map((_, i) => (
                <li key={i} className="flex-1">
                  <button type="button" onClick={() => setIndex(i)} aria-label={t('hero.go_to', { n: i + 1 })} aria-current={i === index} className="block w-full py-2.5">
                    <span className="block h-1 overflow-hidden rounded-full bg-white/30">
                      <span
                        key={`${i}-${i === index ? index : 'x'}-${auto}`}
                        className="block h-full origin-left rounded-full bg-white"
                        style={{ transform: i < index || (i === index && !auto) ? 'scaleX(1)' : 'scaleX(0)', animation: i === index && auto ? `fill ${DURATION}ms linear forwards` : 'none' }}
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t('hero.pause') : t('hero.play')} className="grid size-11 place-items-center rounded-full bg-white/15 ring-1 ring-white/30 hover:bg-white/25">
              {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
            </button>
          </div>
        ) : null}
      </Container>

      <div className="absolute inset-x-0 bottom-[-1px] z-10">
        <WaveDivider variant="soft" className="text-white" />
      </div>
    </section>
  );
}