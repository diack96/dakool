import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { randomBytes } from 'crypto';
import { withAdminAuth } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';

// Types de fichiers autorisés
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

/**
 * API pour générer une URL signée pour upload direct vers Supabase Storage
 * Cette approche évite la limite de 4.5 MB de Vercel en uploadant directement depuis le client
 */
async function POST (request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, fileSize, mimeType, courseId } = body;

    if (!fileName || !fileType || !fileSize || !mimeType) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 },
      );
    }

    // SÉCURITÉ: Validation stricte du courseId
    // Autoriser UUIDs (avec tirets) ou slugs (alphanumériques, tirets et underscores)
    const isUUID = courseId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId);
    const isSlug = courseId && /^[a-zA-Z0-9_-]+$/.test(courseId);
    
    // IMPORTANT: Ne pas utiliser de fallback silencieux - retourner une erreur claire
    if (!isUUID && !isSlug) {
      console.error('[Signed URL] ID de cours invalide:', { courseId, userId: (request as any).adminUser?.id });
      return NextResponse.json(
        { 
          error: 'Impossible de préparer l\'upload',
          details: 'L\'identifiant du cours n\'est pas valide. Veuillez rafraîchir la page et réessayer. Si le problème persiste, contactez le support.',
        },
        { status: 400 },
      );
    }
    
    // Normaliser pour éliminer toute tentative de path traversal
    const safeCourseId = path.basename(courseId);
    if (safeCourseId !== courseId) {
      console.error('[Signed URL] Tentative de path traversal détectée:', { courseId, safeCourseId, userId: (request as any).adminUser?.id });
      return NextResponse.json(
        { error: 'Erreur de sécurité', details: 'L\'identifiant du cours contient des caractères non autorisés.' },
        { status: 400 },
      );
    }

    // Valider le fileType
    const allowedFileTypes = ['thumbnail', 'instructor-avatar', 'lesson', 'course'];
    if (!allowedFileTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Type de fichier invalide' },
        { status: 400 },
      );
    }

    // Vérifier le type MIME
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);
    const isDocument = ALLOWED_DOCUMENT_TYPES.includes(mimeType);
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);

    if (!isVideo && !isDocument && !isImage) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé' },
        { status: 400 },
      );
    }

    // Vérifier la taille
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Taille maximale: ${MAX_FILE_SIZE / (1024 * 1024)} MB` },
        { status: 400 },
      );
    }

    // Valider l'extension
    const originalExtension = path.extname(fileName).toLowerCase();
    const allowedExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!allowedExtensions.includes(originalExtension)) {
      return NextResponse.json(
        { error: 'Extension de fichier non autorisée' },
        { status: 400 },
      );
    }

    // Déterminer le bucket selon le type
    let bucketName = 'course-images';
    if (fileType === 'instructor-avatar') {
      bucketName = 'avatars'; // aligné avec upload/route.ts
    } else if (fileType === 'thumbnail') {
      bucketName = 'course-images';
    } else if (fileType === 'lesson' || fileType === 'course') {
      bucketName = 'course-content';
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const finalFileName = `${safeCourseId}/${timestamp}-${randomString}${originalExtension}`;

    // Générer une vraie URL signée Supabase pour upload direct depuis le navigateur
    // Évite la limite 4.5MB de Vercel — le fichier ne transite pas par l'API Next.js
    const supabaseAdmin = getAdminSupabaseClient();
    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUploadUrl(finalFileName);

    if (signedError || !signedData) {
      console.error('[Signed URL] Erreur création URL signée Supabase:', signedError);
      return NextResponse.json(
        { error: 'Impossible de préparer l\'upload. Réessayez.' },
        { status: 500 },
      );
    }

    // Construire l'URL publique finale (après upload)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${finalFileName}`;

    console.log('[Signed URL] URL signée Supabase générée:', {
      courseId: safeCourseId,
      fileType,
      fileName: finalFileName,
      fileSize,
      userId: (request as any).adminUser?.id,
    });

    return NextResponse.json({
      success: true,
      signedUrl: signedData.signedUrl,  // URL PUT directe vers Supabase Storage
      token: signedData.token,
      bucketName,
      path: finalFileName,
      publicUrl,                         // URL publique finale après upload
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération de l\'URL signée:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de l\'URL signée' },
      { status: 500 },
    );
  }
}

export const POST_handler = withAdminAuth(POST);
export { POST_handler as POST };

