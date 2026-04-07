import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { teams } from '@/data/teams';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faShirt, faMedal, faHandshake, faBullhorn } from '@fortawesome/free-solid-svg-icons';

const impacts = [
  { icon: faShirt, color: '#00853F', title: 'Équipements Complets', desc: 'Maillots domicile et extérieur, survêtements, chaussettes, sacs et accessoires pour toute la saison.' },
  { icon: faMedal, color: '#FDEF42', title: 'Qualité Professionnelle', desc: 'Tissu technique respirant, broderies premium, coupes étudiées avec des professionnels du sport.' },
  { icon: faHandshake, color: '#00853F', title: 'Support Financier', desc: 'Sponsoring des déplacements, primes de performance et soutien logistique tout au long de la saison.' },
  { icon: faBullhorn, color: '#E31E24', title: 'Visibilité Nationale', desc: 'Mise en avant des clubs sur tous les canaux digitaux DAKOOL — Instagram, TikTok, Facebook et YouTube.' },
];

export default function EquipesPage() {
  return (
    <>
      <PageHero
        tag="Partenariats Officiels"
        title="Nos"
        highlight="Équipes"
        subtitle="8 clubs d'élite du football sénégalais équipés par DAKOOL, de la Ligue 1 jusqu'aux académies."
      />

      {/* Teams Grid */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10 border-b border-white/5 pb-6">
            <span className="text-[#00853F] text-[11px] font-bold uppercase tracking-[0.3em] font-sans block mb-2">8 Clubs Partenaires</span>
            <h2 className="text-5xl sm:text-7xl font-black text-white uppercase leading-none" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              Les Champions DAKOOL
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {teams.map(team => (
              <div key={team.id} className="bg-black hover:bg-[#0d0d0d] p-8 group transition-colors duration-200">
                <div
                  className="w-16 h-16 mb-5 flex items-center justify-center text-white font-black"
                  style={{ backgroundColor: team.color, fontFamily: "'Bebas Neue', cursive", fontSize: '14px', letterSpacing: '0.05em' }}
                >
                  {team.acronym.slice(0, 3)}
                </div>
                <h3 className="text-white font-black text-lg mb-1 uppercase leading-tight" style={{ fontFamily: "'Bebas Neue', cursive" }}>{team.name}</h3>
                <p className="text-gray-600 font-sans text-xs flex items-center gap-1.5 mb-2">
                  <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 text-[#00853F]" />
                  {team.city}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] px-2 py-1 border border-[#00853F]/30 text-[#00853F] font-sans">{team.league}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] px-2 py-1 border border-white/10 text-gray-600 font-sans">Depuis {team.since}</span>
                </div>
                <p className="text-gray-600 font-sans text-xs leading-relaxed">{team.description}</p>
                <div className="w-6 h-[2px] bg-[#00853F] mt-5 group-hover:w-12 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 bg-[#050505] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10 border-b border-white/5 pb-6">
            <span className="text-[#00853F] text-[11px] font-bold uppercase tracking-[0.3em] font-sans block mb-2">Notre Impact</span>
            <h2 className="text-5xl sm:text-7xl font-black text-white uppercase leading-none" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              Ce que DAKOOL Apporte
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {impacts.map(item => (
              <div key={item.title} className="bg-[#050505] hover:bg-[#0d0d0d] p-8 group transition-colors">
                <div className="w-10 h-10 border border-white/10 flex items-center justify-center mb-5">
                  <FontAwesomeIcon icon={item.icon} className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <h4 className="text-white font-black mb-3 uppercase text-lg" style={{ fontFamily: "'Bebas Neue', cursive" }}>{item.title}</h4>
                <p className="text-gray-600 font-sans text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#00853F] py-24 relative overflow-hidden">
        <span
          className="absolute right-0 top-1/2 -translate-y-1/2 text-white/10 font-black leading-none select-none hidden lg:block"
          style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '280px' }}
        >
          DK
        </span>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <span className="text-white/60 text-[11px] font-bold uppercase tracking-[0.35em] font-sans block mb-4">Rejoignez DAKOOL</span>
          <h2
            className="text-5xl sm:text-7xl font-black text-white uppercase leading-[0.9] mb-8 max-w-2xl"
            style={{ fontFamily: "'Bebas Neue', cursive" }}
          >
            Devenir Partenaire
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="bg-black hover:bg-white text-white hover:text-black font-black uppercase tracking-[0.15em] px-8 py-4 text-sm transition-colors font-sans">
              Nous contacter →
            </Link>
            <Link href="/produits" className="border border-white/30 hover:border-white text-white font-black uppercase tracking-[0.15em] px-8 py-4 text-sm transition-colors font-sans">
              Voir les équipements
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
