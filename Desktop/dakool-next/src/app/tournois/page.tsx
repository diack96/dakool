import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faTrophy, faHandshake, faCheck } from '@fortawesome/free-solid-svg-icons';

type Tournament = {
  id: string;
  emoji: string;
  badges: { label: string; color: 'green' | 'yellow' | 'red' }[];
  title: string;
  description: string;
  calendar: string[];
  prizes: { amount: string; label: string }[];
  package: string[];
};

const badgeStyles = {
  green: 'border-[#00853F]/40 text-[#00853F]',
  yellow: 'border-[#FDEF42]/40 text-[#FDEF42]',
  red: 'border-[#E31E24]/40 text-[#E31E24]',
};

const tournaments: Tournament[] = [
  {
    id: 't1',
    emoji: '🏆',
    badges: [
      { label: 'Officiel', color: 'green' },
      { label: 'Ligue 1', color: 'yellow' },
      { label: 'Saison 2024–2025', color: 'green' },
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
      { label: 'Officiel', color: 'yellow' },
      { label: 'Knock-out', color: 'green' },
      { label: '2024–2025', color: 'yellow' },
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
      { label: 'Tournoi DAKOOL', color: 'green' },
      { label: 'Invitationnel', color: 'yellow' },
      { label: 'Signature Event', color: 'green' },
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
      { label: 'Communautaire', color: 'red' },
      { label: 'Tradition', color: 'green' },
      { label: 'Été 2025', color: 'yellow' },
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

      <section className="py-20 bg-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-12 border-b border-white/5 pb-6">
            <span className="text-[#00853F] text-[11px] font-bold uppercase tracking-[0.3em] font-sans block mb-2">12 Compétitions</span>
            <h2 className="text-5xl sm:text-7xl font-black text-white uppercase leading-none" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              DAKOOL Sponsorise
            </h2>
          </div>

          <div className="flex flex-col gap-px bg-white/5">
            {tournaments.map(t => (
              <div key={t.id} className="bg-black hover:bg-[#050505] transition-colors">
                {/* Header */}
                <div className="p-8 border-b border-white/5">
                  <div className="flex items-start gap-6 flex-wrap">
                    <div className="w-16 h-16 bg-[#0d0d0d] border border-white/5 flex items-center justify-center text-3xl shrink-0">
                      {t.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {t.badges.map(b => (
                          <span key={b.label} className={`text-[10px] font-black uppercase tracking-[0.15em] px-2 py-1 border font-sans ${badgeStyles[b.color]}`}>{b.label}</span>
                        ))}
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-black text-white mb-2 uppercase" style={{ fontFamily: "'Bebas Neue', cursive" }}>{t.title}</h2>
                      <p className="text-gray-500 font-sans text-sm leading-relaxed">{t.description}</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
                  <div className="p-6">
                    <h4 className="text-gray-600 font-sans text-[10px] font-black uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendar} className="w-3 h-3 text-[#00853F]" /> Calendrier
                    </h4>
                    <ul className="space-y-2">
                      {t.calendar.map(item => (
                        <li key={item} className="text-gray-500 font-sans text-sm flex items-start gap-2">
                          <span className="text-[#00853F] mt-0.5 text-xs">▸</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6">
                    <h4 className="text-gray-600 font-sans text-[10px] font-black uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                      <FontAwesomeIcon icon={faTrophy} className="w-3 h-3 text-[#FDEF42]" /> Dotations
                    </h4>
                    <ul className="space-y-3">
                      {t.prizes.map(p => (
                        <li key={p.label}>
                          <span className="font-black text-[#FDEF42] text-2xl block leading-none mb-0.5" style={{ fontFamily: "'Bebas Neue', cursive" }}>{p.amount}</span>
                          <span className="text-gray-600 font-sans text-xs">{p.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6">
                    <h4 className="text-gray-600 font-sans text-[10px] font-black uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                      <FontAwesomeIcon icon={faHandshake} className="w-3 h-3 text-[#00853F]" /> Package DAKOOL
                    </h4>
                    <ul className="space-y-2">
                      {t.package.map(item => (
                        <li key={item} className="text-gray-500 font-sans text-sm flex items-start gap-2">
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
      <section className="bg-[#00853F] py-24 relative overflow-hidden">
        <span
          className="absolute right-0 top-1/2 -translate-y-1/2 text-white/10 font-black leading-none select-none hidden lg:block"
          style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '280px' }}
        >
          DK
        </span>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <span className="text-white/60 text-[11px] font-bold uppercase tracking-[0.35em] font-sans block mb-4">Sponsoring</span>
          <h2
            className="text-5xl sm:text-7xl font-black text-white uppercase leading-[0.9] mb-8 max-w-2xl"
            style={{ fontFamily: "'Bebas Neue', cursive" }}
          >
            Votre Tournoi avec DAKOOL
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="bg-black hover:bg-white text-white hover:text-black font-black uppercase tracking-[0.15em] px-8 py-4 text-sm transition-colors font-sans">
              Proposer un partenariat →
            </Link>
            <Link href="/equipes" className="border border-white/30 hover:border-white text-white font-black uppercase tracking-[0.15em] px-8 py-4 text-sm transition-colors font-sans">
              Voir nos équipes
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
