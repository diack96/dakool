'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/admin/Toast';
import AdminGuard from '@/components/admin/AdminGuard';
import { useAuth } from '@/contexts/AuthContext';
import CourseCreationWizard from '@/components/admin/CourseCreationWizard';

export default function NewCoursePage() {
  const router = useRouter();
  const { error: showError } = useToast();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Charger les catégories et instructeurs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await fetch('/api/admin/categories', { credentials: 'include' });

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          let categoriesList: Array<{ id: string; name: string }> = [];
          
          if (Array.isArray(categoriesData)) {
            categoriesList = categoriesData.map((cat: any) => ({ id: cat.id, name: cat.name }));
          } else if (categoriesData.categories && Array.isArray(categoriesData.categories)) {
            categoriesList = categoriesData.categories.map((cat: any) => ({ id: cat.id, name: cat.name }));
          }
          
          if (categoriesList.length === 0) {
            console.warn('⚠️ Aucune catégorie trouvée');
            showError('Aucune catégorie disponible. Veuillez créer une catégorie avant de créer un cours.');
          }
          
          setCategories(categoriesList);
        } else {
          const errorData = await categoriesRes.json().catch(() => ({}));
          console.error('❌ Erreur lors du chargement des catégories:', {
            status: categoriesRes.status,
            error: errorData,
          });
          showError(errorData.error || 'Erreur lors du chargement des catégories');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showError]);

  if (!user?.id) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux cours
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau cours</h1>
          <p className="text-gray-500 mt-1">
            Remplissez les informations puis ajoutez vos leçons
          </p>
        </div>
                  
        {/* Wizard */}
        {loading ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement des données...</p>
              </div>
            </div>
        ) : categories.length === 0 ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucune catégorie disponible</h2>
              <p className="text-gray-600 mb-6">
                Vous devez créer au moins une catégorie avant de pouvoir créer un cours.
              </p>
              <Link
                href="/admin/categories/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
              >
                Créer une catégorie
              </Link>
            </div>
          </div>
        ) : (
          <CourseCreationWizard
            categories={categories}
            userId={user.id}
            onComplete={(courseId) => {
              router.push(`/admin/courses/${courseId}/edit`);
            }}
          />
        )}
      </div>
    </AdminGuard>
  );
}
