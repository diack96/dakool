import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST (request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll () {
            return cookieStore.getAll();
          },
          setAll (cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Ignorer les erreurs de cookies côté serveur
            }
          },
        },
      },
    );

    // Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 },
      );
    }

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

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 },
      );
    }

    // SÉCURITÉ: Vérifier le type MIME réel du fichier (pas seulement file.type qui peut être falsifié)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Vérification basique avec file.type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, WebP' },
        { status: 400 },
      );
    }

    // Vérification de l'extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!extension || !allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: 'Extension de fichier non autorisée' },
        { status: 400 },
      );
    }

    // Vérification du type MIME réel avec file-type (obligatoire)
    try {
      const { fileTypeFromBuffer } = await import('file-type');
      const fileType = await fileTypeFromBuffer(buffer);

      if (!fileType || !ALLOWED_IMAGE_TYPES.includes(fileType.mime)) {
        return NextResponse.json(
          { error: 'Type de fichier réel ne correspond pas à une image autorisée. Fichier rejeté.' },
          { status: 400 },
        );
      }
    } catch {
      // file-type indisponible - rejeter par sécurité
      return NextResponse.json(
        { error: 'Impossible de valider le type du fichier' },
        { status: 500 },
      );
    }

    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Taille maximale: ${MAX_FILE_SIZE / (1024 * 1024)} MB` },
        { status: 400 },
      );
    }

    // Buffer déjà créé lors de la validation MIME

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${timestamp}-${randomString}.${fileExtension}`;

    // Upload vers Supabase Storage (on essaie directement, l'erreur nous dira si le bucket n'existe pas)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true, // Remplacer si existe déjà
      });

    if (uploadError) {
      // SÉCURITÉ: Utiliser un logger sécurisé
      const { secureLogger } = await import('@/lib/security/secureLogger');
      secureLogger.error('Erreur upload Supabase', uploadError, {
        statusCode: (uploadError as any).statusCode || (uploadError as any).status || undefined,
        error: (uploadError as any).error || uploadError.message,
        fileName: fileName,
        userId: user.id,
      });

      // Messages d'erreur plus spécifiques
      let errorMessage = 'Erreur lors de l\'upload';

      if (uploadError.message?.includes('new row violates row-level security policy') ||
          uploadError.message?.includes('permission denied') ||
          uploadError.message?.includes('permission_denied')) {
        errorMessage = 'Permission refusée pour le téléversement de la photo.';
      } else if (uploadError.message?.includes('Bucket not found') ||
                 uploadError.message?.includes('not found') ||
                 uploadError.message?.includes('does not exist') ||
                (uploadError as any).statusCode === 404 ||
                (uploadError as any).statusCode === 400) {
        // Le bucket n'existe probablement pas ou n'est pas accessible
        errorMessage = 'Le stockage de photos n\'est pas accessible. Veuillez réessayer plus tard.';
      } else if (uploadError.message?.includes('The resource already exists')) {
        // Si le fichier existe déjà, on essaie de le remplacer
        const { error: replaceError } = await supabase.storage
          .from('avatars')
          .update(fileName, buffer, {
            contentType: file.type,
          });

        if (replaceError) {
          errorMessage = 'Erreur lors du remplacement de la photo.';
        } else {
          // Succès du remplacement
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          // Mettre à jour le profil
          await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);

          await supabase.auth.updateUser({
            data: { avatar_url: publicUrl },
          });

          return NextResponse.json({
            success: true,
            url: publicUrl,
            fileName: fileName,
          });
        }
      } else {
        errorMessage = 'Erreur lors du téléversement de la photo.';
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 },
      );
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Mettre à jour le profil utilisateur avec l'URL de la photo
    // 1. Mettre à jour la table profiles (si elle existe)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      const { secureLogger } = await import('@/lib/security/secureLogger');
      secureLogger.error('Erreur mise à jour profil', updateError);
    }

    // 2. Toujours mettre à jour user_metadata pour que l'avatar soit disponible immédiatement
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (metadataError) {
      const { secureLogger } = await import('@/lib/security/secureLogger');
      secureLogger.error('Erreur mise à jour metadata', metadataError);
      // Si la mise à jour des metadata échoue, retourner une erreur
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil utilisateur' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uploadData.path,
    });
  } catch (error: any) {
    const { secureLogger } = await import('@/lib/security/secureLogger');
    secureLogger.error('Erreur upload photo', error);
    return NextResponse.json(
      { error: 'Erreur inattendue lors de l\'upload' },
      { status: 500 },
    );
  }
}


