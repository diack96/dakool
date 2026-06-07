'use client';

import { useState, useRef } from 'react';
import { Upload, X, File, Video, FileText, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete: (_fileUrl: string, _fileInfo: { fileName: string; fileSize: number; contentType: string; mimeType: string }) => void;
  accept?: string;
  maxSize?: number; // en MB
  courseId?: string;
  fileType?: 'lesson' | 'course' | 'thumbnail';
  label?: string;
  currentFile?: string;
  onRemove?: () => void;
  urlOnly?: boolean; // Afficher uniquement le champ URL (pour YouTube, etc.)
}

export default function FileUpload ({
  onUploadComplete,
  accept = 'video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*',
  maxSize = 500,
  courseId = 'general',
  fileType = 'lesson',
  label = 'Téléverser un fichier',
  currentFile,
  onRemove,
  urlOnly = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  // Détecter si currentFile est une URL externe
  const isExternalUrl = currentFile && (currentFile.startsWith('http://') || currentFile.startsWith('https://'));

  const [uploadedFile, setUploadedFile] = useState<{ url: string; fileName: string; contentType: string } | null>(
    currentFile ? {
      url: currentFile,
      fileName: isExternalUrl
        ? (currentFile.includes('youtube.com') || currentFile.includes('youtu.be') ? 'Video YouTube' : currentFile.split('/').pop()?.split('?')[0] || 'URL externe')
        : currentFile.split('/').pop() || '',
      contentType: isExternalUrl
        ? (currentFile.includes('youtube.com') || currentFile.includes('youtu.be') || currentFile.match(/\.(mp4|webm|ogg|mov|avi)$/i))
          ? 'video'
          : currentFile.match(/\.(pdf|doc|docx)$/i) ? 'document' : currentFile.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'file'
        : 'file',
    } : null,
  );
  const [useUrl, setUseUrl] = useState(urlOnly || isExternalUrl || false);
  const [urlInput, setUrlInput] = useState(currentFile && isExternalUrl ? currentFile : '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille côté client avant tout
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Le fichier est trop volumineux. Taille maximale: ${maxSize} MB`);
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      // Étape 1 : Obtenir une URL signée Supabase pour upload direct
      // Cette approche contourne la limite 4.5MB de Vercel — le fichier va
      // directement du navigateur vers Supabase Storage sans passer par l'API
      const signedRes = await fetch('/api/admin/upload/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType,
          fileSize: file.size,
          mimeType: file.type,
          courseId,
        }),
      });

      if (!signedRes.ok) {
        const errData = await signedRes.json().catch(() => ({}));
        setError(errData.error || 'Impossible de préparer l\'upload');
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      const { signedUrl, publicUrl, bucketName, path: filePath } = await signedRes.json();

      // Étape 2 : Upload direct vers Supabase Storage via XHR (pour suivre la progression)
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      });

      xhr.addEventListener('load', () => {
        setUploading(false);
        setUploadProgress(0);

        if (xhr.status === 200) {
          // Détecter le type de contenu depuis le MIME type
          let contentType = 'file';
          if (file.type.startsWith('video/')) contentType = 'video';
          else if (file.type.startsWith('image/')) contentType = 'image';
          else if (file.type === 'application/pdf' || file.type.includes('word')) contentType = 'document';

          setUploadedFile({ url: publicUrl, fileName: file.name, contentType });
          onUploadComplete(publicUrl, {
            fileName: file.name,
            fileSize: file.size,
            contentType,
            mimeType: file.type,
          });
          setError('');
        } else {
          setError(`Erreur ${xhr.status} lors de l'upload vers le stockage`);
          console.error('[FileUpload] Erreur Supabase Storage:', xhr.status, xhr.responseText, { bucketName, filePath });
        }
      });

      xhr.addEventListener('error', () => {
        setError('Erreur de connexion lors de l\'upload');
        setUploading(false);
        setUploadProgress(0);
      });

      // PUT direct vers l'URL signée Supabase (pas de limite de taille Vercel)
      xhr.open('PUT', signedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setUrlInput('');
    setUseUrl(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setError('Veuillez entrer une URL');
      return;
    }

    // Valider que c'est une URL valide
    try {
      new URL(urlInput.trim());
    } catch {
      setError('URL invalide');
      return;
    }

    setError('');
    const url = urlInput.trim();

    // Détecter le type de contenu depuis l'URL
    let contentType = 'file';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      contentType = 'video';
    } else if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
      contentType = 'video';
    } else if (url.match(/\.(pdf|doc|docx)$/i)) {
      contentType = 'document';
    } else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      contentType = 'image';
    }

    setUploadedFile({
      url: url,
      fileName: url.split('/').pop()?.split('?')[0] || 'URL externe',
      contentType: contentType,
    });

    onUploadComplete(url, {
      fileName: url.split('/').pop()?.split('?')[0] || 'URL externe',
      fileSize: 0,
      contentType: contentType,
      mimeType: contentType === 'video' ? 'video/mp4' : 'application/octet-stream',
    });
  };

  const getFileIcon = (contentType: string) => {
    switch (contentType) {
    case 'video':
      return <Video className="w-5 h-5" />;
    case 'document':
      return <FileText className="w-5 h-5" />;
    case 'image':
      return <ImageIcon className="w-5 h-5" />;
    default:
      return <File className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {uploadedFile ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getFileIcon(uploadedFile.contentType)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{uploadedFile.fileName}</p>
              <p className="text-xs text-gray-500 truncate" title={uploadedFile.url}>{uploadedFile.url}</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          </div>
          <button
            onClick={handleRemove}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex-shrink-0 ml-2"
            title="Supprimer le fichier"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Toggle entre Upload et URL - masqué si urlOnly */}
          {!urlOnly && (
            <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
              <button
                onClick={() => setUseUrl(false)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  !useUrl
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Upload fichier
              </button>
              <button
                onClick={() => setUseUrl(true)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  useUrl
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                URL (YouTube, etc.)
              </button>
            </div>
          )}

          {useUrl || urlOnly ? (
            <div className="space-y-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={urlOnly ? "https://youtube.com/watch?v=..." : "https://youtube.com/watch?v=... ou URL directe"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleUrlSubmit();
                  }
                }}
                onBlur={() => {
                  // Auto-soumettre si l'URL est valide et complète
                  if (urlInput.trim() && (urlInput.includes('youtube.com') || urlInput.includes('youtu.be'))) {
                    handleUrlSubmit();
                  }
                }}
              />
              {!urlOnly && (
                <button
                  onClick={handleUrlSubmit}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Utiliser cette URL
                </button>
              )}
              <p className="text-xs text-gray-500">
                {urlOnly
                  ? "Collez le lien YouTube de votre video (ex: https://youtube.com/watch?v=...)"
                  : "Formats supportes: YouTube ou URL directe vers un fichier video"}
              </p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <div className="text-center">
                {uploading ? (
                  <div className="space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Téléversement en cours... {Math.round(uploadProgress)}%
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <label
                      htmlFor={`file-upload-${fileType}`}
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir un fichier
                    </label>
                    <input
                      id={`file-upload-${fileType}`}
                      ref={fileInputRef}
                      type="file"
                      accept={accept}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Formats acceptés: Vidéos (MP4, WebM), Documents (PDF, DOC, DOCX), Images (JPG, PNG, GIF)
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Taille maximale: {maxSize} MB
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}

