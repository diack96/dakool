'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  ArrowLeft,
  Upload,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import AdminGuard from '@/components/admin/AdminGuard';
import { useToast } from '@/components/admin/Toast';
import { CategoryFormData } from '@/types';

export default function NewCategoryPage () {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    slug: '',
    imageUrl: '',
    color: '#3B82F6',
    isActive: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Générer automatiquement le slug à partir du nom
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        slug,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          slug: formData.slug,
          color: formData.color,
          isActive: formData.isActive,
        }),
      });

      if (response.ok) {
        await response.json();
        success('Catégorie créée avec succès');
        router.push('/admin/categories');
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Erreur lors de la création de la catégorie');
      }
    } catch (err) {
      error('Erreur lors de la création de la catégorie');
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Nouvelle Catégorie</h1>
                  <p className="text-gray-600 mt-1">Créez une nouvelle catégorie de cours</p>
                </div>
              </div>
              <button
                type="submit"
                form="category-form"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Créer la catégorie
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8">
            <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Informations de base */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de base</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la catégorie *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Développement Web"
                    />
                  </div>

                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                    </label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="developpement-web"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                    URL-friendly version du nom
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez cette catégorie de cours..."
                />
              </div>

              {/* Apparence */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Apparence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur de la catégorie
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex space-x-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                            className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Image de la catégorie
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="URL de l'image"
                      />
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statut */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                  Catégorie active
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                Les catégories inactives ne seront pas visibles sur le site public
                </p>
              </div>

              {/* Aperçu */}
              {formData.name && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu</h3>
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: formData.color }}
                      >
                        <span className="text-white font-bold text-lg">
                          {formData.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{formData.name}</h4>
                        {formData.description && (
                          <p className="text-sm text-gray-600">{formData.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}
