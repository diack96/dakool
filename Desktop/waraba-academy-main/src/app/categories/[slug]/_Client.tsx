'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BookOpen,
  Code,
  Palette,
  TrendingUp,
  Brain,
  Users,
  Zap,
  ArrowRight,
  Star,
  Clock,
  Eye,
  Bookmark,
  Rocket,
  Award,
  Loader2,
  Search,
} from 'lucide-react';

import { Course } from '@/types/course';
import { getCourseUrl } from '@/lib/utils/courseUrl';

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
  return 'bg-gray-500';
};

// Récupérer les cours d'une catégorie depuis l'API
const fetchCoursesForCategory = async (categorySlug: string) => {
  try {
    // Utiliser CourseService pour avoir le même format partout
    const { CourseService } = await import('@/services/courseService');
    const allCourses = await CourseService.getCourses();

    // Filtrer par catégorie (en utilisant le slug)
    const categoryCourses = allCourses.filter(course => {
      const courseCategorySlug = course.category.slug || course.category.name.toLowerCase().replace(/\s+/g, '-');
      return courseCategorySlug === categorySlug;
    });

    return categoryCourses;
  } catch (error) {
    console.error('Erreur lors de la récupération des cours de la catégorie:', error);
    return [];
  }
};

// Récupérer une catégorie par son slug
const fetchCategoryBySlug = async (slug: string): Promise<Category | null> => {
  try {
    const response = await fetch('/api/public/categories', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des catégories');
    }

    const data = await response.json();
    if (data.success && data.categories) {
      const category = data.categories.find((cat: Category) => cat.slug === slug);
      return category || null;
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    return null;
  }
};

export default function CategoryPage () {
  const params = useParams();
  const slug = params.slug as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Tous');

  useEffect(() => {
    const loadCategoryData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Récupérer la catégorie depuis l'API
        const foundCategory = await fetchCategoryBySlug(slug);
        
        if (!foundCategory) {
          setError('Catégorie non trouvée');
          setLoading(false);
          return;
        }

        setCategory(foundCategory);

        // Récupérer les vrais cours de cette catégorie
        const categoryCourses = await fetchCoursesForCategory(slug);
        setCourses(categoryCourses);

        // Mettre à jour le nombre de cours réel
        setCategory({
          ...foundCategory,
          courseCount: categoryCourses.length,
        });
      } catch (err: any) {
        console.error('Erreur lors du chargement de la catégorie:', err);
        setError(err.message || 'Erreur lors du chargement de la catégorie');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadCategoryData();
    }
  }, [slug]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Convertir le niveau du cours (DÉBUTANT -> Débutant) pour la comparaison
    const courseLevelDisplay = course.level === 'DÉBUTANT' ? 'Débutant' :
      course.level === 'INTERMÉDIAIRE' ? 'Intermédiaire' :
        course.level === 'AVANCÉ' ? 'Avancé' : 'Débutant';
    const matchesLevel = selectedLevel === 'Tous' || courseLevelDisplay === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  const getLevelColor = (level: string) => {
    // Gérer les deux formats (DÉBUTANT et Débutant)
    const levelUpper = level.toUpperCase();
    if (levelUpper === 'DÉBUTANT' || levelUpper === 'DEBUTANT' || level === 'Débutant') {
      return 'bg-green-100 text-green-800';
    }
    if (levelUpper === 'INTERMÉDIAIRE' || levelUpper === 'INTERMEDIAIRE' || level === 'Intermédiaire') {
      return 'bg-orange-100 text-orange-800';
    }
    if (levelUpper === 'AVANCÉ' || levelUpper === 'AVANCE' || level === 'Avancé') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const formatLevel = (level: string): string => {
    if (level === 'DÉBUTANT') return 'Débutant';
    if (level === 'INTERMÉDIAIRE') return 'Intermédiaire';
    if (level === 'AVANCÉ') return 'Avancé';
    return level;
  };

  const formatDuration = (minutes: number): string => {
    if (!minutes || minutes === 0) return 'N/A';
    const hours = Math.round(minutes / 60);
    return hours > 0 ? `${hours}h` : `${minutes}min`;
  };

  const formatPrice = (price: number, isFree: boolean): string => {
    if (isFree || price === 0) return 'Gratuit';
    return `${price.toLocaleString()} FCFA`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la catégorie...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Catégorie non trouvée'}
          </h2>
          <Link href="/categories" className="text-blue-600 hover:underline">
            Retour aux catégories
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = getCategoryIcon(category.name);
  const colorClass = getCategoryColor(category.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Header de la catégorie */}
      <section className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 ${colorClass} text-white rounded-2xl mb-6`}>
              <IconComponent className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {category.name}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              {category.description}
            </p>
            <div className="flex items-center justify-center space-x-8 text-gray-500">
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                {category.courseCount} cours
              </div>
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Certifiés
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filtres et recherche */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Tous">Tous les niveaux</option>
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Avancé">Avancé</option>
            </select>
          </div>
          <div className="text-gray-600">
            {filteredCourses.length} cours trouvé{filteredCourses.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Grille des cours */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                {/* Image du cours */}
                <Link href={getCourseUrl(course)}>
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center overflow-hidden relative">
                    {course.thumbnail || course.image ? (
                      <Image
                        src={course.thumbnail || course.image || ''}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <BookOpen className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                </Link>

                <div className="p-6">
                  {/* Niveau et note */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`${getLevelColor(course.level)} text-xs font-semibold px-3 py-1 rounded-full`}>
                      {formatLevel(course.level)}
                    </span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold text-gray-700 ml-1">{course.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Titre et description */}
                  <Link href={getCourseUrl(course)}>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors cursor-pointer">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                    {course.description}
                  </p>

                  {/* Métadonnées */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDuration(course.totalDuration)}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {course.totalLessons} leçons
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.totalStudents.toLocaleString()}
                    </div>
                  </div>

                  {/* Prix et instructeur */}
                  <div className="flex items-center justify-between mb-6 text-sm">
                    <div className="text-gray-600">
                      Par <span className="font-medium">{course.instructor.firstName} {course.instructor.lastName}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${course.isFree ? 'text-green-600' : 'text-gray-900'}`}>
                        {formatPrice(course.price, course.isFree)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Link
                      href={getCourseUrl(course)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold transform hover:scale-105 group-hover:shadow-lg flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir le cours
                    </Link>
                    <button className="px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun cours trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedLevel !== 'Tous' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Aucun cours disponible dans cette catégorie pour le moment'}
            </p>
            {(searchTerm || selectedLevel !== 'Tous') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLevel('Tous');
                }}
                className="text-blue-600 hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Prêt à maîtriser {category.name} ?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Rejoignez des milliers d'apprenants qui ont déjà transformé leur carrière
            avec nos formations expertes en {category.name.toLowerCase()}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Commencer gratuitement
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Voir tous les cours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
