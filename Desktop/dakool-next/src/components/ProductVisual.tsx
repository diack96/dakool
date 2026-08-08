/**
 * Visuel produit vectoriel, par catégorie.
 * Dessin au trait plutôt que photo : cohérent avec la direction brutaliste
 * du site, et net à toutes les tailles.
 */

type Props = {
  category: string;
  /** Numéro d'inventaire affiché en filigrane. */
  index?: number;
  className?: string;
};

const shapes: Record<string, React.ReactNode> = {
  Maillots: (
    <>
      <path d="M72 44 L50 52 L26 76 L50 100 L64 86 L64 174 L136 174 L136 86 L150 100 L174 76 L150 52 L128 44" />
      <path d="M72 44 Q100 66 128 44" />
      <path d="M100 96 L100 174" className="stroke-fg" strokeWidth={3} />
      <path d="M64 130 L136 130" strokeOpacity={0.35} />
    </>
  ),
  Chaussures: (
    <>
      <path d="M24 150 Q20 132 26 118 L34 94 Q40 82 58 80 L92 78 Q110 74 126 62 L146 52 Q168 48 174 64 L179 96 Q182 116 166 126 L70 150 Z" />
      <path d="M24 150 L172 130" className="stroke-fg" strokeWidth={3} />
      <path d="M78 92 L96 106 M96 88 L114 102 M114 82 L132 96" strokeOpacity={0.5} />
      <path d="M46 156 L46 166 M78 152 L78 162 M112 147 L112 157 M146 142 L146 152" />
    </>
  ),
  Ballons: (
    <>
      <circle cx="100" cy="100" r="70" />
      <path d="M100 62 L130 84 L118 120 L82 120 L70 84 Z" className="fill-fg/10 stroke-fg" />
      <path d="M100 30 L100 62 M158 82 L130 84 M42 82 L70 84 M78 166 L82 120 M122 166 L118 120" />
    </>
  ),
  Équipements: (
    <>
      <rect x="24" y="80" width="152" height="82" rx="16" />
      <path d="M72 80 Q72 56 100 56 Q128 56 128 80" />
      <path d="M86 80 L86 162 M114 80 L114 162" className="stroke-fg" strokeWidth={3} />
      <path d="M24 118 L176 118" strokeOpacity={0.3} />
    </>
  ),
  Accessoires: (
    <>
      <path d="M46 118 Q46 50 100 50 Q154 50 154 118" />
      <path d="M154 118 Q188 120 190 134 L40 134 Q40 120 46 118 Z" className="fill-fg/10 stroke-fg" />
      <path d="M100 50 L100 118 M72 56 Q86 90 84 118 M128 56 Q114 90 116 118" strokeOpacity={0.45} />
    </>
  ),
};

export default function ProductVisual({ category, index, className = '' }: Props) {
  const shape = shapes[category] ?? shapes.Équipements;

  return (
    <div className={`relative flex h-full w-full items-center justify-center ${className}`}>
      {index !== undefined && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[9rem] leading-none text-fg/[0.04] select-none"
        >
          {String(index).padStart(2, '0')}
        </span>
      )}

      <svg
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="square"
        strokeLinejoin="miter"
        aria-hidden
        className="relative w-[62%] text-fg/85 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
      >
        {shape}
      </svg>
    </div>
  );
}
