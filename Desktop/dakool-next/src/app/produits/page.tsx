import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Marquee from '@/components/Marquee';
import { categories, products } from '@/data/products';
import ProduitsClient from './ProduitsClient';

export const metadata: Metadata = {
  title: 'Produits',
  description:
    'Maillots, chaussures, ballons, équipements et accessoires DAKOOL. Équipements professionnels conçus au Sénégal pour les clubs et les joueurs.',
  alternates: { canonical: '/produits' },
};

export default async function ProduitsPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;
  /* On ne fait confiance au paramètre d'URL que s'il correspond à une catégorie réelle. */
  const initialCategory = categorie && categories.includes(categorie) ? categorie : 'Tous';

  return (
    <>
      <PageHero
        tag="Boutique DAKOOL"
        title="Nos"
        highlight="Produits"
        subtitle="Équipements professionnels conçus pour les champions sénégalais. Livraison 24h à Dakar, 3–5 jours dans le reste du pays."
        index="02"
        meta={[
          { value: String(products.length), label: 'Références' },
          { value: '5', label: 'Catégories' },
          { value: '24h', label: 'Livraison Dakar' },
          { value: '30j', label: 'Garantie' },
        ]}
      />

      <Marquee
        items={[
          'Flocage nom + numéro',
          'Tarifs clubs dès 10 pièces',
          'Wave · Orange Money · Free Money',
          'Retour sous 14 jours',
        ]}
      />

      <ProduitsClient initialCategory={initialCategory} />
    </>
  );
}
