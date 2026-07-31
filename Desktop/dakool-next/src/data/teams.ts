export type Team = {
  id: string;
  slug: string;
  name: string;
  city: string;
  acronym: string;
  league: string;
  since: string;
  description: string;
  founded: string;
  stadium: string;
  /** Palmarès affiché sur la fiche club. */
  honours: string[];
  /** Ce que DAKOOL fournit à ce club précisément. */
  supplies: string[];
};

export const teams: Team[] = [
  {
    id: 't1',
    slug: 'teungueth-fc',
    name: 'Teungueth FC',
    city: 'Rufisque, Dakar',
    acronym: 'TFC',
    league: 'Ligue 1',
    since: '2021',
    description:
      "Champion du Sénégal, Teungueth FC est l'un des clubs les plus titrés de la décennie. DAKOOL fournit l'intégralité des équipements officiels depuis 2021.",
    founded: '1954',
    stadium: 'Stade Ngalandou Diouf',
    honours: ['Champion du Sénégal 2021', 'Coupe du Sénégal 2019', 'Tour préliminaire LDC CAF 2021'],
    supplies: [
      'Maillots domicile, extérieur et third',
      'Survêtements et tenues d’échauffement',
      'Équipement complet de gardien',
      'Sacs et bagagerie de déplacement',
    ],
  },
  {
    id: 't2',
    slug: 'as-jaraaf',
    name: 'AS Jaraaf',
    city: 'Dakar-Médina',
    acronym: 'JAR',
    league: 'Ligue 1',
    since: '2020',
    description:
      "Fondé en 1946, AS Jaraaf est l'un des plus anciens et prestigieux clubs du Sénégal. Notre partenariat depuis 2020 honore cette histoire unique.",
    founded: '1946',
    stadium: 'Stade Iba Mar Diop',
    honours: ['13 titres de champion du Sénégal', '9 Coupes du Sénégal', 'Coupe CAF finaliste 1998'],
    supplies: [
      'Maillots domicile et extérieur',
      'Tenues d’entraînement quotidiennes',
      'Ballons de match et d’entraînement',
      'Équipement de l’encadrement technique',
    ],
  },
  {
    id: 't3',
    slug: 'as-pikine',
    name: 'AS Pikine',
    city: 'Pikine, Dakar',
    acronym: 'PIK',
    league: 'Ligue 1',
    since: '2022',
    description:
      'Le club de la banlieue dakaroise, symbole de la résilience et de la combativité sénégalaise. Un partenariat ancré dans les valeurs populaires.',
    founded: '1961',
    stadium: 'Stade Alassane Djigo',
    honours: ['Champion du Sénégal 2016', 'Finaliste Coupe du Sénégal 2018'],
    supplies: [
      'Maillots domicile et extérieur',
      'Équipements de l’équipe réserve',
      'Dotation annuelle en ballons',
      'Soutien logistique déplacements',
    ],
  },
  {
    id: 't4',
    slug: 'generation-foot',
    name: 'Génération Foot',
    city: 'Déni Biram Ndao',
    acronym: 'GEN',
    league: 'Ligue 1',
    since: '2020',
    description:
      "L'académie qui a formé Sadio Mané. Génération Foot représente l'excellence du football sénégalais et la formation de classe mondiale.",
    founded: '2000',
    stadium: 'Stade Déni Biram Ndao',
    honours: [
      'Champion du Sénégal 2017, 2019',
      'Coupe du Sénégal 2018',
      'Académie formatrice de Sadio Mané',
    ],
    supplies: [
      'Équipement de l’équipe première',
      'Kits complets pour toutes les catégories de jeunes',
      'Matériel d’entraînement de l’académie',
      'Tenues du staff de formation',
    ],
  },
  {
    id: 't5',
    slug: 'diambars-fc',
    name: 'Diambars FC',
    city: 'Saly, Thiès',
    acronym: 'DIA',
    league: 'Ligue 1',
    since: '2021',
    description:
      "Institut de formation reconnu internationalement, Diambars allie sport et éducation. DAKOOL équipe l'académie et l'équipe première depuis 2021.",
    founded: '2003',
    stadium: 'Stade Fodé Wade',
    honours: ['Champion du Sénégal 2013', 'Institut de formation certifié', 'Formateur d’internationaux A'],
    supplies: [
      'Équipement de l’équipe première',
      'Kits de l’institut de formation',
      'Tenues scolaires et sportives',
      'Ballons et matériel pédagogique',
    ],
  },
  {
    id: 't6',
    slug: 'us-goree',
    name: 'US Gorée',
    city: 'Île de Gorée',
    acronym: 'USG',
    league: 'Ligue 2',
    since: '2022',
    description:
      "Club de l'île historique de Gorée, symbole de mémoire et de renouveau. US Gorée porte avec fierté l'héritage de ce lieu emblématique.",
    founded: '1930',
    stadium: 'Stade Municipal de Gorée',
    honours: ['Champion du Sénégal 1978', 'Coupe du Sénégal 1975', 'Doyen des clubs de la capitale'],
    supplies: [
      'Maillots domicile et extérieur',
      'Tenues d’entraînement',
      'Dotation en ballons',
      'Soutien transport insulaire',
    ],
  },
  {
    id: 't7',
    slug: 'mbour-petite-cote',
    name: 'Mbour Petite Côte',
    city: 'Mbour, Thiès',
    acronym: 'MPC',
    league: 'Ligue 1',
    since: '2023',
    description:
      'Club ambitieux de la côte sénégalaise, Mbour PC monte en puissance dans le football national. Notre partenariat marque le début d’une belle aventure.',
    founded: '2006',
    stadium: 'Stade Caroline Faye',
    honours: ['Montée en Ligue 1 en 2022', 'Demi-finaliste Coupe du Sénégal 2023'],
    supplies: [
      'Maillots domicile et extérieur',
      'Survêtements d’échauffement',
      'Équipement de gardien',
      'Bagagerie de déplacement',
    ],
  },
  {
    id: 't8',
    slug: 'casa-sports',
    name: 'Casa Sports',
    city: 'Ziguinchor',
    acronym: 'CASA',
    league: 'Ligue 1',
    since: '2021',
    description:
      'Le géant du sud, représentant fier de la Casamance dans l’élite nationale. Casa Sports incarne la diversité et la richesse du football sénégalais.',
    founded: '1961',
    stadium: 'Stade Aline Sitoé Diatta',
    honours: ['Champion du Sénégal 2022', '4 Coupes du Sénégal', 'Représentant CAF 2022'],
    supplies: [
      'Équipement complet de l’équipe première',
      'Kits des catégories jeunes',
      'Tenues du staff technique',
      'Soutien logistique Ziguinchor–Dakar',
    ],
  },
];

export function getTeam(slug: string): Team | undefined {
  return teams.find((t) => t.slug === slug);
}
