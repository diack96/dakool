'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { buildCartMessage, whatsappUrl } from '@/lib/whatsapp';
import ProductVisual from './ProductVisual';

export default function CartSidebar() {
  const { cart, isOpen, closeCart, removeFromCart, updateQty, cartTotal, cartCount } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  /* Échap ferme, le scroll de la page est bloqué, et le focus revient
     à l'élément qui a ouvert le panier. */
  useEffect(() => {
    if (!isOpen) return;

    lastFocused.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocused.current?.focus();
    };
  }, [isOpen, closeCart]);

  return (
    <>
      <div
        onClick={closeCart}
        aria-hidden
        className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-panier"
        inert={!isOpen}
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line bg-elevated transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 id="titre-panier" className="font-display text-2xl tracking-wide text-fg">
            Mon Panier
            {cartCount > 0 && <span className="ml-2 text-accent">({cartCount})</span>}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="p-1 text-mute transition-colors hover:text-fg"
          >
            <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 text-mute">
              <FontAwesomeIcon icon={faCartShopping} className="h-10 w-10 opacity-20" />
              <p className="text-sm uppercase tracking-label">Ton panier est vide</p>
              <Link
                href="/produits"
                onClick={closeCart}
                className="bg-inverse px-6 py-3 text-xs font-black uppercase tracking-cta text-on-inverse transition-colors hover:bg-accent"
              >
                Continuer mes achats
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {cart.map((item) => (
                <li key={item.key} className="flex items-start gap-4 py-4">
                  <Link
                    href={`/produits/${item.slug}`}
                    onClick={closeCart}
                    className="h-16 w-16 shrink-0 border border-line bg-bg p-1"
                  >
                    <ProductVisual category={item.category} />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produits/${item.slug}`}
                      onClick={closeCart}
                      className="block truncate text-sm font-semibold text-fg transition-colors hover:text-fg"
                    >
                      {item.name}
                    </Link>

                    {(item.size || item.color) && (
                      <p className="mt-0.5 text-xs text-mute-dim">
                        {[item.size, item.color].filter(Boolean).join(' · ')}
                      </p>
                    )}

                    <p className="mt-0.5 text-sm text-accent">{formatPrice(item.price)}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(item.key, -1)}
                        aria-label={`Réduire la quantité de ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center border border-line text-sm text-fg transition-colors hover:border-line-strong"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm text-fg" aria-live="polite">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.key, 1)}
                        aria-label={`Augmenter la quantité de ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center border border-line text-sm text-fg transition-colors hover:border-line-strong"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.key)}
                    aria-label={`Retirer ${item.name} du panier`}
                    className="p-1 text-mute-dim transition-colors hover:text-fg"
                  >
                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <footer className="border-t border-line px-6 py-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs uppercase tracking-label text-mute">Total</span>
              <strong className="font-display text-2xl tracking-wide text-fg">
                {formatPrice(cartTotal)}
              </strong>
            </div>
            {/* Pas de tunnel de commande : le panier part directement dans la
                conversation, l'adresse et le paiement s'y règlent. */}
            <a
              href={whatsappUrl(buildCartMessage(cart, cartTotal))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeCart}
              className="flex w-full items-center justify-center gap-2.5 bg-inverse py-4 text-sm font-black uppercase tracking-cta text-on-inverse transition-colors hover:bg-accent"
            >
              <FontAwesomeIcon icon={faWhatsapp} className="h-4 w-4" />
              Commander sur WhatsApp
            </a>
            <p className="mt-3 text-center text-xs text-mute-dim">
              Livraison et paiement se règlent dans la conversation.
            </p>
          </footer>
        )}
      </aside>
    </>
  );
}
