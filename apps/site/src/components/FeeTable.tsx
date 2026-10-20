import { useLocale, useT } from '@/lib/i18n';
import { money } from '@/lib/format';
import type { Fee } from '@/lib/types';

/** Tarifs : tableau sur grand ecran, cartes empilees sur mobile (pas de defilement horizontal). */
export function FeeTable({ rows }: { rows: (Fee & { level?: { name: string } | null; level_name?: string })[] }) {
  const { locale } = useLocale();
  const t = useT();
  if (!rows.length) return null;
  const name = (r: (typeof rows)[number]) => r.level?.name ?? r.level_name ?? '';

  return (
    <>
      <table className="hidden w-full border-collapse text-left md:table">
        <thead>
          <tr className="bg-green-500 text-white">
            <th scope="col" className="px-5 py-3.5 font-display text-sm font-bold">{t('fees.level')}</th>
            <th scope="col" className="px-5 py-3.5 font-display text-sm font-bold">{t('fees.registration')}</th>
            <th scope="col" className="px-5 py-3.5 font-display text-sm font-bold">{t('fees.tuition')}</th>
            <th scope="col" className="px-5 py-3.5 font-display text-sm font-bold">{t('fees.application')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line even:bg-mint-50">
              <th scope="row" className="px-5 py-4 font-display text-lg font-extrabold">{name(r)}</th>
              <td className="px-5 py-4">{money(r.registration_fee, locale)}</td>
              <td className="px-5 py-4 font-bold">{money(r.tuition_fee, locale)}</td>
              <td className="px-5 py-4">{money(r.application_fee, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="grid gap-4 md:hidden">
        {rows.map((r, i) => (
          <li key={i} className="rounded-[var(--radius-panel)] border-2 border-line p-5">
            <p className="font-display text-xl font-black">{name(r)}</p>
            <dl className="mt-3 grid gap-2 text-[0.98rem]">
              <div className="flex justify-between gap-4"><dt className="text-ink-muted">{t('fees.registration')}</dt><dd className="font-semibold">{money(r.registration_fee, locale)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-ink-muted">{t('fees.tuition')}</dt><dd className="font-bold">{money(r.tuition_fee, locale)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-ink-muted">{t('fees.application')}</dt><dd>{money(r.application_fee, locale)}</dd></div>
            </dl>
          </li>
        ))}
      </ul>
      {rows[0]?.notes ? <p className="mt-4 text-sm text-ink-muted">{rows[0].notes}</p> : null}
    </>
  );
}