export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  badge?: { label: string; color: 'green' | 'yellow' | 'red' };
  tagline: string;
  description: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  details: string[];
  inStock: boolean;
};

const JERSEY_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const BOOT_SIZES = ['39', '40', '41', '42', '43', '44', '45'];
const ONE_SIZE = ['Taille unique'];

export const products: Product[] = [
  {
    id: 'p1',
    slug: 'maillot-officiel-teranga',
    name: 'Maillot Officiel Teranga',
    category: 'Maillots',
    price: 25000,
    badge: { label: 'Nouveau', color: 'green' },
    tagline: 'Le maillot qui porte le nom du pays.',
    description:
      "Notre pièce signature. Le maillot Teranga reprend les codes du football sénégalais dans une coupe ajustée pensée pour le jeu. Maille technique à double couche, empiècements ventilés sous les bras et col côtelé renforcé. Le blason est brodé, pas imprimé — il tiendra toute la saison.",
    sizes: JERSEY_SIZES,
    colors: [
      { name: 'Vert Téranga', hex: '#00853F' },
      { name: 'Blanc Lion', hex: '#F2F2F2' },
      { name: 'Noir Dakar', hex: '#111111' },
    ],
    details: [
      'Maille technique respirante 100% polyester recyclé',
      'Blason brodé et flocage thermocollé',
      'Empiècements ventilés sous les bras',
      'Coupe ajustée — prendre une taille au-dessus pour un porté large',
      'Lavage machine 30°C, séchage à plat',
    ],
    inStock: true,
  },
  {
    id: 'p2',
    slug: 'maillot-domicile-lion',
    name: 'Maillot Domicile Lion',
    category: 'Maillots',
    price: 22000,
    tagline: 'Le maillot des soirs de match à domicile.',
    description:
      'Coupe classique, tissu léger, séchage rapide. Le maillot Domicile Lion est celui que portent nos clubs partenaires en championnat. Sobre sur le terrain, il se porte aussi bien en dehors.',
    sizes: JERSEY_SIZES,
    colors: [
      { name: 'Vert Téranga', hex: '#00853F' },
      { name: 'Or', hex: '#FDEF42' },
    ],
    details: [
      'Maille piquée légère, séchage rapide',
      'Col V côtelé',
      'Logo DAKOOL sérigraphié poitrine',
      'Coupe classique, tombé droit',
    ],
    inStock: true,
  },
  {
    id: 'p3',
    slug: 'ballon-officiel-teranga',
    name: 'Ballon Officiel Téranga',
    category: 'Ballons',
    price: 18500,
    badge: { label: 'Officiel', color: 'yellow' },
    tagline: 'Le ballon des compétitions que nous sponsorisons.',
    description:
      "Ballon de match taille 5, thermocollé sans couture apparente pour une trajectoire prévisible et un contact régulier. C'est le ballon utilisé sur le Tournoi de la Téranga et en Coupe du Sénégal.",
    sizes: ['Taille 4', 'Taille 5'],
    colors: [
      { name: 'Blanc / Vert', hex: '#F2F2F2' },
      { name: 'Or', hex: '#FDEF42' },
    ],
    details: [
      'Ballon de match taille 5, 410–450 g',
      'Assemblage thermocollé sans couture',
      'Vessie latex, rétention de pression renforcée',
      'Surface texturée pour la prise par temps humide',
    ],
    inStock: true,
  },
  {
    id: 'p4',
    slug: 'chaussures-elite-pro',
    name: 'Chaussures Elite Pro',
    category: 'Chaussures',
    price: 45000,
    badge: { label: 'Pro', color: 'yellow' },
    tagline: 'Notre chaussure la plus rapide.',
    description:
      'Conçue avec des joueurs de Ligue 1 sénégalaise. Tige synthétique fine pour le toucher de balle, semelle en composite léger, crampons lamellaires pour les appuis sur terrain sec. 210 g en taille 42.',
    sizes: BOOT_SIZES,
    colors: [
      { name: 'Noir / Vert', hex: '#111111' },
      { name: 'Blanc / Or', hex: '#F2F2F2' },
      { name: 'Rouge Lion', hex: '#E31E24' },
    ],
    details: [
      '210 g en taille 42',
      'Tige synthétique microfibre, toucher direct',
      'Semelle composite, crampons lamellaires FG',
      'Chausson interne pour un maintien sans point dur',
      'Terrain sec et synthétique',
    ],
    inStock: true,
  },
  {
    id: 'p5',
    slug: 'short-training-dakool',
    name: 'Short Training DAKOOL',
    category: 'Accessoires',
    price: 8500,
    tagline: "Le short d'entraînement, tous les jours.",
    description:
      "Taille élastiquée à cordon, deux poches latérales, tissu léger qui sèche vite. Rien de superflu — c'est le short que portent nos équipes à l'entraînement toute la semaine.",
    sizes: JERSEY_SIZES,
    colors: [
      { name: 'Noir', hex: '#111111' },
      { name: 'Vert Téranga', hex: '#00853F' },
    ],
    details: [
      'Tissu léger séchage rapide',
      'Taille élastiquée avec cordon',
      'Deux poches latérales',
      'Logo DAKOOL brodé cuisse gauche',
    ],
    inStock: true,
  },
  {
    id: 'p6',
    slug: 'chaussettes-pro',
    name: 'Chaussettes Pro',
    category: 'Accessoires',
    price: 3500,
    tagline: 'Maintien du pied, zéro glissement.',
    description:
      'Chaussettes hautes à compression légère sur la voûte plantaire, semelle bouclette pour amortir les chocs et bande antidérapante interne. Vendues par paire.',
    sizes: ['35–38', '39–42', '43–46'],
    colors: [
      { name: 'Vert Téranga', hex: '#00853F' },
      { name: 'Blanc', hex: '#F2F2F2' },
      { name: 'Noir', hex: '#111111' },
    ],
    details: [
      'Compression légère sur la voûte plantaire',
      'Semelle bouclette amortissante',
      'Bande antidérapante interne',
      'Vendues par paire',
    ],
    inStock: true,
  },
  {
    id: 'p7',
    slug: 'veste-entraineur',
    name: 'Veste Entraîneur',
    category: 'Équipements',
    price: 35000,
    badge: { label: 'Coach', color: 'green' },
    tagline: 'Pour ceux qui dirigent depuis le bord du terrain.',
    description:
      'Veste coupe-vent déperlante, doublure maille, col montant et poches zippées. Pensée pour rester trois heures debout sous le vent de la corniche sans bouger.',
    sizes: JERSEY_SIZES,
    colors: [
      { name: 'Noir', hex: '#111111' },
      { name: 'Vert Téranga', hex: '#00853F' },
    ],
    details: [
      'Coupe-vent déperlant, coutures thermocollées',
      'Doublure maille respirante',
      'Poches latérales zippées',
      'Bas ajustable par cordon',
    ],
    inStock: true,
  },
  {
    id: 'p8',
    slug: 'sac-de-sport-dakool',
    name: 'Sac de Sport DAKOOL',
    category: 'Équipements',
    price: 28000,
    tagline: 'Tout le kit du match dans un seul sac.',
    description:
      'Sac de 55 litres avec compartiment chaussures ventilé séparé, poche humide étanche et bandoulière rembourrée. Base renforcée pour poser au sol sans abîmer.',
    sizes: ONE_SIZE,
    colors: [
      { name: 'Noir', hex: '#111111' },
      { name: 'Vert Téranga', hex: '#00853F' },
    ],
    details: [
      'Volume 55 L',
      'Compartiment chaussures ventilé séparé',
      'Poche humide étanche',
      'Base renforcée anti-abrasion',
      'Bandoulière rembourrée amovible',
    ],
    inStock: true,
  },
  {
    id: 'p9',
    slug: 'gants-de-gardien',
    name: 'Gants de Gardien',
    category: 'Équipements',
    price: 32000,
    badge: { label: 'Gardien', color: 'red' },
    tagline: 'Latex allemand, adhérence par tous les temps.',
    description:
      'Paume en latex 4 mm à grain fin, adhérente sur sec comme sur mouillé. Sangle de serrage large et dos aéré. Les barrettes de protection des doigts sont amovibles.',
    sizes: ['7', '8', '9', '10', '11'],
    colors: [
      { name: 'Noir / Vert', hex: '#111111' },
      { name: 'Rouge Lion', hex: '#E31E24' },
    ],
    details: [
      'Paume latex 4 mm à grain fin',
      'Adhérence sec et mouillé',
      'Barrettes de protection des doigts amovibles',
      'Sangle de serrage large',
      'Dos aéré maille',
    ],
    inStock: true,
  },
  {
    id: 'p10',
    slug: 'protege-tibias-elite',
    name: 'Protège-tibias Elite',
    category: 'Accessoires',
    price: 7500,
    tagline: 'Léger au point de les oublier.',
    description:
      'Coque en polypropylène haute densité doublée mousse EVA. 42 g par protège-tibia. Livrés avec une paire de manchons de maintien.',
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Blanc / Vert', hex: '#F2F2F2' },
      { name: 'Noir', hex: '#111111' },
    ],
    details: [
      '42 g par protège-tibia',
      'Coque polypropylène haute densité',
      'Doublure mousse EVA',
      'Manchons de maintien inclus',
    ],
    inStock: true,
  },
  {
    id: 'p11',
    slug: 'bandeau-teranga',
    name: 'Bandeau Téranga',
    category: 'Accessoires',
    price: 4500,
    tagline: 'Le détail qui se voit de la tribune.',
    description:
      'Bandeau élastique absorbant aux couleurs du drapeau. Coutures plates pour ne pas irriter, maintien sans serrer.',
    sizes: ONE_SIZE,
    colors: [
      { name: 'Drapeau', hex: '#00853F' },
      { name: 'Noir', hex: '#111111' },
    ],
    details: ['Maille absorbante élastique', 'Coutures plates', 'Lavable en machine'],
    inStock: true,
  },
  {
    id: 'p12',
    slug: 'chaussures-junior',
    name: 'Chaussures Junior',
    category: 'Chaussures',
    price: 28000,
    badge: { label: 'Junior', color: 'red' },
    tagline: 'La première paire sérieuse.',
    description:
      "Version allégée de l'Elite Pro pour les 8–14 ans. Fermeture scratch en plus des lacets, tige souple et crampons adaptés aux terrains des académies.",
    sizes: ['33', '34', '35', '36', '37', '38'],
    colors: [
      { name: 'Vert / Blanc', hex: '#00853F' },
      { name: 'Noir / Or', hex: '#111111' },
    ],
    details: [
      'Pour les 8–14 ans',
      'Fermeture scratch + lacets',
      'Tige souple, chausson confort',
      'Crampons adaptés terrains meubles',
    ],
    inStock: true,
  },
  {
    id: 'p13',
    slug: 'maillot-gardien-elite',
    name: 'Maillot Gardien Elite',
    category: 'Maillots',
    price: 26000,
    badge: { label: 'GK', color: 'yellow' },
    tagline: 'Manches longues, coudes rembourrés.',
    description:
      'Le maillot des gardiens de nos clubs partenaires. Rembourrage discret aux coudes, manches longues resserrées aux poignets, coupe ample pour ne pas gêner les plongeons.',
    sizes: JERSEY_SIZES,
    colors: [
      { name: 'Or', hex: '#FDEF42' },
      { name: 'Noir', hex: '#111111' },
      { name: 'Rouge Lion', hex: '#E31E24' },
    ],
    details: [
      'Manches longues resserrées aux poignets',
      'Rembourrage mousse aux coudes',
      'Coupe ample',
      'Maille technique respirante',
    ],
    inStock: true,
  },
  {
    id: 'p14',
    slug: 'ballon-d-entrainement',
    name: "Ballon d'Entraînement",
    category: 'Ballons',
    price: 12000,
    tagline: 'Celui qui encaisse les séances de la semaine.',
    description:
      "Ballon d'entraînement cousu machine, enveloppe TPU renforcée. Moins nerveux que le ballon de match, beaucoup plus résistant aux terrains durs.",
    sizes: ['Taille 4', 'Taille 5'],
    colors: [
      { name: 'Blanc / Noir', hex: '#F2F2F2' },
      { name: 'Vert Téranga', hex: '#00853F' },
    ],
    details: [
      'Enveloppe TPU renforcée',
      'Assemblage cousu machine',
      'Résistant aux surfaces abrasives',
      'Vessie butyle, tenue de pression longue durée',
    ],
    inStock: true,
  },
  {
    id: 'p15',
    slug: 'survetement-complet',
    name: 'Survêtement Complet',
    category: 'Équipements',
    price: 42000,
    badge: { label: 'Ensemble', color: 'green' },
    tagline: 'Veste et pantalon, une seule commande.',
    description:
      "L'ensemble d'échauffement de nos clubs : veste zippée col montant et pantalon fuselé à chevilles zippées. Bandes latérales aux couleurs du drapeau sur les deux pièces.",
    sizes: JERSEY_SIZES,
    colors: [
      { name: 'Noir / Drapeau', hex: '#111111' },
      { name: 'Vert Téranga', hex: '#00853F' },
    ],
    details: [
      'Veste zippée col montant + pantalon fuselé',
      'Chevilles zippées',
      'Bandes latérales drapeau',
      'Poches zippées sur les deux pièces',
    ],
    inStock: true,
  },
  {
    id: 'p16',
    slug: 'casquette-dakool',
    name: 'Casquette DAKOOL',
    category: 'Accessoires',
    price: 6000,
    tagline: "Le logo, rien d'autre.",
    description:
      'Casquette six panneaux en coton lavé, logo DAKOOL brodé sur le devant, fermeture métal réglable. Visière préformée.',
    sizes: ONE_SIZE,
    colors: [
      { name: 'Noir', hex: '#111111' },
      { name: 'Vert Téranga', hex: '#00853F' },
      { name: 'Écru', hex: '#E8E3D8' },
    ],
    details: [
      'Coton lavé six panneaux',
      'Logo brodé devant',
      'Fermeture métal réglable',
      'Visière préformée',
    ],
    inStock: true,
  },
];

export const categories = [
  'Tous',
  'Maillots',
  'Chaussures',
  'Ballons',
  'Équipements',
  'Accessoires',
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Suggestions de fin de fiche produit : même catégorie d'abord, puis le reste. */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  const others = products.filter((p) => p.category !== product.category && p.id !== product.id);
  return [...sameCategory, ...others].slice(0, limit);
}
