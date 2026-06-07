/**
 * Hook personnalisé pour gérer le flux complet d'inscription
 * Centralise toute la logique d'inscription et de redirection
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/admin/Toast';
import { EnrollmentService, EnrollmentFlowOptions } from '@/services/enrollmentService';
import { getCourseLearnUrl } from '@/lib/utils/courseUrl';

export interface UseEnrollmentFlowReturn {
  handleEnrollment: (options: EnrollmentFlowOptions) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useEnrollmentFlow(): UseEnrollmentFlowReturn {
  const router = useRouter();
  const { user } = useAuth();
  
  // Utiliser useToast - le ToastProvider est dans le layout principal
  // Si une erreur se produit, elle sera visible dans la console
  const toast = useToast();
  const { success, error: showError } = toast;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnrollment = useCallback(
    async (options: EnrollmentFlowOptions) => {
      const { courseId, price, isAvailable, userId } =
        options;

      // 1. Vérifier si le cours est disponible
      if (!EnrollmentService.isCourseAvailable(isAvailable)) {
        showError('Ce cours n\'est pas encore disponible', 5000);
        return;
      }

      // 2. Vérifier l'authentification
      if (!user || !userId) {
        const redirectUrl = EnrollmentService.getLoginRedirectUrl(
          courseId,
          price
        );
        router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }

      // 3. Vérifier si c'est un cours payant
      // Note: Le paiement sera géré par le composant parent via un modal
      // On retourne ici pour que le parent puisse afficher le modal de paiement
      if (EnrollmentService.isPaidCourse(price)) {
        // Ne pas rediriger, le parent gérera l'affichage du modal
        return;
      }

      // 4. Inscription à un cours gratuit
      setIsLoading(true);
      setError(null);

      try {
        console.log('[Enrollment Flow] Début de l\'inscription:', { courseId, userId });
        
        const result = await EnrollmentService.enrollInFreeCourse(
          courseId
        );

        console.log('[Enrollment Flow] Résultat de l\'inscription:', result);

        if (!result.success) {
          const errorMessage = result.error || 'Erreur lors de l\'inscription';
          console.error('[Enrollment Flow] ❌ Échec de l\'inscription:', errorMessage);
          throw new Error(errorMessage);
        }

        // Récupérer les détails du cours pour construire l'URL avec slug
        let learnUrl = `/courses/${courseId}/learn`;
        try {
          const courseResponse = await fetch(`/api/courses/${courseId}`, {
            credentials: 'include',
          });
          if (courseResponse.ok) {
            const text = await courseResponse.text();
            if (text && text.trim() !== '') {
              const courseData = JSON.parse(text);
              const course = courseData.course || courseData.data?.course || courseData.data;
              if (course) {
                learnUrl = getCourseLearnUrl(course);
              }
            }
          }
        } catch {
          // Utiliser l'URL par défaut
        }

        // Succès - Message rapide puis redirection immédiate
        // Utiliser le message du résultat s'il existe, sinon message par défaut
        const successMessage = result.message 
          ? `✅ ${result.message}` 
          : result.enrollment 
          ? '✅ Accès au cours autorisé !' 
          : '✅ Inscription réussie !';
        success(successMessage, 2000);

        // Redirection DIRECTE vers le cours (pas de page de succès, pas de délai supplémentaire)
        // Utiliser window.location.href pour forcer un rechargement complet et éviter les problèmes de cache
        // L'enrollment sera vérifié côté serveur dans /learn, donc pas besoin d'attendre ici
        setTimeout(() => {
          window.location.href = learnUrl;
        }, 300); // Délai minimal pour que le toast s'affiche
      } catch (err: any) {
        let errorMessage =
          err instanceof Error
            ? err.message
            : 'Erreur lors de l\'inscription';
        
        // Améliorer les messages d'erreur pour les problèmes RLS
        if (errorMessage.includes('RLS') || errorMessage.includes('permissions') || errorMessage.includes('403')) {
          errorMessage = 'Erreur de permissions. Veuillez contacter l\'administrateur ou réessayer plus tard.';
          console.error('[Enrollment Flow] ❌ Erreur RLS détectée:', err);
        }
        
        setError(errorMessage);
        showError(errorMessage, 8000); // Afficher plus longtemps pour les erreurs
        console.error('[Enrollment Flow] ❌ Erreur complète:', {
          message: errorMessage,
          error: err,
          courseId,
          errorDetails: (err as any)?.details,
          errorCode: (err as any)?.code,
        });
        
        // Afficher plus de détails dans la console pour le diagnostic
        if ((err as any)?.details) {
          console.error('[Enrollment Flow] Détails de l\'erreur:', (err as any).details);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user, router, success, showError]
  );

  return {
    handleEnrollment,
    isLoading,
    error,
  };
}
