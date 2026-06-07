'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Clock, ChevronRight, ArrowLeft, Layers,
  Star, Users, Play
} from 'lucide-react';
import type { LearningPath, LearningPathCourse } from '@/types/learning-path';

const LEVEL_LABELS: Record<string, string> = {
  all: 'Tous niveaux',
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

function formatDuration(minutes: number) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export default function LearningPathDetailClient({ slug }: { slug: string }) {
  const [path, setPath] = useState<(LearningPath & { courses: LearningPathCourse[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const res = await fetch(`/api/learning-paths/${slug}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        if (data.success) setPath(data.path);
        else setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPath();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600" />
      </div>
    );
  }

  if (notFound || !path) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Layers className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-700">Parcours introuvable</h1>
        <Link href="/parcours" className="text-brand-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Retour aux parcours
        </Link>
      </div>
    );
  }

  const totalDuration = path.courses.reduce((sum, lpc) => sum + (lpc.course?.duration || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-blue-700 to-brand-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Link href="/parcours" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Tous les parcours
          </Link>

          <div className="flex items-start gap-4 mb-6">
            {path.is_featured && (
              <span className="flex items-center gap-1 bg-brand-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                <Star className="w-3 h-3" />
                Recommandé
              </span>
            )}
            <span className="bg-white/10 text-white/90 text-xs font-medium px-3 py-1 rounded-full">
              {LEVEL_LABELS[path.level]}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{path.title}</h1>

          {path.description && (
            <p className="text-lg text-white/80 max-w-3xl mb-8">{path.description}</p>
          )}

          <div className="flex flex-wrap gap-6 text-white/80 text-sm">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <strong className="text-white">{path.courses.length}</strong> cours
            </span>
            {totalDuration > 0 && (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <strong className="text-white">{formatDuration(totalDuration)}</strong> de contenu
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Contenu */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Cours inclus dans ce parcours
        </h2>

        {path.courses.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun cours dans ce parcours pour l'instant.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {path.courses.map((lpc, index) => {
              const course = lpc.course;
              if (!course) return null;
              const isFirst = index === 0;

              return (
                <div
                  key={lpc.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-5">
                    {/* Numéro */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      isFirst
                        ? 'bg-brand-blue-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Thumbnail */}
                    {(course.thumbnail || course.image_url) && (
                      <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-gray-100 hidden sm:block">
                        <Image
                          src={course.thumbnail || course.image_url || ''}
                          alt={course.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    )}

                    {/* Info cours */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                        {course.level && (
                          <span>{LEVEL_LABELS[course.level] || course.level}</span>
                        )}
                        {course.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDuration(course.duration)}
                          </span>
                        )}
                        {(course.total_students || 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {course.total_students} étudiants
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Prix + CTA */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      <span className={`text-sm font-semibold ${
                        course.is_free || !course.price ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {course.is_free || !course.price ? 'Gratuit' : `${course.price} €`}
                      </span>
                      <Link
                        href={`/courses/${course.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-blue-600 hover:text-brand-blue-700 border border-brand-blue-200 hover:border-brand-blue-400 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Play className="w-3 h-3" />
                        Voir le cours
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA bas de page */}
        {path.courses.length > 0 && (
          <div className="mt-10 bg-brand-blue-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-2">Prêt à commencer ce parcours ?</h3>
            <p className="text-white/80 mb-6">
              Inscrivez-vous au premier cours et commencez votre apprentissage dès aujourd'hui.
            </p>
            {path.courses[0]?.course?.slug && (
              <Link
                href={`/courses/${path.courses[0].course.slug}`}
                className="inline-flex items-center gap-2 bg-white text-brand-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-brand-blue-50 transition-colors shadow-lg"
              >
                Commencer le parcours
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
