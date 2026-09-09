import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Marquee from '@/components/Marquee';
import { categories, products } from '@/data/products';
import ProduitsClient from './ProduitsClient';

export const metadata: Metadata = {
  title: 'Boutique officielle',
  description:
    'Maillots, chaussures, ballons et accessoires DAKOOL. Livraison internationale, retours gratuits sous 14 jours.',
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
        tag="Boutique officielle DAKOOL"
        title="La"
        highlight="Collection"
        subtitle="Des équipements de niveau professionnel, testés une saison complète en compétition avant la mise en vente."
        index="02"
        meta={[
          { value: String(products.length), label: 'Références' },
          // « Tous » est un filtre, pas une catégorie : on ne le compte pas.
          { value: String(categories.length - 1), label: 'Catégories' },
          { value: '48h', label: 'Expédition' },
          { value: '30j', label: 'Garantie' },
        ]}
      />

      <Marquee
        items={[
          'Livraison internationale',
          'Retours gratuits sous 14 jours',
          'Flocage nom + numéro',
          'Tarifs clubs dès 200 pièces',
        ]}
      />

      <ProduitsClient initialCategory={initialCategory} />
    </>
  );
}
