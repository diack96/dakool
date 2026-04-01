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
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#111] border-l border-white/10 z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h3 className="text-white font-black text-xl tracking-widest" style={{ fontFamily: "'Bebas Neue', cursive" }}>Mon Panier</h3>
          <button onClick={closeCart} className="text-gray-400 hover:text-white transition-colors">
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
              <FontAwesomeIcon icon={faCartShopping} className="w-12 h-12 opacity-30" />
              <p className="font-sans text-sm">Votre panier est vide</p>
              <button onClick={closeCart} className="bg-[#00853F] hover:bg-[#006830] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors font-sans">
                Voir les produits
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                  <div className="w-12 h-12 rounded-lg bg-[#00853F]/10 border border-[#00853F]/20 flex items-center justify-center text-xl shrink-0">⚽</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold font-sans truncate">{item.name}</p>
                    <p className="text-[#00853F] text-sm font-sans">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors font-sans">−</button>
                      <span className="text-white text-sm font-sans">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors font-sans">+</button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-sans text-sm">Total</span>
            <strong className="text-white font-black text-lg" style={{ fontFamily: "'Bebas Neue', cursive" }}>{formatPrice(cartTotal)}</strong>
          </div>
          <button
            className="w-full bg-[#00853F] hover:bg-[#006830] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-sans"
            onClick={() => alert('Fonctionnalité de paiement à venir !')}
          >
            <FontAwesomeIcon icon={faLock} className="w-4 h-4" />
            Commander
          </button>
        </div>
      </aside>
    </>
  );
}
