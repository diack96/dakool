'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen,
  Award,
  Clock,
  Loader2,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Play,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import CourseRecommendations from '@/components/recommendations/CourseRecommendations';
import { fetchWithTimeout } from '@/lib/utils/fetchTimeout';
import { getCourseLearnUrl } from '@/lib/utils/courseUrl';
import FirstStepsProgress from '@/components/dashboard/FirstStepsProgress';
import WelcomeOnboarding from '@/components/onboarding/WelcomeOnboarding';
import GamificationStats from '@/components/gamification/GamificationStats';

interface EnrollmentStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  certificates: number;
  totalHours: number;
  averageProgress: number;
}

interface CourseInProgress {
  id: string;
  title: string;
  progress: number;
  thumbnail?: string;
  slug?: string;
}

interface RawEnrollment {
  id: string;
  course_id: string;
  status: 'active' | 'completed' | 'pending' | 'cancelled';
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
  };
}

export default function DashboardPage () {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<EnrollmentStats>({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    certificates: 0,
    totalHours: 0,
    averageProgress: 0,
  });
  const [coursesInProgress, setCoursesInProgress] = useState<CourseInProgress[]>([]);
  const [completedCoursesDetails, setCompletedCoursesDetails] = useState<CourseInProgress[]>([]);
  const [allCompletedCourseIds, setAllCompletedCourseIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const fetchDataRef = useRef(false); // Prevent multiple simultaneous calls

  // Récupérer les données du dashboard (profil + enrollments en parallèle)
  useEffect(() => {
    if (authLoading || !user || fetchDataRef.current) {
      if (!authLoading && !user) {
        setIsLoading(false);
      }
      return;
    }

    fetchDataRef.current = true;
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // 2 requêtes indépendantes en parallèle
        const [enrollmentsRes, profileRes] = await Promise.all([
          fetchWithTimeout('/api/enrollments', { credentials: 'include', cache: 'no-store' }),
          fetchWithTimeout('/api/profile/check', { credentials: 'include' }),
        ]);

        // Onboarding check
        if (profileRes.ok) {
          const profileData = await profileRes.json().catch(() => null);
          if (profileData?.profile?.welcome_email_sent === false) {
            setShowOnboarding(true);
          }
        }

        if (!enrollmentsRes.ok) throw new Error('Erreur lors de la récupération des données');

        const data = await enrollmentsRes.json();
        if (!data.success || !Array.isArray(data.enrollments)) {
          setIsLoading(false);
          return;
        }

        const enrollments: RawEnrollment[] = (data.enrollments as RawEnrollment[]).filter(
          (e) => e.status === 'active' || e.status === 'completed',
        );

        // Stats calculées directement depuis les données d'enrollment (pas de fetch supplémentaire)
        const totalCourses = enrollments.length;
        const completedCourses = enrollments.filter((e) => e.status === 'completed' || (e.progress || 0) >= 100).length;
        const inProgressCourses = enrollments.filter((e) => e.status === 'active' && (e.progress || 0) < 100).length;
        const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
        const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
        const totalHours = Math.round((totalProgress / 100) * 10 * totalCourses);

        setStats({ totalCourses, completedCourses, inProgressCourses, certificates: completedCourses, totalHours, averageProgress });

        // Cours en cours — données déjà dans enrollment.courses (jointure Supabase)
        const inProgress: CourseInProgress[] = enrollments
          .filter((e) => e.status === 'active' && (e.progress || 0) < 100)
          .slice(0, 6)
          .map((e) => ({
            id: e.courses?.id || e.course_id,
            title: e.courses?.title || 'Cours sans titre',
            progress: e.progress || 0,
            thumbnail: e.courses?.thumbnail || e.courses?.image_url || undefined,
            slug: e.courses?.slug || undefined,
          }));
        setCoursesInProgress(inProgress);

        // Cours terminés
        const completedEnrollments = enrollments.filter((e) => e.status === 'completed' || (e.progress || 0) >= 100);
        setAllCompletedCourseIds(completedEnrollments.map((e) => e.course_id));
        setCompletedCoursesDetails(
          completedEnrollments.slice(0, 6).map((e) => ({
            id: e.courses?.id || e.course_id,
            title: e.courses?.title || 'Cours sans titre',
            progress: 100,
            thumbnail: e.courses?.thumbnail || e.courses?.image_url || undefined,
            slug: e.courses?.slug || undefined,
          })),
        );
      } catch (error) {
        console.error('Erreur dashboard:', error);
      } finally {
        setIsLoading(false);
        fetchDataRef.current = false;
      }
    };

    fetchDashboardData();
  }, [authLoading, user]);

  // Redirection si pas d'utilisateur une fois l'auth terminée
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/auth/login';
    }
  }, [authLoading, user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-16 w-16 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Chargement de vos statistiques...</p>
        </div>
      </div>
    );
  }

  const userProfile = {
    firstName: user.user_metadata?.first_name || 'Utilisateur',
    lastName: user.user_metadata?.last_name || '',
    email: user.email || '',
    role: user.user_metadata?.role || 'student',
    avatarUrl: user.user_metadata?.avatar_url,
  };

  // Déterminer l'état contextuel du dashboard
  const dashboardState: 'new' | 'active' | 'completed' =
    stats.totalCourses === 0 ? 'new' :
    stats.inProgressCourses > 0 ? 'active' :
    stats.completedCourses > 0 ? 'completed' : 'new';

  const greetingSubtitle =
    dashboardState === 'new' ? 'Commencez votre aventure — votre premier cours vous attend !' :
    dashboardState === 'active' ? 'Reprenez là où vous vous êtes arrêté 📚' :
    `Bravo ! Vous avez terminé ${stats.completedCourses} cours. Prêt pour la suite ? 🎉`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      {showOnboarding && (
        <WelcomeOnboarding
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header du Dashboard */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Bonjour, {userProfile.firstName} ! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {greetingSubtitle}
          </p>
        </div>

        {/* SECTION ONBOARDING: Premiers pas */}
        <FirstStepsProgress />

        {/* SECTION GAMIFICATION: XP, Streak, Badges */}
        <GamificationStats />

        {/* SECTION 1: MES COURS */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mes cours</h2>
              {stats.totalCourses > 0 && (
                <Link
                  href="/dashboard/courses"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                >
                  Voir tout <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Aucun cours inscrit */}
            {stats.totalCourses === 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 border-2 border-blue-200 dark:border-blue-800 text-center">
                <div className="w-20 h-20 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Commencez votre premier cours ! 🚀
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Découvrez notre catalogue et transformez votre carrière
                </p>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all font-semibold text-lg shadow-lg gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  Explorer les cours
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}

            {/* Stats rapides */}
            {stats.totalCourses > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-100 dark:border-blue-800">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgressCourses}</p>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mt-1">En cours</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-100 dark:border-green-800">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedCourses}</p>
                  <p className="text-xs font-medium text-green-700 dark:text-green-300 mt-1">Terminés</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center border border-purple-100 dark:border-purple-800">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.certificates}</p>
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mt-1">Certificats</p>
                </div>
              </div>
            )}

            {/* Cours en cours */}
            {coursesInProgress.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  En cours ({stats.inProgressCourses})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coursesInProgress.map((course) => (
                    <Link
                      key={course.id}
                      href={getCourseLearnUrl(course)}
                      className="group block bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all overflow-hidden"
                    >
                      <div className="relative w-full h-36 bg-blue-600 dark:bg-blue-700 overflow-hidden">
                        {course.thumbnail ? (
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-white opacity-40" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 text-sm">{course.title}</p>
                        <div className="w-full bg-gray-100 dark:bg-gray-600 rounded-full h-1.5 mb-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{course.progress}% complété</span>
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {course.progress > 0 ? 'Reprendre' : 'Commencer'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Cours terminés */}
            {completedCoursesDetails.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Terminés ({stats.completedCourses})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedCoursesDetails.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white dark:bg-gray-700 rounded-xl border border-green-200 dark:border-green-800 overflow-hidden"
                    >
                      <div className="relative w-full h-36 bg-green-700 dark:bg-green-800 overflow-hidden">
                        {course.thumbnail ? (
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-white opacity-40" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Terminé
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 text-sm">{course.title}</p>
                        <div className="w-full bg-green-100 dark:bg-green-900/30 rounded-full h-1.5 mb-3">
                          <div className="bg-green-500 h-1.5 rounded-full w-full" />
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href="/dashboard/certificates"
                            className="flex-1 text-center text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors flex items-center justify-center gap-1"
                          >
                            <Award className="w-3 h-3" />
                            Certificat
                          </Link>
                          <Link
                            href={getCourseLearnUrl(course)}
                            className="flex-1 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors flex items-center justify-center gap-1"
                          >
                            <BookOpen className="w-3 h-3" />
                            Revoir
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: DÉCOUVRIR - Cours recommandés */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Découvrir
            </h2>
            
            {/* Cours recommandés personnalisés */}
            <CourseRecommendations
              userId={user?.id}
              completedCourseIds={allCompletedCourseIds}
              limit={4}
            />

            {/* Actions rapides */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/courses?isFree=true"
                  className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 transition-all hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Cours gratuits</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Commencez sans engagement</p>
                </Link>
                <Link
                  href="/courses?level=DÉBUTANT"
                  className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Pour débutants</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Parfait pour commencer</p>
                </Link>
                <Link
                  href="/categories"
                  className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-orange-600 dark:bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Par catégorie</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Explorez par domaine</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
