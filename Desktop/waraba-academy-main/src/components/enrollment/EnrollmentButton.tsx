'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle, AlertCircle, Play, ShoppingCart, Clock, Gift } from 'lucide-react';
import { useCourseStore } from '@/stores/courseStore';
import { useEnrollmentFlow } from '@/hooks/useEnrollmentFlow';
import { EnrollmentService } from '@/services/enrollmentService';
import LoginModal from '@/components/auth/LoginModal';
// PaymentModal n'est plus utilisé - on utilise la page /payment à la place

interface EnrollmentButtonProps {
  courseId: string;
  courseTitle: string;
  isEnrolled?: boolean;
  isFree?: boolean;
  price?: number | null;
  isAvailable?: boolean; // Si false, le cours n'est pas publié
  isComingSoon?: boolean; // Si true, inscription possible mais contenu bloqué
  onEnrollmentChange?: (enrolled: boolean) => void;
  className?: string;
  variant?: 'default' | 'primary' | 'outline';
}

export default function EnrollmentButton ({
  courseId,
  courseTitle,
  isEnrolled = false,
  price = null,
  isAvailable = true, // Par défaut, le cours est disponible
  isComingSoon = false, // Par défaut, le contenu est accessible
  onEnrollmentChange,
  className = '',
  variant = 'default',
}: EnrollmentButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { isLoading: storeLoading } = useCourseStore();
  const { handleEnrollment: handleEnrollmentFlow, isLoading: flowLoading, error: flowError } = useEnrollmentFlow();
  const [showLoginModal, setShowLoginModal] = useState(false);
  // showPaymentModal n'est plus utilisé - on redirige vers /payment

  // Utiliser la logique centralisée du hook
  const handleEnrollment = async () => {
    if (!user?.id) {
      // Rediriger vers login avec redirection vers la page de paiement ou le cours
      const redirectUrl = EnrollmentService.isPaidCourse(price) 
        ? EnrollmentService.getPaymentUrl(courseId)
        : `/courses/${courseId}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    // Si c'est un cours payant, rediriger vers la page de paiement (pas de modal)
    if (EnrollmentService.isPaidCourse(price)) {
      router.push(EnrollmentService.getPaymentUrl(courseId));
      return;
    }

    // Cours gratuit - inscription directe
    await handleEnrollmentFlow({
      courseId,
      courseTitle,
      price: price || null,
      isAvailable,
      userId: user.id,
    });

    // Notifier le parent du changement d'état
    if (onEnrollmentChange) {
      // Vérifier l'inscription après un court délai
      setTimeout(async () => {
        const check = await EnrollmentService.checkEnrollment(courseId);
        onEnrollmentChange(check.isEnrolled);
      }, 1500);
    }
  };

  const isLoading = flowLoading || storeLoading;
  const error = flowError;

  // Fonction de désinscription (non utilisée pour l'instant)
  // const handleUnenrollment = async () => {
  //   if (!user) return;
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     await unenrollFromCourse(courseId, user.id);
  //     onEnrollmentChange?.(false);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Erreur lors de la désinscription');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const getButtonContent = () => {
    if (isEnrolled && isComingSoon) {
      return {
        icon: <Clock className="w-4 h-4" />,
        text: 'Bientôt disponible',
        action: () => router.push(`/courses/${courseId}/coming-soon`),
      };
    } else if (isEnrolled) {
      return {
        icon: <Play className="w-4 h-4" />,
        text: 'Continuer l\'apprentissage',
        action: () => {
          router.push(`/courses/${courseId}/learn`);
        },
      };
    } else if (!isAvailable) {
      // Cours bientôt disponible
      return {
        icon: <Clock className="w-4 h-4" />,
        text: 'Bientôt disponible',
        action: () => {
          // Ne rien faire, juste informer
        },
      };
    } else {
      // Adapter le texte selon si le cours est gratuit ou payant
      // Utiliser le service centralisé pour déterminer le type de cours
      const isPaidCourse = EnrollmentService.isPaidCourse(price);

      if (isPaidCourse) {
        return {
          icon: <ShoppingCart className="w-4 h-4" />,
          text: `Acheter pour ${price?.toLocaleString()} FCFA`,
          action: handleEnrollment,
        };
      } else {
        return {
          icon: <Gift className="w-4 h-4" />,
          text: 'S\'inscrire gratuitement',
          action: handleEnrollment,
        };
      }
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    if (isEnrolled && isComingSoon) {
      return `${baseClasses} bg-amber-500 text-white cursor-not-allowed`;
    }

    if (isEnrolled) {
      return `${baseClasses} bg-green-600 text-white hover:bg-green-700 hover:scale-105`;
    }

    // Si le cours n'est pas disponible, style désactivé
    if (!isAvailable) {
      return `${baseClasses} bg-gray-400 text-white cursor-not-allowed`;
    }

    const isPaid = EnrollmentService.isPaidCourse(price);
    if (!isPaid) {
      return `${baseClasses} bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105`;
    }

    switch (variant) {
    case 'primary':
      return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 hover:scale-105`;
    case 'outline':
      return `${baseClasses} border-2 border-blue-600 text-blue-600 hover:bg-blue-50`;
    default:
      return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 hover:scale-105`;
    }
  };

  const buttonContent = getButtonContent();
  const buttonClasses = getButtonClasses();

  // Déterminer si c'est un cours payant en utilisant le service centralisé
  const isPaidCourse = !isEnrolled && EnrollmentService.isPaidCourse(price);
  const paymentUrl = isPaidCourse ? EnrollmentService.getPaymentUrl(courseId) : null;

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Si c'est un cours payant, rediriger immédiatement
    if (isPaidCourse && paymentUrl) {
      if (!user || !isAuthenticated) {
        const loginUrl = `/auth/login?redirect=${encodeURIComponent(paymentUrl)}`;
        router.push(loginUrl);
      } else {
        router.push(paymentUrl);
      }
      return;
    }

    // Sinon, utiliser l'action du bouton (inscription gratuite)
    buttonContent.action();
  };

  // Si l'utilisateur est inscrit mais le cours est "bientôt disponible", bloquer l'accès au contenu
  if (isEnrolled && isComingSoon) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          disabled
          className={`${buttonClasses} ${className}`}
        >
          {buttonContent.icon}
          <span className="ml-2">{buttonContent.text}</span>
        </button>
        <div className="text-center text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Vous êtes inscrit. Le contenu sera bientôt disponible !</span>
          </div>
        </div>
      </div>
    );
  }

  // Si le cours n'est pas disponible, désactiver toutes les actions
  if (!isAvailable) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          disabled
          className={`${buttonClasses} ${className}`}
        >
          {buttonContent.icon}
          <span className="ml-2">{buttonContent.text}</span>
        </button>
        <div className="text-center text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span>Ce cours sera bientôt disponible. Revenez plus tard !</span>
          </div>
        </div>
      </div>
    );
  }

  // Si c'est un cours payant, utiliser un lien au lieu d'un bouton pour forcer la navigation
  if (isPaidCourse && paymentUrl) {
    return (
      <div className="space-y-3">
        <a
          href={paymentUrl}
          onClick={handleButtonClick}
          className={`${buttonClasses} ${className} no-underline`}
        >
          {buttonContent.icon}
          <span className="ml-2">{buttonContent.text}</span>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isLoading || storeLoading || !isAvailable}
        className={`${buttonClasses} ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin w-4 h-4 mr-2" />
            {isEnrolled ? 'Chargement...' : 'Inscription...'}
          </>
        ) : (
          <>
            {buttonContent.icon}
            <span className="ml-2">{buttonContent.text}</span>
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {!isEnrolled && !EnrollmentService.isPaidCourse(price) && (
        <p className="text-center text-xs font-medium text-emerald-700">
          Gratuit · Accès immédiat · Sans carte bancaire
        </p>
      )}

      {isEnrolled && isComingSoon && (
        <div className="text-center text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Vous êtes inscrit. Le contenu sera bientôt disponible !</span>
          </div>
        </div>
      )}

      {isEnrolled && !isComingSoon && (
        <div className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Vous êtes inscrit à ce cours</span>
          </div>
        </div>
      )}

      {/* Modal de login */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          // Réessayer l'inscription après connexion
          if (user?.id) {
            handleEnrollment();
          }
        }}
        redirectUrl={`/courses/${courseId}`}
      />

      {/* Modal de paiement - DÉSACTIVÉ : on utilise la page /payment à la place */}
      {/* Le modal est gardé pour compatibilité mais ne sera plus utilisé */}
    </div>
  );
}
