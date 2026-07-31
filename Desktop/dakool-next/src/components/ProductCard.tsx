'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faHeart, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/data/products';
import ProductVisual from './ProductVisual';

/* Toutes les pastilles partagent le même traitement : le site est
   monochrome, la distinction se fait par le libellé. */
const BADGE = 'bg-white text-black';

export default function ProductCard({ product, index }: { product: Product; index?: number }) {
  const { addToCart, openCart } = useCart();
  const [wished, setWished] = useState(false);

  /* Un article qui existe en plusieurs tailles se choisit sur sa fiche —
     on n'ajoute au panier depuis la grille que ce qui n'a pas de variante. */
  const singleVariant = product.sizes.length === 1;

  const handleAdd = () => {
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      category: product.category,
      size: product.sizes[0],
      color: product.colors[0]?.name,
    });
    openCart();
  };

  return (
    <article className="group relative bg-ink">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-elevated">
        <ProductVisual category={product.category} index={index} />

        {product.badge && (
          <span
            className={`absolute top-3 left-3 z-10 px-2 py-1 text-[10px] font-black uppercase tracking-cta ${BADGE}`}
          >
            {product.badge.label}
          </span>
        )}

        <button
          type="button"
          onClick={() => setWished(!wished)}
          aria-pressed={wished}
          aria-label={
            wished ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`
          }
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center bg-black/50 transition-colors hover:bg-black/90"
        >
          <FontAwesomeIcon
            icon={faHeart}
            className={`h-3.5 w-3.5 transition-colors ${wished ? 'text-white' : 'text-white/40'}`}
          />
        </button>

        {/* Sur mobile l'action reste visible ; sur desktop elle monte au survol. */}
        {singleVariant ? (
          <button
            type="button"
            onClick={handleAdd}
            className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-2 bg-white py-3.5 text-[11px] font-black uppercase tracking-label text-black transition-[transform,background-color,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent sm:translate-y-full sm:group-hover:translate-y-0 sm:focus-visible:translate-y-0"
          >
            <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
            Ajouter au panier
          </button>
        ) : (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 bg-white py-3.5 text-[11px] font-black uppercase tracking-label text-black transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:translate-y-full sm:group-hover:translate-y-0">
            Choisir la taille
            <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
          </span>
        )}
      </div>

      <div className="pt-4 pb-1">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-label text-accent">
          {product.category}
        </p>
        <h3 className="mb-2 text-sm leading-tight font-semibold text-white">
          {/* Le ::after étend la zone cliquable à toute la carte sans imbriquer
              de bouton dans un lien. */}
          <Link
            href={`/produits/${product.slug}`}
            className="transition-colors after:absolute after:inset-0 after:content-[''] hover:text-white"
          >
            {product.name}
          </Link>
        </h3>
        <p className="font-display text-xl tracking-wide text-white">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
