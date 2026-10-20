import { useEffect, useRef, useState } from 'react';

/** Fine barre verte en haut de l'ecran tant qu'une requete est en cours (apparait apres 150 ms : pas de scintillement). */
export function TopProgress() {
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);
  const showTimer = useRef<number | undefined>(undefined);
  const grow = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onBusy = (e: Event) => {
      const n = (e as CustomEvent<number>).detail;
      if (n > 0) {
        if (showTimer.current || active) return;
        showTimer.current = window.setTimeout(() => {
          setActive(true);
          setWidth(18);
          grow.current = window.setInterval(() => setWidth((w) => (w < 90 ? w + (90 - w) * 0.12 : w)), 200);
        }, 150);
      } else {
        window.clearTimeout(showTimer.current);
        showTimer.current = undefined;
        window.clearInterval(grow.current);
        setWidth((w) => { if (w > 0) window.setTimeout(() => { setActive(false); setWidth(0); }, 220); return w > 0 ? 100 : 0; });
      }
    };
    window.addEventListener('isstas:busy', onBusy);
    return () => { window.removeEventListener('isstas:busy', onBusy); window.clearTimeout(showTimer.current); window.clearInterval(grow.current); };
  }, [active]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-1">
      <div className="h-full bg-gradient-to-r from-green-300 via-green-500 to-green-300 shadow-[0_0_10px_rgb(61_122_95/.7)] transition-[width,opacity] duration-200" style={{ width: `${width}%`, opacity: active ? 1 : 0 }} />
    </div>
  );
}
