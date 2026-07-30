'use client';

import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGrip,
  faShirt,
  faShoePrints,
  faFutbol,
  faVest,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import ProductCard from '@/components/ProductCard';
import Container from '@/components/Container';
import Reveal from '@/components/Reveal';
import { products, categories } from '@/data/products';

const catIcons: Record<string, typeof faGrip> = {
  Tous: faGrip,
  Maillots: faShirt,
  Chaussures: faShoePrints,
  Ballons: faFutbol,
  Équipements: faVest,
  Accessoires: faTag,
};

const sorts = {
  defaut: 'Sélection',
  'prix-croissant': 'Prix croissant',
  'prix-decroissant': 'Prix décroissant',
  nom: 'Nom (A–Z)',
} as const;

type SortKey = keyof typeof sorts;

export default function ProduitsClient({ initialCategory }: { initialCategory: string }) {
  const [active, setActive] = useState(initialCategory);
  const [sort, setSort] = useState<SortKey>('defaut');

  const filtered = useMemo(() => {
    const list = active === 'Tous' ? products : products.filter((p) => p.category === active);

    switch (sort) {
      case 'prix-croissant':
        return [...list].sort((a, b) => a.price - b.price);
      case 'prix-decroissant':
        return [...list].sort((a, b) => b.price - a.price);
      case 'nom':
        return [...list].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      default:
        return list;
    }
  }, [active, sort]);

  return (
    <section className="bg-ink py-14 sm:py-16">
      <Container>
        {/* Filtres */}
        <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filtrer par catégorie"
            className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                aria-pressed={active === cat}
                className={`flex shrink-0 items-center gap-2 border px-4 py-2.5 text-[11px] font-black uppercase tracking-label transition-colors ${
                  active === cat
                    ? 'border-white bg-white text-black'
                    : 'border-line bg-transparent text-mute hover:border-line-strong hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={catIcons[cat] ?? faGrip} className="h-3 w-3" />
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="tri"
              className="shrink-0 text-[10px] font-black uppercase tracking-label text-mute-dim"
            >
              Trier
            </label>
            <select
              id="tri"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-line bg-elevated py-2.5 pl-4 pr-10 text-xs text-white transition-colors focus:border-teranga focus:outline-none"
            >
              {Object.entries(sorts).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mb-8 text-xs uppercase tracking-label text-mute-dim" aria-live="polite">
          {filtered.length} produit{filtered.length > 1 ? 's' : ''}
          {active !== 'Tous' && ` · ${active}`}
        </p>

        {filtered.length === 0 ? (
          <div className="border border-line py-24 text-center">
            <p className="font-display text-3xl text-white">Aucun produit</p>
            <p className="mt-2 text-sm text-mute">Cette catégorie est vide pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 7) * 60}>
                <ProductCard product={p} index={i + 1} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
