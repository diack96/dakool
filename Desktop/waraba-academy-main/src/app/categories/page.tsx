import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import CategoriesClient from './_Client';

export const revalidate = 3600;

export const metadata: Metadata = generatePageMetadata(
  'Catégories de formations',
  'Parcourez toutes les catégories de formations Waraba Academy : Digital, IA, Marketing, Développement web, Entrepreneuriat et plus encore.',
  '/categories'
);

export default function CategoriesPage() {
  return <CategoriesClient />;
}