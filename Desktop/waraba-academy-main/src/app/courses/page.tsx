import type { Metadata } from 'next';
import { Suspense } from 'react';
import { generatePageMetadata } from '@/lib/seo';
import CoursesClient from './_Client';

export const revalidate = 3600;

export const metadata: Metadata = generatePageMetadata(
  'Toutes les formations en ligne',
  'Explorez notre catalogue de formations en Digital, IA, Marketing et Soft Skills. Des cours certifiants pour transformer votre carrière, accessibles depuis toute l\'Afrique.',
  '/courses'
);

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <CoursesClient />
    </Suspense>
  );
}
