import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError, createValidationError, createInternalError, createForbiddenError } from '@/lib/errors';
// Note: apiLogger (winston) désactivé pour compatibilité Edge Runtime
// Utiliser console.log/error/warn à la place
// import { apiLogger } from '@/lib/logger';
import { z } from 'zod';

// Schéma de validation pour mettre à jour un cours
const updateCourseSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').optional(),
  description: z.string().min(1, 'La description est requise').optional(),
  category_id: z.string().uuid('ID de catégorie invalide').optional(),
  instructor_id: z.string().uuid('ID d\'instructeur invalide').optional(),
  price: z.number().min(0, 'Le prix doit être positif').optional(),
  image_url: z.string().url('URL d\'image invalide').optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  is_published: z.boolean().optional(),
  status: z.enum(['published', 'draft', 'archived']).optional(),
  isFeatured: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isStarterCourse: z.boolean().optional(),
  isComingSoon: z.boolean().optional(),
  displayOrder: z.number().int().min(0, 'L\'ordre d\'affichage doit être positif').optional(),
  thumbnail: z.union([
    z.string().url('URL de miniature invalide'),
    z.string().length(0), // Accepter les chaînes vides
    z.null(),
  ]).optional().nullable(),
  videoUrl: z.union([
    z.string().url('URL de vidéo invalide'),
    z.string().length(0), // Accepter les chaînes vides
    z.null(),
  ]).optional().nullable(),
  shortDescription: z.string().optional(),
  originalPrice: z.number().min(0, 'Le prix original doit être positif').optional().nullable(),
  requirements: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(), // Fonctionnalités (ce qui est inclus)
  syllabus: z.string().optional(),
  instructorName: z.string().optional(), // Nom de l'instructeur saisi manuellement
  instructorBio: z.string().optional(), // Bio de l'instructeur
  instructorAvatar: z.union([
    z.string().url('URL d\'avatar invalide'),
    z.string().length(0), // Accepter les chaînes vides
    z.null(),
  ]).optional().nullable(), // Photo de l'instructeur
  language: z.string().optional(), // Langue du cours
  certificate: z.boolean().optional(), // Certificat inclus
  displayStudentsCount: z.number().int().min(0).optional().nullable(), // Override manuel du nb d'étudiants
});

// GET /api/admin/courses/[id] - Récupérer un cours spécifique
async function GET (request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { adminUser } = (request as any);

    if (!adminUser) {
      throw createForbiddenError('Accès non autorisé - authentification admin requise');
    }

    // Utiliser le client admin pour contourner RLS et accéder à tous les cours
    const supabase = getAdminSupabaseClient();
    const { id } = await params;
    const courseId = id;

    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        throw createValidationError(`Cours avec l'ID "${courseId}" non trouvé dans la base de données`);
      }
      console.error('Erreur lors de la récupération du cours', error);
      throw createInternalError('Erreur lors de la récupération du cours', {
        error: error.message,
        code: error.code,
        details: error.details,
      });
    }

    if (!course) {
      throw createValidationError(`Cours avec l'ID "${courseId}" non trouvé.`);
    }

    // Récupérer catégorie, instructeur, inscriptions et avis en parallèle
    const [
      { data: category },
      { data: instructor },
      { count: enrollmentCount },
      { data: reviews },
    ] = await Promise.all([
      course.category_id
        ? supabase.from('categories').select('id, name, description').eq('id', course.category_id).maybeSingle()
        : Promise.resolve({ data: null }),
      course.instructor_id
        ? supabase.from('profiles').select('id, first_name, last_name, avatar_url, email').eq('id', course.instructor_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('course_id', courseId),
      supabase.from('course_reviews').select('rating').eq('course_id', courseId),
    ]);

    const rating = reviews && reviews.length > 0
      ? reviews.reduce((sum: number, r: { rating?: number }) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

    // Transformer les données
    const transformedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      shortDescription: (course as any).short_description || `${course.description.substring(0, 150)}...`,
      categoryId: course.category_id || '',
      instructorId: course.instructor_id || '',
      instructorName: (course as any).instructor_name || '', // Nom de l'instructeur si stocké séparément
      instructorAvatar: (course as any).instructor_avatar_url || '', // Photo de l'instructeur
      instructorBio: (course as any).instructor_bio || '', // Bio de l'instructeur
      price: course.price,
      originalPrice: (course as any).original_price || undefined,
      duration: (course as any).duration ? `${(course as any).duration} min` : 'N/A', // Format d'affichage
      durationMinutes: typeof (course as any).duration === 'number' ? (course as any).duration : 0, // Durée en minutes (numérique pour le formulaire)
      level: ((course as any).level || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
      // Utiliser le champ status de la base de données si disponible, sinon déduire de is_published
      status: (() => {
        const dbStatus = ((course as any).status as string)?.toLowerCase();
        if (dbStatus === 'published' || dbStatus === 'draft' || dbStatus === 'archived') {
          return dbStatus as 'published' | 'draft' | 'archived';
        }
        // Fallback sur is_published si status n'existe pas
        return ((course as any).is_published !== undefined && (course as any).is_published) ? 'published' as const : 'draft' as const;
      })(),
      thumbnail: course.image_url || undefined,
      videoUrl: (course as any).video_preview || undefined,
      enrollmentCount: enrollmentCount || 0,
      displayStudentsCount: (course as any).display_students_count ?? null,
      totalStudents: (course as any).display_students_count ?? enrollmentCount ?? 0,
      rating: Math.round(rating * 10) / 10,
      reviewCount: reviews?.length || 0,
      isFeatured: (course as any).is_featured || false,
      isPopular: (course as any).is_popular || false,
      isStarterCourse: (course as any).is_starter_course || false,
      isComingSoon: (course as any).is_coming_soon || false,
      displayOrder: (course as any).display_order || 0,
      requirements: (course as any).requirements ? (typeof (course as any).requirements === 'string' ? JSON.parse((course as any).requirements) : (course as any).requirements) : [],
      objectives: (course as any).objectives ? (typeof (course as any).objectives === 'string' ? JSON.parse((course as any).objectives) : (course as any).objectives) : [],
      materials: (course as any).materials ? (typeof (course as any).materials === 'string' ? JSON.parse((course as any).materials) : (course as any).materials) : [],
      syllabus: (course as any).syllabus || '[]',
      createdAt: new Date(course.created_at),
      updatedAt: new Date(course.updated_at),
      category: category ? {
        id: category.id,
        name: category.name,
      } : undefined,
      instructor: instructor ? {
        id: instructor.id,
        firstName: instructor.first_name || '',
        lastName: instructor.last_name || '',
        fullName: `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim() || 'Expert',
        email: instructor.email || '',
        avatarUrl: instructor.avatar_url,
      } : undefined,
    };

    // Log de l'action (ne pas bloquer si ça échoue)
    try {
      await logAdminAction({
        user_id: (request as any).adminUser?.id || 'unknown',
        action: 'courses.view',
        resource: `/api/admin/courses/${courseId}`,
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        success: true,
        details: { course_id: courseId },
      });
    } catch (logError) {
      // Ne pas bloquer la réponse si le log échoue
      console.warn('Erreur lors du log admin:', logError);
    }

    return NextResponse.json({
      success: true,
      course: transformedCourse,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du cours', error);
    return handleApiError(error);
  }
}

// PATCH /api/admin/courses/[id] - Mettre à jour un cours
async function PATCH (request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Utiliser le client admin pour contourner RLS et accéder à tous les cours
    const supabase = getAdminSupabaseClient();
    const { id } = await params;
    const courseId = id;

    const body = await request.json();

    // Validation avec Zod
    const validation = updateCourseSchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError('Données invalides', validation.error.issues);
    }

    const updateData = validation.data;

    // Transformer status en is_published si nécessaire
    const updatePayload: any = {};
    // Colonnes de base (toujours présentes)
    if (updateData.title !== undefined) updatePayload.title = updateData.title;
    if (updateData.description !== undefined) updatePayload.description = updateData.description;
    if (updateData.category_id !== undefined) updatePayload.category_id = updateData.category_id;
    if (updateData.instructor_id !== undefined) updatePayload.instructor_id = updateData.instructor_id;
    if (updateData.price !== undefined) updatePayload.price = updateData.price;
    if (updateData.image_url !== undefined) updatePayload.image_url = updateData.image_url;

    // Colonnes optionnelles (pourraient ne pas exister)
    if (updateData.duration !== undefined) updatePayload.duration = updateData.duration;
    if (updateData.level !== undefined) updatePayload.level = updateData.level;

    // Gérer le statut : mettre à jour à la fois status ET is_published pour respecter la contrainte
    if (updateData.status !== undefined) {
      // Mapper les valeurs de l'API (minuscules) vers les valeurs de la DB (majuscules)
      const statusMap: Record<'published' | 'draft' | 'archived', 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'> = {
        'published': 'PUBLISHED',
        'draft': 'DRAFT',
        'archived': 'ARCHIVED',
      };
      updatePayload.status = statusMap[updateData.status as 'published' | 'draft' | 'archived'];
      updatePayload.is_published = updateData.status === 'published';
    } else if (updateData.is_published !== undefined) {
      // Si seulement is_published est fourni, mettre à jour les deux pour cohérence
      updatePayload.is_published = updateData.is_published;
      updatePayload.status = updateData.is_published ? 'PUBLISHED' : 'DRAFT';
    }

    // Gérer les champs d'affichage (optionnels, peuvent ne pas exister dans la DB)
    // Ces champs sont optionnels et peuvent ne pas exister dans toutes les bases de données
    // On les ajoute seulement s'ils sont définis, et on gérera les erreurs plus tard
    if (updateData.isFeatured !== undefined) updatePayload.is_featured = updateData.isFeatured;
    if (updateData.isPopular !== undefined) updatePayload.is_popular = updateData.isPopular;
    if (updateData.isStarterCourse !== undefined) {
      updatePayload.is_starter_course = updateData.isStarterCourse;
      if (updateData.isStarterCourse && updatePayload.price && updatePayload.price > 0) {
        updatePayload.price = 0;
      }
    }
    if (updateData.isComingSoon !== undefined) updatePayload.is_coming_soon = updateData.isComingSoon;
    // display_order peut ne pas exister - on ne l'ajoute que si défini et on gérera l'erreur
    if (updateData.displayOrder !== undefined) {
      // On l'ajoute mais on gérera l'erreur si la colonne n'existe pas
      updatePayload.display_order = updateData.displayOrder;
    }

    // Gérer les autres champs optionnels (peuvent ne pas exister dans la DB)
    if (updateData.thumbnail !== undefined) updatePayload.image_url = updateData.thumbnail;
    // Note: Les colonnes suivantes peuvent ne pas exister - on les essaie mais on gérera l'erreur si nécessaire
    if (updateData.videoUrl !== undefined) updatePayload.video_preview = updateData.videoUrl;
    if (updateData.shortDescription !== undefined) updatePayload.short_description = updateData.shortDescription;
    if (updateData.originalPrice !== undefined) updatePayload.original_price = updateData.originalPrice;
    // Nom de l'instructeur (peut être stocké dans instructor_name ou dans un champ JSON)
    if (updateData.instructorName !== undefined) {
      // Essayer d'abord avec instructor_name (si la colonne existe)
      updatePayload.instructor_name = updateData.instructorName;
    }
    // Ces colonnes peuvent ne pas exister - on les ajoute mais on gérera l'erreur si elles n'existent pas
    if (updateData.requirements !== undefined) updatePayload.requirements = JSON.stringify(updateData.requirements);
    if (updateData.objectives !== undefined) updatePayload.objectives = JSON.stringify(updateData.objectives);
    if (updateData.materials !== undefined) updatePayload.materials = JSON.stringify(updateData.materials);
    if (updateData.features !== undefined) updatePayload.features = JSON.stringify(updateData.features);
    if (updateData.syllabus !== undefined) updatePayload.syllabus = updateData.syllabus;
    if (updateData.instructorBio !== undefined) updatePayload.instructor_bio = updateData.instructorBio;
    if (updateData.instructorAvatar !== undefined) updatePayload.instructor_avatar_url = updateData.instructorAvatar;
    if (updateData.language !== undefined) updatePayload.language = updateData.language;
    if (updateData.certificate !== undefined) updatePayload.certificate = updateData.certificate;
    if (updateData.displayStudentsCount !== undefined) updatePayload.display_students_count = updateData.displayStudentsCount;

    const { data: course, error } = await supabase
      .from('courses')
      .update(updatePayload)
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw createValidationError('Cours non trouvé');
      }

      // Si l'erreur est due à une colonne inexistante
      const missingColumns = [
        'is_published', 'level', 'duration', 'is_featured',
        'is_popular', 'display_order', 'original_price', 'video_preview',
        'short_description', 'requirements', 'objectives', 'materials', 'syllabus',
        'instructor_name', 'instructor_bio', 'features', 'language', 'certificate',
        'is_coming_soon', 'display_students_count',
      ];

      const isMissingColumnError = error.message && missingColumns.some(col =>
        error.message.includes(col) || error.message.toLowerCase().includes(col.replace('_', ' ')),
      );

      if (isMissingColumnError) {
        // Identifier quelle colonne manque
        const missingColumn = missingColumns.find(col =>
          error.message?.includes(col) || error.message?.toLowerCase().includes(col.replace('_', ' '))
        );

        if (missingColumn) {
          const payloadWithoutMissing = { ...updatePayload };
          delete (payloadWithoutMissing as any)[missingColumn];

          const { data: courseRetry, error: errorRetry } = await supabase
            .from('courses')
            .update(payloadWithoutMissing)
            .eq('id', courseId)
            .select()
            .single();

          if (courseRetry && !errorRetry) {
            return NextResponse.json({
              success: true,
              message: 'Cours mis à jour avec succès',
              course: courseRetry,
              warning: missingColumn === 'syllabus' 
                ? 'La colonne syllabus n\'existe pas encore. Le cours a été mis à jour sans le syllabus. Appliquez la migration 007 pour activer cette fonctionnalité.'
                : `La colonne ${missingColumn} n'existe pas encore. Le cours a été mis à jour sans cette colonne.`,
            });
          }
        }

        // Retirer TOUTES les colonnes optionnelles qui pourraient ne pas exister
        const payloadWithoutMissing = { ...updatePayload };
        delete payloadWithoutMissing.is_published;
        delete payloadWithoutMissing.level;
        delete payloadWithoutMissing.duration;
        delete payloadWithoutMissing.is_featured;
        delete payloadWithoutMissing.is_popular;
        delete payloadWithoutMissing.display_order;
        delete payloadWithoutMissing.original_price;
        delete payloadWithoutMissing.video_preview;
        delete payloadWithoutMissing.short_description;
        delete payloadWithoutMissing.requirements;
        delete payloadWithoutMissing.objectives;
        delete payloadWithoutMissing.materials;
        delete payloadWithoutMissing.features;
        delete payloadWithoutMissing.syllabus;
        delete payloadWithoutMissing.instructor_name;
        delete payloadWithoutMissing.instructor_bio;
        delete payloadWithoutMissing.language;
        delete payloadWithoutMissing.certificate;

        // Garder seulement les colonnes de base qui existent TOUJOURS (colonnes obligatoires)
        const safePayload: any = {};
        if (updateData.title !== undefined) safePayload.title = updatePayload.title;
        if (updateData.description !== undefined) safePayload.description = updatePayload.description;
        if (updateData.category_id !== undefined) safePayload.category_id = updatePayload.category_id;
        if (updateData.instructor_id !== undefined) safePayload.instructor_id = updatePayload.instructor_id;
        if (updateData.price !== undefined) safePayload.price = updatePayload.price;
        if (updateData.image_url !== undefined) safePayload.image_url = updatePayload.image_url;
        if (updateData.displayStudentsCount !== undefined) safePayload.display_students_count = updateData.displayStudentsCount;
        // Ne pas inclure requirements, objectives, materials, syllabus car ils peuvent ne pas exister
        // On les essaie seulement si la première tentative échoue

        if (Object.keys(safePayload).length > 0) {
          const { data: course2, error: error2 } = await supabase
            .from('courses')
            .update(safePayload)
            .eq('id', courseId)
            .select()
            .single();

          if (error2) {
            console.error('Erreur lors de la mise à jour du cours (sans colonnes optionnelles)', error2);
            throw createInternalError('Erreur lors de la mise à jour du cours', { error: error2.message });
          }

          // Retourner le cours mis à jour avec un message d'avertissement
          return NextResponse.json({
            success: true,
            message: 'Cours mis à jour avec succès. Note: certaines colonnes optionnelles (display_order, is_featured, is_popular, etc.) n\'existent pas encore dans la base de données.',
            course: course2,
            warning: 'Certaines colonnes optionnelles ont été ignorées car elles n\'existent pas dans la base de données',
          });
        } else {
          // Si on ne peut rien mettre à jour, retourner une erreur claire
          throw createValidationError(
            'Impossible de mettre à jour: aucune colonne valide à mettre à jour. ' +
            'Veuillez exécuter les migrations SQL dans Supabase Dashboard.',
          );
        }
      }

      console.error('Erreur lors de la mise à jour du cours', error);
      throw createInternalError('Erreur lors de la mise à jour du cours', { error: error.message });
    }

    // ── Notifications de lancement ─────────────────────────────────────────────
    // Si l'admin vient de désactiver "coming soon" → envoyer les emails de lancement
    if (updateData.isComingSoon === false) {
      try {
        const { sendEmail } = await import('@/lib/email');
        const { courseLaunchedTemplate } = await import('@/lib/email/templates');

        const { data: notifications } = await supabase
          .from('course_launch_notifications')
          .select('email, first_name')
          .eq('course_id', courseId);

        if (notifications && notifications.length > 0) {
          const courseTitle = course?.title ?? 'Formation';
          const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';
          const courseUrl  = `${siteUrl}/courses/${(course as any)?.slug || courseId}`;
          const coursePrice = (course as any)?.price ?? 0;
          const isFree     = coursePrice === 0;

          // Envoi séquentiel pour éviter de saturer Resend
          for (const notif of notifications) {
            const tpl = await courseLaunchedTemplate({
              userName:    notif.first_name || 'Apprenant',
              courseTitle,
              courseUrl,
              coursePrice,
              isFree,
            });
            await sendEmail({ to: notif.email, ...tpl });
          }

          // Nettoyer les notifications envoyées
          await supabase
            .from('course_launch_notifications')
            .delete()
            .eq('course_id', courseId);

          console.log(`[launch] ${notifications.length} email(s) envoyé(s) pour le cours ${courseId}`);
        }
      } catch (emailErr) {
        // Ne pas bloquer la réponse si l'envoi échoue
        console.error('[launch] Erreur envoi notifications:', emailErr);
      }
    }

    // Log de l'action
    await logAdminAction({
      user_id: (request as any).adminUser.id,
      action: 'courses.update',
      resource: `/api/admin/courses/${courseId}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { course_id: courseId, updates: updatePayload },
    });

    return NextResponse.json({
      success: true,
      message: 'Cours mis à jour avec succès',
      course,
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du cours', error);
    return handleApiError(error);
  }
}

// DELETE /api/admin/courses/[id] - Supprimer un cours
async function DELETE (request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Utiliser le client admin pour contourner RLS et accéder à tous les cours
    const supabase = getAdminSupabaseClient();
    const { id } = await params;
    const courseId = id;

    // Vérifier que le cours existe
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw createValidationError('Cours non trouvé');
      }
      console.error('Erreur lors de la vérification du cours', fetchError);
      throw createInternalError('Erreur lors de la vérification du cours', { error: fetchError.message });
    }

    // Supprimer le cours (les relations seront supprimées automatiquement via CASCADE)
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (deleteError) {
      console.error('Erreur lors de la suppression du cours', deleteError);
      throw createInternalError('Erreur lors de la suppression du cours', { error: deleteError.message });
    }

    // Log de l'action
    await logAdminAction({
      user_id: (request as any).adminUser.id,
      action: 'courses.delete',
      resource: `/api/admin/courses/${courseId}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { course_id: courseId, course_title: existingCourse.title },
    });

    return NextResponse.json({
      success: true,
      message: 'Cours supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du cours', error);
    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
const GET_handler = withAdminAuth(GET);
const PATCH_handler = withAdminAuth(PATCH);
const DELETE_handler = withAdminAuth(DELETE);

export { GET_handler as GET, PATCH_handler as PATCH, DELETE_handler as DELETE };

