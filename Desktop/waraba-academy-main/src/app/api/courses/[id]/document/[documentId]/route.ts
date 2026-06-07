import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { isUUID } from '@/lib/utils/slug';
import path from 'path';
import { existsSync } from 'fs';

// Helper pour résoudre l'ID réel du cours (UUID) à partir d'un slug ou UUID
async function resolveCourseId(supabase: any, courseIdentifier: string): Promise<string | null> {
  const isIdUUID = isUUID(courseIdentifier);
  
  if (isIdUUID) {
    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseIdentifier)
      .single();
    
    if (!error && data) {
      return data.id;
    }
    return null;
  } else {
    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', courseIdentifier)
      .single();
    
    if (!error && data) {
      return data.id;
    }
    return null;
  }
}

/**
 * API Route pour obtenir une URL sécurisée pour un document PDF de leçon
 *
 * Cette route :
 * 1. Vérifie que l'utilisateur est authentifié
 * 2. Vérifie que l'utilisateur est inscrit au cours
 * 3. Retourne l'URL du document (ou génère une URL signée si stocké dans Supabase Storage)
 */

export async function GET (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  try {
    const { id: courseIdentifier, documentId } = await params;
    const supabase = await createServerSupabaseClient();

    // 1. Résoudre l'ID réel du cours (UUID) à partir du slug ou UUID
    const courseId = await resolveCourseId(supabase, courseIdentifier);
    if (!courseId) {
      return ApiErrors.notFound('Cours', courseIdentifier);
    }

    // 2. Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    // 3. Vérifier que la leçon appartient au cours AVANT de vérifier l'enrollment (SÉCURITÉ CRITIQUE)
    // D'abord, vérifier si documentId est un ID de leçon dans la table lessons
    const { data: lessonCheck, error: lessonCheckError } = await supabase
      .from('lessons')
      .select('id, course_id')
      .eq('id', documentId)
      .eq('course_id', courseId)
      .single();

    // Si la leçon n'existe pas dans la table lessons, chercher dans le syllabus
    let lesson: any = null;
    if (lessonCheckError || !lessonCheck) {
      // Récupérer le cours avec son syllabus pour trouver la leçon
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id, syllabus')
        .eq('id', courseId)
        .single();

      if (courseError || !course) {
        return ApiErrors.notFound('Cours', courseIdentifier);
      }

      // Parser le syllabus pour trouver la leçon
      let modules: any[] = [];
      if ((course as any).syllabus) {
        try {
          const syllabus = typeof (course as any).syllabus === 'string' 
            ? JSON.parse((course as any).syllabus) 
            : (course as any).syllabus;
          modules = Array.isArray(syllabus) ? syllabus : [];
        } catch (e) {
          return ApiErrors.internalError('Erreur lors de la lecture du syllabus du cours');
        }
      }

      // Trouver la leçon dans les modules
      for (const module of modules) {
        const lessonList = module.lessonList || module.lessons || [];
        const foundLesson = lessonList.find((l: any) => l.id === documentId);
        if (foundLesson) {
          lesson = foundLesson;
          break;
        }
      }

      if (!lesson) {
        return ApiErrors.notFound('Leçon', documentId);
      }
    } else {
      // La leçon existe dans la table lessons, récupérer ses détails
      const { data: lessonData, error: lessonDataError } = await supabase
        .from('lessons')
        .select('id, course_id, content')
        .eq('id', documentId)
        .single();

      if (lessonDataError || !lessonData) {
        return ApiErrors.notFound('Leçon', documentId);
      }
      lesson = lessonData;
    }

    // 3. Vérifier que l'utilisateur est inscrit au cours (APRÈS vérification que la leçon appartient au cours)
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .in('status', ['active', 'completed'])
      .single();

    if (enrollmentError || !enrollment) {
      return ApiErrors.enrollmentRequired(courseIdentifier);
    }

    // 4. Récupérer l'URL du document (pdfUrl ou fileUrl depuis le JSON ou content)
    let documentUrl = lesson.pdfUrl || lesson.fileUrl;
    
    // Si pas dans le JSON, chercher dans le content de la leçon (table lessons)
    if (!documentUrl && lesson.content) {
      try {
        const content = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content;
        documentUrl = content?.pdfUrl || content?.fileUrl || content?.documentUrl;
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }

    if (!documentUrl) {
      return ApiErrors.notFound('Document', documentId);
    }

    // 4. Vérifier si c'est une URL externe (retourner directement)
    if (documentUrl.startsWith('http://') || documentUrl.startsWith('https://')) {
      // Vérifier que ce n'est pas une URL Supabase Storage (qui nécessite une signature)
      if (!documentUrl.includes(process.env.NEXT_PUBLIC_SUPABASE_URL || '')) {
        return successResponse({
          documentUrl: documentUrl,
          expiresIn: 0, // Pas d'expiration pour URLs externes
        });
      }
    }

    // 5. Si c'est un fichier local (dans /public/uploads/)
    if (documentUrl.startsWith('/uploads/')) {
      // Vérifier que le fichier existe
      const filePath = path.join(process.cwd(), 'public', documentUrl);
      
      if (existsSync(filePath)) {
        // Retourner l'URL publique
        return successResponse({
          documentUrl: documentUrl,
          expiresIn: 0,
        });
      } else {
        return ApiErrors.notFound('Fichier', documentUrl);
      }
    }

    // 6. Si c'est stocké dans Supabase Storage, générer une URL signée
    let bucketPath = documentUrl;

    // Extraire le chemin depuis l'URL Supabase Storage si nécessaire
    if (documentUrl.includes('/storage/v1/object/public/')) {
      // Format: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file.pdf
      const match = documentUrl.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)/);
      if (match) {
        const bucketName = match[1];
        bucketPath = match[2].split('?')[0];
        
        // Générer une URL signée valide 1 heure
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (serviceRoleKey) {
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
          );

          const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
            .from(bucketName)
            .createSignedUrl(bucketPath, 3600); // 1 heure

          if (signedUrlError || !signedUrlData) {
            return ApiErrors.internalError('Erreur lors de la génération de l\'URL du document', signedUrlError?.message);
          }

          return successResponse({
            documentUrl: signedUrlData.signedUrl,
            expiresIn: 3600,
          });
        }
      }
    }

    // 7. Si c'est un chemin relatif, essayer de le servir depuis /public/uploads/
    const relativePath = documentUrl.startsWith('/') ? documentUrl : `/${documentUrl}`;
    const localFilePath = path.join(process.cwd(), 'public', 'uploads', 'lesson', courseId, path.basename(relativePath));

    if (existsSync(localFilePath)) {
      return successResponse({
        documentUrl: `/uploads/lesson/${courseId}/${path.basename(relativePath)}`,
        expiresIn: 0,
      });
    }

    // 8. Si aucun cas ne correspond, retourner l'URL telle quelle (peut être une URL publique)
    return successResponse({
      documentUrl: documentUrl,
      expiresIn: 0,
    });
  } catch (error: any) {
    return ApiErrors.internalError('Erreur serveur lors de la récupération du document', error.message);
  }
}

