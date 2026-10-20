import { useEffect, useMemo, useState } from 'react';
import { Printer, Share2 } from 'lucide-react';
import { Checkbox, Container, Progress, Reveal, SelectField } from '@isstas/ui';
import { useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import { usePageMeta } from '@/lib/usePageMeta';
import type { Level, RequiredDoc } from '@/lib/types';
import { PageBanner } from '@/components/PageBanner';

const KEY = 'isstas.checklist';

/** Dossier a fournir : liste adaptee au niveau, progression sauvegardee sur l'appareil, impression, partage WhatsApp. */
export default function Checklist() {
  const { locale } = useLocale();
  const t = useT();
  const { data: levels } = useApi<Level[]>('/levels', locale);
  const [level, setLevel] = useState('');
  const { data: docs } = useApi<RequiredDoc[]>('/admission/documents', locale, { level });
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  usePageMeta({ title: t('admission.checklist'), alternates: { fr: '/admission/dossier', en: '/admission/dossier' } });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      setChecked(saved.checked ?? {});
      if (saved.level) setLevel(saved.level);
    } catch { /* stockage indisponible */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ checked, level })); } catch { /* ignore */ }
  }, [checked, level]);

  const list = docs ?? [];
  const done = useMemo(() => list.filter((d) => checked[d.label]).length, [list, checked]);
  const pct = list.length ? Math.round((done / list.length) * 100) : 0;
  const shareText = `${t('admission.checklist')}\n` + list.map((d) => `${checked[d.label] ? '✅' : '⬜'} ${d.label}`).join('\n');

  return (
    <>
      <PageBanner title={t('admission.checklist')} lead={t('checklist.lead')} crumbs={[{ label: t('admission.title'), to: '/admission' }, { label: t('admission.checklist') }]} />
      <Container size="narrow" className="py-16 sm:py-24">
        <div className="print:hidden">
          <SelectField label={t('checklist.level')} value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">{t('checklist.all_levels')}</option>
            {(levels ?? []).map((l) => <option key={l.id} value={l.slug}>{l.name}</option>)}
          </SelectField>
        </div>

        <div className="mt-10" aria-live="polite">
          <div className="flex items-baseline justify-between font-display font-bold">
            <span>{t('checklist.progress', { done, total: list.length })}</span>
            <span className="text-green-700">{pct}%</span>
          </div>
          <Progress value={pct} className="mt-2" aria-label={t('admission.checklist')} />
        </div>

        <ul className="mt-8 border-t-2 border-green-700">
          {list.map((d) => (
            <li key={d.label} className="border-b border-line">
              <label className="flex cursor-pointer items-start gap-4 py-4">
                <Checkbox checked={!!checked[d.label]} onCheckedChange={(v) => setChecked((c) => ({ ...c, [d.label]: v === true }))} className="mt-0.5" />
                <span className={checked[d.label] ? 'text-ink-muted line-through' : ''}>
                  <span className="text-lg font-semibold">{d.label}</span>
                  {d.is_additional ? <span className="ml-2 text-sm font-bold text-green-700">{t('documents.extra')}</span> : null}
                  {d.description ? <span className="block text-sm text-ink-muted">{d.description}</span> : null}
                </span>
              </label>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-4 print:hidden">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border-2 border-green-700 px-5 py-3 font-display font-bold hover:bg-green-500 hover:text-white">
            <Printer className="size-5" aria-hidden="true" /> {t('checklist.print')}
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border-2 border-green-600 bg-green-600 px-5 py-3 font-display font-bold text-white no-underline hover:bg-green-700">
            <Share2 className="size-5" aria-hidden="true" /> {t('checklist.share')}
          </a>
        </div>
      </Container>
    </>
  );
}