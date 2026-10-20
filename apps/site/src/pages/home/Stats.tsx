import { Container, CountUp } from '@isstas/ui';
import { useSettings } from '@/lib/settings';
import { SectionShell, type Shell } from '@/components/SectionShell';

/** Chiffres cles : bande verte, compteurs animes au scroll, vagues haut et bas. Une valeur vide masque la ligne. */
export function Stats({ shell }: { data?: unknown; shell: Shell }) {
  const { data } = useSettings();
  const stats = (data?.stats ?? []).filter((s) => s.value && String(s.value).trim() !== '' && String(s.value) !== '0');
  if (!stats.length) return null;

  return (
    <SectionShell shell={shell} className="!py-16 md:!py-20 lg:!py-24">
      <Container>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {stats.map((s) => (
            <li key={s.label}>
              <p className="font-display text-[clamp(2.75rem,6vw,4.75rem)] font-black leading-none tracking-[-0.03em]"><CountUp value={String(s.value)} /></p>
              <p className="mt-4 border-t-2 border-white/40 pt-4 text-[1.0625rem] font-semibold text-white/90">{s.label}</p>
            </li>
          ))}
        </ul>
      </Container>
    </SectionShell>
  );
}