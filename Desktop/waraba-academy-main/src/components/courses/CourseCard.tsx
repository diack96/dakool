import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Clock,
  BookOpen,
  Code,
  Palette,
  Brain,
  Globe,
  Shield,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Course, CourseLevel } from '@/types/course';
import { getCourseUrl } from '@/lib/utils/courseUrl';
import { getSafeImageUrl, createImageErrorHandler } from '@/lib/utils/imageUtils';

interface CourseCardProps {
  course: Course;
  priority?: boolean;
}

const getLevelColor = (level: CourseLevel): string => {
  switch (level) {
    case 'DÉBUTANT':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    case 'INTERMÉDIAIRE':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
    case 'AVANCÉ':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  }
};

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Développement': Code,
  'Design': Palette,
  'Intelligence Artificielle': Brain,
  'Marketing Digital': TrendingUp,
  'Business': Globe,
  'Cybersécurité': Shield,
};

const formatDuration = (minutes: number): string => {
  if (minutes === 0) return '0h';
  const hours = Math.round(minutes / 60);
  return `${hours}h`;
};

const formatPrice = (price: number | null, isFree: boolean): string => {
  if (isFree || price === null || price === 0) return 'Gratuit';
  return `${price.toLocaleString()} FCFA`;
};

function CourseCard({ course, priority = false }: CourseCardProps) {
  // Mémoiser le calcul de la durée
  const totalDuration = useMemo(() => {
    let duration = course.totalDuration || 0;
    if (duration === 0 && course.modules && Array.isArray(course.modules)) {
      duration = course.modules.reduce((sum, module) => {
        if (module.lessons && Array.isArray(module.lessons)) {
          return sum + module.lessons.reduce((s: number, lesson: { duration?: number }) => s + (lesson.duration || 0), 0);
        }
        return sum;
      }, 0);
    }
    return duration;
  }, [course.totalDuration, course.modules]);

  // Mémoiser le calcul du nombre de leçons
  const totalLessons = useMemo(() => {
    if (course.totalLessons > 0) {
      return course.totalLessons;
    }
    if (course.modules && Array.isArray(course.modules)) {
      return course.modules.reduce((sum, module) => {
        if (module.lessons && Array.isArray(module.lessons)) {
          return sum + module.lessons.length;
        }
        return sum;
      }, 0);
    }
    return 0;
  }, [course.totalLessons, course.modules]);

  // Mémoiser l'icône de catégorie
  const CategoryIcon = useMemo(() => {
    return categoryIconMap[course.category.name] || BookOpen;
  }, [course.category.name]);

  // Mémoiser l'URL de l'image
  const imageUrl = useMemo(() => {
    return getSafeImageUrl(course.thumbnail || course.image, course.title);
  }, [course.thumbnail, course.image, course.title]);

  // Mémoiser l'URL du cours
  const courseUrl = useMemo(() => getCourseUrl(course), [course]);

  // Mémoiser la couleur du niveau
  const levelColor = useMemo(() => getLevelColor(course.level), [course.level]);

  // Mémoiser le label du niveau
  const levelLabel = useMemo(() => {
    switch (course.level) {
      case 'DÉBUTANT': return 'Débutant';
      case 'INTERMÉDIAIRE': return 'Intermédiaire';
      case 'AVANCÉ': return 'Avancé';
      default: return course.level;
    }
  }, [course.level]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Image du cours */}
      <div className="relative">
        <Link href={courseUrl}>
          <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
            {imageUrl && imageUrl.startsWith('data:image') ? (
              <div
                className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"
                style={{ backgroundImage: `url(${imageUrl})` }}
              >
                <BookOpen className="w-16 h-16 text-white opacity-50" />
              </div>
            ) : (
              <Image
                src={imageUrl}
                alt={course.title}
                fill
                priority={priority}
                className="object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACQAQCdASoKAAcABUB8JZQAAla5MgAA+kOdCERCLVKkahRhQbNtpUiGtpupzwgA"
                onError={createImageErrorHandler(course.title)}
              />
            )}
          </div>
        </Link>

        {/* Badges */}
        {course.isFeatured && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            <Star className="w-3 h-3 inline mr-1" />
            Populaire
          </div>
        )}

        {course.isFree && (
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            Gratuit
          </div>
        )}

        {course.isComingSoon && (
          <div className="absolute bottom-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Bientôt disponible
          </div>
        )}
      </div>

      {/* Contenu du cours */}
      <div className="p-6">
        {/* Catégorie et niveau */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CategoryIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{course.category.name}</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelColor}`}>
            {levelLabel}
          </span>
        </div>

        {/* Titre */}
        <Link href={courseUrl} className="block">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
            {course.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Métadonnées */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(totalDuration)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{totalLessons} leçons</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span>{(course.rating || 4.5).toFixed(1)}</span>
          </div>
        </div>

        {/* Prix et instructeur */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Par <span className="font-medium">{course.instructor.firstName} {course.instructor.lastName}</span>
          </div>
          <div className="text-right">
            {course.isFree ? (
              <span className="text-green-600 font-semibold">Gratuit</span>
            ) : (
              <div>
                <span className="text-gray-900 dark:text-gray-100 font-semibold">{formatPrice(course.price, course.isFree)}</span>
                {course.originalPrice && course.originalPrice > (course.price || 0) && (
                  <span className="text-gray-500 dark:text-gray-400 line-through ml-2">{course.originalPrice.toLocaleString()} FCFA</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bouton "En savoir plus" */}
        <Link
          href={courseUrl}
          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:scale-105"
        >
          <span>En savoir plus</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}

// Export avec React.memo pour éviter les re-renders inutiles
export default React.memo(CourseCard);
