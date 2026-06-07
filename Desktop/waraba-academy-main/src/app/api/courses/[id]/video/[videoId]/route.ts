import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { successResponse, ApiErrors, errorResponse } from '@/lib/api/response';
import { isUUID } from '@/lib/utils/slug';
import { apiRateLimiter } from '@/lib/rateLimit';

// Helper pour résoudre l'ID réel du cours (UUID) à partir d'un slug ou UUID
async function resolveCourseId(supabase: any, courseIdentifier: string): Promise<string | null> {
  const isIdUUID = isUUID(courseIdentifier);
  
  if (isIdUUID) {
    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseIdentifier)
      .maybeSingle(); // Utiliser maybeSingle() pour éviter les erreurs si le cours n'existe pas
    
    if (error) {
      console.error('[resolveCourseId Video] Erreur lors de la recherche par UUID:', {
        courseIdentifier,
        error: error.message,
        errorCode: error.code,
      });
      return null;
    }
    
    if (data) {
      return data.id;
    }
    
    console.warn('[resolveCourseId Video] Cours non trouvé par UUID:', courseIdentifier);
    return null;
  } else {
    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', courseIdentifier)
      .maybeSingle(); // Utiliser maybeSingle() pour éviter les erreurs si le cours n'existe pas
    
    if (error) {
      console.error('[resolveCourseId Video] Erreur lors de la recherche par slug:', {
        courseIdentifier,
        error: error.message,
      });
      return null;
    }
    
    if (data) {
      return data.id;
    }
    
    console.warn('[resolveCourseId Video] Cours non trouvé par slug:', courseIdentifier);
    return null;
  }
}

/**
 * API Route pour obtenir une URL signée pour une vidéo de leçon
 *
 * Cette route :
 * 1. Vérifie que l'utilisateur est authentifié
 * 2. Vérifie que l'utilisateur est inscrit au cours
 * 3. Génère une URL signée valide 1 heure
 * 4. Retourne l'URL pour la lecture
 */

async function GETHandler (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> },
) {
  
  try {
    
    const { id: courseIdentifier, videoId } = await params;

    // Validate videoId format (alphanumeric, hyphens, underscores only)
    if (!videoId || !/^[a-zA-Z0-9_-]+$/.test(videoId)) {
      return ApiErrors.notFound('Leçon', videoId || 'unknown');
    }

    const supabase = await createServerSupabaseClient();

    // 1. Vérifier l'authentification en premier — évite une requête DB inutile
    //    si l'utilisateur n'est pas connecté (getSession = JWT local, zéro appel réseau Auth)
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    // 2. Résoudre l'ID réel du cours (UUID) à partir du slug ou UUID
    const courseId = await resolveCourseId(supabase, courseIdentifier);

    if (!courseId) {
      return ApiErrors.notFound('Cours', courseIdentifier);
    }

    // 3. Récupérer le cours + chercher la leçon dans la table lessons ET le syllabus JSONB
    const [{ data: course, error: courseError }, { data: lessonRow }] = await Promise.all([
      supabase
        .from('courses')
        .select('id, title, syllabus')
        .eq('id', courseId)
        .single(),
      supabase
        .from('lessons')
        .select('id, title, video_url')
        .eq('id', videoId)
        .eq('course_id', courseId)
        .maybeSingle(),
    ]);

    if (courseError || !course) {
      return ApiErrors.notFound('Cours', courseIdentifier);
    }

    // 4. Chercher la leçon : d'abord dans la table lessons, sinon dans le syllabus JSONB
    const lr = lessonRow as { id: string; title: string; video_url: string | null } | null;
    let lesson: any = lr
      ? { id: lr.id, title: lr.title, videoUrl: lr.video_url }
      : null;

    if (!lesson) {
      const syllabus = (course as any).syllabus;
      let modules: any[] = [];
      if (Array.isArray(syllabus)) {
        modules = syllabus;
      } else if (syllabus?.modules && Array.isArray(syllabus.modules)) {
        modules = syllabus.modules;
      }

      for (const module of modules) {
        const lessonList = module.lessons || module.lessonList || [];
        const found = lessonList.find((l: any) => l.id === videoId || l.videoId === videoId);
        if (found) { lesson = found; break; }
      }
    }

    if (!lesson) {
      return ApiErrors.notFound('Leçon', videoId);
    }

    // 5. Vérifier que l'utilisateur est inscrit au cours (APRÈS vérification que la leçon appartient au cours)
    // Utiliser la même stratégie robuste que l'API lessons pour éviter les problèmes de timing/RLS
    let enrollment: any = null;
    
    // Tentative 1: Requête directe
    let enrollmentResult = await supabase
      .from('enrollments')
      .select('id, status, course_id, user_id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();
    
    enrollment = enrollmentResult.data;
    
    // Si pas trouvé, essayer avec une requête globale (contourne les problèmes de RLS/timing)
    if (!enrollment) {
      const allEnrollmentsResult = await supabase
        .from('enrollments')
        .select('id, status, course_id, user_id')
        .eq('user_id', user.id);
      
      if (!allEnrollmentsResult.error && allEnrollmentsResult.data) {
        const foundEnrollment = allEnrollmentsResult.data.find((e: any) => {
          const eCourseId = String(e.course_id || '').toLowerCase().trim();
          const searchCourseId = String(courseId || '').toLowerCase().trim();
          return eCourseId === searchCourseId;
        });
        
        if (foundEnrollment) {
          enrollment = foundEnrollment;
        }
      }
    }

    // Si pas d'enrollment trouvé, créer automatiquement pour les cours gratuits
    if (!enrollment) {
      const { data: courseInfo } = await supabase
        .from('courses')
        .select('price, is_free')
        .eq('id', courseId)
        .maybeSingle();

      const isFree = courseInfo && ((courseInfo as any)?.is_free || (courseInfo as any)?.price === 0 || (courseInfo as any)?.price === null);

      if (isFree) {
        const { data: newEnrollment, error: createError } = await supabase
          .from('enrollments')
          .insert({
            user_id: user.id,
            course_id: courseId,
            status: 'active',
            enrolled_at: new Date().toISOString(),
            progress: 0,
          } as any)
          .select()
          .maybeSingle();

        if (!createError && newEnrollment) {
          enrollment = newEnrollment;
        } else if (createError?.code === '23505') {
          // Duplicate key - l'enrollment existe déjà, le récupérer
          const existingResult = await supabase
            .from('enrollments')
            .select('id, status, course_id, user_id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .maybeSingle();
          
          if (existingResult.data) {
            enrollment = existingResult.data;
          }
        }
      }
    }

    const enrollmentStatus = enrollment?.status;
    if (!enrollment || !['active', 'completed', 'pending'].includes(enrollmentStatus)) {
      return ApiErrors.enrollmentRequired(courseIdentifier);
    }

    // 6. Vérifier que la leçon a une vidéo
    const videoUrl = lesson.videoUrl || lesson.video_url || lesson.video;
    if (!videoUrl) {
      return errorResponse(
        `La leçon "${lesson.title || videoId}" n'a pas de vidéo associée`,
        404,
        'VIDEO_NOT_FOUND',
      );
    }

    // 7. Extraire le chemin et le bucket depuis l'URL complète ou utiliser directement
    const videoPath = videoUrl;
    let bucketPath = videoPath;
    // Bucket par défaut (rétrocompatibilité), sera écrasé si détecté dans l'URL
    let targetBucket = 'course-videos';

    const KNOWN_BUCKETS = ['course-videos', 'course-content'];

    // Cas 1: URL publique Supabase Storage — détecte le bucket dynamiquement
    // Format: https://xxx.supabase.co/storage/v1/object/public/<bucket>/path/to/video.mp4
    const publicStorageMatch = videoPath.match(/\/storage\/v1\/object\/public\/([^/]+)\/([^?]+)/);
    if (publicStorageMatch) {
      const detectedBucket = publicStorageMatch[1];
      const detectedPath = publicStorageMatch[2];
      if (KNOWN_BUCKETS.includes(detectedBucket)) {
        targetBucket = detectedBucket;
        bucketPath = detectedPath;
      } else {
        // Bucket inconnu → URL externe ou nouveau bucket non géré
        return successResponse({ videoUrl, expiresIn: 0 });
      }
    }
    // Cas 2: URL signée ou chemin relatif
    else if (!videoPath.startsWith('http')) {
      bucketPath = videoPath;
      // targetBucket reste 'course-videos' (défaut)
    }
    // Cas 3: URL Supabase avec format alternatif (signed URL, etc.)
    else if (videoPath.includes('supabase.co')) {
      // Cherche un bucket connu dans l'URL
      const bucketMatch = KNOWN_BUCKETS.map(b => ({
        bucket: b,
        match: videoPath.match(new RegExp(`${b}\\/([^?]+)`)),
      })).find(r => r.match);

      if (bucketMatch?.match) {
        targetBucket = bucketMatch.bucket;
        bucketPath = bucketMatch.match[1];
      } else {
        // URL Supabase non reconnue → retourner telle quelle
        return successResponse({ videoUrl, expiresIn: 0 });
      }
    }
    // Cas 4: URL externe (YouTube, Vimeo, etc.) - retourner directement
    else {
      return successResponse({
        videoUrl: videoUrl,
        expiresIn: 0, // Pas d'expiration pour URLs externes
      });
    }

    // 5. Générer une URL signée valide 1 heure pour Supabase Storage
    // Utiliser SERVICE_ROLE_KEY pour générer l'URL signée
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    try {
      const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
        .from(targetBucket)
        .createSignedUrl(bucketPath, 3600); // 1 heure

      if (signedUrlError || !signedUrlData) {
        console.error('[API Video] Échec génération URL signée:', signedUrlError?.message);
        return ApiErrors.internalError('Impossible de charger la vidéo. Réessayez plus tard.');
      }

      return successResponse({
        videoUrl: signedUrlData.signedUrl,
        expiresIn: 3600, // 1 heure en secondes
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[API Video] Erreur génération URL signée:', msg);
      return ApiErrors.internalError('Impossible de charger la vidéo. Réessayez plus tard.');
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[API Video] Error:', message);
    return ApiErrors.internalError('Erreur lors de la recuperation de la video', message);
  }
}

// Wrapper avec rate limiting
export async function GET (
  request: NextRequest,
  context: { params: Promise<{ id: string; videoId: string }> },
) {
  // Appliquer le rate limiting
  const rateLimitResponse = await apiRateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  // Continuer avec le handler original
  return GETHandler(request, context);
}

