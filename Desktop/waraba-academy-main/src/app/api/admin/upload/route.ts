import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { randomBytes } from 'crypto';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { withAdminAuth } from '@/middleware/adminAuth';

// Types de fichiers autorisés
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

async function POST (request: NextRequest) {
  try {
    // SECURITY: Reject oversized requests before parsing into memory
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    if (contentLength > MAX_FILE_SIZE * 2) {
      return NextResponse.json(
        { error: 'Requête trop volumineuse' },
        { status: 413 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string || 'thumbnail'; // 'thumbnail', 'instructor-avatar'
    const courseId = formData.get('courseId') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 },
      );
    }

    // SÉCURITÉ CRITIQUE: Validation stricte du courseId pour éviter path traversal
    // Autoriser UUIDs (avec tirets) ou slugs (alphanumériques, tirets et underscores)
    // Format UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId);
    const isSlug = /^[a-zA-Z0-9_-]+$/.test(courseId);
    
    if (!isUUID && !isSlug) {
      console.error('[Upload] ID de cours invalide:', { courseId, userId: (request as any).adminUser?.id });
      return NextResponse.json(
        { 
          error: 'Impossible de téléverser l\'image',
          details: 'L\'identifiant du cours n\'est pas valide. Veuillez rafraîchir la page et réessayer. Si le problème persiste, contactez le support.',
        },
        { status: 400 },
      );
    }

    // Normaliser le chemin pour éliminer toute tentative de path traversal
    const safeCourseId = path.basename(courseId); // Élimine ../ et /

    // Vérifier que le courseId normalisé est identique à l'original
    if (safeCourseId !== courseId) {
      console.error('[Upload] Tentative de path traversal détectée:', { courseId, safeCourseId, userId: (request as any).adminUser?.id });
      return NextResponse.json(
        { 
          error: 'Erreur de sécurité',
          details: 'L\'identifiant du cours contient des caractères non autorisés. Veuillez réessayer.',
        },
        { status: 400 },
      );
    }

    // Valider le fileType
    const allowedFileTypes = ['thumbnail', 'instructor-avatar', 'lesson', 'course'];
    if (!allowedFileTypes.includes(fileType)) {
      console.error('[Upload] Type de fichier invalide:', { fileType, userId: (request as any).adminUser?.id });
      return NextResponse.json(
        { 
          error: 'Type de fichier non autorisé',
          details: 'Le type de fichier spécifié n\'est pas pris en charge. Veuillez réessayer.',
        },
        { status: 400 },
      );
    }

    // Vérifier le type de fichier
    const fileMimeType = file.type;
    const isVideo = ALLOWED_VIDEO_TYPES.includes(fileMimeType);
    const isDocument = ALLOWED_DOCUMENT_TYPES.includes(fileMimeType);
    const isImage = ALLOWED_IMAGE_TYPES.includes(fileMimeType);

    if (!isVideo && !isDocument && !isImage) {
      console.error('[Upload] Type MIME non autorisé:', { mimeType: fileMimeType, fileName: file.name, userId: (request as any).adminUser?.id });
      return NextResponse.json(
        { 
          error: 'Format de fichier non supporté',
          details: 'Veuillez utiliser un fichier image (JPG, PNG, GIF, WebP), vidéo (MP4, WebM) ou document (PDF, DOC, DOCX).',
        },
        { status: 400 },
      );
    }

    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      console.error('[Upload] Fichier trop volumineux:', { 
        fileSize: file.size, 
        maxSize: MAX_FILE_SIZE,
        fileName: file.name,
        userId: (request as any).adminUser?.id,
      });
      return NextResponse.json(
        { 
          error: 'Fichier trop volumineux',
          details: `La taille du fichier (${fileSizeMB} MB) dépasse la limite autorisée (${maxSizeMB} MB). Veuillez compresser ou choisir un fichier plus petit.`,
        },
        { status: 400 },
      );
    }

    // Utiliser Supabase Storage au lieu du système de fichiers local
    const supabaseAdmin = getAdminSupabaseClient();

    // Déterminer le bucket selon le type
    let bucketName = 'course-images'; // Bucket par défaut
    if (fileType === 'instructor-avatar') {
      bucketName = 'avatars';
    } else if (fileType === 'thumbnail') {
      bucketName = 'course-images';
    } else if (fileType === 'lesson' || fileType === 'course') {
      bucketName = 'course-content';
    }

    // Générer un nom de fichier unique et sécurisé
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');

    // Valider et nettoyer l'extension
    const originalExtension = path.extname(file.name).toLowerCase();
    const allowedExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = allowedExtensions.includes(originalExtension) ? originalExtension : '.bin';

    const fileName = `${safeCourseId}/${timestamp}-${randomString}${fileExtension}`;

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload vers Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false, // Ne pas écraser les fichiers existants
      });

    if (uploadError) {
      console.error('[Upload] Erreur Supabase Storage:', {
        error: uploadError.message,
        code: (uploadError as any).statusCode,
        courseId: safeCourseId,
        fileType,
        fileName,
        userId: (request as any).adminUser?.id,
      });
      
      // Messages d'erreur plus clairs selon le type d'erreur
      let userMessage = 'Impossible de téléverser l\'image';
      if (uploadError.message?.includes('already exists') || uploadError.message?.includes('duplicate')) {
        userMessage = 'Cette image existe déjà. Veuillez choisir une autre image ou renommer le fichier.';
      } else if (uploadError.message?.includes('quota') || uploadError.message?.includes('limit')) {
        userMessage = 'Limite de stockage atteinte. Veuillez contacter l\'administrateur.';
      } else if (uploadError.message?.includes('permission') || uploadError.message?.includes('access')) {
        userMessage = 'Vous n\'avez pas les permissions nécessaires pour téléverser cette image.';
      } else {
        userMessage = 'Une erreur est survenue lors du téléversement. Veuillez réessayer dans quelques instants.';
      }
      
      return NextResponse.json(
        { 
          error: userMessage,
          details: 'Si le problème persiste, contactez le support technique.',
        },
        { status: 500 },
      );
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Déterminer le type de contenu
    let contentType = 'file';
    if (isVideo) contentType = 'video';
    else if (isDocument) contentType = 'document';
    else if (isImage) contentType = 'image';

    // Log de succès pour observabilité
    console.log('[Upload] Image téléversée avec succès:', {
      courseId: safeCourseId,
      fileType,
      fileName,
      fileSize: file.size,
      contentType,
      userId: (request as any).adminUser?.id,
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      contentType,
      mimeType: fileMimeType,
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 },
    );
  }
}

export const POST_handler = withAdminAuth(POST);
export { POST_handler as POST };
