'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import { fetchWithTimeout } from '@/lib/utils/fetchTimeout';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  Search,
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertCircle,
  TrendingUp,
  Award,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Course, CourseLevel } from '@/types/course';
import { getCourseUrl } from '@/lib/utils/courseUrl';
import CourseCardSimple from '@/components/courses/CourseCardSimple';

interface EnrolledCourse extends Course {
  enrollmentId: string;
  enrollmentStatus: 'pending' | 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
  completedAt?: string;
  progress: number;
  lastAccessed?: string;
}

interface RawEnrollment {
  id: string;
  course_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  progress: number;
  enrolled_at: string;
  completed_at?: string;
  created_at: string;
  courses?: {
    id: string;
    title: string;
    slug?: string;
    thumbnail?: string;
    image_url?: string;
    description?: string;
    level?: CourseLevel;
    rating?: number;
    price?: number;
    duration?: number;
    totalDuration?: number;
    totalLessons?: number;
    totalStudents?: number;
  };
}

export default function DashboardCoursesPage () {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'in-progress' | 'completed' | 'pending' | 'cancelled'>('all');
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | 'all'>('all');
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true);
  const [enrollmentsError, setEnrollmentsError] = useState<string | null>(null);
  const fetchEnrollmentsRef = useRef(false); // Prevent multiple simultaneous calls

  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Récupérer les vraies inscriptions depuis l'API
  useEffect(() => {
    if (!isAuthenticated || fetchEnrollmentsRef.current) {
      if (!isAuthenticated) {
        setIsLoadingEnrollments(false);
      }
      return;
    }

    fetchEnrollmentsRef.current = true;
    const fetchEnrollments = async () => {
      try {
        setIsLoadingEnrollments(true);
        setEnrollmentsError(null);

        const response = await fetchWithTimeout('/api/enrollments', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || 'Erreur lors de la récupération des inscriptions';
          console.error('Erreur API enrollments:', {
            status: response.status,
            statusText: response.statusText,
            error: errorMessage,
            details: errorData.details,
          });
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.success) {
          const errorMessage = data.error || 'Erreur lors de la récupération des inscriptions';
          console.error('Réponse API non réussie:', data);
          throw new Error(errorMessage);
        }

        if (!Array.isArray(data.enrollments)) {
          logger.warn('Les inscriptions ne sont pas un tableau:', data.enrollments);
          setEnrolledCourses([]);
          return;
        }

        // Les données du cours sont déjà présentes via jointure Supabase (enrollment.courses)
        // La progression est déjà dans enrollment.progress — aucun fetch supplémentaire nécessaire
        const enrichedCourses: (EnrolledCourse | null)[] = (data.enrollments as RawEnrollment[]).map((enrollment) => {
          const course = enrollment.courses;
          if (!course && !enrollment.course_id) return null;

          const courseId = course?.id || enrollment.course_id || 'unknown';
          return {
            id: courseId,
            slug: course?.slug || undefined,
            title: course?.title || 'Cours sans titre',
            description: course?.description || '',
            level: (course?.level || 'beginner') as CourseLevel,
            rating: course?.rating ?? 0,
            thumbnail: course?.thumbnail || course?.image_url || null,
            image: course?.image_url || null,
            totalDuration: course?.totalDuration || course?.duration || null,
            totalLessons: course?.totalLessons || 0,
            totalStudents: course?.totalStudents || 0,
            price: course?.price ?? 0,
            enrollmentId: enrollment.id,
            enrollmentStatus: enrollment.status || 'pending',
            enrolledAt: enrollment.enrolled_at || enrollment.created_at || new Date().toISOString(),
            completedAt: enrollment.completed_at,
            progress: enrollment.progress || 0,
            lastAccessed: enrollment.enrolled_at || enrollment.created_at || new Date().toISOString(),
          } as EnrolledCourse;
        });

        // Filtrer les valeurs null et valider les cours
        const filteredCourses = enrichedCourses.filter((course): course is EnrolledCourse => {
          if (!course) return false;
          // Valider que le cours a les propriétés minimales requises
          return !!(course.id && course.title && course.level);
        });
        setEnrolledCourses(filteredCourses);
      } catch (error: any) {
        console.error('Erreur lors de la récupération des inscriptions:', error);
        setEnrollmentsError(error.message || 'Erreur lors du chargement de vos cours');
        setEnrolledCourses([]);
      } finally {
        setIsLoadingEnrollments(false);
        fetchEnrollmentsRef.current = false;
      }
    };

    fetchEnrollments();
  }, [isAuthenticated, user?.id]);

  // Rediriger si non connecté
  useEffect(() => {
    if (!isLoadingEnrollments && !isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  }, [isAuthenticated, isLoadingEnrollments]);

  if (isLoadingEnrollments) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Loader2 className="mx-auto h-16 w-16 text-blue-500 animate-spin mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Chargement de vos cours...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (enrollmentsError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Erreur lors du chargement
            </h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{enrollmentsError}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setEnrollmentsError(null);
                  setIsLoadingEnrollments(true);
                  // Recharger les données
                  window.location.reload();
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Réessayer
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Retour au tableau de bord
              </Link>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto text-left">
                <p className="text-sm font-semibold text-yellow-800 mb-2">🔍 Informations de débogage :</p>
                <p className="text-xs text-yellow-700">
                  Vérifiez la console du navigateur et les logs serveur pour plus de détails.
                  <br />
                  Erreur : {enrollmentsError}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredCourses = enrolledCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const isCompleted = course.enrollmentStatus === 'completed' || course.progress === 100;
    const matchesStatus = selectedStatus === 'all' ||
                         (selectedStatus === 'in-progress' && !isCompleted && course.enrollmentStatus === 'active') ||
                         (selectedStatus === 'completed' && isCompleted);
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

    return matchesSearch && matchesStatus && matchesLevel;
  });

  const getStatusColor = (progress: number, enrollmentStatus: string) => {
    // Priorité au statut d'enrollment
    if (enrollmentStatus === 'completed' || progress === 100) return 'bg-green-100 text-green-800';
    if (enrollmentStatus === 'cancelled') return 'bg-gray-100 text-gray-800';
    if (enrollmentStatus === 'pending') return 'bg-orange-100 text-orange-800';
    if (progress > 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (progress: number, enrollmentStatus: string) => {
    // Priorité au statut d'enrollment
    if (enrollmentStatus === 'completed' || progress === 100) return 'Terminé';
    if (enrollmentStatus === 'cancelled') return 'Annulé';
    if (enrollmentStatus === 'pending') return 'En attente';
    if (progress > 50) return 'En cours';
    if (progress > 0) return 'Débuté';
    return 'Non commencé';
  };

  const getLevelColor = (level: CourseLevel) => {
    switch (level) {
    case 'DÉBUTANT':
      return 'bg-green-100 text-green-800';
    case 'INTERMÉDIAIRE':
      return 'bg-yellow-100 text-yellow-800';
    case 'AVANCÉ':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Optimisé pour mobile */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Mes Cours
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {enrolledCourses.length} {enrolledCourses.length === 1 ? 'cours' : 'cours'} • Suivez votre progression
              </p>
            </div>

            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold text-sm sm:text-base shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Découvrir d'autres cours</span>
              <span className="sm:hidden">Découvrir</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Statistiques rapides - Optimisé pour mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Inscrits</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                  {enrolledCourses.filter(c => c.enrollmentStatus === 'active' || c.enrollmentStatus === 'completed').length} actifs
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Terminés</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {enrolledCourses.filter(c => c.enrollmentStatus === 'completed' || c.progress === 100).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg sm:rounded-xl">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">En cours</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {enrolledCourses.filter(c => (c.enrollmentStatus === 'active' || c.enrollmentStatus === 'pending') && c.progress > 0 && c.progress < 100).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg sm:rounded-xl">
                <Award className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Certificats</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {enrolledCourses.filter(c => (c.enrollmentStatus === 'completed' || c.progress === 100) && c.certificate).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche - Optimisé pour mobile */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Terminés</option>
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les niveaux</option>
              <option value="DÉBUTANT">Débutant</option>
              <option value="INTERMÉDIAIRE">Intermédiaire</option>
              <option value="AVANCÉ">Avancé</option>
            </select>
          </div>
        </div>

        {/* Liste des cours - Mobile: grille simple, Desktop: liste détaillée */}
        <div className="space-y-4 sm:space-y-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              {enrolledCourses.length === 0 && !searchTerm && selectedStatus === 'all' && selectedLevel === 'all' ? (
                // Cas : Aucun cours inscrit du tout - Style similaire à l'exemple
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-sm">
                    <div className="mb-6">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-12 h-12 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Aucun cours inscrit
                      </h3>
                      <p className="text-gray-600 mb-8">
                        Commencez votre parcours d'apprentissage en vous inscrivant à des cours passionnants.
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <Link
                        href="/courses"
                        className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                      >
                        <BookOpen className="w-5 h-5 mr-2" />
                        Découvrir les cours
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-4">💡 Recommandations pour commencer :</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <Link
                          href="/courses?level=DÉBUTANT"
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          Cours Débutants
                        </Link>
                        <Link
                          href="/courses?isFree=true"
                          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                        >
                          Cours Gratuits
                        </Link>
                        <Link
                          href="/courses?isFeatured=true"
                          className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                        >
                          Cours Populaires
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Cas : Filtres appliqués mais aucun résultat
                <div>
                  <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun cours trouvé
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Essayez de modifier vos filtres de recherche
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedStatus('all');
                        setSelectedLevel('all');
                      }}
                      className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-semibold"
                    >
                      Réinitialiser les filtres
                    </button>
                    <Link
                      href="/courses"
                      className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      Explorer les cours
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Version Mobile: Cartes simples en grille */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredCourses
                  .filter((course) => {
                    const isValid = !!(course && course.id && course.title);
                    return isValid;
                  })
                  .map((course) => (
                    <CourseCardSimple key={course.id} course={course} />
                  ))}
              </div>

              {/* Version Desktop: Liste détaillée */}
              <div className="hidden md:block space-y-6">
                {filteredCourses
                  .filter((course) => {
                    const isValid = !!(course && course.id && course.title);
                    return isValid;
                  })
                  .map((course) => {
                    return (
                      <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level)}`}>
                                  {course.level}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(course.progress, course.enrollmentStatus)}`}>
                                  {getStatusText(course.progress, course.enrollmentStatus)}
                                </span>
                                <span className="flex items-center space-x-1 text-sm text-gray-600">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span>{(course.rating ?? 0).toFixed(1)}</span>
                                </span>
                              </div>

                              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {course.title}
                              </h3>

                              <p className="text-gray-600 mb-4 line-clamp-2">
                                {course.description}
                              </p>

                              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{course.totalDuration ? Math.round(course.totalDuration / 60) : 0} heures</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <BookOpen className="w-4 h-4" />
                                  <span>{course.totalLessons || 0} leçons</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4" />
                                  <span>{(course.totalStudents || 0).toLocaleString()} étudiants</span>
                                </div>
                                {course.lastAccessed && (
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Dernière visite: {new Date(course.lastAccessed).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>

                              {/* Barre de progression - Afficher seulement si le cours est actif ou complété */}
                              {(course.enrollmentStatus === 'active' || course.enrollmentStatus === 'completed') && (
                                <div className="mb-4">
                                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                    <span>Progression</span>
                                    <span>{course.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-300 ${
                                        course.progress === 100 ? 'bg-green-600' : 'bg-blue-600'
                                      }`}
                                      style={{ width: `${course.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Message pour les cours annulés ou en attente */}
                              {course.enrollmentStatus === 'cancelled' && (
                                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                  <p className="text-sm text-gray-600">
                                    Votre inscription à ce cours a été annulée. Vous pouvez toujours consulter les détails du cours.
                                  </p>
                                </div>
                              )}
                              
                              {course.enrollmentStatus === 'pending' && (
                                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                  <p className="text-sm text-orange-700">
                                    ⏳ Votre inscription est en attente d'activation. Vous pourrez accéder au contenu une fois activée.
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="ml-6 flex flex-col items-end space-y-3">
                              {course.thumbnail || course.image ? (
                                <Image
                                  src={course.thumbnail || course.image || ''}
                                  alt={course.title}
                                  width={128}
                                  height={80}
                                  sizes="128px"
                                  loading="lazy"
                                  className="w-32 h-20 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-32 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                                  <BookOpen className="w-8 h-8 text-white opacity-50" />
                                </div>
                              )}

                              {course.enrollmentStatus === 'cancelled' ? (
                                <div className="text-center">
                                  <p className="text-sm text-gray-500 mb-2">Inscription annulée</p>
                                  <Link
                                    href={getCourseUrl(course)}
                                    className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                  >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Voir le cours
                                  </Link>
                                </div>
                              ) : course.enrollmentStatus === 'pending' ? (
                                <div className="text-center">
                                  <p className="text-sm text-orange-600 mb-2">En attente d'activation</p>
                                  <Link
                                    href={getCourseUrl(course)}
                                    className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                  >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Voir le cours
                                  </Link>
                                </div>
                              ) : (
                                <Link
                                  href={`${getCourseUrl(course)}/learn`}
                                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  {course.progress >= 100 ? 'Revoir' : course.progress > 0 ? 'Continuer' : 'Commencer'}
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>

        {/* Call to Action - Afficher seulement si l'étudiant a déjà des cours */}
        {enrolledCourses.length > 0 && (
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                Prêt pour de nouveaux défis ?
              </h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Découvrez notre collection de cours et continuez à développer vos compétences
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Explorer les cours
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
