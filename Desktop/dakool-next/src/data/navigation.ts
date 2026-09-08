export type NavChild = { label: string; href: string };

export type NavEntry = {
  label: string;
  href: string;
  /** Intitulé de la colonne du sous-menu. */
  heading: string;
  children: NavChild[];
};

/* Le catalogue n'est pas encore segmenté par genre ni par sport : les
   entrées pointent vers la boutique filtrée quand une catégorie existe,
   vers la boutique complète sinon. */
const SHOP = '/produits';
const JERSEYS = '/produits?categorie=Maillots';
const SHOES = '/produits?categorie=Chaussures';
const BASKET = '/produits?categorie=Basketball';
const VOLLEY = '/produits?categorie=Volleyball';
const HAND = '/produits?categorie=Handball';
const YOGA = '/produits?categorie=Yoga';
const BOTTOMS = '/produits?categorie=' + encodeURIComponent('Pantalons & Leggings');

const APPAREL: NavChild[] = [
  { label: 'Maillot de football', href: JERSEYS },
  { label: 'Survêtements', href: SHOP },
  { label: 'Sweats', href: SHOP },
  { label: 'T-shirt', href: SHOP },
  { label: 'Short', href: SHOP },
  { label: 'Pantalon & Legging', href: BOTTOMS },
];

export const navigation: NavEntry[] = [
  { label: 'Hommes', href: SHOP, heading: 'Vêtements', children: APPAREL },
  { label: 'Femmes', href: SHOP, heading: 'Vêtements', children: APPAREL },
  { label: 'Enfants', href: SHOP, heading: 'Vêtements', children: APPAREL },
  {
    label: 'Sports',
    href: SHOP,
    heading: 'Disciplines',
    children: [
      { label: 'Football', href: SHOP },
      { label: 'Basketball', href: BASKET },
      { label: 'Volley-ball', href: VOLLEY },
      { label: 'Hand-ball', href: HAND },
      { label: 'Yoga', href: YOGA },
      { label: 'Tennis', href: SHOP },
    ],
  },
  {
    label: 'Chaussures',
    href: SHOES,
    heading: 'Style de chaussures',
    children: [
      { label: 'Chaussures de basketball', href: SHOES },
      { label: 'Chaussures de course', href: SHOES },
      { label: 'Chaussure de football', href: SHOES },
    ],
  },
];
