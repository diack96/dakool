'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  X,
  Plus,
  Trash2,
  FileText,
  Video,
  Image as ImageIcon,
  Link,
} from 'lucide-react';

interface ContentFormData {
  title: string;
  description: string;
  type: 'text' | 'video' | 'image' | 'link';
  content: string;
  metadata?: Record<string, string>;
}

interface ContentFormProps {
  initialData?: Partial<ContentFormData>;
  onSubmit: (_data: ContentFormData) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

export default function ContentForm ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: ContentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    description: '',
    type: 'text',
    content: '',
    metadata: {},
    ...initialData,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof ContentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleMetadataChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [key]: value,
      },
    }));
  };

  const addMetadataField = () => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [`field_${Object.keys(prev.metadata || {}).length}`]: '',
      },
    }));
  };

  const removeMetadataField = (key: string) => {
    setFormData(prev => {
      const newMetadata = { ...prev.metadata };
      delete newMetadata[key];
      return {
        ...prev,
        metadata: newMetadata,
      };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Le contenu est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      router.push('/admin/content');
    } catch {
      // Gestion silencieuse des erreurs
      setErrors({
        submit: 'Une erreur est survenue lors de la sauvegarde',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContentIcon = () => {
    switch (formData.type) {
    case 'video':
      return <Video className="w-5 h-5" />;
    case 'image':
      return <ImageIcon className="w-5 h-5" />;
    case 'link':
      return <Link className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getContentIcon()}
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Modifier le contenu' : 'Créer un nouveau contenu'}
            </h2>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Type de contenu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de contenu
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="text">Texte</option>
            <option value="video">Vidéo</option>
            <option value="image">Image</option>
            <option value="link">Lien</option>
          </select>
        </div>

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Entrez le titre du contenu"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Entrez une description du contenu"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Contenu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenu *
          </label>
          {formData.type === 'text' ? (
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={8}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.content ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Entrez le contenu principal"
            />
          ) : (
            <input
              type="text"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.content ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={
                formData.type === 'video'
                  ? 'URL de la video (YouTube, etc.)'
                  : formData.type === 'image'
                    ? 'URL de l\'image'
                    : 'URL du lien'
              }
            />
          )}
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        {/* Métadonnées */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Métadonnées
            </label>
            <button
              type="button"
              onClick={addMetadataField}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(formData.metadata || {}).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    const newMetadata = { ...formData.metadata };
                    delete newMetadata[key];
                    newMetadata[e.target.value] = value;
                    setFormData(prev => ({
                      ...prev,
                      metadata: newMetadata,
                    }));
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Clé"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleMetadataChange(key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Valeur"
                />
                <button
                  type="button"
                  onClick={() => removeMetadataField(key)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Erreur de soumission */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
