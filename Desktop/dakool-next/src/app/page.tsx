import Link from 'next/link';
import { products } from '@/data/products';
import { teams } from '@/data/teams';
import ProductCard from '@/components/ProductCard';

const stats = [
  { value: '8', label: 'Clubs Partenaires' },
  { value: '12', label: 'Tournois Sponsorisés' },
  { value: '500+', label: 'Maillots Distribués' },
  { value: '2020', label: 'Fondée à Dakar' },
];

export default function Home() {
  const featured = products.slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#080808]">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,133,63,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,133,63,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00853F]/5 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
          <span className="inline-block bg-[#00853F]/10 border border-[#00853F]/30 text-[#00853F] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full font-sans mb-8">
            🇸🇳 L&apos;Équipementier du Lion
          </span>
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black text-white tracking-tight leading-none mb-6" style={{ fontFamily: "'Bebas Neue', cursive" }}>
            Équipé
            <br />
            <span className="bg-gradient-to-r from-[#00853F] via-[#FDEF42] to-[#00853F] bg-clip-text text-transparent">
              pour Gagner
            </span>
          </h1>
          <p className="text-gray-400 font-sans text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            La première marque d&apos;équipements sportifs 100% Sénégalaise. Des maillots aux chaussures,
            des ballons aux accessoires — DAKOOL équipe les champions.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/produits" className="bg-[#00853F] hover:bg-[#006830] text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 font-sans text-base hover:scale-105">
              Découvrir la boutique
            </Link>
            <Link href="/equipes" className="border border-white/20 hover:border-[#00853F]/50 text-white hover:text-[#00853F] font-bold px-8 py-4 rounded-xl transition-all duration-200 font-sans text-base">
              Nos équipes
            </Link>
          </div>
        </div>

        {/* Flag bar */}
        <div className="absolute bottom-0 left-0 right-0 flex h-1">
          <span className="flex-1 bg-[#00853F]" />
          <span className="flex-1 bg-[#FDEF42]" />
          <span className="flex-1 bg-[#E31E24]" />
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[#0d0d0d] border-y border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl sm:text-5xl font-black text-[#00853F] mb-1" style={{ fontFamily: "'Bebas Neue', cursive" }}>{stat.value}</div>
                <div className="text-gray-500 font-sans text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#00853F]/10 border border-[#00853F]/30 text-[#00853F] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full font-sans mb-4">
              Nouveautés
            </span>
            <h2 className="text-4xl sm:text-6xl font-black text-white" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              Nos <span className="bg-gradient-to-r from-[#00853F] to-[#FDEF42] bg-clip-text text-transparent">Produits</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#00853F] to-[#FDEF42] mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-10">
            <Link href="/produits" className="inline-flex items-center gap-2 border border-[#00853F]/40 hover:border-[#00853F] text-[#00853F] font-semibold px-6 py-3 rounded-xl transition-all font-sans">
              Voir tous les produits →
            </Link>
          </div>
        </div>
      </section>

      {/* TEAMS */}
      <section className="py-20 bg-[#0d0d0d] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#00853F]/10 border border-[#00853F]/30 text-[#00853F] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full font-sans mb-4">
              Partenariats
            </span>
            <h2 className="text-4xl sm:text-6xl font-black text-white" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              Nos <span className="bg-gradient-to-r from-[#00853F] to-[#FDEF42] bg-clip-text text-transparent">Équipes</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#00853F] to-[#FDEF42] mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {teams.map(team => (
              <div key={team.id} className="bg-[#111] border border-white/10 rounded-2xl p-6 text-center hover:border-[#00853F]/30 transition-all group">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-black text-xl" style={{ backgroundColor: team.color, fontFamily: "'Bebas Neue', cursive" }}>
                  {team.acronym.slice(0, 3)}
                </div>
                <p className="text-white font-semibold font-sans text-sm">{team.name}</p>
                <p className="text-gray-500 font-sans text-xs mt-1">{team.city}</p>
                <span className="inline-block mt-2 text-xs bg-[#00853F]/10 text-[#00853F] border border-[#00853F]/20 px-2 py-0.5 rounded-full font-sans">{team.league}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/equipes" className="inline-flex items-center gap-2 border border-[#00853F]/40 hover:border-[#00853F] text-[#00853F] font-semibold px-6 py-3 rounded-xl transition-all font-sans">
              Voir toutes les équipes →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0a0a0a] border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', cursive" }}>
            Rejoignez la <span className="bg-gradient-to-r from-[#00853F] to-[#FDEF42] bg-clip-text text-transparent">Famille DAKOOL</span>
          </h2>
          <p className="text-gray-400 font-sans text-lg mb-8">
            Votre club mérite les meilleurs équipements. Contactez-nous pour un partenariat.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-[#00853F] hover:bg-[#006830] text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 font-sans">
            Nous contacter
          </Link>
        </div>
      </section>
    </>
  );
}
