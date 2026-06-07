'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Play,
  Clock,
  BookOpen,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { Course, CourseLevel } from '@/types/course';
import { getSafeImageUrl, createImageErrorHandler } from '@/lib/utils/imageUtils';

interface CourseCardSimpleProps {
  course: Course & {
    enrollmentId?: string;
    enrollmentStatus?: 'pending' | 'active' | 'completed' | 'cancelled';
    progress?: number;
    lastAccessed?: string;
  };
}

export default function CourseCardSimple({ course }: CourseCardSimpleProps) {
  const getLevelColor = (level: CourseLevel) => {
    switch (level) {
    case 'DÉBUTANT':
      return 'bg-green-100 text-green-700';
    case 'INTERMÉDIAIRE':
      return 'bg-yellow-100 text-yellow-700';
    case 'AVANCÉ':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (progress: number = 0, enrollmentStatus?: string) => {
    if (enrollmentStatus === 'completed' || progress === 100) return 'bg-green-500';
    if (enrollmentStatus === 'cancelled') return 'bg-gray-400';
    if (enrollmentStatus === 'pending') return 'bg-orange-500';
    if (progress > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const getStatusText = (progress: number = 0, enrollmentStatus?: string) => {
    if (enrollmentStatus === 'completed' || progress === 100) return 'Terminé';
    if (enrollmentStatus === 'cancelled') return 'Annulé';
    if (enrollmentStatus === 'pending') return 'En attente';
    if (progress > 0) return 'En cours';
    return 'Non commencé';
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '0h';
    const hours = Math.round(minutes / 60);
    return `${hours}h`;
  };

  const progress = course.progress || 0;
  const enrollmentStatus = course.enrollmentStatus || 'active';
  
  // S'assurer qu'on utilise bien l'ID du cours et non l'ID d'enrollment
  const courseId = course.id;
  const courseSlug = course.slug;
  
  // Construire l'URL manuellement pour s'assurer qu'on utilise le bon identifiant
  const baseUrl = courseSlug ? `/courses/${courseSlug}` : `/courses/${courseId}`;
  const courseUrl = enrollmentStatus === 'cancelled' || enrollmentStatus === 'pending' 
    ? baseUrl
    : `${baseUrl}/learn`;

  // Log pour déboguer
  if (!courseSlug && courseId) {
    console.warn(`⚠️ CourseCardSimple: Cours ${courseId} n'a pas de slug, utilisation de l'ID`);
  }

  return (
    <Link href={courseUrl} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 active:scale-[0.98]">
        {/* Image et badges */}
        <div className="relative">
          <div className="relative w-full h-32 overflow-hidden bg-gray-100">
            {(() => {
              const imageUrl = getSafeImageUrl(course.thumbnail || course.image, course.title);
              if (imageUrl && imageUrl.startsWith('data:image')) {
                // C'est un placeholder SVG, utiliser une div avec background
                return (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-white opacity-50" />
                  </div>
                );
              }
              return (
                <Image
                  src={imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                  onError={createImageErrorHandler(course.title)}
                />
              );
            })()}
          </div>

          {/* Badge de niveau */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getLevelColor(course.level)}`}>
              {course.level === 'DÉBUTANT' ? 'Débutant' :
                course.level === 'INTERMÉDIAIRE' ? 'Intermédiaire' :
                  course.level === 'AVANCÉ' ? 'Avancé' : course.level}
            </span>
          </div>

          {/* Badge de statut */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-md text-xs font-semibold text-white ${getStatusColor(progress, enrollmentStatus)}`}>
              {getStatusText(progress, enrollmentStatus)}
            </span>
          </div>

          {/* Badge bientôt disponible */}
          {course.isComingSoon && (
            <div className="absolute bottom-2 left-2">
              <span className="px-2 py-1 rounded-md text-xs font-semibold bg-amber-500 text-white flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Bientôt disponible
              </span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4">
          {/* Titre */}
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
            {course.title}
          </h3>

          {/* Métadonnées compactes */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(course.totalDuration || null)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{course.totalLessons || 0} leçons</span>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          {(enrollmentStatus === 'active' || enrollmentStatus === 'completed') && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progression</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Message pour statuts spéciaux */}
          {enrollmentStatus === 'pending' && (
            <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-700">
                ⏳ En attente d'activation
              </p>
            </div>
          )}

          {enrollmentStatus === 'cancelled' && (
            <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                Inscription annulée
              </p>
            </div>
          )}

          {/* Bouton d'action */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              {progress === 100 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">Terminé</span>
                </>
              ) : progress > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600 font-medium">Continuer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600 font-medium">Commencer</span>
                </>
              )}
            </div>
            <div className="flex items-center text-blue-600">
              <span className="text-xs font-semibold mr-1">
                {progress === 100 ? 'Revoir' : 'Accéder'}
              </span>
              <Play className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
