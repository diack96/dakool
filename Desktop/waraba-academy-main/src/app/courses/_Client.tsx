'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { useCourseStore, useCourseSelectors } from '@/stores/courseStore';
import { CourseLevel } from '@/types/course';
import ModernCourseFilters from '@/components/courses/ModernCourseFilters';
import CourseGrid from '@/components/courses/CourseGrid';

export default function CoursesPage () {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialiser les filtres depuis l'URL (permet le partage de liens filtrés)
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get('category');
    return cat ? [cat] : [];
  });
  const [selectedLevels, setSelectedLevels] = useState<CourseLevel[]>(() => {
    const lvl = searchParams.get('level') as CourseLevel | null;
    return lvl ? [lvl] : [];
  });
  const [selectedExtras, setSelectedExtras] = useState<string[]>(() => {
    const price = searchParams.get('price');
    return price === 'free' ? ['free'] : [];
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'price'>(
    () => (searchParams.get('sort') as any) || 'popular',
  );

  const {
    filteredCourses,
    isLoading,
    error,
    fetchCourses,
    setFilters,
    setSearchQuery: setStoreSearchQuery,
    clearFilters,
  } = useCourseStore();

  const { getPaginatedCourses } = useCourseSelectors();

  // Synchroniser les filtres actifs dans l'URL (permet partage + navigation back)
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategories[0]) params.set('category', selectedCategories[0]);
    if (selectedLevels[0]) params.set('level', selectedLevels[0]);
    if (selectedExtras.includes('free')) params.set('price', 'free');
    if (sortBy !== 'popular') params.set('sort', sortBy);
    const qs = params.toString();
    router.replace(qs ? `/courses?${qs}` : '/courses', { scroll: false });
  }, [searchQuery, selectedCategories, selectedLevels, selectedExtras, sortBy, router]);

  // Convertir les nouveaux filtres vers le format du store
  // Le store attend une seule catégorie et un seul niveau, on prend le premier si plusieurs
  const storeFilters = useMemo(() => {
    const filters: any = {
      sortBy,
    };

    // Catégorie (prendre la première si plusieurs)
    if (selectedCategories.length > 0 && selectedCategories[0]) {
      // Mapper les IDs de catégories vers les slugs réels
      const categoryMap: Record<string, string> = {
        tech: 'developpement',
        design: 'design',
        business: 'business',
        ia: 'ia',
        marketing: 'marketing',
      };
      const firstCategory = selectedCategories[0];
      filters.category = categoryMap[firstCategory] || firstCategory;
    }

    // Niveau (prendre le premier si plusieurs)
    if (selectedLevels.length > 0 && selectedLevels[0]) {
      filters.level = selectedLevels[0];
    }

    // Prix (gratuit ou payant)
    if (selectedExtras.includes('free')) {
      filters.price = 'free';
    } else if (selectedExtras.length === 0 && priceRange[0] > 0) {
      // Si on a un range de prix mais pas "gratuit", c'est payant
      filters.price = 'paid';
    }

    return filters;
  }, [selectedCategories, selectedLevels, selectedExtras, priceRange, sortBy]);

  // Appliquer les filtres
  useEffect(() => {
    setFilters(storeFilters);
  }, [storeFilters, setFilters]);

  // Gérer la recherche
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setStoreSearchQuery(query);
  };

  // Réinitialiser tous les filtres
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedExtras([]);
    setPriceRange([0, 100000]);
    setDurationRange([0, 1000]);
    setSortBy('popular');
    clearFilters();
  };

  // Récupérer les cours paginés
  const paginatedCourses = getPaginatedCourses();

  // Afficher l'erreur seulement si on n'a aucun cours et qu'on n'est pas en train de charger
  if (error && !isLoading && filteredCourses.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-gray-900 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Erreur lors du chargement des cours
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => fetchCourses({}).catch(() => {})}
                className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
              >
                Réessayer
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Retour à l'accueil
              </Link>
            </div>
            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              <p>Si le problème persiste, vérifiez votre connexion internet.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 pt-24">
      {/* Hero */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Découvrez nos formations
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Des cours de qualité pour développer vos compétences numériques et accélérer votre carrière
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filtres et Recherche */}
        <ModernCourseFilters
          searchQuery={searchQuery}
          selectedCategories={selectedCategories}
          selectedLevels={selectedLevels}
          selectedExtras={selectedExtras}
          priceRange={priceRange}
          durationRange={durationRange}
          sortBy={sortBy}
          onSearchChange={handleSearch}
          onCategoriesChange={setSelectedCategories}
          onLevelsChange={setSelectedLevels}
          onExtrasChange={setSelectedExtras}
          onPriceRangeChange={setPriceRange}
          onDurationRangeChange={setDurationRange}
          onSortChange={setSortBy}
          onClearAll={handleClearFilters}
        />

        {/* Résultats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isLoading ? 'Chargement...' : `${filteredCourses.length} cours trouvés`}
            </h2>

            {!isLoading && (
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Affichage de {paginatedCourses.length} cours</span>
              </div>
            )}
          </div>

          {/* Grille des cours */}
          <CourseGrid
            courses={paginatedCourses}
            isLoading={isLoading}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Prêt à commencer votre apprentissage ?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d&apos;apprenants qui ont déjà transformé leur carrière avec nos formations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/auth/register?redirect=${encodeURIComponent('/courses')}`}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/categories"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold text-lg"
            >
              Explorer les catégories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
