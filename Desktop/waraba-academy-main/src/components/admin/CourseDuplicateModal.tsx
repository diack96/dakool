'use client';

import { useState } from 'react';
import { Copy, X, Loader2 } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

interface CourseDuplicateModalProps {
  isOpen: boolean;
  course: {
    id: string;
    title: string;
    description: string;
    category_id: string;
    instructor_id: string;
    price: number;
    level: string;
    image_url?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function CourseDuplicateModal({
  isOpen,
  course,
  onClose,
  onSuccess,
}: CourseDuplicateModalProps) {
  const { success, error: showError } = useToast();
  const [newTitle, setNewTitle] = useState(`${course.title} (Copie)`);
  const [duplicating, setDuplicating] = useState(false);

  if (!isOpen) return null;

  const handleDuplicate = async () => {
    if (!newTitle.trim()) {
      showError('Le titre est requis');
      return;
    }

    setDuplicating(true);
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newTitle.trim(),
          description: course.description,
          category_id: course.category_id,
          instructor_id: course.instructor_id,
          price: course.price,
          level: course.level,
          image_url: course.image_url || null,
          is_published: false, // Toujours en brouillon par défaut
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la duplication');
      }

      await response.json();
      success('Cours dupliqué avec succès !');
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la duplication du cours');
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Copy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Dupliquer le cours</h2>
              <p className="text-sm text-gray-600">Créer une copie de "{course.title}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Titre du cours dupliqué"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Le cours sera créé en brouillon. Vous pourrez ensuite le modifier et le publier.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Ce qui sera copié :</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Description et informations de base</li>
              <li>Catégorie et niveau</li>
              <li>Image de couverture</li>
              <li>Prix</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              <strong>Note :</strong> Les modules et leçons ne seront pas copiés. Vous devrez les ajouter manuellement.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={duplicating}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleDuplicate}
            disabled={duplicating || !newTitle.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            {duplicating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Duplication...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Dupliquer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

