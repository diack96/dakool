'use client';

import { useState, useCallback } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { CourseLevel } from '@/types/course';
import AdvancedFiltersPanel from './AdvancedFiltersPanel';
import ActiveFiltersChips from './ActiveFiltersChips';

interface ModernCourseFiltersProps {
  searchQuery: string;
  selectedCategories: string[];
  selectedLevels: CourseLevel[];
  selectedExtras: string[]; // 'free', 'certified'
  priceRange: [number, number];
  durationRange: [number, number];
  sortBy: 'popular' | 'newest' | 'rating' | 'price';
  onSearchChange: (query: string) => void;
  onCategoriesChange: (categories: string[]) => void;
  onLevelsChange: (levels: CourseLevel[]) => void;
  onExtrasChange: (extras: string[]) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onDurationRangeChange: (range: [number, number]) => void;
  onSortChange: (sort: 'popular' | 'newest' | 'rating' | 'price') => void;
  onClearAll: () => void;
}

// Catégories disponibles
const CATEGORIES = [
  {
    id: 'tech', label: 'Tech',
    dot: 'bg-blue-500',
    active: 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-200 dark:shadow-blue-900/40',
    hover: 'hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-600 dark:hover:text-blue-400',
  },
  {
    id: 'design', label: 'Design',
    dot: 'bg-purple-500',
    active: 'bg-purple-500 text-white border-purple-500 shadow-sm shadow-purple-200 dark:shadow-purple-900/40',
    hover: 'hover:border-purple-300 hover:text-purple-600 dark:hover:border-purple-600 dark:hover:text-purple-400',
  },
  {
    id: 'business', label: 'Business',
    dot: 'bg-indigo-500',
    active: 'bg-indigo-500 text-white border-indigo-500 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40',
    hover: 'hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-600 dark:hover:text-indigo-400',
  },
  {
    id: 'ia', label: 'IA',
    dot: 'bg-orange-500',
    active: 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200 dark:shadow-orange-900/40',
    hover: 'hover:border-orange-300 hover:text-orange-600 dark:hover:border-orange-600 dark:hover:text-orange-400',
  },
  {
    id: 'marketing', label: 'Marketing',
    dot: 'bg-emerald-500',
    active: 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40',
    hover: 'hover:border-emerald-300 hover:text-emerald-600 dark:hover:border-emerald-600 dark:hover:text-emerald-400',
  },
];

// Niveaux disponibles
const LEVELS: { value: CourseLevel; label: string; dot: string; active: string; hover: string }[] = [
  {
    value: 'DÉBUTANT', label: 'Débutant',
    dot: 'bg-green-400',
    active: 'bg-green-500 text-white border-green-500 shadow-sm shadow-green-200 dark:shadow-green-900/40',
    hover: 'hover:border-green-300 hover:text-green-600 dark:hover:border-green-600 dark:hover:text-green-400',
  },
  {
    value: 'INTERMÉDIAIRE', label: 'Intermédiaire',
    dot: 'bg-amber-400',
    active: 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200 dark:shadow-amber-900/40',
    hover: 'hover:border-amber-300 hover:text-amber-600 dark:hover:border-amber-600 dark:hover:text-amber-400',
  },
  {
    value: 'AVANCÉ', label: 'Avancé',
    dot: 'bg-red-400',
    active: 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-200 dark:shadow-red-900/40',
    hover: 'hover:border-red-300 hover:text-red-600 dark:hover:border-red-600 dark:hover:text-red-400',
  },
];

// Extras disponibles
const EXTRAS = [
  {
    id: 'free', label: 'Gratuit',
    dot: 'bg-teal-400',
    active: 'bg-teal-500 text-white border-teal-500 shadow-sm shadow-teal-200 dark:shadow-teal-900/40',
    hover: 'hover:border-teal-300 hover:text-teal-600 dark:hover:border-teal-600 dark:hover:text-teal-400',
  },
  {
    id: 'certified', label: 'Certifiant',
    dot: 'bg-violet-400',
    active: 'bg-violet-500 text-white border-violet-500 shadow-sm shadow-violet-200 dark:shadow-violet-900/40',
    hover: 'hover:border-violet-300 hover:text-violet-600 dark:hover:border-violet-600 dark:hover:text-violet-400',
  },
];

export default function ModernCourseFilters({
  searchQuery,
  selectedCategories,
  selectedLevels,
  selectedExtras,
  priceRange,
  durationRange,
  sortBy,
  onSearchChange,
  onCategoriesChange,
  onLevelsChange,
  onExtrasChange,
  onPriceRangeChange,
  onDurationRangeChange,
  onSortChange,
  onClearAll,
}: ModernCourseFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Toggle catégorie
  const toggleCategory = useCallback((categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  }, [selectedCategories, onCategoriesChange]);

  // Toggle niveau
  const toggleLevel = useCallback((level: CourseLevel) => {
    if (selectedLevels.includes(level)) {
      onLevelsChange(selectedLevels.filter((l) => l !== level));
    } else {
      onLevelsChange([...selectedLevels, level]);
    }
  }, [selectedLevels, onLevelsChange]);

  // Toggle extra
  const toggleExtra = useCallback((extraId: string) => {
    if (selectedExtras.includes(extraId)) {
      onExtrasChange(selectedExtras.filter((id) => id !== extraId));
    } else {
      onExtrasChange([...selectedExtras, extraId]);
    }
  }, [selectedExtras, onExtrasChange]);

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = 
    searchQuery.trim() !== '' ||
    selectedCategories.length > 0 ||
    selectedLevels.length > 0 ||
    selectedExtras.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 100000 ||
    durationRange[0] > 0 ||
    durationRange[1] < 1000 ||
    sortBy !== 'popular';

  return (
    <div className="space-y-6">
      {/* Barre de recherche principale */}
      <div className="relative">
        <label htmlFor="main-search" className="sr-only">
          Que veux-tu apprendre aujourd'hui ?
        </label>
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          <input
            id="main-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un cours..."
            className="w-full pl-14 pr-12 py-4 text-base border-0 rounded-2xl focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 outline-none bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            aria-label="Que veux-tu apprendre aujourd'hui ?"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Effacer la recherche"
            >
              <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </button>
          )}
        </div>
        <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400 px-1">
          Que veux-tu apprendre aujourd'hui ?
        </p>
      </div>

      {/* Filtres rapides — ligne unique avec séparateurs */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex items-center gap-2 min-w-max py-1">

          {/* ── Catégories ── */}
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`
                  flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium
                  border transition-all duration-150 whitespace-nowrap
                  focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current/30
                  ${isActive
                    ? cat.active
                    : `bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
                       border-gray-200 dark:border-gray-700 ${cat.hover}`
                  }
                `}
                aria-pressed={isActive}
                aria-label={`Filtrer par ${cat.label}`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-white/70' : cat.dot}`} />
                {cat.label}
              </button>
            );
          })}

          {/* Séparateur */}
          <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0" aria-hidden="true" />

          {/* ── Niveaux ── */}
          {LEVELS.map((level) => {
            const isActive = selectedLevels.includes(level.value);
            return (
              <button
                key={level.value}
                onClick={() => toggleLevel(level.value)}
                className={`
                  flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium
                  border transition-all duration-150 whitespace-nowrap
                  focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current/30
                  ${isActive
                    ? level.active
                    : `bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
                       border-gray-200 dark:border-gray-700 ${level.hover}`
                  }
                `}
                aria-pressed={isActive}
                aria-label={`Filtrer par niveau ${level.label}`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-white/70' : level.dot}`} />
                {level.label}
              </button>
            );
          })}

          {/* Séparateur */}
          <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0" aria-hidden="true" />

          {/* ── Extras ── */}
          {EXTRAS.map((extra) => {
            const isActive = selectedExtras.includes(extra.id);
            return (
              <button
                key={extra.id}
                onClick={() => toggleExtra(extra.id)}
                className={`
                  flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium
                  border transition-all duration-150 whitespace-nowrap
                  focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current/30
                  ${isActive
                    ? extra.active
                    : `bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
                       border-gray-200 dark:border-gray-700 ${extra.hover}`
                  }
                `}
                aria-pressed={isActive}
                aria-label={`Filtrer par ${extra.label}`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-white/70' : extra.dot}`} />
                {extra.label}
              </button>
            );
          })}

        </div>
      </div>

      {/* Filtres actifs et bouton avancé */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Chips des filtres actifs */}
          {hasActiveFilters && (
          <ActiveFiltersChips
            searchQuery={searchQuery}
            selectedCategories={selectedCategories}
            selectedLevels={selectedLevels}
            selectedExtras={selectedExtras}
            priceRange={priceRange}
            durationRange={durationRange}
            sortBy={sortBy}
            onRemoveSearch={() => onSearchChange('')}
            onRemoveCategory={(id) => toggleCategory(id)}
            onRemoveLevel={(level) => toggleLevel(level)}
            onRemoveExtra={(id) => toggleExtra(id)}
            onClearAll={onClearAll}
          />
        )}

        {/* Bouton filtres avancés */}
        <button
          onClick={() => setIsAdvancedOpen(true)}
          className={`
            flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200
            ${isAdvancedOpen || hasActiveFilters
              ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500/50
          `}
          aria-label="Ouvrir les filtres avancés"
        >
          <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          <span>Filtres avancés</span>
        </button>
      </div>

      {/* Panneau de filtres avancés */}
      <AdvancedFiltersPanel
        isOpen={isAdvancedOpen}
        onClose={() => setIsAdvancedOpen(false)}
        priceRange={priceRange}
        durationRange={durationRange}
        sortBy={sortBy}
        onPriceRangeChange={onPriceRangeChange}
        onDurationRangeChange={onDurationRangeChange}
        onSortChange={onSortChange}
      />
    </div>
  );
}

