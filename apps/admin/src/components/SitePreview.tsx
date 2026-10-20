import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Monitor, RefreshCw, Smartphone } from 'lucide-react';

type Media = { id: number; url: string; collection: string };
export type PreviewSection = {
  type: string;
  style: Record<string, unknown> | null;
  data: Record<string, any> | null; // { fr: {...}, en: {...} }
  _media?: Media[];
};

const FRAME_H = 640;

/**
 * Apercu en direct : le vrai site dans un cadre (ordinateur ou mobile, francais ou anglais). Chaque modification du
 * formulaire est envoyee au cadre (postMessage, meme origine) : le rendu change pendant la saisie, avant tout enregistrement.
 */
export function SitePreview({ section, savedAt }: { section: PreviewSection; savedAt: number }) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [loc, setLoc] = useState<'fr' | 'en'>('fr');
  const [ready, setReady] = useState(false);
  const [reload, setReload] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);
  const holder = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560);

  useEffect(() => {
    if (!holder.current) return;
    const ro = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width));
    ro.observe(holder.current);
    return () => ro.disconnect();
  }, []);

  const payload = useCallback(() => {
    const data = { ...(section.data?.fr ?? {}), ...(section.data?.[loc] ?? {}) } as Record<string, any>;
    // Les slides du hero referencent une image par identifiant : l'apercu a besoin de l'adresse de l'image.
    if (Array.isArray(data.slides)) {
      data.slides = data.slides.map((s: any) => ({ ...s, image: section._media?.find((m) => m.id === s.image_id)?.url ?? s.image ?? null }));
    }
    return { type: 'isstas:preview', section: { type: section.type, style: section.style ?? {}, data } };
  }, [section, loc]);

  // Reception du « pret » du cadre.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.source === frame.current?.contentWindow && e.data?.type === 'isstas:preview-ready') setReady(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  useEffect(() => { setReady(false); }, [loc, reload]);

  // Envoi du brouillon : immediat au chargement, puis 150 ms apres la derniere frappe.
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => frame.current?.contentWindow?.postMessage(payload(), window.location.origin), 150);
    return () => window.clearTimeout(t);
  }, [ready, payload]);

  // Apres un enregistrement, on recharge le cadre pour verifier le rendu reel (donnees du serveur).
  useEffect(() => { if (savedAt) setReload((n) => n + 1); }, [savedAt]);

  const frameWidth = device === 'mobile' ? 390 : 1280;
  const scale = Math.min(1, width / frameWidth);
  const scaledW = frameWidth * scale;

  return (
    <aside aria-label="Aperçu du site" className="xl:sticky xl:top-24">
      <div className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-soft ring-1 ring-line">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <h2 className="mr-auto font-display text-base font-extrabold">Aperçu en direct</h2>
          <div role="group" aria-label="Appareil" className="inline-flex rounded-full bg-mint-100 p-1">
            {([['desktop', Monitor, 'Ordinateur'], ['mobile', Smartphone, 'Mobile']] as const).map(([k, Icon, label]) => (
              <button key={k} type="button" onClick={() => setDevice(k)} aria-pressed={device === k} aria-label={label} title={label} className={`grid size-8 place-items-center rounded-full ${device === k ? 'bg-green-500 text-white' : 'text-ink-muted hover:text-ink'}`}><Icon className="size-4" aria-hidden="true" /></button>
            ))}
          </div>
          <div role="group" aria-label="Langue de l'aperçu" className="inline-flex rounded-full bg-mint-100 p-1">
            {(['fr', 'en'] as const).map((l) => (
              <button key={l} type="button" onClick={() => setLoc(l)} aria-pressed={loc === l} className={`h-8 rounded-full px-3 text-xs font-extrabold uppercase ${loc === l ? 'bg-green-500 text-white' : 'text-ink-muted hover:text-ink'}`}>{l}</button>
            ))}
          </div>
          <button type="button" onClick={() => setReload((n) => n + 1)} aria-label="Recharger l'aperçu" title="Recharger" className="grid size-8 place-items-center rounded-full text-ink-muted hover:bg-mint-100"><RefreshCw className="size-4" aria-hidden="true" /></button>
          <a href={`/${loc}`} target="_blank" rel="noopener" aria-label="Ouvrir le site dans un nouvel onglet" title="Ouvrir le site" className="grid size-8 place-items-center rounded-full text-ink-muted hover:bg-mint-100"><ExternalLink className="size-4" aria-hidden="true" /></a>
        </div>

        <div ref={holder} className="relative bg-mint-100 p-0">
          <div className="mx-auto overflow-hidden" style={{ width: scaledW, height: FRAME_H }}>
            <iframe
              ref={frame}
              key={`${loc}-${reload}`}
              title="Aperçu du site"
              src={`/${loc}?preview=1&focus=${section.type}`}
              loading="eager"
              className="block origin-top-left border-0 bg-white"
              style={{ width: frameWidth, height: FRAME_H / scale, transform: `scale(${scale})` }}
            />
          </div>
          {!ready ? (
            <div role="status" className="absolute inset-0 grid place-items-center bg-mint-100/80 text-sm font-semibold text-ink-muted backdrop-blur-sm">Chargement de l'aperçu…</div>
          ) : null}
        </div>
        <p className="border-t border-line px-4 py-2.5 text-xs text-ink-muted">Le rendu change pendant que vous tapez. Rien n'est publié tant que vous n'avez pas cliqué sur « Enregistrer ».</p>
      </div>
    </aside>
  );
}
