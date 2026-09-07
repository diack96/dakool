'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheck, faTruckFast, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { buildProductMessage, whatsappUrl } from '@/lib/whatsapp';
import { useProductVariant } from '@/components/ProductVariant';
import type { Product } from '@/data/products';

export default function BuyPanel({ product }: { product: Product }) {
  const { addToCart, openCart } = useCart();
  const singleSize = product.sizes.length === 1;

  const { color, selectColor } = useProductVariant();
  const [size, setSize] = useState<string | null>(singleSize ? product.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);

  const handleAdd = () => {
    if (!size) {
      setError(true);
      return;
    }
    addToCart(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        category: product.category,
        size,
        color,
      },
      qty,
    );
    openCart();
  };

  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-brand text-fg">
        {product.category}
      </p>
      <h1 className="mb-3 font-display text-title text-fg">{product.name}</h1>
      <p className="mb-6 text-base text-mute">{product.tagline}</p>

      <p className="mb-8 flex items-baseline gap-3">
        <span className="font-display text-4xl text-fg">{formatPrice(product.price)}</span>
        {product.inStock ? (
          <span className="text-xs uppercase tracking-label text-accent">En stock</span>
        ) : (
          <span className="text-xs uppercase tracking-label text-fg">Rupture</span>
        )}
      </p>

      {/* Coloris */}
      {product.colors.length > 0 && (
        <fieldset className="mb-7">
          <legend className="mb-3 text-[10px] font-black uppercase tracking-label text-mute-dim">
            Coloris — <span className="text-fg">{color}</span>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => selectColor(c.name)}
                aria-pressed={color === c.name}
                aria-label={c.name}
                title={c.name}
                /* Bordure toujours marquée : sans elle, la pastille « Noir »
                   disparaîtrait sur le fond sombre du panneau. */
                className={`h-10 w-10 border-2 transition-colors ${
                  color === c.name ? 'border-fg' : 'border-line-strong hover:border-fg/60'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </fieldset>
      )}

      {/* Tailles */}
      <fieldset className="mb-7">
        <legend className="mb-3 text-[10px] font-black uppercase tracking-label text-mute-dim">
          {singleSize ? 'Format' : 'Taille'}
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSize(s);
                setError(false);
              }}
              aria-pressed={size === s}
              className={`min-w-14 border px-4 py-3 text-xs font-black uppercase tracking-cta transition-colors ${
                size === s
                  ? 'border-fg bg-inverse text-on-inverse'
                  : 'border-line text-mute hover:border-line-strong hover:text-fg'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-3 text-xs text-fg">
            Sélectionne ta taille.
          </p>
        )}
      </fieldset>

      {/* Quantité */}
      <div className="mb-8">
        <span className="mb-3 block text-[10px] font-black uppercase tracking-label text-mute-dim">
          Quantité
        </span>
        <div className="inline-flex items-center border border-line">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Réduire la quantité"
            className="px-4 py-3 text-fg transition-colors hover:bg-elevated"
          >
            −
          </button>
          <span className="w-10 text-center text-sm text-fg" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Augmenter la quantité"
            className="px-4 py-3 text-fg transition-colors hover:bg-elevated"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!product.inStock}
        className="flex w-full items-center justify-center gap-2.5 bg-inverse py-4.5 text-sm font-black uppercase tracking-cta text-on-inverse transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
      >
        <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
        Ajouter au panier
      </button>

      {/* Commande directe pour un article seul, sans passer par le panier. */}
      <a
        href={whatsappUrl(
          buildProductMessage({
            name: product.name,
            size: size ?? undefined,
            color,
            qty,
            price: product.price,
          }),
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 flex w-full items-center justify-center gap-2.5 border border-line-strong py-4 text-sm font-black uppercase tracking-cta text-fg transition-colors hover:bg-inverse hover:text-on-inverse"
      >
        <FontAwesomeIcon icon={faWhatsapp} className="h-4 w-4" />
        Commander sur WhatsApp
      </a>

      <ul className="mt-8 space-y-3 border-t border-line pt-8">
        <li className="flex items-start gap-3 text-sm text-mute">
          <FontAwesomeIcon icon={faTruckFast} className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          Expédition sous 48h pour les articles en stock. Délai de livraison selon la destination.
        </li>
        <li className="flex items-start gap-3 text-sm text-mute">
          <FontAwesomeIcon icon={faRotateLeft} className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          Retour gratuit sous 14 jours si l&apos;article n&apos;a pas été porté.
        </li>
        <li className="flex items-start gap-3 text-sm text-mute">
          <FontAwesomeIcon icon={faCheck} className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          Garantie 30 jours contre les défauts de fabrication.
        </li>
      </ul>
    </div>
  );
}
