'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faHeart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/data/products';
import { useState } from 'react';

const badgeColors = {
  green: 'bg-[#00853F]/20 text-[#00853F] border border-[#00853F]/30',
  yellow: 'bg-[#FDEF42]/20 text-[#FDEF42] border border-[#FDEF42]/30',
  red: 'bg-[#E31E24]/20 text-[#E31E24] border border-[#E31E24]/30',
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, openCart } = useCart();
  const [wished, setWished] = useState(false);

  const handleAdd = () => {
    addToCart({ id: product.id, name: product.name, price: product.price, category: product.category });
    openCart();
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-[#00853F]/40 hover:shadow-xl hover:shadow-[#00853F]/10 transition-all duration-300 group">
      {/* Image area */}
      <div className="relative bg-[#0a0a0a] p-6 flex items-center justify-center h-48">
        <div className="text-6xl">
          {product.category === 'Maillots' ? '👕' :
           product.category === 'Chaussures' ? '👟' :
           product.category === 'Ballons' ? '⚽' :
           product.category === 'Équipements' ? '🎽' : '🧢'}
        </div>
        {product.badge && (
          <span className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full font-sans ${badgeColors[product.badge.color]}`}>
            {product.badge.label}
          </span>
        )}
        <button
          onClick={() => setWished(!wished)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <FontAwesomeIcon icon={faHeart} className={`w-4 h-4 transition-colors ${wished ? 'text-[#E31E24]' : 'text-gray-500'}`} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[#00853F] font-sans text-xs font-semibold uppercase tracking-wider mb-1">{product.category}</p>
        <p className="text-white font-semibold font-sans mb-3 leading-tight">{product.name}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-white font-black text-lg" style={{ fontFamily: "'Bebas Neue', cursive" }}>
            {product.price.toLocaleString('fr-FR')} <span className="text-sm text-gray-400 font-sans font-normal">FCFA</span>
          </span>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 bg-[#00853F] hover:bg-[#006830] text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors font-sans"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
