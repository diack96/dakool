'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, AlertTriangle, RefreshCw, ArrowLeft, MessageCircle, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Reason = 'cancelled' | 'unconfirmed' | 'error';

function getContent(reason: Reason) {
  switch (reason) {
    case 'cancelled':
      return {
        icon: <XCircle className="w-14 h-14 text-red-400" />,
        bg: 'bg-red-50',
        iconBg: 'bg-red-100',
        title: 'Paiement annulé',
        subtitle: 'Vous n\'avez pas été débité.',
        detail: 'Le paiement Wave a été annulé ou refusé. Votre compte n\'a subi aucun prélèvement.',
        retryLabel: 'Réessayer le paiement',
      };
    case 'unconfirmed':
      return {
        icon: <AlertTriangle className="w-14 h-14 text-orange-400" />,
        bg: 'bg-orange-50',
        iconBg: 'bg-orange-100',
        title: 'Paiement non confirmé',
        subtitle: 'Votre accès n\'a pas encore été activé.',
        detail: 'Si vous avez été débité sur Wave, votre accès sera activé automatiquement dans quelques minutes via notre système de vérification. Sinon, vous pouvez réessayer.',
        retryLabel: 'Réessayer le paiement',
      };
    default:
      return {
        icon: <XCircle className="w-14 h-14 text-red-400" />,
        bg: 'bg-red-50',
        iconBg: 'bg-red-100',
        title: 'Échec du paiement',
        subtitle: 'Une erreur est survenue.',
        detail: 'Nous n\'avons pas pu traiter votre paiement. Vous n\'avez pas été débité. Veuillez réessayer ou contacter le support.',
        retryLabel: 'Réessayer le paiement',
      };
  }
}

export default function PaymentFailurePage() {
  const params      = useParams();
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const courseId = params.id as string;
  const reason   = (searchParams.get('reason') ?? 'error') as Reason;

  const [course, setCourse] = useState<{ title: string; slug?: string } | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const raw  = data.course || data.data?.course || data.data;
          if (raw) setCourse(raw);
        }
      } catch { /* silencieux */ }
    })();
  }, [authLoading, user, courseId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/courses/${courseId}/payment`);
    }
  }, [authLoading, user, router, courseId]);

  const content    = getContent(reason);
  const courseUrl  = course?.slug ? `/courses/${course.slug}` : `/courses/${courseId}`;
  const paymentUrl = course?.slug
    ? `/courses/${course.slug}/payment`
    : `/courses/${courseId}/payment`;

  return (
    <div className={`min-h-screen ${content.bg} flex items-center justify-center p-4`}>
      <div className="max-w-lg w-full">

        {/* Carte principale */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">

          {/* Icône */}
          <div className="flex justify-center">
            <div className={`w-24 h-24 ${content.iconBg} rounded-full flex items-center justify-center`}>
              {content.icon}
            </div>
          </div>

          {/* Titre */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
            <p className="text-base font-semibold text-gray-600 mt-1">{content.subtitle}</p>
          </div>

          {/* Détail */}
          <p className="text-sm text-gray-500 leading-relaxed">{content.detail}</p>

          {/* Nom du cours */}
          {course && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-start gap-3 text-left">
              <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 font-medium text-sm">{course.title}</p>
            </div>
          )}

          {/* CTA Réessayer */}
          <Link
            href={paymentUrl}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors text-base shadow-md hover:shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            {content.retryLabel}
          </Link>

          {/* CTAs secondaires */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={courseUrl}
              className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au cours
            </Link>
            <span className="hidden sm:block text-gray-300">·</span>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
            >
              <MessageCircle className="w-4 h-4" />
              Contacter le support
            </Link>
          </div>

        </div>

        {/* Mention garantie */}
        <p className="text-center text-xs text-gray-400 mt-4">
          En cas de problème · <Link href="/contact" className="underline hover:text-gray-600">support@waraba-academy.com</Link>
        </p>

      </div>
    </div>
  );
}
