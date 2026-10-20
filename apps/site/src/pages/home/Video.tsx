import { Play } from 'lucide-react';
import { useState } from 'react';
import { Container, SectionHeading } from '@isstas/ui';
import { useT } from '@/lib/i18n';
import { youtubeId } from '@/lib/format';
import { SectionShell, type Shell } from '@/components/SectionShell';

/** Video de presentation a la demande : vignette, puis lecteur YouTube sans cookies au clic. */
export function Video({ data, shell }: { data: { title?: string; url?: string }; shell: Shell }) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(data.url);
  if (!id) return null;

  return (
    <SectionShell shell={shell} className="!pt-0">
      <Container size="narrow">
        <SectionHeading title={data.title ?? t('video.title')} />
        <div className="photo-flip relative mt-14 aspect-video w-full overflow-hidden bg-black shadow-lift">
          {playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
              title={data.title ?? t('video.title')}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
            />
          ) : (
            <button type="button" onClick={() => setPlaying(true)} aria-label={t('video.play')} className="group absolute inset-0 size-full">
              <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-green-900/45 via-transparent to-transparent" />
              <span className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-green-500 shadow-lift transition-transform duration-300 group-hover:scale-110 sm:size-24">
                <Play className="size-8 translate-x-0.5 fill-current sm:size-10" aria-hidden="true" />
              </span>
            </button>
          )}
        </div>
      </Container>
    </SectionShell>
  );
}