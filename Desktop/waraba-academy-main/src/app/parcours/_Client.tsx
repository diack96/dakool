'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, ChevronRight, Star, Layers } from 'lucide-react';
import type { LearningPath } from '@/types/learning-path';

const LEVEL_LABELS: Record<string, string> = {
  all: 'Tous niveaux',
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

const LEVEL_COLORS: Record<string, string> = {
  all: 'bg-gray-100 text-gray-700',
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

function formatDuration(minutes: number) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function PathCard({ path }: { path: LearningPath & { courses_count: number } }) {
  return (
    <Link href={`/parcours/${path.slug}`} className="group block">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        {/* Thumbnail */}
        <div className="relative h-44 bg-gradient-to-br from-brand-blue-500 to-brand-blue-700 overflow-hidden">
          {path.thumbnail ? (
            <Image
              src={path.thumbnail}
              alt={path.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Layers className="w-16 h-16 text-white/40" />
            </div>
          )}
          {path.is_featured && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-brand-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              <Star className="w-3 h-3" />
              Recommandé
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${LEVEL_COLORS[path.level]}`}>
              {LEVEL_LABELS[path.level]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-blue-600 transition-colors">
            {path.title}
          </h3>
          {path.short_description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{path.short_description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {path.courses_count} cours
            </span>
            {path.estimated_duration > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(path.estimated_duration)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-blue-600">Voir le parcours</span>
            <ChevronRight className="w-4 h-4 text-brand-blue-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function LearningPathsClient() {
  const [paths, setPaths] = useState<(LearningPath & { courses_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    const fetchPaths = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (levelFilter !== 'all') params.set('level', levelFilter);
        const res = await fetch(`/api/learning-paths?${params}`);
        const data = await res.json();
        if (data.success) setPaths(data.paths || []);
      } finally {
        setLoading(false);
      }
    };
    fetchPaths();
  }, [levelFilter]);

  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-blue-600 to-brand-blue-800 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Layers className="w-4 h-4" />
            Parcours structurés
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Apprenez avec un parcours guidé
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Des séquences de cours soigneusement sélectionnées pour vous mener de débutant à expert, étape par étape.
          </p>
        </div>
      </section>

      {/* Filtres */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                levelFilter === l
                  ? 'bg-brand-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue-300'
              }`}
            >
              {LEVEL_LABELS[l]}
            </button>
          ))}
        </div>

        {/* Grille */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : paths.length === 0 ? (
          <div className="text-center py-20">
            <Layers className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun parcours disponible</h3>
            <p className="text-gray-500">Revenez bientôt, de nouveaux parcours arrivent !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
