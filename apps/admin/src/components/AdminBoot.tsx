import { PulseLine } from '@isstas/ui';

/** Ecran affiche pendant le telechargement du code de l'administration (jamais une page blanche). */
export function AdminBoot() {
  return (
    <div role="status" aria-live="polite" className="grid min-h-dvh place-items-center bg-brown-800 text-white">
      <div className="text-center">
        <p className="font-display text-4xl font-black tracking-[-0.04em]">ISSTAS</p>
        <PulseLine className="mx-auto mt-2 h-6 w-32 text-green-300" strokeWidth={2} draw />
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-green-300">Chargement de l'administration…</p>
      </div>
    </div>
  );
}
