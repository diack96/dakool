'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, BookOpen, Loader2, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentSuccessPage() {
  const params   = useParams();
  const router   = useRouter();
  const { user, loading: authLoading } = useAuth();
  const courseId = params.id as string;

  const [course,   setCourse]   = useState<{ title: string; slug?: string } | null>(null);
  const [checking, setChecking] = useState(true);

  /* Charger les infos du cours pour l'affichage */
  useEffect(() => {
    if (authLoading || !user) return;

    (async () => {
      try {
        const courseRes = await fetch(`/api/courses/${courseId}`, { cache: 'no-store' });
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          const raw = courseData.course || courseData.data?.course || courseData.data;
          if (raw) setCourse(raw);
        }
      } catch (err) {
        console.error('[PaymentSuccess]', err);
      } finally {
        setChecking(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, courseId]);

  /* Rediriger vers login si non connecté */
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/courses/${courseId}/payment/success`);
    }
  }, [authLoading, user, router, courseId]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-blue-50">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
      </div>
    );
  }

  const courseUrl = course?.slug
    ? `/courses/${course.slug}/learn`
    : `/courses/${courseId}/learn`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">

        {/* Carte principale */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">

          {/* Icône succès */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>
          </div>

          {/* Titre */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Félicitations ! 🎉</h1>
            <p className="text-gray-500 mt-2">
              Votre paiement a été confirmé avec succès.
            </p>
          </div>

          {/* Nom du cours */}
          {course && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3 text-left">
              <BookOpen className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-700 font-medium">Accès débloqué</p>
                <p className="text-gray-900 font-semibold mt-0.5">{course.title}</p>
              </div>
            </div>
          )}

          {/* Email envoyé */}
          <div className="flex items-center gap-2 justify-center text-sm text-gray-500">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Un email de confirmation vous a été envoyé.</span>
          </div>

          {/* CTA principal */}
          <Link
            href={courseUrl}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors text-lg shadow-md hover:shadow-lg"
          >
            Commencer le cours
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Lien secondaire */}
          <Link
            href="/dashboard"
            className="block text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Aller au tableau de bord
          </Link>

        </div>

        {/* Mention garantie */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Garantie satisfait ou remboursé 30 jours · Support disponible 7j/7
        </p>

      </div>
    </div>
  );
}
