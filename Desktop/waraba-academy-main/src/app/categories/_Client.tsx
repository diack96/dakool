'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Code,
  Palette,
  TrendingUp,
  Brain,
  Users,
  Globe,
  Zap,
  ArrowRight,
  GraduationCap,
  Loader2,
  Search,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  image_url?: string | null;
  courseCount: number;
}

// Mapping des icônes par nom de catégorie
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('développement') || name.includes('web') || name.includes('code')) {
    return Code;
  }
  if (name.includes('design') || name.includes('créativité') || name.includes('graphique')) {
    return Palette;
  }
  if (name.includes('marketing') || name.includes('digital')) {
    return TrendingUp;
  }
  if (name.includes('intelligence') || name.includes('artificielle') || name.includes('ia') || name.includes('ai')) {
    return Brain;
  }
  if (name.includes('business') || name.includes('management') || name.includes('gestion')) {
    return Users;
  }
  if (name.includes('devops') || name.includes('cloud') || name.includes('infrastructure')) {
    return Zap;
  }
  if (name.includes('mobile') || name.includes('app')) {
    return Globe;
  }
  if (name.includes('soft') || name.includes('compétence') || name.includes('personnel')) {
    return GraduationCap;
  }
  return BookOpen;
};

// Mapping des couleurs par nom de catégorie
const getCategoryColor = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('développement') || name.includes('web') || name.includes('code')) {
    return 'bg-blue-500';
  }
  if (name.includes('design') || name.includes('créativité') || name.includes('graphique')) {
    return 'bg-purple-500';
  }
  if (name.includes('marketing') || name.includes('digital')) {
    return 'bg-green-500';
  }
  if (name.includes('intelligence') || name.includes('artificielle') || name.includes('ia') || name.includes('ai')) {
    return 'bg-orange-500';
  }
  if (name.includes('business') || name.includes('management') || name.includes('gestion')) {
    return 'bg-indigo-500';
  }
  if (name.includes('devops') || name.includes('cloud') || name.includes('infrastructure')) {
    return 'bg-red-500';
  }
  if (name.includes('mobile') || name.includes('app')) {
    return 'bg-teal-500';
  }
  if (name.includes('soft') || name.includes('compétence') || name.includes('personnel')) {
    return 'bg-pink-500';
  }
  return 'bg-gray-500';
};

export default function CategoriesPage () {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/public/categories', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des catégories');
        }

        const data = await response.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
        } else {
          throw new Error('Format de réponse invalide');
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement des catégories:', err);
        setError(err.message || 'Erreur lors du chargement des catégories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explorez nos domaines d'expertise
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez des formations spécialisées dans les domaines les plus demandés du marché.
              Choisissez votre parcours et transformez votre carrière.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredCategories.length} catégorie{filteredCategories.length > 1 ? 's' : ''} trouvée{filteredCategories.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Grille des catégories */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map(category => {
              const IconComponent = getCategoryIcon(category.name);
              const colorClass = getCategoryColor(category.name);

              return (
                <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Header de la catégorie */}
                  <div className={`${colorClass} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent className="w-12 h-12" />
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                        {category.courseCount} cours
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                      {category.description}
                    </p>
                  </div>

                  {/* Contenu de la catégorie */}
                  <div className="p-6">
                    {/* Action */}
                    <Link
                      href={`/categories/${category.slug}`}
                      className="inline-flex items-center justify-center w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      Explorer {category.name}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune catégorie trouvée
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Aucune catégorie disponible pour le moment'}
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Prêt à commencer votre apprentissage ?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Rejoignez des milliers d'apprenants qui ont déjà transformé leur carrière
            avec nos formations expertes. Commencez dès aujourd'hui !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg"
            >
              Voir tous les cours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
