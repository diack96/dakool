'use client';

import dynamic from 'next/dynamic';

// Sections below-the-fold : hydratation différée côté client uniquement
// ssr: false = pas de HTML serveur pour ces sections (below fold = ok pour SEO)
const StatsSection = dynamic(() => import('@/components/home/StatsSection'), {
  ssr: false,
  loading: () => <div className="py-12 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900" />,
});

const Testimonials = dynamic(() => import('@/components/home/Testimonials'), {
  ssr: false,
  loading: () => <div className="py-16 md:py-20 bg-indigo-50 dark:bg-gray-900" />,
});

export default function BelowFoldSections() {
  return (
    <>
      <StatsSection />
      <Testimonials />
    </>
  );
}
