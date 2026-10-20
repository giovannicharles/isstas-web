import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { Button, Decor, Switch, WaveDivider, isDecor, type WaveVariant } from '@isstas/ui';
import { api } from '@admin/lib/api';
import { describeError } from '@admin/lib/errors';
import { Alert } from '@admin/components/Alert';
import { SubNav } from '@admin/components/SubNav';
import { SitePreview } from '@admin/components/SitePreview';
import { HOME_SECTIONS } from '@admin/lib/resources';
import { useNotify } from '@admin/components/Notify';

type Style = { background?: string | null; wave?: string | null; decor?: string | null; flip?: boolean; hidden_on_mobile?: boolean };
type Slide = { title?: string; subtitle?: string; image_id?: number | null };
type Media = { id: number; url: string; name: string; collection: string };
type Section = {
  id: number;
  type: string;
  position: number;
  is_visible: boolean;
  style: Style | null;
  data: Record<string, any> | null; // { fr: {...}, en: {...} }
  _media?: Media[];
};

const LABELS: Record<string, string> = {
  hero: 'Héros (diaporama)', program_finder: 'Trouver ma filière', levels: 'Niveaux de formation', video: 'Vidéo',
  strengths: 'Atouts', stats: 'Chiffres clés', director_word: 'Mot de la Directrice', admission: 'Admission',
  featured_programs: 'Filières à la une', testimonials: 'Témoignages', news_events: 'Actualités et événements', partners: 'Partenaires', final_cta: 'Appel final',
};
const BACKGROUNDS = [['white', 'Blanc'], ['mint', 'Menthe'], ['green', 'Vert du logo'], ['deep', 'Vert profond'], ['brown', 'Brun du logo']] as const;
const DECORS = [['none', 'Aucun'], ['pulse', 'Ligne de pouls'], ['crosses', 'Croix médicales'], ['dna', 'ADN'], ['network', 'Molécules'], ['rings', 'Cercles'], ['blobs', 'Formes organiques'], ['dots', 'Trame de points']] as const;
const WAVES = [['none', 'Aucune'], ['soft', 'Douce'], ['double', 'Double'], ['asymmetric', 'Asymétrique'], ['arc', 'Arc'], ['pulse', 'Ligne de pouls']] as const;

const PREVIEW_BG: Record<string, string> = { white: 'bg-white text-white', mint: 'bg-mint-100 text-mint-100', green: 'bg-green-500 text-green-500', deep: 'bg-green-700 text-green-700', brown: 'bg-brown-800 text-brown-800' };

/** Apercu fidele du fond et de la vague : la vague est dessinee dans la couleur de la section sur la section precedente. */
function StylePreview({ style }: { style: Style | null }) {
  const bg = PREVIEW_BG[style?.background ?? 'white'] ?? PREVIEW_BG.white!;
  const wave = style?.wave && style.wave !== 'none' ? (style.wave as WaveVariant) : null;
  return (
    <div className="relative isolate overflow-hidden rounded-xl ring-1 ring-line" aria-hidden="true">
      {isDecor(style?.decor) ? <Decor kind={style.decor} dark={['green', 'deep', 'brown'].includes(style?.background ?? '')} className="!top-8" /> : null}
      <div className="h-8 bg-green-100" />
      {wave ? <WaveDivider variant={wave} flip={!!style?.flip} className={`${bg.split(' ')[1]} -mt-px !h-10 bg-green-100`} /> : null}
      <div className={`h-10 ${bg.split(' ')[0]}`} />
    </div>
  );
}

/**
 * Constructeur de l'accueil : ordre, visibilité, fond, vague, sens, affichage mobile ; titres FR/EN ;
 * slides du hero (textes + images). Chaque section s'enregistre séparément.
 */
export default function HomeBuilder() {
  const [sections, setSections] = useState<Section[]>([]);
  const [status, setStatus] = useState<Record<number, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const notify = useNotify();
  const { section } = useParams();
  const [ready, setReady] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const current = section ? sections.find((x) => x.type === section) : undefined;

  const load = useCallback(async () => {
    try {
      const res = (await api('/home-sections', { raw: true, params: { per_page: 100, sort: 'position' } })) as unknown as { data: Section[] };
      setSections(res.data);
      setLoadError(null);
    } catch (e) {
      setLoadError(describeError(e).message);
    } finally {
      setReady(true);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const patch = (id: number, fn: (s: Section) => Section) => setSections((l) => l.map((s) => (s.id === id ? fn(s) : s)));
  const setStyle = (s: Section, k: keyof Style, v: unknown) => patch(s.id, (x) => ({ ...x, style: { ...(x.style ?? {}), [k]: v } }));
  const setDataField = (s: Section, lang: 'fr' | 'en', field: string, v: unknown) =>
    patch(s.id, (x) => ({ ...x, data: { ...(x.data ?? {}), [lang]: { ...((x.data?.[lang] as object) ?? {}), [field]: v } } }));

  async function save(s: Section) {
    setSaving(s.id);
    setStatus((m) => ({ ...m, [s.id]: '' }));
    try {
      await api(`/home-sections/${s.id}`, { method: 'PUT', body: { is_visible: s.is_visible, style: s.style, data: s.data } });
      notify.success('Section enregistrée', `« ${LABELS[s.type] ?? s.type} » est à jour sur le site.`);
      setSavedAt(Date.now());
    } catch (e) {
      const d = notify.fromError(e, 'Enregistrement impossible');
      setStatus((m) => ({ ...m, [s.id]: Object.values(d.fields)[0]?.[0] ?? d.message }));
    } finally {
      setSaving(null);
    }
  }

  async function toggleVisible(s: Section, visible: boolean) {
    patch(s.id, (x) => ({ ...x, is_visible: visible }));
    try {
      await api(`/home-sections/${s.id}`, { method: 'PUT', body: { is_visible: visible } });
      notify.success(visible ? 'Section affichée' : 'Section masquée', LABELS[s.type] ?? s.type);
    } catch (e) {
      patch(s.id, (x) => ({ ...x, is_visible: !visible }));
      notify.fromError(e, 'Modification impossible');
    }
  }

  async function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= sections.length) return;
    const previous = sections;
    const next = [...sections];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setSections(next);
    try {
      await api('/home-sections/reorder', { method: 'POST', body: { items: next.map((s, i) => ({ id: s.id, position: i + 1 })) } });
    } catch (e) {
      setSections(previous); // l'ordre affiche doit refleter ce qui est enregistre
      notify.fromError(e, 'Réorganisation impossible');
    }
  }

  async function upload(s: Section, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api(`/home-sections/${s.id}/media/slides`, { method: 'POST', body: fd });
      notify.success('Image ajoutée', file.name);
      await load();
    } catch (e) {
      notify.fromError(e, "Téléversement impossible");
    }
  }

  const slidesOf = (s: Section, lang: 'fr' | 'en'): Slide[] => ((s.data?.[lang] as any)?.slides as Slide[]) ?? [];
  const setSlides = (s: Section, lang: 'fr' | 'en', slides: Slide[]) => setDataField(s, lang, 'slides', slides);
  // image_id partage entre les deux langues
  const setSlideImage = (s: Section, index: number, id: number | null) => {
    (['fr', 'en'] as const).forEach((lang) => {
      const list = [...slidesOf(s, lang)];
      if (list[index]) list[index] = { ...list[index], image_id: id };
      setSlides(s, lang, list);
    });
  };

  return (
    <div className={`grid gap-6 ${section ? 'max-w-[88rem]' : 'max-w-4xl'}`}>
      <div>
        <h1 className="font-display text-3xl font-black">{section ? (HOME_SECTIONS.find((h) => h.type === section)?.label ?? 'Section') : "Page d'accueil"}</h1>
        <p className="mt-1 text-ink-muted">{section ? 'Fond, vague, décor et contenus de cette section. Les modifications apparaissent sur le site dès l\'enregistrement.' : 'Ordre et visibilité des sections. Ouvrez une section pour modifier son fond, son décor et ses textes.'}</p>
      </div>
      <SubNav label="Sections de l'accueil" items={[{ to: '/admin/accueil', label: "Vue d'ensemble", end: true }, ...HOME_SECTIONS.map((h) => ({ to: `/admin/accueil/${h.type}`, label: h.label }))]} />

      {!ready && !loadError ? <LoadingCards count={section ? 1 : 6} /> : null}

      {!section && ready ? (
        <ol className="grid gap-2">
          {sections.map((s, i) => (
            <li key={s.id} className={`flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 pr-4 shadow-soft ring-1 ring-line ${s.is_visible ? '' : 'opacity-60'}`}>
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mint-100 font-display font-extrabold text-green-700">{i + 1}</span>
              <Link to={`/admin/accueil/${s.type}`} className="min-w-0 flex-1 font-display font-extrabold text-ink no-underline hover:text-green-600">{LABELS[s.type] ?? s.type}</Link>
              <span className="hidden items-center gap-2 text-xs font-semibold text-ink-muted sm:flex">
                <span aria-hidden="true" className={`size-3.5 rounded-full ring-1 ring-black/10 ${({ white: 'bg-white', mint: 'bg-mint-200', green: 'bg-green-500', deep: 'bg-green-700', brown: 'bg-brown-800' } as Record<string, string>)[s.style?.background ?? 'white'] ?? 'bg-white'}`} />
                {BACKGROUNDS.find(([v]) => v === (s.style?.background ?? 'white'))?.[1] ?? 'Blanc'}
              </span>
              <button type="button" onClick={() => void move(i, -1)} disabled={i === 0} aria-label={`Monter ${LABELS[s.type] ?? s.type}`} className="grid size-9 place-items-center rounded-lg hover:bg-mint-100 disabled:opacity-30"><ArrowUp className="size-4" /></button>
              <button type="button" onClick={() => void move(i, 1)} disabled={i === sections.length - 1} aria-label={`Descendre ${LABELS[s.type] ?? s.type}`} className="grid size-9 place-items-center rounded-lg hover:bg-mint-100 disabled:opacity-30"><ArrowDown className="size-4" /></button>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <Switch checked={s.is_visible} onCheckedChange={(v) => void toggleVisible(s, v)} aria-label={`Afficher ${LABELS[s.type] ?? s.type}`} />
                <span className="w-14">{s.is_visible ? 'Visible' : 'Masquée'}</span>
              </label>
              <Link to={`/admin/accueil/${s.type}`} className="inline-flex min-h-9 items-center rounded-full px-4 text-sm font-bold text-green-700 no-underline ring-2 ring-green-500/30 hover:bg-green-500 hover:text-white">Modifier</Link>
            </li>
          ))}
        </ol>
      ) : null}

      {loadError ? <Alert tone="error" title="Chargement impossible" action={<Button variant="outline" onClick={() => void load()}>Réessayer</Button>}>{loadError}</Alert> : null}
      {section ? <div className="grid items-start gap-6 xl:grid-cols-2"><div className="grid gap-6">{sections.filter((s) => s.type === section).map((s) => (
        <section key={s.id} className="grid gap-5 rounded-[var(--radius-card)] bg-white shadow-soft ring-1 ring-line p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-extrabold">{LABELS[s.type] ?? s.type}</h2>
            <div className="flex items-center gap-2">
              <label className="ml-2 flex items-center gap-2 font-semibold">
                <Switch checked={s.is_visible} onCheckedChange={(v) => patch(s.id, (x) => ({ ...x, is_visible: v }))} aria-label="Afficher la section" />
                {s.is_visible ? 'Visible' : 'Masquée'}
              </label>
            </div>
          </div>

          <StylePreview style={s.style} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="grid gap-1.5 text-sm font-bold">Fond
              <select className="field" value={s.style?.background ?? ''} onChange={(e) => setStyle(s, 'background', e.target.value || null)}>
                <option value="">Par défaut</option>
                {BACKGROUNDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-bold">Vague
              <select className="field" value={s.style?.wave ?? ''} onChange={(e) => setStyle(s, 'wave', e.target.value || null)}>
                <option value="">Par défaut (douce)</option>
                {WAVES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-bold">Décor SVG
              <select className="field" value={s.style?.decor ?? 'none'} onChange={(e) => setStyle(s, 'decor', e.target.value)}>
                {DECORS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-3 self-end pb-3 text-sm font-bold">
              <Switch checked={!!s.style?.flip} onCheckedChange={(v) => setStyle(s, 'flip', v)} aria-label="Inverser la vague" /> Vague inversée
            </label>
            <label className="flex items-center gap-3 self-end pb-3 text-sm font-bold">
              <Switch checked={!!s.style?.hidden_on_mobile} onCheckedChange={(v) => setStyle(s, 'hidden_on_mobile', v)} aria-label="Masquer sur mobile" /> Masquée sur mobile
            </label>
          </div>

          {s.type !== 'hero' && s.data && 'title' in ((s.data.fr as object) ?? {}) ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-bold">Titre (français)
                <input className="field" value={(s.data?.fr?.title as string) ?? ''} onChange={(e) => setDataField(s, 'fr', 'title', e.target.value)} />
              </label>
              <label className="grid gap-1.5 text-sm font-bold">Titre (anglais)
                <input className="field" value={(s.data?.en?.title as string) ?? ''} onChange={(e) => setDataField(s, 'en', 'title', e.target.value)} />
              </label>
            </div>
          ) : null}

          {s.type === 'video' ? (
            <label className="grid gap-1.5 text-sm font-bold">Lien YouTube
              <input className="field" value={(s.data?.fr?.url as string) ?? ''} onChange={(e) => { setDataField(s, 'fr', 'url', e.target.value); setDataField(s, 'en', 'url', e.target.value); }} placeholder="https://youtu.be/…" />
            </label>
          ) : null}

          {s.type === 'hero' ? (
            <div className="grid gap-4">
              <h3 className="font-display font-extrabold">Diaporama</h3>
              {slidesOf(s, 'fr').map((slide, i) => {
                const en = slidesOf(s, 'en')[i] ?? {};
                const media = (s._media ?? []).filter((m) => m.collection === 'slides');
                const current = media.find((m) => m.id === slide.image_id);
                return (
                  <div key={i} className="grid gap-3 rounded-lg bg-mint-50 p-4 ring-1 ring-line">
                    <div className="flex items-center justify-between">
                      <p className="font-display font-extrabold">Slide {i + 1}</p>
                      <button type="button" aria-label="Supprimer la slide" onClick={() => (['fr', 'en'] as const).forEach((l) => setSlides(s, l, slidesOf(s, l).filter((_, k) => k !== i)))} className="grid size-8 place-items-center rounded-lg text-danger hover:bg-red-50"><Trash2 className="size-4" /></button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input className="field" aria-label="Titre FR" placeholder="Titre (FR)" value={slide.title ?? ''} onChange={(e) => setSlides(s, 'fr', slidesOf(s, 'fr').map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))} />
                      <input className="field" aria-label="Titre EN" placeholder="Title (EN)" value={en.title ?? ''} onChange={(e) => setSlides(s, 'en', slidesOf(s, 'en').map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))} />
                      <textarea className="field" rows={2} aria-label="Sous-titre FR" placeholder="Sous-titre (FR)" value={slide.subtitle ?? ''} onChange={(e) => setSlides(s, 'fr', slidesOf(s, 'fr').map((x, k) => (k === i ? { ...x, subtitle: e.target.value } : x)))} />
                      <textarea className="field" rows={2} aria-label="Sous-titre EN" placeholder="Subtitle (EN)" value={en.subtitle ?? ''} onChange={(e) => setSlides(s, 'en', slidesOf(s, 'en').map((x, k) => (k === i ? { ...x, subtitle: e.target.value } : x)))} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {current ? <img src={current.url} alt="" className="h-14 w-20 rounded object-cover" /> : <span className="text-sm text-ink-muted">Aucune image</span>}
                      <select className="field !min-h-10 max-w-xs" aria-label="Image de la slide" value={slide.image_id ?? ''} onChange={(e) => setSlideImage(s, i, e.target.value ? Number(e.target.value) : null)}>
                        <option value="">Choisir une image…</option>
                        {media.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => (['fr', 'en'] as const).forEach((l) => setSlides(s, l, [...slidesOf(s, l), { title: '', subtitle: '', image_id: null }]))}><Plus className="size-4" /> Ajouter une slide</Button>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-button)] border-2 border-green-700 px-4 py-2 font-display text-sm font-bold text-green-700 hover:bg-green-700 hover:text-white">
                  <ImagePlus className="size-4" aria-hidden="true" /> Téléverser une image
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && void upload(s, e.target.files[0])} />
                </label>
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-4">
            <Button onClick={() => void save(s)} disabled={saving === s.id}>{saving === s.id ? 'Enregistrement…' : 'Enregistrer'}</Button>
            {status[s.id] ? <span role="alert" className="font-semibold text-danger">{status[s.id]}</span> : null}
          </div>
        </section>
      ))}</div>{current ? <SitePreview section={current} savedAt={savedAt} /> : null}</div> : null}
      {section && ready && !loadError && !sections.some((s) => s.type === section) ? <Alert tone="warning" title="Section introuvable">Cette section n'existe pas dans la base.</Alert> : null}
    </div>
  );
}

function LoadingCards({ count }: { count: number }) {
  return (
    <div className="grid gap-3" aria-busy="true"><span className="sr-only">Chargement…</span>
      {Array.from({ length: count }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-white ring-1 ring-line" />)}
    </div>
  );
}