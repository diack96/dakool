'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FolderOpen,
  Search,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import AdminGuard from '@/components/admin/AdminGuard';
import { useToast } from '@/components/admin/Toast';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Category } from '@/types';

export default function CategoriesPage () {
  const { success, error } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; categoryId: string | null }>({
    isOpen: false,
    categoryId: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          error('Erreur lors de la récupération des catégories');
        }
      } catch (err) {
        error('Erreur lors de la récupération des catégories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && category.isActive) ||
                         (filterStatus === 'inactive' && !category.isActive);

    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (categoryId: string) => {
    setDeleteModal({ isOpen: true, categoryId });
  };

  const confirmDelete = async () => {
    if (!deleteModal.categoryId) return;

    try {
      const response = await fetch(`/api/admin/categories/${deleteModal.categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== deleteModal.categoryId));
        success('Catégorie supprimée avec succès');
      } else {
        error('Erreur lors de la suppression de la catégorie');
      }
    } catch (err) {
      error('Erreur lors de la suppression de la catégorie');
    } finally {
      setDeleteModal({ isOpen: false, categoryId: null });
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    try {
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) return;

      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !category.isActive,
        }),
      });

      if (response.ok) {
        setCategories(categories.map(cat =>
          cat.id === categoryId
            ? { ...cat, isActive: !cat.isActive }
            : cat,
        ));
        success('Statut de la catégorie mis à jour');
      } else {
        error('Erreur lors de la mise à jour du statut');
      }
    } catch (err) {
      error('Erreur lors de la mise à jour du statut');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Catégories</h1>
                <p className="text-gray-600 mt-1">Gérez les catégories de cours</p>
              </div>
              <Link
                href="/admin/categories/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
              Nouvelle catégorie
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filtres et recherche */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher une catégorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des catégories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <FolderOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.courseCount} cours</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(category.id)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.isActive ? 'Actif' : 'Inactif'}
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Link
                    href={`/admin/categories/${category.id}/courses`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                  Voir les cours →
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune catégorie trouvée</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all'
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Commencez par créer votre première catégorie'
                }
              </p>
              <Link
                href="/admin/categories/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
              Créer une catégorie
              </Link>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Supprimer la catégorie"
        message="Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, categoryId: null })}
      />
    </AdminGuard>
  );
}
