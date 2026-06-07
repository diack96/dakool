'use client';

import { X } from 'lucide-react';
import { CourseLevel } from '@/types/course';

interface ActiveFiltersChipsProps {
  searchQuery: string;
  selectedCategories: string[];
  selectedLevels: CourseLevel[];
  selectedExtras: string[];
  priceRange: [number, number];
  durationRange: [number, number];
  sortBy: 'popular' | 'newest' | 'rating' | 'price';
  onRemoveSearch: () => void;
  onRemoveCategory: (id: string) => void;
  onRemoveLevel: (level: CourseLevel) => void;
  onRemoveExtra: (id: string) => void;
  onClearAll: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  tech: 'Tech',
  design: 'Design',
  business: 'Business',
  ia: 'IA',
  marketing: 'Marketing',
};

const LEVEL_LABELS: Record<CourseLevel, string> = {
  'DÉBUTANT': 'Débutant',
  'INTERMÉDIAIRE': 'Intermédiaire',
  'AVANCÉ': 'Avancé',
};

const EXTRA_LABELS: Record<string, string> = {
  free: 'Gratuit',
  certified: 'Certifiant',
};

const SORT_LABELS: Record<string, string> = {
  popular: 'Popularité',
  newest: 'Nouveautés',
  rating: 'Note',
  price: 'Prix',
};

export default function ActiveFiltersChips({
  searchQuery,
  selectedCategories,
  selectedLevels,
  selectedExtras,
  priceRange,
  durationRange,
  sortBy,
  onRemoveSearch,
  onRemoveCategory,
  onRemoveLevel,
  onRemoveExtra,
  onClearAll,
}: ActiveFiltersChipsProps) {
  const activeFilters: Array<{ id: string; label: string; onRemove: () => void }> = [];

  // Recherche
  if (searchQuery.trim()) {
    activeFilters.push({
      id: 'search',
      label: `"${searchQuery}"`,
      onRemove: onRemoveSearch,
    });
  }

  // Catégories
  selectedCategories.forEach((id) => {
    activeFilters.push({
      id: `category-${id}`,
      label: CATEGORY_LABELS[id] || id,
      onRemove: () => onRemoveCategory(id),
    });
  });

  // Niveaux
  selectedLevels.forEach((level) => {
    activeFilters.push({
      id: `level-${level}`,
      label: LEVEL_LABELS[level],
      onRemove: () => onRemoveLevel(level),
    });
  });

  // Extras
  selectedExtras.forEach((id) => {
    activeFilters.push({
      id: `extra-${id}`,
      label: EXTRA_LABELS[id] || id,
      onRemove: () => onRemoveExtra(id),
    });
  });

  // Prix
  if (priceRange[0] > 0 || priceRange[1] < 100000) {
    activeFilters.push({
      id: 'price',
      label: `${priceRange[0]} - ${priceRange[1]} FCFA`,
      onRemove: () => {}, // Géré par le panneau avancé
    });
  }

  // Durée
  if (durationRange[0] > 0 || durationRange[1] < 1000) {
    const formatDuration = (minutes: number) => {
      if (minutes < 60) return `${minutes}min`;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
    };
    activeFilters.push({
      id: 'duration',
      label: `${formatDuration(durationRange[0])} - ${formatDuration(durationRange[1])}`,
      onRemove: () => {}, // Géré par le panneau avancé
    });
  }

  // Tri
  if (sortBy !== 'popular') {
    activeFilters.push({
      id: 'sort',
      label: `Tri: ${SORT_LABELS[sortBy]}`,
      onRemove: () => {}, // Géré par le panneau avancé
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600 font-medium">Filtres actifs:</span>
      {activeFilters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
        >
          <span>{filter.label}</span>
          {filter.onRemove && (
            <button
              onClick={filter.onRemove}
              className="p-0.5 rounded-full hover:bg-blue-100 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label={`Retirer le filtre ${filter.label}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
        aria-label="Réinitialiser tous les filtres"
      >
        <X className="w-4 h-4" />
        <span>Réinitialiser</span>
      </button>
    </div>
  );
}

