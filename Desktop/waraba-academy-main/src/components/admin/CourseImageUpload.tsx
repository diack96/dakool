'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { createBrowserSupabaseClient } from '@/lib/supabase-helpers';

interface CourseImageUploadProps {
  courseId: string;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved?: () => void;
  label?: string;
  uploadType?: string; // 'thumbnail' ou 'instructor-avatar'
}

export default function CourseImageUpload({
  courseId,
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  label = 'Image du cours',
  uploadType = 'thumbnail',
}: CourseImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.');
      return;
    }

    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      setError(`Fichier trop volumineux. Taille maximale: ${MAX_FILE_SIZE / (1024 * 1024)} MB`);
      return;
    }

    setError('');
    setUploading(true);

    // Afficher un aperçu immédiat
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Pour les fichiers > 4 MB, utiliser l'upload direct vers Supabase Storage depuis le client
      // Pour les petits fichiers, utiliser l'API classique
      const USE_DIRECT_UPLOAD = file.size > 4 * 1024 * 1024; // 4 MB

      if (USE_DIRECT_UPLOAD) {
        // 1. Obtenir les infos du bucket depuis l'API
        const bucketInfoResponse = await fetch('/api/admin/upload/signed-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: uploadType,
            fileSize: file.size,
            mimeType: file.type,
            courseId: courseId,
          }),
        });

        const bucketInfo = await bucketInfoResponse.json();

        if (!bucketInfoResponse.ok || !bucketInfo.success) {
          throw new Error(bucketInfo.error || 'Erreur lors de la préparation de l\'upload');
        }

        // 2. Uploader directement depuis le client vers Supabase Storage
        const supabase = createBrowserSupabaseClient();

        const { error: uploadError } = await supabase.storage
          .from(bucketInfo.bucketName)
          .upload(bucketInfo.path, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Erreur lors de l'upload: ${uploadError.message}`);
        }

        // 3. Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from(bucketInfo.bucketName)
          .getPublicUrl(bucketInfo.path);

        onImageUploaded(urlData.publicUrl);
      } else {
        // Upload classique pour les petits fichiers
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', uploadType);
        formData.append('courseId', courseId);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Erreur lors de l\'upload');
        }

        // Appeler le callback avec l'URL de l'image
        onImageUploaded(data.url);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload de l\'image');
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Aperçu de l'image */}
      {preview && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
          <Image
            src={preview}
            alt="Aperçu de l'image du cours"
            fill
            className="object-cover"
          />
          {!uploading && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Zone d'upload */}
      {!preview && (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            uploading
              ? 'border-blue-400 bg-blue-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Cliquez pour téléverser une image
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, GIF ou WebP (max 5 MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bouton de changement d'image si une image existe déjà */}
      {preview && !uploading && (
        <button
          onClick={() => fileInputRef.current?.click()}
          type="button"
          className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <ImageIcon className="w-4 h-4 inline mr-2" />
          Changer l'image
        </button>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Message de succès */}
      {uploading === false && preview && !error && (
        <div className="flex items-center text-sm text-green-600">
          <CheckCircle className="w-4 h-4 mr-2" />
          Image téléversée avec succès
        </div>
      )}
    </div>
  );
}

