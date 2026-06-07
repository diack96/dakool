import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import PopularCourses from '@/components/home/PopularCourses';
import BelowFoldSections from '@/components/home/BelowFoldSections';
import { getHomepageCourses } from '@/lib/queries/getHomepageCourses';

const HowItWorks = dynamic(() => import('@/components/home/HowItWorks'), {
  loading: () => <div className="h-96 bg-gray-50 dark:bg-gray-900 animate-pulse" />,
  ssr: true,
});
const FinalCTA = dynamic(() => import('@/components/home/FinalCTA'), {
  loading: () => <div className="h-64 bg-gray-50 dark:bg-gray-900 animate-pulse" />,
  ssr: true,
});

export default async function HomePage () {
  // Fetch des cours côté serveur (cache ISR 5 min) — élimine le round-trip client
  const initialCourses = await getHomepageCourses();

  return (
    <div className="min-h-screen">
      {/* 1. Hero — above the fold, SSR complet */}
      <Hero />

      {/* 2. Nos formations — données pré-chargées côté serveur */}
      <PopularCourses initialCourses={initialCourses} />

      {/* 3 & 5. Statistiques + Témoignages — below fold, hydratation différée (client only) */}
      <BelowFoldSections />

      {/* 4. Comment ça marche */}
      <Suspense fallback={<div className="h-96 bg-gray-50 dark:bg-gray-900 animate-pulse transition-colors" />}>
        <HowItWorks />
      </Suspense>

      {/* 6. Final CTA */}
      <Suspense fallback={<div className="h-64 bg-gray-50 dark:bg-gray-900 animate-pulse transition-colors" />}>
        <FinalCTA />
      </Suspense>
    </div>
  );
}
