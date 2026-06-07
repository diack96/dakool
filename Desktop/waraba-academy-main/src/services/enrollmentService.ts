/**
 * Service centralisé pour gérer les inscriptions aux cours
 * Séparation des responsabilités : logique métier isolée des composants UI
 */

export interface EnrollmentResult {
  success: boolean;
  enrollmentId?: string;
  error?: string;
  enrollment?: any;
  message?: string;
  details?: any;
}

export interface EnrollmentFlowOptions {
  courseId: string;
  courseTitle: string;
  price: number | null;
  isAvailable: boolean;
  userId: string;
}

export class EnrollmentService {
  private static baseUrl = '/api';

  /**
   * Détermine si un cours est payant
   */
  static isPaidCourse(price: number | null | undefined): boolean {
    return price !== null && price !== undefined && price > 0;
  }

  /**
   * Détermine si un cours est gratuit
   */
  static isFreeCourse(price: number | null | undefined): boolean {
    return !this.isPaidCourse(price);
  }

  /**
   * Vérifie si un cours est disponible (publié)
   */
  static isCourseAvailable(isAvailable: boolean): boolean {
    return isAvailable === true;
  }

  /**
   * Inscrit un utilisateur à un cours gratuit
   * Note: userId n'est pas nécessaire car l'API utilise la session (auth.uid())
   */
  static async enrollInFreeCourse(
    courseId: string
  ): Promise<EnrollmentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          // Note: userId n'est pas nécessaire car l'API utilise la session (auth.uid())
        }),
      });

      // Vérifier que la réponse n'est pas vide avant de parser
      const text = await response.text();
      let data: any = {};
      
      if (text && text.trim() !== '') {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('[EnrollmentService] Erreur parsing JSON:', parseError);
          // Si le parsing échoue, retourner une erreur
          return {
            success: false,
            error: 'Réponse invalide du serveur',
          };
        }
      }

      // Gérer les cas d'erreur HTTP
      if (!response.ok) {
        console.error('[EnrollmentService] Erreur API:', {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        
        // Si c'est une erreur 400 "déjà inscrit", considérer comme succès
        if (response.status === 400 && (data.error?.includes('déjà inscrit') || data.error?.includes('already enrolled'))) {
          console.log('[EnrollmentService] ⚠️ Déjà inscrit, considéré comme succès');
          return {
            success: true,
            enrollmentId: data.enrollment?.id,
            enrollment: data.enrollment,
            message: 'Vous êtes déjà inscrit à ce cours',
          };
        }
        
        // Si c'est une erreur 403 (Forbidden), c'est probablement un problème RLS
        if (response.status === 403) {
          console.error('[EnrollmentService] ❌ Erreur 403 - Problème de permissions RLS:', data);
          return {
            success: false,
            error: data.error || 'Erreur de permissions. Les politiques RLS bloquent l\'inscription. Veuillez contacter l\'administrateur.',
            details: data.details,
          };
        }
        
        // Si c'est une erreur 405 (Method Not Allowed), transformer en message utilisateur
        if (response.status === 405) {
          console.warn('[EnrollmentService] ⚠️ Erreur 405 détectée, vérification de l\'inscription...');
          // Essayer de vérifier si l'utilisateur est déjà inscrit
          const checkResult = await this.checkEnrollment(courseId);
          if (checkResult.isEnrolled) {
            return {
              success: true,
              enrollmentId: checkResult.enrollmentId,
              message: 'Vous êtes déjà inscrit à ce cours',
            };
          }
          // L'utilisateur n'est pas inscrit et on a eu 405 - retourner l'erreur
          const apiErrorMessage = data.error || data.message || `Erreur ${response.status}: Méthode non autorisée`;
          console.error('[EnrollmentService] ❌ Erreur 405 - Méthode non autorisée:', {
            status: response.status,
            message: apiErrorMessage,
            allowedMethods: data.allowedMethods,
            receivedMethod: data.receivedMethod,
          });

          return {
            success: false,
            error: 'Erreur technique lors de l\'inscription. Veuillez réessayer ou contacter le support.',
            details: data.details,
          };
        }
        
        // Pour les autres erreurs, retourner le message d'erreur du serveur
        const errorMessage = data.error || `Erreur ${response.status}: ${response.statusText}`;
        console.error('[EnrollmentService] ❌ Erreur API:', {
          status: response.status,
          message: errorMessage,
          data,
        });
        
        return {
          success: false,
          error: errorMessage,
          details: data.details,
        };
      }

      // Si success est false dans la réponse
      if (data.success === false) {
        console.error('[EnrollmentService] Réponse non réussie:', data);
        return {
          success: false,
          error: data.error || 'Erreur lors de l\'inscription',
        };
      }

      // Succès (même si success n'est pas explicitement true, si response.ok et pas d'erreur)
      console.log('[EnrollmentService] ✅ Inscription réussie:', {
        enrollmentId: data.enrollment?.id || data.enrollmentId,
        courseId,
        message: data.message,
      });

      return {
        success: true,
        enrollmentId: data.enrollment?.id || data.enrollmentId,
        enrollment: data.enrollment,
      };
    } catch (error: any) {
      console.error('[EnrollmentService] ❌ Erreur lors de l\'inscription:', {
        error: error.message,
        courseId,
        stack: error.stack,
      });
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'inscription',
      };
    }
  }

  /**
   * Vérifie si l'utilisateur connecté est déjà inscrit à un cours
   * Note: L'API utilise la session pour identifier l'utilisateur
   * @param courseId - Peut être un UUID ou un slug
   */
  static async checkEnrollment(
    courseId: string
  ): Promise<{ isEnrolled: boolean; enrollmentId?: string }> {
    try {
      // D'abord, résoudre le courseId en UUID si c'est un slug
      let resolvedCourseId = courseId;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId);

      if (!isUUID) {
        // C'est un slug, récupérer le cours pour obtenir l'UUID
        try {
          const courseResponse = await fetch(`${this.baseUrl}/courses/${courseId}`, {
            credentials: 'include',
            cache: 'no-store',
          });
          if (courseResponse.ok) {
            const courseText = await courseResponse.text();
            if (courseText && courseText.trim() !== '') {
              const courseData = JSON.parse(courseText);
              const course = courseData.course || courseData.data?.course || courseData.data;
              if (course?.id) {
                resolvedCourseId = course.id;
                console.log('[EnrollmentService] Slug résolu en UUID:', { slug: courseId, uuid: resolvedCourseId });
              }
            }
          }
        } catch (resolveError) {
          console.warn('[EnrollmentService] Impossible de résoudre le slug en UUID:', resolveError);
        }
      }

      const response = await fetch(`${this.baseUrl}/enrollments`, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        return { isEnrolled: false };
      }

      // Vérifier que la réponse n'est pas vide avant de parser
      const text = await response.text();
      let data: any = {};

      if (text && text.trim() !== '') {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.warn('[EnrollmentService] Erreur parsing JSON checkEnrollment:', parseError);
          return { isEnrolled: false };
        }
      }

      if (data.success && Array.isArray(data.enrollments)) {
        // Comparer avec l'UUID résolu ET le courseId original (slug)
        // Le course.slug peut être présent dans les données d'enrollment (via jointure)
        const enrollment = data.enrollments.find(
          (e: any) => {
            const enrollmentCourseId = e.course_id || e.course?.id;
            const enrollmentCourseSlug = e.courses?.slug || e.course?.slug;

            // Comparer avec UUID résolu ou avec le slug
            const matchesUUID = enrollmentCourseId === resolvedCourseId;
            const matchesSlug = enrollmentCourseSlug === courseId;
            const matchesOriginal = enrollmentCourseId === courseId;

            return (matchesUUID || matchesSlug || matchesOriginal) &&
              (e.status === 'active' || e.status === 'completed' || e.status === 'pending');
          }
        );

        return {
          isEnrolled: !!enrollment,
          enrollmentId: enrollment?.id,
        };
      }

      return { isEnrolled: false };
    } catch (error) {
      console.error('Erreur EnrollmentService.checkEnrollment:', error);
      return { isEnrolled: false };
    }
  }

  /**
   * Génère l'URL de redirection après login selon le type de cours
   */
  static getLoginRedirectUrl(
    courseId: string,
    price: number | null | undefined
  ): string {
    if (this.isPaidCourse(price)) {
      return `/courses/${courseId}/payment`;
    }
    return `/courses/${courseId}`;
  }

  /**
   * Génère l'URL de redirection vers la page de paiement
   */
  static getPaymentUrl(courseId: string): string {
    return `/courses/${courseId}/payment`;
  }

  /**
   * Génère l'URL de redirection vers la page de succès
   */
  static getSuccessUrl(courseId: string): string {
    return `/courses/${courseId}/success?completed=true`;
  }

  /**
   * Génère l'URL de redirection vers la page d'apprentissage
   */
  static getLearnUrl(courseId: string): string {
    return `/courses/${courseId}/learn`;
  }
}
