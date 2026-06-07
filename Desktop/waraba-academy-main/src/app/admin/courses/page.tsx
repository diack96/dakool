'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Plus,
  BookOpen,
  Users,
  DollarSign,
  Archive,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  Copy,
  EyeOff,
  Send,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import AdminGuard from '@/components/admin/AdminGuard';
import { useToast } from '@/components/admin/Toast';
import ConfirmModal from '@/components/admin/ConfirmModal';
import CourseDuplicateModal from '@/components/admin/CourseDuplicateModal';
import ExportButton from '@/components/admin/ExportButton';
import StatusBadge from '@/components/admin/StatusBadge';
import Pagination from '@/components/admin/Pagination';
import EmptyState from '@/components/admin/EmptyState';
import TableSkeleton from '@/components/admin/TableSkeleton';
import { AdminCourse } from '@/types';

type SortField = 'title' | 'status' | 'enrollments' | 'price' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 20;

export default function CoursesPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; courseId: string | null; title?: string }>({
    isOpen: false,
    courseId: null,
  });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [duplicateModal, setDuplicateModal] = useState<{
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
    } | null;
  }>({
    isOpen: false,
    course: null,
  });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (levelFilter !== 'all') params.set('level', levelFilter);
      if (searchTerm) params.set('search', searchTerm);

      const response = await fetch(`/api/admin/courses?${params}`, {
        cache: 'no-store',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCourses(data.courses || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      } else {
        error(data.error || data.message || 'Erreur lors du chargement des cours');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des cours';
      error(message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, levelFilter, searchTerm, error]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDelete = (courseId: string, title: string) => {
    setDeleteModal({ isOpen: true, courseId, title });
  };

  const confirmDelete = async () => {
    if (!deleteModal.courseId) return;

    try {
      const response = await fetch(`/api/admin/courses/${deleteModal.courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCourses();
        success('Cours supprimé avec succès');
        setSelectedCourses(prev => {
          const next = new Set(prev);
          next.delete(deleteModal.courseId!);
          return next;
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        error(errorData.error || 'Erreur lors de la suppression du cours');
      }
    } catch {
      error('Erreur lors de la suppression du cours');
    } finally {
      setDeleteModal({ isOpen: false, courseId: null });
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedCourses.size === 0) return;

    try {
      const deletePromises = Array.from(selectedCourses).map(id =>
        fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      await fetchCourses();
      success(`${selectedCourses.size} cours supprimés avec succès`);
      setSelectedCourses(new Set());
    } catch {
      error('Erreur lors de la suppression des cours');
    } finally {
      setBulkDeleteModal(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: 'published' | 'draft' | 'archived') => {
    if (selectedCourses.size === 0) return;

    try {
      const updatePromises = Array.from(selectedCourses).map(id =>
        fetch(`/api/admin/courses/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      );

      await Promise.all(updatePromises);
      await fetchCourses();
      success(`${selectedCourses.size} cours mis à jour avec succès`);
      setSelectedCourses(new Set());
    } catch {
      error('Erreur lors de la mise à jour des cours');
    }
  };

  const handleToggleStatus = async (courseId: string, currentStatus: string, forcedStatus?: string) => {
    const newStatus = forcedStatus ?? (currentStatus === 'published' ? 'draft' : 'published');

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchCourses();
        success(`Statut du cours mis à jour: ${newStatus === 'published' ? 'publié' : 'brouillon'}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        error(errorData.error || 'Erreur lors de la mise à jour du statut');
      }
    } catch {
      error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'enrollments':
        comparison = (a.enrollmentCount || 0) - (b.enrollmentCount || 0);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [courses, sortField, sortOrder]);

  const handleSelectAll = () => {
    if (selectedCourses.size === filteredCourses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(filteredCourses.map(c => c.id)));
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" aria-hidden="true" />;
    }
    return sortOrder === 'asc'
      ? <ArrowUp className="w-4 h-4 text-blue-600" aria-hidden="true" />
      : <ArrowDown className="w-4 h-4 text-blue-600" aria-hidden="true" />;
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Gestion des Cours</h1>
            <p className="text-gray-600">
              {total} cours trouvé{total !== 1 ? 's' : ''}
              {` — Page ${page} / ${totalPages}`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/courses/new')}
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              <Plus className="mr-2 w-5 h-5" aria-hidden="true" />
              Nouveau cours
            </button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="course-search" className="block text-sm font-semibold text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
                <input
                  id="course-search"
                  type="text"
                  placeholder="Rechercher un cours..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="status-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                Statut
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="published">Publié</option>
                <option value="draft">Brouillon</option>
                <option value="archived">Archivé</option>
              </select>
            </div>

            <div>
              <label htmlFor="level-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                Niveau
              </label>
              <select
                id="level-filter"
                value={levelFilter}
                onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="all">Tous les niveaux</option>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <ExportButton
                data={filteredCourses}
                filename="cours"
                fields={[
                  { key: 'title', label: 'Titre' },
                  { key: 'category', label: 'Catégorie', transform: (c: { name?: string } | undefined) => c?.name || 'Non assignée' },
                  { key: 'status', label: 'Statut' },
                  { key: 'enrollmentCount', label: 'Inscriptions' },
                  { key: 'price', label: 'Prix (FCFA)' },
                  { key: 'level', label: 'Niveau' },
                  { key: 'createdAt', label: 'Date de création', transform: (d: string) => new Date(d).toLocaleDateString('fr-FR') },
                ]}
                label="Exporter CSV"
                variant="outline"
              />
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setLevelFilter('all');
                  setPage(1);
                }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedCourses.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {selectedCourses.size} cours sélectionné{selectedCourses.size > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => handleBulkStatusChange('published')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Publier
              </button>
              <button
                onClick={() => handleBulkStatusChange('draft')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                Brouillon
              </button>
              <button
                onClick={() => handleBulkStatusChange('archived')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Archiver
              </button>
              <button
                onClick={() => setBulkDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Supprimer définitivement
              </button>
              <button
                onClick={() => setSelectedCourses(new Set())}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Annuler
              </button>
            </div>
          )}
        </Card>

        {/* Table */}
        <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} columns={8} />
          ) : filteredCourses.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-8 h-8 text-gray-400" />}
              title="Aucun cours trouvé"
              description={
                searchTerm || statusFilter !== 'all' || levelFilter !== 'all'
                  ? 'Aucun cours ne correspond à vos critères de recherche.'
                  : 'Aucun cours n\'a encore été créé. Commencez par créer votre premier cours !'
              }
              action={{
                label: 'Créer le premier cours',
                onClick: () => router.push('/admin/courses/new'),
              }}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={handleSelectAll}
                          aria-label={selectedCourses.size === filteredCourses.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                        >
                          {selectedCourses.size === filteredCourses.length && filteredCourses.length > 0 ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" aria-hidden="true" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" aria-hidden="true" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('title')}
                          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                          aria-label="Trier par titre"
                        >
                          Titre
                          <SortIcon field="title" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                          aria-label="Trier par statut"
                        >
                          Statut
                          <SortIcon field="status" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('enrollments')}
                          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                          aria-label="Trier par inscriptions"
                        >
                          Inscriptions
                          <SortIcon field="enrollments" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('price')}
                          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                          aria-label="Trier par prix"
                        >
                          Prix
                          <SortIcon field="price" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Niveau
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCourses.map((course) => (
                      <tr
                        key={course.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          selectedCourses.has(course.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleSelectCourse(course.id)}
                            aria-label={`Sélectionner ${course.title}`}
                          >
                            {selectedCourses.has(course.id) ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" aria-hidden="true" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" aria-hidden="true" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{course.title}</div>
                          <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                            {course.description}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {course.category?.name || 'Non assignée'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <StatusBadge status={course.status} />
                            {course.isComingSoon && (
                              <StatusBadge status="pending" label="Bientôt" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" aria-hidden="true" />
                            <span className="text-sm font-semibold text-gray-900">
                              {course.enrollmentCount || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" aria-hidden="true" />
                            <span className="text-sm font-semibold text-gray-900">
                              {course.price.toLocaleString()} FCFA
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={course.level} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => router.push(`/admin/courses/${course.id}/preview`)}
                              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              aria-label={`Prévisualiser le cours ${course.title}`}
                              title="Prévisualiser"
                            >
                              <Eye className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => router.push(`/admin/courses/${course.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              aria-label={`Voir le détail du cours ${course.title}`}
                              title="Détail"
                            >
                              <BookOpen className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              aria-label={`Modifier le cours ${course.title}`}
                            >
                              <Edit className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => setDuplicateModal({
                                isOpen: true,
                                course: {
                                  id: course.id,
                                  title: course.title,
                                  description: course.description || '',
                                  category_id: course.category?.id || course.categoryId || '',
                                  instructor_id: course.instructor?.id || course.instructorId || '',
                                  price: course.price,
                                  level: course.level,
                                  image_url: course.thumbnail || undefined,
                                },
                              })}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              aria-label={`Dupliquer le cours ${course.title}`}
                            >
                              <Copy className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(course.id, course.status)}
                              className={`p-2 rounded-lg transition-colors ${
                                course.status === 'published'
                                  ? 'text-gray-600 hover:bg-gray-100'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              aria-label={course.status === 'published' ? `Dépublier ${course.title}` : `Publier ${course.title}`}
                            >
                              {course.status === 'published' ? (
                                <EyeOff className="w-4 h-4" aria-hidden="true" />
                              ) : (
                                <Send className="w-4 h-4" aria-hidden="true" />
                              )}
                            </button>
                            {course.status !== 'archived' && (
                              <button
                                onClick={() => handleToggleStatus(course.id, course.status, 'archived')}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label={`Archiver le cours ${course.title}`}
                                title="Archiver"
                              >
                                <Archive className="w-4 h-4" aria-hidden="true" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(course.id, course.title)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label={`Supprimer définitivement le cours ${course.title}`}
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                onPageChange={setPage}
                label="cours"
                pageSize={pageSize}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              />
            </>
          )}
        </Card>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Supprimer le cours"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteModal.title || 'ce cours'}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, courseId: null })}
      />

      <ConfirmModal
        isOpen={bulkDeleteModal}
        title="Supprimer les cours sélectionnés"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedCourses.size} cours ? Cette action est irréversible.`}
        confirmText="Supprimer tout"
        cancelText="Annuler"
        variant="danger"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteModal(false)}
      />

      {duplicateModal.course && (
        <CourseDuplicateModal
          isOpen={duplicateModal.isOpen}
          course={duplicateModal.course}
          onClose={() => setDuplicateModal({ isOpen: false, course: null })}
          onSuccess={fetchCourses}
        />
      )}
    </AdminGuard>
  );
}
