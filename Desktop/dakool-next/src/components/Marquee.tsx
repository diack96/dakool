import FlagBar from './FlagBar';

type Props = {
  items: string[];
  /** Bande verte pleine plutôt que noire — pour les ruptures de section. */
  accent?: boolean;
};

/**
 * Bandeau défilant type ruban de marque.
 * La liste est dupliquée : l'animation translate de -50%, la boucle est donc invisible.
 */
export default function Marquee({ items, accent = false }: Props) {
  const sequence = [...items, ...items];

  return (
    <div
      className={`relative overflow-hidden border-y border-line ${accent ? 'bg-teranga' : 'bg-elevated'}`}
    >
      <div className="flex w-max animate-marquee py-3.5 hover:[animation-play-state:paused]">
        {sequence.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className={`flex shrink-0 items-center gap-6 px-6 font-display text-xl tracking-[0.18em] whitespace-nowrap ${
              accent ? 'text-white' : 'text-white/70'
            }`}
          >
            {item}
            <span className={accent ? 'text-black/40' : 'text-teranga'}>✦</span>
          </span>
        ))}
      </div>
      {accent && <FlagBar className="absolute bottom-0 left-0" />}
    </div>
  );
}
