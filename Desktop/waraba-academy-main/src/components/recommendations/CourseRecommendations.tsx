'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, Star, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Course {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  thumbnail?: string;
  image_url?: string;
  price: number;
  level?: string;
  duration?: number;
  rating?: number;
  is_coming_soon?: boolean;
  category?: {
    id: string;
    name: string;
  };
}

interface CourseRecommendationsProps {
  userId?: string;
  currentCourseId?: string;
  completedCourseIds?: string[];
  limit?: number;
}

export default function CourseRecommendations({
  userId,
  currentCourseId,
  completedCourseIds = [],
  limit = 4
}: CourseRecommendationsProps) {
  useAuth(); // Pour vérifier l'authentification si nécessaire
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stable key to avoid re-fetching when parent passes a new array with same content
  const completedIdsKey = completedCourseIds.join(',');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);

        // Récupérer plus de cours pour compenser le filtrage des cours terminés
        const fetchLimit = limit + completedCourseIds.length + 4;
        const response = await fetch(`/api/courses?limit=${fetchLimit}&recommended=true`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.courses)) {
            // Exclure le cours actuel et tous les cours déjà terminés
            const filteredCourses = data.courses.filter((c: Course) => {
              if (currentCourseId && c.id === currentCourseId) return false;
              if (completedCourseIds.includes(c.id)) return false;
              return true;
            });

            setCourses(filteredCourses.slice(0, limit));
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des recommandations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentCourseId, completedIdsKey, limit]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Cours recommandés pour vous</h3>
        <Link
          href="/courses"
          className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        >
          Voir tout
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={course.slug ? `/courses/${course.slug}` : `/courses/${course.id}`}
            className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Image */}
            <div className="relative w-full h-32 overflow-hidden">
              {(course.thumbnail || course.image_url) ? (
                <Image
                  src={course.thumbnail || course.image_url || ''}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white opacity-50" />
                </div>
              )}
              {/* Badge Bientôt disponible */}
              {course.is_coming_soon && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                  <Clock className="w-3 h-3" />
                  Bientôt disponible
                </div>
              )}
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {course.title}
              </h4>

              {course.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {course.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  {course.level && (
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {course.level}
                    </span>
                  )}
                  {course.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration} min</span>
                    </div>
                  )}
                </div>
                {course.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span>{course.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">
                    {course.price === 0 || !course.price ? 'Gratuit' : `${course.price.toLocaleString('fr-FR')} FCFA`}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
