'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Clock, Users, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  image_url?: string;
  duration?: number;
  level?: string;
  price: number;
  is_coming_soon?: boolean;
}

interface CourseSelectionProps {
  onSelect: (courseId: string) => void;
  onSkip?: () => void; // Rendu optionnel car non utilisé
}

export default function CourseSelection({ onSelect }: CourseSelectionProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFreeCourses = async () => {
      try {
        const response = await fetch('/api/courses?price=free&limit=3', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.courses)) {
            // Filtrer les cours gratuits
            const freeCourses = data.courses
              .filter((c: any) => (!c.price || c.price === 0) && !c.is_coming_soon)
              .slice(0, 3);
            setCourses(freeCourses);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFreeCourses();
  }, []);

  const handleSelect = async (courseId: string) => {
    if (isEnrolling) return;

    setSelectedCourse(courseId);
    setIsEnrolling(true);
    setEnrollmentError(null);

    try {
      // Inscrire automatiquement l'utilisateur au cours
      const enrollResponse = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId }),
      });

      if (!enrollResponse.ok) {
        const errorData = await enrollResponse.json().catch(() => ({}));
        // Ignorer l'erreur si déjà inscrit
        if (!errorData.alreadyEnrolled) {
          throw new Error(errorData.message || 'Erreur lors de l\'inscription');
        }
      }

      // Envoyer l'email de bienvenue avec le cours
      await fetch('/api/onboarding/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId }),
      }).catch(() => {
        // Ignorer les erreurs d'email, ne pas bloquer l'onboarding
        console.warn('Email de bienvenue non envoyé');
      });

      // Continuer vers le cours
      onSelect(courseId);
    } catch (error) {
      console.error('Erreur inscription:', error);
      setEnrollmentError(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
      setIsEnrolling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-4 sm:p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Contenu */}
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Choisissez votre premier cours
            </h2>
            <p className="text-gray-600">
              Sélectionnez un cours gratuit pour commencer votre apprentissage
            </p>
            <p className="text-sm text-orange-600 mt-2 font-medium">
              Cette étape est obligatoire pour continuer
            </p>
          </div>

          {/* Message d'erreur */}
          {enrollmentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {enrollmentError}
            </div>
          )}

          {/* Liste des cours */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Aucun cours gratuit disponible pour le moment.</p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Explorer tous les cours
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => {
                const coverImage = course.thumbnail || course.image_url || null;
                return (
                  <div
                    key={course.id}
                    className={`border-2 rounded-xl overflow-hidden transition-all cursor-pointer ${
                      selectedCourse === course.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelect(course.id)}
                  >
                    {/* Image de couverture */}
                    <div className="relative w-full h-36 bg-gradient-to-br from-blue-500 to-purple-600">
                      {coverImage ? (
                        <Image
                          src={coverImage}
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 672px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-white opacity-60" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold shadow">
                          Gratuit
                        </span>
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {course.description}
                      </p>

                      {/* Métadonnées + Bouton */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {course.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{course.duration} min</span>
                            </div>
                          )}
                          {course.level && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span>{course.level}</span>
                            </div>
                          )}
                        </div>

                        <button
                          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors flex-shrink-0 ${
                            isEnrolling && selectedCourse === course.id
                              ? 'bg-blue-400 text-white cursor-not-allowed'
                              : selectedCourse === course.id
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(course.id);
                          }}
                          disabled={isEnrolling}
                        >
                          {isEnrolling && selectedCourse === course.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Inscription...
                            </>
                          ) : selectedCourse === course.id ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Sélectionné
                            </>
                          ) : (
                            <>
                              Commencer
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-center items-center">
              <Link
                href="/courses"
                target="_blank"
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Voir tous les cours disponibles →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

