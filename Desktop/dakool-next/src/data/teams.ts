export type Team = {
  id: string;
  name: string;
  city: string;
  acronym: string;
  color: string;
  league: string;
  since: string;
  description: string;
};

export const teams: Team[] = [
  { id: 't1', name: 'Teungueth FC',       city: 'Rufisque, Dakar',    acronym: 'TFC',    color: '#E31E24', league: 'Ligue 1', since: '2021', description: "Champion du Sénégal, Teungueth FC est l'un des clubs les plus titrés de la décennie. DAKOOL fournit l'intégralité des équipements officiels depuis 2021." },
  { id: 't2', name: 'AS Jaraaf',          city: 'Dakar-Médina',       acronym: 'JAR',    color: '#003DA5', league: 'Ligue 1', since: '2020', description: "Fondé en 1946, AS Jaraaf est l'un des plus anciens et prestigieux clubs du Sénégal. Notre partenariat depuis 2020 honore cette histoire unique." },
  { id: 't3', name: 'AS Pikine',          city: 'Pikine, Dakar',      acronym: 'PIK',    color: '#FF6B00', league: 'Ligue 1', since: '2022', description: "Le club de la banlieue dakaroise, symbole de la résilience et de la combativité sénégalaise. Un partenariat ancré dans les valeurs populaires." },
  { id: 't4', name: 'Génération Foot',    city: 'Déni Biram Ndao',    acronym: 'GEN',    color: '#00853F', league: 'Ligue 1', since: '2020', description: "L'académie qui a formé Sadio Mané. Génération Foot représente l'excellence du football sénégalais et la formation de classe mondiale." },
  { id: 't5', name: 'Diambars FC',        city: 'Saly, Thiès',        acronym: 'DIA',    color: '#7B2D8B', league: 'Ligue 1', since: '2021', description: "Institut de formation reconnu internationalement, Diambars allie sport et éducation. DAKOOL équipe l'académie et l'équipe première depuis 2021." },
  { id: 't6', name: 'US Gorée',           city: 'Île de Gorée',       acronym: 'USG',    color: '#00516B', league: 'Ligue 2', since: '2022', description: "Club de l'île historique de Gorée, symbole de mémoire et de renouveau. US Gorée porte avec fierté l'héritage de ce lieu emblématique." },
  { id: 't7', name: 'Mbour Petite Côte',  city: 'Mbour, Thiès',       acronym: 'MPC',    color: '#C8102E', league: 'Ligue 1', since: '2023', description: "Club ambitieux de la côte sénégalaise, Mbour PC monte en puissance dans le football national. Notre partenariat marque le début d'une belle aventure." },
  { id: 't8', name: 'Casa Sports',        city: 'Ziguinchor',         acronym: 'CASA',   color: '#1a1a2e', league: 'Ligue 1', since: '2021', description: "Le géant du sud, représentant fier de la Casamance dans l'élite nationale. Casa Sports incarne la diversité et la richesse du football sénégalais." },
];
