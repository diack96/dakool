type Props = {
  items: string[];
  /** Bandeau inversé (fond blanc, texte noir) — pour les ruptures de section. */
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
      /* En version inversée le filet doit être sombre : un bandeau blanc
         collé à un bandeau CTA blanc se lirait comme un seul bloc. */
      className={`relative overflow-hidden border-y ${
        accent ? 'border-black/15 bg-white' : 'border-line bg-elevated'
      }`}
    >
      <div className="flex w-max animate-marquee py-3.5 hover:[animation-play-state:paused]">
        {sequence.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className={`flex shrink-0 items-center gap-6 px-6 font-display text-xl tracking-[0.18em] whitespace-nowrap ${
              accent ? 'text-black' : 'text-white/70'
            }`}
          >
            {item}
            <span className={accent ? 'text-black/35' : 'text-accent'}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
