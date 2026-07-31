import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Marquee from '@/components/Marquee';
import { categories, products } from '@/data/products';
import ProduitsClient from './ProduitsClient';

export const metadata: Metadata = {
  title: 'Produits',
  description:
    'Maillots, chaussures, ballons et accessoires DAKOOL. Livraison offerte à Dakar, retours gratuits sous 14 jours.',
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
        title="La"
        highlight="Collection"
        subtitle="Des équipements de niveau professionnel, conçus et cousus à Dakar. Livraison offerte dans la capitale."
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
          'Livraison offerte à Dakar',
          'Retours gratuits sous 14 jours',
          'Flocage nom + numéro',
          'Tarifs clubs dès 10 pièces',
        ]}
      />

      <ProduitsClient initialCategory={initialCategory} />
    </>
  );
}
