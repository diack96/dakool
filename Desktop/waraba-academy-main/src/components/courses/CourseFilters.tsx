
import {
  Search,
  Code,
  Palette,
  Brain,
  Globe,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { CourseLevel } from '@/types/course';

interface CourseFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  selectedLevel: CourseLevel | '';
  selectedPrice: 'all' | 'free' | 'paid';
  sortBy: 'popular' | 'rating' | 'newest' | 'price';
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onLevelChange: (level: CourseLevel | '') => void;
  onPriceChange: (price: 'all' | 'free' | 'paid') => void;
  onSortChange: (sort: 'popular' | 'rating' | 'newest' | 'price') => void;
  onClearFilters: () => void;
}

export default function CourseFilters ({
  searchQuery,
  selectedCategory,
  selectedLevel,
  selectedPrice,
  sortBy,
  onSearchChange,
  onCategoryChange,
  onLevelChange,
  onPriceChange,
  onSortChange,
  onClearFilters,
}: CourseFiltersProps) {
  // Catégories disponibles
  const categories = [
    { id: 'developpement', name: 'Développement', icon: Code, color: 'bg-blue-500' },
    { id: 'design', name: 'Design', icon: Palette, color: 'bg-purple-500' },
    { id: 'ia', name: 'Intelligence Artificielle', icon: Brain, color: 'bg-green-500' },
    { id: 'marketing', name: 'Marketing Digital', icon: TrendingUp, color: 'bg-orange-500' },
    { id: 'business', name: 'Business', icon: Globe, color: 'bg-indigo-500' },
    { id: 'securite', name: 'Cybersécurité', icon: Shield, color: 'bg-red-500' },
  ];

  // Niveaux disponibles
  const levels: { value: CourseLevel; label: string; color: string }[] = [
    { value: 'DÉBUTANT', label: 'Débutant', color: 'bg-green-100 text-green-800' },
    { value: 'INTERMÉDIAIRE', label: 'Intermédiaire', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'AVANCÉ', label: 'Avancé', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recherche */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Rechercher un cours
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              id="search"
              placeholder="Ex: React, Design, Marketing..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Catégorie */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Niveau */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
            Niveau
          </label>
          <select
            id="level"
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value as CourseLevel | '')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les niveaux</option>
            {levels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtres supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Prix */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Prix
          </label>
          <select
            id="price"
            value={selectedPrice}
            onChange={(e) => onPriceChange(e.target.value as 'all' | 'free' | 'paid')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les prix</option>
            <option value="free">Gratuits</option>
            <option value="paid">Payants</option>
          </select>
        </div>

        {/* Tri */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
            Trier par
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'popular' | 'rating' | 'newest' | 'price')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="popular">Popularité</option>
            <option value="rating">Note</option>
            <option value="newest">Plus récents</option>
            <option value="price">Prix</option>
          </select>
        </div>

        {/* Bouton réinitialiser */}
        <div className="flex items-end">
          <button
            onClick={onClearFilters}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}
