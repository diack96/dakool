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
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#00853F]/10 border border-[#00853F]/30 text-[#00853F] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full font-sans mb-4">8 Clubs Partenaires</span>
            <h2 className="text-4xl sm:text-6xl font-black text-white" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              Les <span className="bg-gradient-to-r from-[#00853F] to-[#FDEF42] bg-clip-text text-transparent">Champions</span> DAKOOL
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#00853F] to-[#FDEF42] mx-auto mt-4 rounded-full" />
            <p className="text-gray-400 font-sans mt-4">Ensemble, nous construisons le football sénégalais de demain. Chaque maillot raconte une histoire.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teams.map(team => (
              <div key={team.id} className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-[#00853F]/30 hover:shadow-xl hover:shadow-[#00853F]/5 transition-all">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-black text-2xl" style={{ backgroundColor: team.color, fontFamily: "'Bebas Neue', cursive" }}>
                  {team.acronym.slice(0, 3)}
                </div>
                <h3 className="text-white font-black text-lg text-center mb-1" style={{ fontFamily: "'Bebas Neue', cursive" }}>{team.name}</h3>
                <p className="text-gray-500 font-sans text-sm text-center flex items-center justify-center gap-1 mb-3">
                  <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 text-[#00853F]" />
                  {team.city}
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  <span className="text-xs bg-[#00853F]/10 text-[#00853F] border border-[#00853F]/20 px-2 py-0.5 rounded-full font-sans">{team.league}</span>
                  <span className="text-xs bg-[#FDEF42]/10 text-[#FDEF42] border border-[#FDEF42]/20 px-2 py-0.5 rounded-full font-sans">Depuis {team.since}</span>
                </div>
                <p className="text-gray-500 font-sans text-sm leading-relaxed text-center">{team.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 bg-[#0d0d0d] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#00853F]/10 border border-[#00853F]/30 text-[#00853F] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full font-sans mb-4">Notre Impact</span>
            <h2 className="text-4xl sm:text-6xl font-black text-white" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              Ce que <span className="bg-gradient-to-r from-[#00853F] to-[#FDEF42] bg-clip-text text-transparent">DAKOOL</span> Apporte
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#00853F] to-[#FDEF42] mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impacts.map(item => (
              <div key={item.title} className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-[#00853F]/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={item.icon} className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <h4 className="text-white font-black mb-2" style={{ fontFamily: "'Bebas Neue', cursive" }}>{item.title}</h4>
                <p className="text-gray-500 font-sans text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0a0a0a] border-t border-white/10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-[#00853F]/10 border border-[#00853F]/30 text-[#00853F] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full font-sans mb-6">Rejoignez DAKOOL</span>
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', cursive" }}>
            Devenir <span className="bg-gradient-to-r from-[#00853F] to-[#FDEF42] bg-clip-text text-transparent">Partenaire</span>
          </h2>
          <p className="text-gray-400 font-sans mb-8">Votre club mérite les meilleurs équipements. Rejoignez la famille DAKOOL et équipez vos joueurs comme des champions.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="bg-[#00853F] hover:bg-[#006830] text-white font-bold px-8 py-4 rounded-xl transition-all font-sans">Nous Contacter</Link>
            <Link href="/produits" className="border border-white/20 hover:border-[#00853F]/50 text-white font-bold px-8 py-4 rounded-xl transition-all font-sans">Voir les équipements</Link>
          </div>
        </div>
      </section>
    </>
  );
}
