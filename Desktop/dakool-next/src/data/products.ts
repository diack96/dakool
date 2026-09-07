export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  badge?: { label: string };
  /** Vues du produit dans /public ; à défaut, un dessin par catégorie est utilisé. */
  images?: string[];
  /** Chaque vue correspond au coloris de même rang : galerie et nuancier
      sont alors synchronisés. */
  viewsAreColorways?: boolean;
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
    slug: 'maillot-officiel-pro',
    name: 'Maillot Officiel Pro',
    category: 'Maillots',
    price: 38,
    badge: { label: 'Nouveau' },
    tagline: 'Notre maillot signature.',
    description:
      "Notre pièce signature, dans une coupe ajustée pensée pour le jeu. Maille technique à double couche, empiècements ventilés sous les bras et col côtelé renforcé. Le blason est brodé, pas imprimé — il tiendra toute la saison.",
    sizes: JERSEY_SIZES,
    colors: [
      { name: 'Noir', hex: '#0F0F0F' },
      { name: 'Blanc', hex: '#F2F2F2' },
      { name: 'Gris', hex: '#8A8A8A' },
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
    slug: 'maillot-domicile',
    name: 'Maillot Domicile',
    category: 'Maillots',
    price: 34,
    tagline: 'Le maillot des soirs de match à domicile.',
    description:
      "Coupe classique, tissu léger, séchage rapide. C'est le maillot que portent nos clubs partenaires en championnat. Sobre sur le terrain, il se porte aussi bien en dehors.",
    sizes: JERSEY_SIZES,
    colors: [
      { name: 'Noir', hex: '#0F0F0F' },
      { name: 'Blanc', hex: '#F2F2F2' },
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
    slug: 'ballon-officiel-match',
    name: 'Ballon Officiel Match',
    category: 'Ballons',
    price: 28,
    badge: { label: 'Officiel' },
    tagline: 'Le ballon des compétitions que nous sponsorisons.',
    description:
      "Ballon de match taille 5, thermocollé sans couture apparente pour une trajectoire prévisible et un contact régulier. C'est le ballon utilisé sur les compétitions que nous sponsorisons.",
    sizes: ['Taille 4', 'Taille 5'],
    colors: [
      { name: 'Blanc', hex: '#F2F2F2' },
      { name: 'Noir', hex: '#0F0F0F' },
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
    name: 'Chaussure Elite Pro',
    category: 'Chaussures',
    price: 69,
    badge: { label: 'Pro' },
    tagline: 'Notre chaussure la plus rapide.',
    description:
      'Conçue avec des joueurs professionnels. Tige synthétique fine pour le toucher de balle, semelle en composite léger, crampons lamellaires pour les appuis sur terrain sec. 210 g en taille 42.',
    sizes: BOOT_SIZES,
    colors: [
      { name: 'Noir', hex: '#0F0F0F' },
      { name: 'Blanc', hex: '#F2F2F2' },
      { name: 'Gris', hex: '#8A8A8A' },
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
    price: 13,
    tagline: "Le short d'entraînement, tous les jours.",
    description:
      "Taille élastiquée à cordon, deux poches latérales, tissu léger qui sèche vite. Rien de superflu — c'est le short que portent nos équipes à l'entraînement toute la semaine.",
    sizes: JERSEY_SIZES,
    colors: [
      { name: 'Noir', hex: '#0F0F0F' },
      { name: 'Gris', hex: '#8A8A8A' },
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
    price: 6,
    tagline: 'Maintien du pied, zéro glissement.',
    description:
      'Chaussettes hautes à compression légère sur la voûte plantaire, semelle bouclette pour amortir les chocs et bande antidérapante interne. Vendues par paire.',
    sizes: ['35–38', '39–42', '43–46'],
    colors: [
      { name: 'Blanc', hex: '#F2F2F2' },
      { name: 'Noir', hex: '#0F0F0F' },
      { name: 'Gris', hex: '#8A8A8A' },
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
    price: 53,
    badge: { label: 'Coach' },
    tagline: 'Pour ceux qui dirigent depuis le bord du terrain.',
    description:
      'Veste coupe-vent déperlante, doublure maille, col montant et poches zippées. Pensée pour rester trois heures debout au bord du terrain sans bouger.',
    sizes: JERSEY_SIZES,
    colors: [
      { name: 'Noir', hex: '#0F0F0F' },
      { name: 'Gris', hex: '#8A8A8A' },
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
    price: 43,
    tagline: 'Tout le kit du match dans un seul sac.',
    description:
      'Sac de 55 litres avec compartiment chaussures ventilé séparé, poche humide étanche et bandoulière rembourrée. Base renforcée pour poser au sol sans abîmer.',
    sizes: ONE_SIZE,
    colors: [
      { name: 'Noir', hex: '#0F0F0F' },
      { name: 'Gris', hex: '#8A8A8A' },
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
    price: 49,
    badge: { label: 'Gardien' },
    tagline: 'Latex allemand, adhérence par tous les temps.',
    description:
      'Paume en latex 4 mm à grain fin, adhérente sur sec comme sur mouillé. Sangle de serrage large et dos aéré. Les barrettes de protection des doigts sont amovibles.',
    sizes: ['7', '8', '9', '10', '11'],
    colors: [
      { name: 'Noir', hex: '#0F0F0F' },
      { name: 'Blanc', hex: '#F2F2F2' },
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
    price: 11,
    tagline: 'Léger au point de les oublier.',
    description:
      'Coque en polypropylène haute densité doublée mousse EVA. 42 g par protège-tibia. Livrés avec une paire de manchons de maintien.',
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Blanc', hex: '#F2F2F2' },
      { name: 'Noir', hex: '#0F0F0F' },
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
    slug: 'bandeau-performance',
    name: 'Bandeau Performance',
    category: 'Accessoires',
    price: 7,
    tagline: 'Le détail qui se voit de la tribune.',
    description:
      'Bandeau élastique absorbant, logo DAKOOL tissé. Coutures plates pour ne pas irriter, maintien sans serrer.',
    sizes: ONE_SIZE,
    colors: [
      { name: 'Noir', hex: '#0F0F0F' },
      { name: 'Blanc', hex: '#F2F2F2' },
    ],
    details: ['Maille absorbante élastique', 'Coutures plates', 'Lavable en machine'],
    inStock: true,
  },
  {
    id: 'p12',
    slug: 'chaussures-junior',
    name: 'Chaussure Junior',
    category: 'Chaussures',
    price: 43,
    badge: { label: 'Junior' },
    tagline: 'La première paire sérieuse.',
    description:
      "Version allégée de l'Elite Pro pour les 8–14 ans. Fermeture scratch en plus des lacets, tige souple et crampons adaptés aux terrains des académies.",
    sizes: ['33', '34', '35', '36', '37', '38'],
    colors: [
      { name: 'Noir', hex: '#0F0F0F' },
      { name: 'Blanc', hex: '#F2F2F2' },
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
    price: 40,
    badge: { label: 'GK' },
    tagline: 'Manches longues, coudes rembourrés.',
    description:
      'Le maillot des gardiens de nos clubs partenaires. Rembourrage discret aux coudes, manches longues resserrées aux poignets, coupe ample pour ne pas gêner les plongeons.',
    sizes: JERSEY_SIZES,
    colors: [
      { name: 'Noir', hex: '#0F0F0F' },
      { name: 'Gris', hex: '#8A8A8A' },
      { name: 'Blanc', hex: '#F2F2F2' },
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
    price: 18,
    tagline: 'Celui qui encaisse les séances de la semaine.',
    description:
      "Ballon d'entraînement cousu machine, enveloppe TPU renforcée. Moins nerveux que le ballon de match, beaucoup plus résistant aux terrains durs.",
    sizes: ['Taille 4', 'Taille 5'],
    colors: [
      { name: 'Blanc', hex: '#F2F2F2' },
      { name: 'Noir', hex: '#0F0F0F' },
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
    price: 64,
    badge: { label: 'Ensemble' },
    tagline: 'Veste et pantalon, une seule commande.',
    description:
      "L'ensemble d'échauffement de nos clubs : veste zippée col montant et pantalon fuselé à chevilles zippées. Bandes latérales contrastées sur les deux pièces.",
    sizes: JERSEY_SIZES,
    colors: [
      { name: 'Noir', hex: '#0F0F0F' },
      { name: 'Gris', hex: '#8A8A8A' },
    ],
    details: [
      'Veste zippée col montant + pantalon fuselé',
      'Chevilles zippées',
      'Bandes latérales contrastées',
      'Poches zippées sur les deux pièces',
    ],
    inStock: true,
  },
  {
    id: 'p16',
    slug: 'casquette-dakool',
    name: 'Casquette DAKOOL',
    category: 'Accessoires',
    price: 9,
    tagline: "Le logo, rien d'autre.",
    description:
      'Casquette six panneaux en coton lavé, logo DAKOOL brodé sur le devant, fermeture métal réglable. Visière préformée.',
    sizes: ONE_SIZE,
    colors: [
      { name: 'Noir', hex: '#0F0F0F' },
      { name: 'Blanc', hex: '#F2F2F2' },
      { name: 'Gris', hex: '#8A8A8A' },
    ],
    details: [
      'Coton lavé six panneaux',
      'Logo brodé devant',
      'Fermeture métal réglable',
      'Visière préformée',
    ],
    inStock: true,
  },
  {
    id: 'b1',
    slug: 'ensemble-basket-royal',
    name: 'Ensemble Basket Royal',
    category: 'Basketball',
    price: 58,
    badge: { label: 'Sur mesure' },
    images: ['/produits/basket-royal.jpg'],
    tagline: 'Bleu franc, chevrons latéraux, col contrasté.',
    description:
      "Ensemble de basketball sublimé aux couleurs du club. Le bleu profond est cassé par un col et des emmanchures blanches, avec des chevrons sur les flancs qui suivent le mouvement. Nom, numéro, blason et sponsors sont intégrés à l'impression, pas rapportés.",
    sizes: JERSEY_SIZES,
    colors: [{ name: 'Bleu Royal', hex: '#1B32D6' }],
    details: [
      'Ensemble complet : maillot sans manches + short',
      'Sublimation intégrale — le motif ne se décolle pas',
      'Maille technique respirante, séchage rapide',
      'Nom, numéros, logos club et sponsors inclus',
      'Production à partir de 10 ensembles',
      'Livraison 3 à 4 semaines après validation de la maquette',
    ],
    inStock: true,
  },
  {
    id: 'b2',
    slug: 'ensemble-basket-or',
    name: 'Ensemble Basket Or',
    category: 'Basketball',
    price: 58,
    images: ['/produits/basket-or.jpg'],
    tagline: 'Or profond et double liseré.',
    description:
      "Ensemble de basketball sublimé, dans un or dense relevé par un double liseré au col et aux emmanchures. Une coupe classique, lisible de loin, pensée pour les salles où le maillot doit se reconnaître depuis les tribunes.",
    sizes: JERSEY_SIZES,
    colors: [{ name: 'Or', hex: '#E8A317' }],
    details: [
      'Ensemble complet : maillot sans manches + short',
      'Sublimation intégrale — le motif ne se décolle pas',
      'Maille technique respirante, séchage rapide',
      'Nom, numéros, logos club et sponsors inclus',
      'Production à partir de 10 ensembles',
      'Livraison 3 à 4 semaines après validation de la maquette',
    ],
    inStock: true,
  },
  {
    id: 'b3',
    slug: 'ensemble-basket-noir',
    name: 'Ensemble Basket Noir',
    category: 'Basketball',
    price: 58,
    images: ['/produits/basket-noir.jpg'],
    tagline: 'Noir mat, motif ton sur ton, finitions jaunes.',
    description:
      "Ensemble de basketball sublimé en noir, avec un motif ton sur ton qui monte depuis le bas du maillot et se prolonge sur les côtés du short. Les liserés jaunes tiennent le contraste sans alourdir la pièce.",
    sizes: JERSEY_SIZES,
    colors: [{ name: 'Noir', hex: '#0F0F0F' }],
    details: [
      'Ensemble complet : maillot sans manches + short',
      'Sublimation intégrale — le motif ne se décolle pas',
      'Maille technique respirante, séchage rapide',
      'Nom, numéros, logos club et sponsors inclus',
      'Production à partir de 10 ensembles',
      'Livraison 3 à 4 semaines après validation de la maquette',
    ],
    inStock: true,
  },
  {
    id: 'b4',
    slug: 'ensemble-basket-jaune',
    name: 'Ensemble Basket Jaune',
    category: 'Basketball',
    price: 58,
    images: ['/produits/basket-jaune.jpg'],
    tagline: 'Jaune vif et bandes graphiques latérales.',
    description:
      'Version claire du même patron : jaune saturé, col et emmanchures noirs, et une bande graphique qui court sur les flancs du maillot comme du short. Le jeu extérieur qui complète la tenue noire.',
    sizes: JERSEY_SIZES,
    colors: [{ name: 'Jaune', hex: '#F2D024' }],
    details: [
      'Ensemble complet : maillot sans manches + short',
      'Sublimation intégrale — le motif ne se décolle pas',
      'Maille technique respirante, séchage rapide',
      'Nom, numéros, logos club et sponsors inclus',
      'Production à partir de 10 ensembles',
      'Livraison 3 à 4 semaines après validation de la maquette',
    ],
    inStock: true,
  },
  {
    id: 'b5',
    slug: 'ensemble-basket-blanc',
    name: 'Ensemble Basket Blanc',
    category: 'Basketball',
    price: 58,
    images: ['/produits/basket-blanc.jpg'],
    tagline: 'Blanc texturé, dégradé vert sur les flancs.',
    description:
      "Ensemble de basketball sublimé sur fond blanc texturé, avec un dégradé vert qui remonte le long des côtes. Les emplacements sponsors sont intégrés dès la maquette, à l'avant comme à l'arrière.",
    sizes: JERSEY_SIZES,
    colors: [{ name: 'Blanc', hex: '#F2F2F2' }],
    details: [
      'Ensemble complet : maillot sans manches + short',
      'Sublimation intégrale — le motif ne se décolle pas',
      'Maille technique respirante, séchage rapide',
      'Nom, numéros, logos club et sponsors inclus',
      'Production à partir de 10 ensembles',
      'Livraison 3 à 4 semaines après validation de la maquette',
    ],
    inStock: true,
  },
  {
    id: 'v1',
    slug: 'ensemble-volley-vert',
    name: 'Ensemble Volley Vert',
    category: 'Volleyball',
    price: 52,
    badge: { label: 'Sur mesure' },
    images: ['/produits/volley-vert-1.jpg', '/produits/volley-vert-2.jpg'],
    tagline: 'Vert franc, marquage jaune, coupe débardeur.',
    description:
      "Ensemble de volleyball en maille légère : débardeur à emmanchures larges et short à taille élastiquée. Le marquage jaune est imprimé à chaud, poitrine, dos et cuisse. Une tenue pensée pour le jeu en extérieur, où la couleur doit rester lisible en plein soleil.",
    sizes: JERSEY_SIZES,
    colors: [{ name: 'Vert', hex: '#2E9B2E' }],
    details: [
      'Ensemble complet : débardeur + short',
      'Maille légère, séchage rapide',
      'Marquage nom, numéro et sponsors imprimé à chaud',
      'Short à taille élastiquée avec cordon',
      'Production à partir de 10 ensembles',
      'Livraison 3 à 4 semaines après validation de la maquette',
    ],
    inStock: true,
  },
  {
    id: 'v2',
    slug: 'ensemble-volley-blanc',
    name: 'Ensemble Volley Blanc',
    category: 'Volleyball',
    price: 52,
    images: ['/produits/volley-blanc-1.jpg', '/produits/volley-blanc-2.jpg'],
    tagline: 'Blanc, griffures colorées, motif ton sur ton.',
    description:
      "Le jeu extérieur du même patron. Fond blanc à motif ton sur ton, traversé de trois griffures colorées sur le devant. Le marquage vert reste net sur le blanc, de face comme de dos, et le short reprend le nom de l'équipe sur toute sa largeur.",
    sizes: JERSEY_SIZES,
    colors: [{ name: 'Blanc', hex: '#F2F2F2' }],
    details: [
      'Ensemble complet : débardeur + short',
      'Maille légère, séchage rapide',
      'Motif ton sur ton intégré au tissu',
      'Marquage nom, numéro et sponsors imprimé à chaud',
      'Production à partir de 10 ensembles',
      'Livraison 3 à 4 semaines après validation de la maquette',
    ],
    inStock: true,
  },
  {
    id: 'h1',
    slug: 'maillot-handball',
    name: 'Maillot Handball',
    category: 'Handball',
    price: 44,
    badge: { label: 'Sur mesure' },
    images: [
      '/produits/hand-blanc-orange.jpg',
      '/produits/hand-marine.jpg',
      '/produits/hand-blanc-marine.jpg',
    ],
    viewsAreColorways: true,
    tagline: 'Col et poignets contrastés, emplacements sponsors intégrés.',
    description:
      "Maillot de handball à manches courtes, col rond et poignets contrastés. La coupe laisse l'épaule libre pour le geste de tir. Numéro, blason et sponsors sont intégrés dès la maquette : les vues ci-dessus montrent trois coloris réellement produits pour des clubs.",
    sizes: JERSEY_SIZES,
    colors: [
      { name: 'Blanc / Orange', hex: '#F2F2F2' },
      { name: 'Marine / Orange', hex: '#2E3192' },
      { name: 'Blanc / Marine', hex: '#EDEDED' },
    ],
    details: [
      'Manches courtes, col rond côtelé',
      'Col et poignets en contraste',
      'Maille technique respirante, séchage rapide',
      'Numéro, blason et sponsors inclus',
      'Production à partir de 10 maillots',
      'Livraison 3 à 4 semaines après validation de la maquette',
    ],
    inStock: true,
  },
  {
    id: 'h2',
    slug: 'tenue-staff',
    name: 'Tenue Staff',
    category: 'Équipements',
    price: 62,
    images: ['/produits/staff-vert-marine.jpg', '/produits/staff-blanc-vert.jpg'],
    viewsAreColorways: true,
    tagline: 'Polo et pantalon, pour le banc et les déplacements.',
    description:
      "L'ensemble que portent les encadrants : polo à empiècement contrasté, boutonnage trois trous, et pantalon de survêtement à bas resserré. Une tenue qui tient le bord du terrain comme le déplacement, et qui se décline aux couleurs du club.",
    sizes: JERSEY_SIZES,
    colors: [
      { name: 'Vert / Marine', hex: '#2E3192' },
      { name: 'Blanc / Vert', hex: '#2ECC40' },
    ],
    details: [
      'Ensemble complet : polo + pantalon',
      'Polo à empiècement contrasté, boutonnage trois trous',
      'Pantalon à taille élastiquée et bas resserré',
      'Blason club et logos sponsors inclus',
      'Production à partir de 10 ensembles',
      'Livraison 3 à 4 semaines après validation de la maquette',
    ],
    inStock: true,
  },
];

export const categories = [
  'Tous',
  'Basketball',
  'Volleyball',
  'Handball',
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
