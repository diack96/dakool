'use client';

import { useState } from 'react';
import ProductVisual from './ProductVisual';
import FlagBar from './FlagBar';
import type { Product } from '@/data/products';

type Props = {
  product: Product;
  /** Numéro d'inventaire, affiché en filigrane à défaut de photo. */
  index?: number;
};

/**
 * Visuel principal de la fiche produit.
 * Affiche une galerie quand plusieurs vues existent, sinon la seule photo,
 * sinon le dessin au trait de la catégorie.
 */
export default function ProductGallery({ product, index }: Props) {
  const images = product.images ?? [];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="grain relative flex aspect-square items-center justify-center overflow-hidden border border-line bg-elevated">
        <ProductVisual
          category={product.category}
          image={images[active]}
          alt={product.name}
          priority
          index={index}
        />
        {product.badge && (
          <span className="absolute top-5 left-5 z-10 bg-inverse px-2.5 py-1.5 text-[10px] font-black uppercase tracking-cta text-on-inverse">
            {product.badge.label}
          </span>
        )}
        <FlagBar className="absolute inset-x-0 bottom-0 z-10" />
      </div>

      {images.length > 1 && (
        <div
          role="group"
          aria-label={`Vues de ${product.name}`}
          className="mt-3 grid grid-cols-4 gap-3"
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              aria-label={`Vue ${i + 1} sur ${images.length}`}
              className={`relative aspect-square overflow-hidden border transition-colors ${
                i === active ? 'border-fg' : 'border-line hover:border-line-strong'
              }`}
            >
              <ProductVisual category={product.category} image={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
