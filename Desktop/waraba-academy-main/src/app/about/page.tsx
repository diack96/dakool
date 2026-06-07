import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import AboutClient from './_Client';

export const revalidate = 3600;

export const metadata: Metadata = generatePageMetadata(
  'À propos de Waraba Academy',
  "Découvrez Waraba Academy, la plateforme de formation en ligne dédiée aux apprenants africains. Notre mission : démocratiser l'accès aux compétences numériques.",
  '/about'
);

export default function AboutPage() {
  return <AboutClient />;
}