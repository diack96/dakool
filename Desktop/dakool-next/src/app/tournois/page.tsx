import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faTrophy, faHandshake, faPlay, faFlagCheckered, faRotate, faShield, faArrowDown, faStar, faLocationDot, faUsers, faGift, faCheck, faShirt } from '@fortawesome/free-solid-svg-icons';

type Tournament = {
  id: string;
  emoji: string;
  badges: { label: string; color: string }[];
  title: string;
  description: string;
  calendar: string[];
  prizes: { amount: string; label: string }[];
  package: string[];
};

const tournaments: Tournament[] = [
  {
    id: 't1',
    emoji: '🏆',
    badges: [
      { label: 'Officiel', color: 'bg-[#00853F]/20 text-[#00853F] border-[#00853F]/30' },
      { label: 'Ligue 1', color: 'bg-[#FDEF42]/20 text-[#FDEF42] border-[#FDEF42]/30' },
      { label: 'Saison 2024–2025', color: 'bg-[#00853F]/20 text-[#00853F] border-[#00853F]/30' },
    ],
    title: 'Ligue 1 Sénégalaise',
    description: "Le championnat national de première division, la plus haute compétition de football au Sénégal. DAKOOL est fier d'équiper 6 clubs et de sponsoriser les trophées officiels de la saison 2024–2025.",
    calendar: ['Début : Août 2024', 'Fin : Juin 2025', 'Format : Championnat aller-retour', '16 clubs participants', '3 relégations en Ligue 2'],
    prizes: [{ amount: '15 000 000', label: 'FCFA — 1er prix (Champion)' }, { amount: '8 000 000', label: 'FCFA — 2e place (Vice-champion)' }, { amount: '4 000 000', label: 'FCFA — 3e place' }],
    package: ['Équipements pour 6 clubs partenaires', 'Trophée officiel DAKOOL', 'Maillots du meilleur joueur', 'Branding sur panneaux publicitaires', 'Médailles DAKOOL pour finalistes'],
  },
  {
    id: 't2',
    emoji: '🥇',
    badges: [
      { label: 'Officiel', color: 'bg-[#FDEF42]/20 text-[#FDEF42] border-[#FDEF42]/30' },
      { label: 'Knock-out', color: 'bg-[#00853F]/20 text-[#00853F] border-[#00853F]/30' },
      { label: '2024–2025', color: 'bg-[#FDEF42]/20 text-[#FDEF42] border-[#FDEF42]/30' },
    ],
    title: 'Coupe du Sénégal',
    description: "La coupe nationale, ouverte à tous les clubs du Sénégal de la première à la quatrième division. Un format knock-out impitoyable qui produit chaque année des surprises mémorables. DAKOOL équipe les équipes finalistes.",
    calendar: ['Début : Octobre 2024', 'Finale : Mai 2025', 'Format : Élimination directe', '64+ clubs participants', 'Finale au Stade Léopold Sédar Senghor'],
    prizes: [{ amount: '10 000 000', label: 'FCFA — Vainqueur' }, { amount: '5 000 000', label: 'FCFA — Finaliste' }, { amount: '2 000 000', label: 'FCFA — Demi-finalistes (x2)' }],
    package: ['Trophée officiel DAKOOL gravé', 'Équipements des deux finalistes', 'Maillots spéciaux finale', 'Médailles DAKOOL (32 médailles)', 'Couverture digitale des matchs'],
  },
  {
    id: 't3',
    emoji: '🦁',
    badges: [
      { label: 'Tournoi DAKOOL', color: 'bg-[#00853F]/20 text-[#00853F] border-[#00853F]/30' },
      { label: 'Invitationnel', color: 'bg-[#FDEF42]/20 text-[#FDEF42] border-[#FDEF42]/30' },
      { label: 'Signature Event', color: 'bg-[#00853F]/20 text-[#00853F] border-[#00853F]/30' },
    ],
    title: 'Tournoi de la Téranga',
    description: 'Le tournoi signature de DAKOOL, créé en 2020 pour célébrer la "téranga". Un événement annuel unique qui réunit les meilleures équipes partenaires dans un esprit de fraternité et de compétition de haut niveau.',
    calendar: ['Dates : 15–22 Janvier 2025', 'Lieu : Stade Alassane Djigo, Pikine', '8 équipes invitées', 'Format : Phase de groupes + finale', '4e édition du tournoi'],
    prizes: [{ amount: '20 000 000', label: 'FCFA — Vainqueur' }, { amount: '10 000 000', label: 'FCFA — Finaliste' }, { amount: '5 000 000', label: 'FCFA — Meilleur buteur' }],
    package: ['Kit complet DAKOOL offert', 'Hébergement pris en charge', 'Transport aller-retour', 'Repas et collations', 'Couverture photo & vidéo pro', 'Trophée personnalisé DAKOOL'],
  },
  {
    id: 't4',
    emoji: '🏘️',
    badges: [
      { label: 'Communautaire', color: 'bg-[#E31E24]/20 text-[#E31E24] border-[#E31E24]/30' },
      { label: 'Tradition', color: 'bg-[#00853F]/20 text-[#00853F] border-[#00853F]/30' },
      { label: 'Été 2025', color: 'bg-[#FDEF42]/20 text-[#FDEF42] border-[#FDEF42]/30' },
    ],
    title: 'Navétanes',
    description: "Les Navétanes sont une institution au Sénégal — des tournois communautaires de quartier qui se déroulent chaque été dans tout le pays. DAKOOL soutient cette tradition vivante depuis 2020 en équipant des centaines d'équipes locales.",
    calendar: ['Début : Juillet 2025', 'Fin : Septembre 2025', 'Partout au Sénégal', '200+ équipes par région', '14 régions couvertes'],
    prizes: [{ amount: '500 000', label: 'FCFA — Vainqueur par zone' }, { amount: '250 000', label: 'FCFA — Finaliste par zone' }],
    package: ['500+ maillots distribués', '200+ ballons fournis', 'Arbitres équipés DAKOOL', 'Trophées régionaux gravés', 'Présence et animation DAKOOL'],
  },
];

export default function TournoisPage() {
  return (
    <>
      <PageHero
        tag="Sponsoring Sportif"
        title="Nos"
        highlight="Tournois"
        subtitle="DAKOOL soutient le football à tous les niveaux — du quartier jusqu'à l'élite nationale."
      />

      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block bg-[#00853F]/10 border border-[#00853F]/30 text-[#00853F] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full font-sans mb-4">12 Compétitions</span>
            <h2 className="text-4xl sm:text-6xl font-black text-white" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              DAKOOL <span className="bg-gradient-to-r from-[#00853F] to-[#FDEF42] bg-clip-text text-transparent">Sponsorise</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#00853F] to-[#FDEF42] mx-auto mt-4 rounded-full" />
            <p className="text-gray-400 font-sans mt-4">Chaque compétition est une opportunité de célébrer le talent sénégalais et d&apos;équiper les prochains champions.</p>
          </div>

          <div className="flex flex-col gap-8">
            {tournaments.map(t => (
              <div key={t.id} className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-[#00853F]/30 transition-all">
                {/* Header */}
                <div className="p-8 border-b border-white/10">
                  <div className="flex items-start gap-6 flex-wrap">
                    <div className="w-20 h-20 rounded-xl bg-[#00853F]/10 border border-[#00853F]/20 flex items-center justify-center text-4xl shrink-0">
                      {t.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {t.badges.map(b => (
                          <span key={b.label} className={`text-xs font-bold px-3 py-1 rounded-full border font-sans ${b.color}`}>{b.label}</span>
                        ))}
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', cursive" }}>{t.title}</h2>
                      <p className="text-gray-400 font-sans text-sm leading-relaxed">{t.description}</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                  <div className="p-6">
                    <h4 className="text-gray-500 font-sans text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendar} className="w-3 h-3 text-[#00853F]" /> Calendrier
                    </h4>
                    <ul className="space-y-2">
                      {t.calendar.map(item => (
                        <li key={item} className="text-gray-400 font-sans text-sm flex items-start gap-2">
                          <span className="text-[#00853F] mt-0.5">▸</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6">
                    <h4 className="text-gray-500 font-sans text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FontAwesomeIcon icon={faTrophy} className="w-3 h-3 text-[#FDEF42]" /> Dotations
                    </h4>
                    <ul className="space-y-3">
                      {t.prizes.map(p => (
                        <li key={p.label}>
                          <span className="font-black text-[#FDEF42] text-xl block" style={{ fontFamily: "'Bebas Neue', cursive" }}>{p.amount}</span>
                          <span className="text-gray-500 font-sans text-xs">{p.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6">
                    <h4 className="text-gray-500 font-sans text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FontAwesomeIcon icon={faHandshake} className="w-3 h-3 text-[#00853F]" /> Package DAKOOL
                    </h4>
                    <ul className="space-y-2">
                      {t.package.map(item => (
                        <li key={item} className="text-gray-400 font-sans text-sm flex items-start gap-2">
                          <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#00853F] mt-0.5 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0d0d0d] border-t border-white/10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-[#00853F]/10 border border-[#00853F]/30 text-[#00853F] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full font-sans mb-6">Sponsoring</span>
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', cursive" }}>
            Votre Tournoi <span className="bg-gradient-to-r from-[#00853F] to-[#FDEF42] bg-clip-text text-transparent">avec DAKOOL</span>
          </h2>
          <p className="text-gray-400 font-sans mb-8">Vous organisez un tournoi ? Associez-vous à DAKOOL pour équiper vos participants et bénéficier de notre soutien logistique et médiatique.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="bg-[#00853F] hover:bg-[#006830] text-white font-bold px-8 py-4 rounded-xl transition-all font-sans">Proposer un partenariat</Link>
            <Link href="/equipes" className="border border-white/20 hover:border-[#00853F]/50 text-white font-bold px-8 py-4 rounded-xl transition-all font-sans">Voir nos équipes</Link>
          </div>
        </div>
      </section>
    </>
  );
}
