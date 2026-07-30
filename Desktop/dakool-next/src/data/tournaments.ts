export type Tournament = {
  id: string;
  emoji: string;
  badges: { label: string; color: 'green' | 'yellow' | 'red' }[];
  title: string;
  description: string;
  calendar: string[];
  prizes: { amount: string; label: string }[];
  package: string[];
};

export const tournaments: Tournament[] = [
  {
    id: 't1',
    emoji: '🏆',
    badges: [
      { label: 'Officiel', color: 'green' },
      { label: 'Ligue 1', color: 'yellow' },
      { label: 'Saison 2024–2025', color: 'green' },
    ],
    title: 'Ligue 1 Sénégalaise',
    description:
      "Le championnat national de première division, la plus haute compétition de football au Sénégal. DAKOOL est fier d'équiper 6 clubs et de sponsoriser les trophées officiels de la saison 2024–2025.",
    calendar: [
      'Début : Août 2024',
      'Fin : Juin 2025',
      'Format : Championnat aller-retour',
      '16 clubs participants',
      '3 relégations en Ligue 2',
    ],
    prizes: [
      { amount: '15 000 000', label: 'FCFA — 1er prix (Champion)' },
      { amount: '8 000 000', label: 'FCFA — 2e place (Vice-champion)' },
      { amount: '4 000 000', label: 'FCFA — 3e place' },
    ],
    package: [
      'Équipements pour 6 clubs partenaires',
      'Trophée officiel DAKOOL',
      'Maillots du meilleur joueur',
      'Branding sur panneaux publicitaires',
      'Médailles DAKOOL pour finalistes',
    ],
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
    description:
      'La coupe nationale, ouverte à tous les clubs du Sénégal de la première à la quatrième division. Un format knock-out impitoyable qui produit chaque année des surprises mémorables. DAKOOL équipe les équipes finalistes.',
    calendar: [
      'Début : Octobre 2024',
      'Finale : Mai 2025',
      'Format : Élimination directe',
      '64+ clubs participants',
      'Finale au Stade Léopold Sédar Senghor',
    ],
    prizes: [
      { amount: '10 000 000', label: 'FCFA — Vainqueur' },
      { amount: '5 000 000', label: 'FCFA — Finaliste' },
      { amount: '2 000 000', label: 'FCFA — Demi-finalistes (x2)' },
    ],
    package: [
      'Trophée officiel DAKOOL gravé',
      'Équipements des deux finalistes',
      'Maillots spéciaux finale',
      'Médailles DAKOOL (32 médailles)',
      'Couverture digitale des matchs',
    ],
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
    description:
      'Le tournoi signature de DAKOOL, créé en 2020 pour célébrer la « téranga ». Un événement annuel unique qui réunit les meilleures équipes partenaires dans un esprit de fraternité et de compétition de haut niveau.',
    calendar: [
      'Dates : 15–22 Janvier 2025',
      'Lieu : Stade Alassane Djigo, Pikine',
      '8 équipes invitées',
      'Format : Phase de groupes + finale',
      '4e édition du tournoi',
    ],
    prizes: [
      { amount: '20 000 000', label: 'FCFA — Vainqueur' },
      { amount: '10 000 000', label: 'FCFA — Finaliste' },
      { amount: '5 000 000', label: 'FCFA — Meilleur buteur' },
    ],
    package: [
      'Kit complet DAKOOL offert',
      'Hébergement pris en charge',
      'Transport aller-retour',
      'Repas et collations',
      'Couverture photo & vidéo pro',
      'Trophée personnalisé DAKOOL',
    ],
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
    description:
      "Les Navétanes sont une institution au Sénégal — des tournois communautaires de quartier qui se déroulent chaque été dans tout le pays. DAKOOL soutient cette tradition vivante depuis 2020 en équipant des centaines d'équipes locales.",
    calendar: [
      'Début : Juillet 2025',
      'Fin : Septembre 2025',
      'Partout au Sénégal',
      '200+ équipes par région',
      '14 régions couvertes',
    ],
    prizes: [
      { amount: '500 000', label: 'FCFA — Vainqueur par zone' },
      { amount: '250 000', label: 'FCFA — Finaliste par zone' },
    ],
    package: [
      '500+ maillots distribués',
      '200+ ballons fournis',
      'Arbitres équipés DAKOOL',
      'Trophées régionaux gravés',
      'Présence et animation DAKOOL',
    ],
  },
];
