'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faHeart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/data/products';
import { useState } from 'react';

const badgeStyles = {
  green: 'bg-[#00853F] text-white',
  yellow: 'bg-[#FDEF42] text-black',
  red: 'bg-[#E31E24] text-white',
};

const categoryEmoji: Record<string, string> = {
  Maillots: '👕',
  Chaussures: '👟',
  Ballons: '⚽',
  Équipements: '🎽',
  Accessoires: '🧢',
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, openCart } = useCart();
  const [wished, setWished] = useState(false);

  const handleAdd = () => {
    addToCart({ id: product.id, name: product.name, price: product.price, category: product.category });
    openCart();
  };

  return (
    <div className="bg-black group cursor-pointer">
      {/* Image area */}
      <div className="relative bg-[#0d0d0d] aspect-square flex items-center justify-center overflow-hidden">
        <div className="text-7xl transition-transform duration-500 group-hover:scale-110">
          {categoryEmoji[product.category] ?? '📦'}
        </div>

        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-[0.15em] px-2 py-1 font-sans ${badgeStyles[product.badge.color]}`}>
            {product.badge.label}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={() => setWished(!wished)}
          className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/80 flex items-center justify-center transition-colors"
          aria-label="Favoris"
        >
          <FontAwesomeIcon
            icon={faHeart}
            className={`w-3.5 h-3.5 transition-colors ${wished ? 'text-[#E31E24]' : 'text-white/40'}`}
          />
        </button>

        {/* Slide-up cart button */}
        <button
          onClick={handleAdd}
          className="absolute bottom-0 left-0 right-0 bg-white hover:bg-[#00853F] text-black hover:text-white py-3.5 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] font-sans translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
          Ajouter au panier
        </button>
      </div>

      {/* Info */}
      <div className="bg-black px-0 pt-3 pb-1">
        <p className="text-[#00853F] font-sans text-[10px] font-bold uppercase tracking-[0.25em] mb-1">{product.category}</p>
        <p className="text-white font-semibold font-sans text-sm leading-tight mb-2">{product.name}</p>
        <p className="text-white font-black font-sans text-base" style={{ fontFamily: "'Bebas Neue', cursive" }}>
          {product.price.toLocaleString('fr-FR')}{' '}
          <span className="text-gray-500 text-xs font-sans font-normal">FCFA</span>
        </p>
      </div>
    </div>
  );
}
