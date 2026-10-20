import { Fragment } from 'react';

/**
 * Headline that composes itself: each word rises out of its own clipped line.
 * The text stays intact in the DOM; reduced motion collapses it to an instant reveal (global CSS rule).
 */
export function KineticText({ text, active = true, delay = 0, step = 70, className }: { text: string; active?: boolean; delay?: number; step?: number; className?: string }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {i > 0 && ' '}
          <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
            <span className={`inline-block ${active ? 'animate-word-rise' : ''}`} style={active ? { animationDelay: `${delay + i * step}ms` } : undefined}>
              {word}
            </span>
          </span>
        </Fragment>
      ))}
    </span>
  );
}