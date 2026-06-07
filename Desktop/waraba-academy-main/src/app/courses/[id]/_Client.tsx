'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  Bookmark,
  Share2,
  Download,
  Award,
  CheckCircle,
  Heart,
  MessageCircle,
  Globe,
  Lock,
  Unlock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Target,
  Zap,
  Shield,
  GraduationCap,
  HelpCircle,
  ThumbsUp,
} from 'lucide-react';
import { useCourseStore } from '@/stores/courseStore';
import { CourseLevel } from '@/types/course';
import EnrollmentButton from '@/components/enrollment/EnrollmentButton';
import VideoPlayer from '@/components/courses/VideoPlayer';
import { useAuth } from '@/contexts/AuthContext';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StructuredData from '@/components/seo/StructuredData';
import { createCourseSchema } from '@/components/seo/StructuredData';
import CourseReviews from '@/components/courses/CourseReviews';

// Module Accordion Component
const ModuleAccordion = ({
  module,
  moduleIndex,
  isExpanded,
  onToggle,
  isEnrolled,
}: {
  module: any;
  moduleIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  isEnrolled: boolean;
}) => {
  const lessons = Array.isArray(module?.lessons) ? module.lessons : [];
  const totalDuration = lessons.reduce((sum: number, l: any) => sum + (Number(l.duration) || 0), 0);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-md">
      {/* Module Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25">
            {moduleIndex + 1}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {module?.title || `Module ${moduleIndex + 1}`}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {lessons.length} leçon{lessons.length > 1 ? 's' : ''}
              </span>
              {totalDuration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {totalDuration} min
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Lessons List */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-gray-100 dark:border-gray-700">
          {lessons.map((lesson: any, lessonIndex: number) => {
            const hasVideo = lesson?.videoUrl;
            const hasPdf = lesson?.pdfUrl || lesson?.fileUrl;
            const isFree = lesson?.isFree !== undefined ? lesson.isFree : false;

            return (
              <div
                key={lesson?.id || lessonIndex}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-b-0 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700">
                    {isEnrolled || isFree ? (
                      <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                      {lesson?.title || `Leçon ${lessonIndex + 1}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {hasVideo && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-md">
                          <Play className="w-3 h-3" /> Vidéo
                        </span>
                      )}
                      {hasPdf && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium rounded-md">
                          <Download className="w-3 h-3" /> Document
                        </span>
                      )}
                      {isFree && !isEnrolled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-md">
                          <Unlock className="w-3 h-3" /> Gratuit
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {Number(lesson?.duration) > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {lesson.duration} min
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
// ─── FAQ Accordion ────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Comment accéder au cours après inscription ?',
    a: 'Dès votre inscription confirmée, le cours apparaît dans votre tableau de bord. Vous pouvez le suivre immédiatement, à votre rythme, sur ordinateur ou téléphone.',
  },
  {
    q: 'Puis-je suivre le cours à mon propre rythme ?',
    a: 'Oui, absolument. Toutes les leçons sont disponibles en accès illimité. Vous pouvez mettre en pause, reprendre, et revoir les leçons autant de fois que vous le souhaitez.',
  },
  {
    q: 'Le certificat est-il reconnu professionnellement ?',
    a: 'Le certificat Waraba Academy atteste de votre complétion du cours et de vos compétences. Il est téléchargeable en PDF et peut être partagé sur LinkedIn ou présenté à un employeur.',
  },
  {
    q: 'Comment fonctionne la garantie satisfait ou remboursé ?',
    a: 'Si vous n\'êtes pas satisfait dans les 30 jours suivant votre inscription, contactez notre équipe support et nous vous remboursons intégralement, sans question.',
  },
  {
    q: 'Le cours est-il accessible sur mobile ?',
    a: 'Oui. La plateforme est entièrement responsive. Vous pouvez suivre les leçons sur smartphone, tablette ou ordinateur avec la même expérience.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-expanded={open}
      >
        <span className="font-semibold text-gray-900 dark:text-white pr-4">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-5 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });
  const [isCopied, setIsCopied] = useState(false);
  const [lastLesson, setLastLesson] = useState<{ lessonTitle: string; moduleIndex: number; lessonIndex: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { currentCourse, isLoading, error, fetchCourseById } = useCourseStore();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (id && typeof id === 'string' && id.trim() !== '' && id !== 'undefined') {
      fetchCourseById(id);
    }
  }, [id, fetchCourseById]);

  // Redirect UUID to slug
  useEffect(() => {
    if (currentCourse?.slug && id && typeof id === 'string') {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID && currentCourse.slug !== id) {
        router.replace(`/courses/${currentCourse.slug}${window.location.search}`);
      }
    }
  }, [currentCourse?.slug, id, router]);

  // Check enrollment
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!id || id === 'undefined' || !isAuthenticated || !user) {
        setIsEnrolled(false);
        return;
      }

      try {
        let courseUUID = currentCourse?.id || id;
        if (!currentCourse?.id) {
          const courseResponse = await fetch(`/api/courses/${id}`, {
            credentials: 'include',
            cache: 'no-store',
          });
          if (courseResponse.ok) {
            const data = await courseResponse.json();
            const course = data.course || data.data?.course || data.data;
            if (course?.id) courseUUID = course.id;
          }
        }

        const response = await fetch('/api/enrollments', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.enrollments)) {
            const enrollment = data.enrollments.find(
              (e: any) => (e.course_id || e.course?.id) === courseUUID &&
                ['active', 'completed', 'pending'].includes(e.status)
            );
            setIsEnrolled(!!enrollment);
          }
        }
      } catch (error) {
        console.error('Erreur vérification inscription:', error);
        setIsEnrolled(false);
      }
    };

    checkEnrollment();
  }, [id, isAuthenticated, user, currentCourse?.id]);

  // Read last visited lesson from localStorage when enrolled
  useEffect(() => {
    if (!isEnrolled || !currentCourse?.id) return;
    try {
      const stored = localStorage.getItem(`waraba_last_lesson_${currentCourse.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        const daysDiff = (Date.now() - new Date(data.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff < 30 && data.lessonTitle) {
          setLastLesson({ lessonTitle: data.lessonTitle, moduleIndex: data.moduleIndex ?? 0, lessonIndex: data.lessonIndex ?? 0 });
        }
      }
    } catch { /* Ignore */ }
  }, [isEnrolled, currentCourse?.id]);

  // Sticky CTA on scroll
  useEffect(() => {
    const handleScroll = () => setShowStickyCTA(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle module accordion
  const toggleModule = (index: number) => {
    setExpandedModules((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Share course
  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: course?.title || 'Cours Waraba Academy',
      text: course?.description || 'Découvrez ce cours sur Waraba Academy',
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or error — silently ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch {
        // Fallback: select and copy
      }
    }
  };

  // Loading state
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 animate-spin" />
            <BookOpen className="absolute inset-0 m-auto w-6 h-6 text-blue-500" />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentCourse) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Cours non trouvé</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Ce cours n\'existe pas ou a été supprimé.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => id && fetchCourseById(id as string)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Réessayer
            </button>
            <Link
              href="/courses"
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Voir tous les cours
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const course = currentCourse;

  // Calculate stats
  const totalLessons = course.totalLessons || course.modules?.reduce((sum: number, m: any) =>
    sum + (m.lessons?.length || 0), 0) || 0;

  const totalDuration = course.totalDuration || course.modules?.reduce((sum: number, m: any) =>
    sum + (m.lessons?.reduce((s: number, l: any) => s + (l.duration || 0), 0) || 0), 0) || 0;

  const formatDuration = (mins: number) => {
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const minutes = mins % 60;
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
    return `${mins} min`;
  };

  const getLevelConfig = (level: CourseLevel): { bg: string; text: string; label: string } => {
    const defaultConfig = { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Débutant' };
    const configs: Record<string, { bg: string; text: string; label: string }> = {
      'DÉBUTANT': defaultConfig,
      'INTERMÉDIAIRE': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Intermédiaire' },
      'AVANCÉ': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', label: 'Avancé' },
    };
    return configs[level] || defaultConfig;
  };

  const levelConfig = getLevelConfig(course.level);

  const breadcrumbItems = [
    { name: 'Cours', href: '/courses' },
    ...(course.category ? [{ name: course.category.name, href: `/categories/${course.category.slug || 'non-categorise'}` }] : []),
    { name: course.title, href: `/courses/${id}` },
  ];

  return (
    <>
      <StructuredData
        type="course"
        data={createCourseSchema({
          title: course.title,
          description: course.longDescription || course.description || '',
          id: course.id,
          image: course.thumbnail || course.image,
          price: course.price || undefined,
          slug: course.slug || (id as string),
          instructor: course.instructor ? {
            firstName: course.instructor.firstName,
            lastName: course.instructor.lastName,
          } : undefined,
          level: course.level,
          duration: totalDuration,
          rating: course.rating,
        })}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden pt-24">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Breadcrumb items={breadcrumbItems.slice(1)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Left Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${levelConfig.bg} ${levelConfig.text}`}>
                    {levelConfig.label}
                  </span>
                  {course.isFeatured && (
                    <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-current" /> Populaire
                    </span>
                  )}
                  {course.isComingSoon && (
                    <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-500 text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Bientôt disponible
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{(course.rating || 4.5).toFixed(1)}</span>
                    <span className="text-white/60 text-sm">({course.totalReviews || 0} avis)</span>
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  {course.title}
                </h1>

                {/* Description */}
                <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
                  {(course as any).shortDescription || course.description || 'Découvrez ce cours exceptionnel.'}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold">{(course.totalStudents || 0).toLocaleString()}</p>
                      <p className="text-sm text-white/60">Étudiants</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold">{formatDuration(totalDuration)}</p>
                      <p className="text-sm text-white/60">Durée</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold">{totalLessons}</p>
                      <p className="text-sm text-white/60">Leçons</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-semibold capitalize">{course.language || 'Français'}</p>
                      <p className="text-sm text-white/60">Langue</p>
                    </div>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-4 pt-4">
                  <div className="relative">
                    <Image
                      src={course.instructor?.avatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces'}
                      alt={`${course.instructor?.firstName || 'Expert'} ${course.instructor?.lastName || ''}`}
                      width={56}
                      height={56}
                      className="rounded-full object-cover ring-2 ring-white/20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">
                      {course.instructor?.firstName || 'Expert'} {course.instructor?.lastName || ''}
                    </p>
                    <p className="text-sm text-white/60">Instructeur certifié</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                      isBookmarked
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-white/20 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{isBookmarked ? 'Sauvegardé' : 'Sauvegarder'}</span>
                  </button>
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                      isLiked
                        ? 'border-rose-500 bg-rose-500/20 text-rose-400'
                        : 'border-white/20 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{isLiked ? 'Aimé' : 'J\'aime'}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                      isCopied
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : 'border-white/20 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-medium">{isCopied ? 'Lien copié !' : 'Partager'}</span>
                  </button>
                </div>
              </div>

              {/* Right Sidebar - Preview Card (visible on hero for desktop) */}
              <div className="lg:col-span-1 hidden lg:block">
                {/* Placeholder for proper spacing */}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* What You'll Learn */}
              <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ce que vous apprendrez</h2>
                </div>

                {course.objectives && Array.isArray(course.objectives) && course.objectives.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.objectives.map((objective: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors group"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-gray-700 dark:text-gray-300">{String(objective)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Objectifs d'apprentissage à venir.</p>
                )}
              </section>

              {/* Course Curriculum */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Programme du cours</h2>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{course.modules?.length || 0} modules</span>
                    <span>•</span>
                    <span>{totalLessons} leçons</span>
                    <span>•</span>
                    <span>{formatDuration(totalDuration)}</span>
                  </div>
                </div>

                {course.modules && Array.isArray(course.modules) && course.modules.length > 0 ? (
                  <div className="space-y-4">
                    {course.modules
                      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                      .map((module: any, index: number) => (
                        <ModuleAccordion
                          key={module?.id || index}
                          module={module}
                          moduleIndex={index}
                          isExpanded={expandedModules[index] || false}
                          onToggle={() => toggleModule(index)}
                          isEnrolled={isEnrolled}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Programme en préparation
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400">
                      Le contenu détaillé sera bientôt disponible.
                    </p>
                  </div>
                )}
              </section>

              {/* Requirements */}
              <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prérequis</h2>
                </div>

                {course.requirements && Array.isArray(course.requirements) && course.requirements.length > 0 ? (
                  <div className="space-y-3">
                    {course.requirements.map((req: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{String(req)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Aucun prérequis spécifique. Ce cours est accessible à tous.</p>
                )}
              </section>

              {/* About Instructor */}
              <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">À propos de l'instructeur</h2>
                </div>

                <div className="flex items-start gap-5">
                  <Image
                    src={course.instructor?.avatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces'}
                    alt={`${course.instructor?.firstName || 'Expert'} ${course.instructor?.lastName || ''}`}
                    width={80}
                    height={80}
                    className="rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {course.instructor?.firstName || 'Expert'} {course.instructor?.lastName || ''}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Instructeur certifié</p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {course.instructor?.bio || 'Instructeur expérimenté avec une passion pour l\'enseignement et le partage de connaissances.'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Trust & Guarantee */}
              <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
                    <ThumbsUp className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pourquoi nous faire confiance ?</h2>
                </div>

                {/* Rating teaser */}
                <div className="flex items-center gap-4 p-5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800 mb-6">
                  <div className="text-center">
                    <p className="text-5xl font-extrabold text-gray-900 dark:text-white">{(course.rating || 4.8).toFixed(1)}</p>
                    <div className="flex items-center gap-0.5 mt-1 justify-center">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= Math.round(course.rating || 4.8) ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Note du cours</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3].map((stars) => (
                      <div key={stars} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 w-2">{stars}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-current" />
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: stars === 5 ? '72%' : stars === 4 ? '20%' : '8%' }} />
                        </div>
                        <span className="text-gray-400 text-xs w-6">{stars === 5 ? '72%' : stars === 4 ? '20%' : '8%'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3 trust badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                    <Shield className="w-8 h-8 text-green-600 mb-2" />
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Garantie 30 jours</p>
                    <p className="text-xs text-gray-500 mt-1">Satisfait ou remboursé</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                    <Award className="w-8 h-8 text-amber-500 mb-2" />
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Certificat inclus</p>
                    <p className="text-xs text-gray-500 mt-1">Téléchargeable et partageable</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                    <MessageCircle className="w-8 h-8 text-blue-500 mb-2" />
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Support réactif</p>
                    <p className="text-xs text-gray-500 mt-1">Équipe disponible pour vous</p>
                  </div>
                </div>

              </section>

              <CourseReviews courseId={course.id} isEnrolled={isEnrolled} />

              {/* FAQ */}
              <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Questions fréquentes</h2>
                </div>
                <div className="space-y-3">
                  {FAQ_ITEMS.map((item, i) => (
                    <FaqItem key={i} q={item.q} a={item.a} />
                  ))}
                </div>
                <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Une autre question ?{' '}
                  <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Contactez notre équipe
                  </a>
                </p>
              </section>
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8 space-y-6">
                {/* Pricing Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {/* Course Preview Image */}
                  {course.thumbnail || course.image ? (
                    <div className="relative aspect-video">
                      <Image
                        src={course.thumbnail || course.image || ''}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {!isEnrolled && course.videoPreview && (
                        <button
                          onClick={() => setShowPreviewModal(true)}
                          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
                        >
                          <Play className="w-6 h-6 text-blue-600 ml-1" />
                        </button>
                      )}
                    </div>
                  ) : null}

                  <div className="p-6 space-y-6">
                    {/* Price */}
                    <div className="text-center">
                      {course.isFree || !course.price || course.price === 0 ? (
                        <div className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-full">
                          <span className="text-2xl font-bold">Gratuit</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">
                              {typeof course.price === 'number' ? course.price.toLocaleString() : course.price} FCFA
                            </span>
                          </div>
                          {course.originalPrice && course.originalPrice > (course.price || 0) && (
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-lg text-gray-400 line-through">
                                {course.originalPrice.toLocaleString()} FCFA
                              </span>
                              <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-semibold rounded-full">
                                -{Math.round(((course.originalPrice - (course.price || 0)) / course.originalPrice) * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <EnrollmentButton
                      courseId={course.id}
                      courseTitle={course.title}
                      isEnrolled={isEnrolled}
                      isFree={course.isFree || !course.price || course.price === 0}
                      price={course.price || null}
                      isAvailable={course.status === 'PUBLISHED'}
                      isComingSoon={!!course.isComingSoon}
                      variant="primary"
                      className="w-full py-4 text-lg"
                      onEnrollmentChange={setIsEnrolled}
                    />

                    {/* Last lesson visited — resume banner */}
                    {isEnrolled && lastLesson && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dernière leçon vue</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{lastLesson.lessonTitle}</p>
                        <Link
                          href={`/courses/${course.slug || course.id}/learn`}
                          className="inline-flex items-center gap-1.5 mt-2 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                        >
                          <Play className="w-3.5 h-3.5" /> Reprendre le cours
                        </Link>
                      </div>
                    )}

                    {/* Guarantee */}
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Garantie satisfait ou remboursé 30 jours
                    </p>

                    {/* Features */}
                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Ce cours inclut :</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-5 h-5 text-blue-500" />
                          <span>{formatDuration(totalDuration)} de contenu vidéo</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <BookOpen className="w-5 h-5 text-purple-500" />
                          <span>{totalLessons} leçons</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <Download className="w-5 h-5 text-emerald-500" />
                          <span>Ressources téléchargeables</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <Shield className="w-5 h-5 text-amber-500" />
                          <span>Accès illimité à vie</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <Award className="w-5 h-5 text-rose-500" />
                          <span>Certificat de fin de formation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Help Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Besoin d'aide ?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Notre équipe est là pour répondre à vos questions.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline"
                  >
                    Contactez-nous <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky CTA - Mobile */}
        {showStickyCTA && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-50 p-4 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white truncate">{course.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {course.isFree || !course.price || course.price === 0 ? 'Gratuit' : `${course.price?.toLocaleString()} FCFA`}
                </p>
              </div>
              <EnrollmentButton
                courseId={course.id}
                courseTitle={course.title}
                isEnrolled={isEnrolled}
                isFree={course.isFree || !course.price || course.price === 0}
                price={course.price || null}
                isComingSoon={!!course.isComingSoon}
                variant="primary"
                className="px-6"
                onEnrollmentChange={setIsEnrolled}
              />
            </div>
          </div>
        )}

        {/* Final CTA Section */}
        <section className="bg-blue-900 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-6 text-white/80" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {course.title}
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Accédez à toutes les leçons dès maintenant et progressez à votre propre rythme.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <EnrollmentButton
                courseId={course.id}
                courseTitle={course.title}
                isEnrolled={isEnrolled}
                isFree={course.isFree || !course.price || course.price === 0}
                price={course.price || null}
                isComingSoon={!!course.isComingSoon}
                variant="primary"
                className={isEnrolled ? 'px-8 py-4 text-lg font-semibold' : 'bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold'}
                onEnrollmentChange={setIsEnrolled}
              />
              <Link
                href="/courses"
                className="px-8 py-4 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-all duration-300 font-semibold text-lg"
              >
                Explorer d'autres cours
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Modal preview vidéo */}
      {showPreviewModal && course.videoPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-sm font-medium"
            >
              ✕ Fermer
            </button>
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <VideoPlayer url={course.videoPreview} title={course.title} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
