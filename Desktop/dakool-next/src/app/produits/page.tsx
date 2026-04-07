'use client';

import { useState } from 'react';
import PageHero from '@/components/PageHero';
import ProductCard from '@/components/ProductCard';
import { products, categories } from '@/data/products';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGrip, faShirt, faShoePrints, faFutbol, faVest, faTag } from '@fortawesome/free-solid-svg-icons';

const catIcons: Record<string, typeof faGrip> = {
  Tous: faGrip,
  Maillots: faShirt,
  Chaussures: faShoePrints,
  Ballons: faFutbol,
  Équipements: faVest,
  Accessoires: faTag,
};

export default function ProduitsPage() {
  const [active, setActive] = useState('Tous');

  const filtered = active === 'Tous' ? products : products.filter(p => p.category === active);

  return (
    <>
      <PageHero
        tag="Boutique DAKOOL"
        title="Nos"
        highlight="Produits"
        subtitle="Équipements professionnels conçus pour les champions sénégalais."
      />

      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Filter bar */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] font-sans transition-all border ${
                  active === cat
                    ? 'bg-white border-white text-black'
                    : 'bg-transparent border-white/10 text-gray-500 hover:border-white/40 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={catIcons[cat] || faGrip} className="w-3 h-3" />
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/5">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
    </>
  );
}
