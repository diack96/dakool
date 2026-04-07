'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCartShopping, faLock } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/context/CartContext';

function formatPrice(price: number) {
  return price.toLocaleString('fr-FR') + ' FCFA';
}

export default function CartSidebar() {
  const { cart, isOpen, closeCart, removeFromCart, updateQty, cartTotal } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#0d0d0d] border-l border-white/5 z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h3 className="text-white font-black text-xl uppercase tracking-[0.2em]" style={{ fontFamily: "'Bebas Neue', cursive" }}>Mon Panier</h3>
          <button onClick={closeCart} className="text-gray-500 hover:text-white transition-colors p-1">
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-600">
              <FontAwesomeIcon icon={faCartShopping} className="w-10 h-10 opacity-20" />
              <p className="font-sans text-sm uppercase tracking-wider">Panier vide</p>
              <button
                onClick={closeCart}
                className="bg-white hover:bg-[#00853F] text-black hover:text-white text-xs font-black uppercase tracking-[0.15em] px-6 py-3 transition-colors font-sans"
              >
                Voir les produits
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-white/5">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <div className="w-14 h-14 bg-black border border-white/5 flex items-center justify-center text-xl shrink-0">⚽</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold font-sans truncate">{item.name}</p>
                    <p className="text-[#00853F] text-sm font-sans mt-0.5">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 border border-white/10 hover:border-white/30 text-white text-xs font-bold transition-colors font-sans flex items-center justify-center">−</button>
                      <span className="text-white text-sm font-sans w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 border border-white/10 hover:border-white/30 text-white text-xs font-bold transition-colors font-sans flex items-center justify-center">+</button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-white transition-colors p-1">
                    <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-white/5">
            <div className="flex items-center justify-between mb-5">
              <span className="text-gray-500 font-sans text-xs uppercase tracking-[0.2em]">Total</span>
              <strong className="text-white font-black text-xl" style={{ fontFamily: "'Bebas Neue', cursive" }}>{formatPrice(cartTotal)}</strong>
            </div>
            <button
              className="w-full bg-white hover:bg-[#00853F] text-black hover:text-white font-black uppercase tracking-[0.15em] py-4 flex items-center justify-center gap-2 text-sm transition-colors font-sans"
              onClick={() => alert('Fonctionnalité de paiement à venir !')}
            >
              <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5" />
              Commander
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
