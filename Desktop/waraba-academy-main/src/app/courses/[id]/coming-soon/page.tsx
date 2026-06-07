'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock, Bell, BookOpen, CheckCircle, ArrowLeft,
  Star, Users, Award, Play, Loader2, AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  image_url?: string;
  instructorName?: string;
  rating?: number;
  totalStudents?: number;
  totalLessons?: number;
  duration?: number;
  level?: string;
  price?: number;
  isFree?: boolean;
  objectives?: string[];
  certificate?: boolean;
  slug?: string;
}

function formatDuration(minutes: number) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h${m}` : `${h}h`;
}

export default function ComingSoonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [notified,     setNotified]     = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError,   setNotifError]   = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const raw = data.course || data.data?.course || data.data;
          if (raw) {
            // Si le cours n'est pas coming soon, rediriger vers la page normale
            if (!raw.isComingSoon && !raw.is_coming_soon) {
              router.replace(`/courses/${raw.slug || courseId}`);
              return;
            }
            setCourse(raw);
          }
        }
      } catch { /* silencieux */ }
      finally { setLoading(false); }
    })();
  }, [courseId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Cours introuvable.</p>
          <Link href="/courses" className="text-blue-600 hover:underline">Voir tous les cours →</Link>
        </div>
      </div>
    );
  }

  const handleNotify = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/courses/${courseId}/coming-soon`);
      return;
    }
    setNotifLoading(true);
    setNotifError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/notify`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setNotified(true);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.code === 'ALREADY_AVAILABLE') {
          router.replace(`/courses/${course.slug || courseId}`);
        } else {
          setNotifError('Erreur lors de l\'enregistrement. Réessayez.');
        }
      }
    } catch {
      setNotifError('Erreur réseau. Réessayez.');
    } finally {
      setNotifLoading(false);
    }
  };

  const thumbnail = course.thumbnail || course.image_url;
  const objectives = Array.isArray(course.objectives)
    ? course.objectives.filter(Boolean).slice(0, 4)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link
          href={`/courses/${course.slug || courseId}`}
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au cours
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-5 gap-10 items-start">

          {/* ─── Colonne gauche (info) ─── */}
          <div className="lg:col-span-3 space-y-8">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-semibold px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              Bientôt disponible
            </div>

            {/* Titre */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                {course.title}
              </h1>
              <p className="text-white/70 mt-4 text-base leading-relaxed">
                {course.shortDescription || course.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-sm text-white/60">
              {course.level && (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  {course.level}
                </span>
              )}
              {course.totalLessons ? (
                <span className="flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-emerald-400" />
                  {course.totalLessons} leçons
                </span>
              ) : null}
              {course.duration ? (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                  {formatDuration(course.duration)}
                </span>
              ) : null}
              {course.certificate && (
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Certificat inclus
                </span>
              )}
              {(course.totalStudents ?? 0) > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-pink-400" />
                  {(course.totalStudents ?? 0).toLocaleString()} déjà inscrits
                </span>
              )}
            </div>

            {/* Objectifs */}
            {objectives.length > 0 && (
              <div>
                <h2 className="text-white font-semibold mb-4 text-lg">Ce que vous apprendrez</h2>
                <ul className="space-y-3">
                  {objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructeur */}
            {course.instructorName && (
              <div className="flex items-center gap-3 border-t border-white/10 pt-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {course.instructorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Instructeur</p>
                  <p className="text-white font-medium text-sm">{course.instructorName}</p>
                </div>
              </div>
            )}
          </div>

          {/* ─── Colonne droite (carte) ─── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden sticky top-8">

              {/* Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
                {thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover opacity-80"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                ) : (
                  <BookOpen className="w-16 h-16 text-white/30" />
                )}
                {/* Overlay badge */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="flex flex-col items-center gap-2 text-white text-center">
                    <Clock className="w-10 h-10 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-300">Bientôt disponible</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">

                {/* Prix */}
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {course.isFree || !course.price || course.price === 0
                      ? 'Gratuit'
                      : `${course.price.toLocaleString()} FCFA`}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Ce cours arrive très prochainement
                  </p>
                </div>

                {/* Bouton notification */}
                {notified ? (
                  <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold py-3.5 px-6 rounded-xl text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Vous serez notifié par email au lancement !
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleNotify}
                      disabled={notifLoading}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors text-sm shadow-md hover:shadow-lg"
                    >
                      {notifLoading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Bell className="w-4 h-4" />}
                      {isAuthenticated ? 'Me notifier au lancement' : 'Se connecter pour être notifié'}
                    </button>
                    {notifError && (
                      <div className="flex items-center gap-2 text-xs text-red-600">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {notifError}
                      </div>
                    )}
                  </>
                )}

                {/* Retour catalogue */}
                <Link
                  href="/courses"
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl py-3 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Voir d'autres cours disponibles
                </Link>

                {/* Mini garanties */}
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  {[
                    { icon: <Award className="w-3.5 h-3.5 text-amber-500" />, text: 'Certificat de complétion' },
                    { icon: <Star className="w-3.5 h-3.5 text-blue-500" />, text: 'Accès à vie inclus' },
                    { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />, text: 'Garantie 30 jours' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                      {item.icon}
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
