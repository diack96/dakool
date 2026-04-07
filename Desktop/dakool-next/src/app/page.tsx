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
      <section className="relative min-h-screen flex items-end bg-black overflow-hidden">
        {/* Decorative background lines */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Vertical line */}
          <div className="absolute top-0 bottom-0 right-[15%] w-px bg-white/3" />
          {/* Horizontal accent */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/3" />
          {/* Big decorative number */}
          <span
            className="absolute bottom-16 right-8 text-white/[0.03] font-black leading-none select-none hidden lg:block"
            style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '320px' }}
          >
            01
          </span>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-24">
          {/* Tag */}
          <div className="flex items-center gap-3 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#00853F] shrink-0" />
            <span className="text-[#00853F] text-xs font-bold uppercase tracking-[0.35em] font-sans">
              L&apos;Équipementier du Lion · Dakar, Sénégal
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-black text-white uppercase leading-[0.88] tracking-tight mb-8"
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 'clamp(72px, 14vw, 200px)',
            }}
          >
            ÉQUIPÉ<br />
            POUR<br />
            <span className="text-[#00853F]">GAGNER</span>
          </h1>

          {/* Sub + CTAs */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-8 sm:gap-16">
            <p className="text-gray-500 font-sans text-base sm:text-lg max-w-sm leading-relaxed">
              La première marque d&apos;équipements sportifs 100% Sénégalaise.
              Des maillots aux chaussures — DAKOOL équipe les champions.
            </p>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/produits"
                className="bg-white hover:bg-[#00853F] text-black hover:text-white font-black uppercase tracking-[0.15em] px-8 py-4 text-sm transition-colors duration-200 font-sans"
              >
                Découvrir →
              </Link>
              <Link
                href="/equipes"
                className="border border-white/20 hover:border-white text-white font-black uppercase tracking-[0.15em] px-8 py-4 text-sm transition-colors duration-200 font-sans"
              >
                Nos équipes
              </Link>
            </div>
          </div>
        </div>

        {/* Senegalese flag bar */}
        <div className="absolute bottom-0 left-0 right-0 flex h-[3px]">
          <span className="flex-1 bg-[#00853F]" />
          <span className="flex-1 bg-[#FDEF42]" />
          <span className="flex-1 bg-[#E31E24]" />
        </div>
      </section>

      {/* STATS */}
      <section className="bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/5">
            {stats.map(stat => (
              <div key={stat.label} className="py-10 px-6 text-center">
                <div
                  className="text-5xl sm:text-6xl font-black text-white leading-none mb-2"
                  style={{ fontFamily: "'Bebas Neue', cursive" }}
                >
                  {stat.value}
                </div>
                <div className="text-gray-600 font-sans text-[11px] uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10 border-b border-white/5 pb-6">
            <div>
              <span className="text-[#00853F] text-[11px] font-bold uppercase tracking-[0.3em] font-sans block mb-2">Nouveautés</span>
              <h2
                className="text-5xl sm:text-7xl font-black text-white uppercase leading-none"
                style={{ fontFamily: "'Bebas Neue', cursive" }}
              >
                Nos Produits
              </h2>
            </div>
            <Link
              href="/produits"
              className="hidden sm:flex items-center gap-2 text-white text-xs font-black uppercase tracking-[0.2em] font-sans border-b border-white/30 pb-0.5 hover:border-[#00853F] hover:text-[#00853F] transition-colors mb-1"
            >
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link
              href="/produits"
              className="inline-block border border-white/20 hover:border-white text-white font-black uppercase tracking-[0.15em] px-8 py-4 text-sm transition-colors font-sans"
            >
              Voir tous les produits →
            </Link>
          </div>
        </div>
      </section>

      {/* TEAMS */}
      <section className="py-20 bg-[#050505] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10 border-b border-white/5 pb-6">
            <div>
              <span className="text-[#00853F] text-[11px] font-bold uppercase tracking-[0.3em] font-sans block mb-2">Partenariats</span>
              <h2
                className="text-5xl sm:text-7xl font-black text-white uppercase leading-none"
                style={{ fontFamily: "'Bebas Neue', cursive" }}
              >
                Nos Équipes
              </h2>
            </div>
            <Link
              href="/equipes"
              className="hidden sm:flex items-center gap-2 text-white text-xs font-black uppercase tracking-[0.2em] font-sans border-b border-white/30 pb-0.5 hover:border-[#00853F] hover:text-[#00853F] transition-colors mb-1"
            >
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5">
            {teams.map(team => (
              <div key={team.id} className="bg-[#050505] hover:bg-[#0d0d0d] p-8 group transition-colors duration-200 cursor-pointer">
                <div
                  className="w-12 h-12 mb-5 flex items-center justify-center text-white font-black text-sm shrink-0"
                  style={{ backgroundColor: team.color, fontFamily: "'Bebas Neue', cursive", fontSize: '13px', letterSpacing: '0.05em' }}
                >
                  {team.acronym.slice(0, 3)}
                </div>
                <p className="text-white font-bold font-sans text-sm leading-tight mb-1">{team.name}</p>
                <p className="text-gray-600 font-sans text-xs mb-4">{team.city}</p>
                <div className="w-6 h-[2px] bg-[#00853F] group-hover:w-12 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-[#00853F] py-24 relative overflow-hidden">
        {/* Decorative */}
        <span
          className="absolute right-0 top-1/2 -translate-y-1/2 text-white/10 font-black leading-none select-none hidden lg:block"
          style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '280px' }}
        >
          DK
        </span>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <span className="text-white/60 text-[11px] font-bold uppercase tracking-[0.35em] font-sans block mb-4">Partenariat</span>
          <h2
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-white uppercase leading-[0.9] mb-8 max-w-3xl"
            style={{ fontFamily: "'Bebas Neue', cursive" }}
          >
            Votre Club Mérite le Meilleur
          </h2>
          <Link
            href="/contact"
            className="inline-block bg-black hover:bg-white text-white hover:text-black font-black uppercase tracking-[0.15em] px-10 py-5 text-sm transition-colors duration-200 font-sans"
          >
            Nous contacter →
          </Link>
        </div>
      </section>

      {/* BRAND STATEMENT */}
      <section className="bg-black py-24 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p
            className="font-black text-white/5 uppercase text-center leading-none select-none"
            style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(60px, 12vw, 160px)' }}
          >
            DAKOOL · DAKAR · SÉNÉGAL
          </p>
        </div>
      </section>
    </>
  );
}
