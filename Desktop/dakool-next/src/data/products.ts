export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  badge?: { label: string; color: 'green' | 'yellow' | 'red' };
};

export const products: Product[] = [
  { id: 'p1',  name: 'Maillot Officiel Teranga',  category: 'Maillots',    price: 25000, badge: { label: 'Nouveau', color: 'green' } },
  { id: 'p2',  name: 'Maillot Domicile Lion',      category: 'Maillots',    price: 22000 },
  { id: 'p3',  name: 'Ballon Officiel Téranga',    category: 'Ballons',     price: 18500, badge: { label: 'Officiel', color: 'yellow' } },
  { id: 'p4',  name: 'Chaussures Elite Pro',        category: 'Chaussures',  price: 45000, badge: { label: 'Pro', color: 'yellow' } },
  { id: 'p5',  name: 'Short Training DAKOOL',       category: 'Accessoires', price: 8500 },
  { id: 'p6',  name: 'Chaussettes Pro',             category: 'Accessoires', price: 3500 },
  { id: 'p7',  name: 'Veste Entraîneur',            category: 'Équipements', price: 35000, badge: { label: 'Coach', color: 'green' } },
  { id: 'p8',  name: 'Sac de Sport DAKOOL',         category: 'Équipements', price: 28000 },
  { id: 'p9',  name: 'Gants de Gardien',            category: 'Équipements', price: 32000, badge: { label: 'Gardien', color: 'red' } },
  { id: 'p10', name: 'Protège-tibias Elite',        category: 'Accessoires', price: 7500 },
  { id: 'p11', name: 'Bandeau Téranga',             category: 'Accessoires', price: 4500 },
  { id: 'p12', name: 'Chaussures Junior',           category: 'Chaussures',  price: 28000, badge: { label: 'Junior', color: 'red' } },
  { id: 'p13', name: 'Maillot Gardien Elite',       category: 'Maillots',    price: 26000, badge: { label: 'GK', color: 'yellow' } },
  { id: 'p14', name: "Ballon d'Entraînement",       category: 'Ballons',     price: 12000 },
  { id: 'p15', name: 'Survêtement Complet',         category: 'Équipements', price: 42000, badge: { label: 'Ensemble', color: 'green' } },
  { id: 'p16', name: 'Casquette DAKOOL',            category: 'Accessoires', price: 6000 },
];

export const categories = ['Tous', 'Maillots', 'Chaussures', 'Ballons', 'Équipements', 'Accessoires'];
