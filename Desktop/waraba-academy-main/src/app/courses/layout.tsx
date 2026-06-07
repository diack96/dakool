import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Tous nos cours',
  'Découvrez notre catalogue complet de formations en ligne : Digital, IA, Soft Skills et bien plus. Formations certifiantes pour transformer votre carrière.',
  '/courses',
);

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

