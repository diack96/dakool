'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Layers, Plus, Edit, Trash2, Eye, EyeOff, Search,
  BookOpen, Star, ChevronLeft, ChevronRight,
} from 'lucide-react';

interface AdminPath {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  level: string;
  is_featured: boolean;
  courses_count: number;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  published: { label: 'Publié', classes: 'bg-green-100 text-green-700' },
  draft: { label: 'Brouillon', classes: 'bg-yellow-100 text-yellow-700' },
  archived: { label: 'Archivé', classes: 'bg-gray-100 text-gray-500' },
};

const LEVEL_LABELS: Record<string, string> = {
  all: 'Tous niveaux', beginner: 'Débutant',
  intermediate: 'Intermédiaire', advanced: 'Avancé',
};

export default function AdminLearningPathsPage() {
  const [paths, setPaths] = useState<AdminPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPaths = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/learning-paths?${params}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setPaths(data.paths || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchPaths(); }, [fetchPaths]);

  const handleToggleStatus = async (path: AdminPath) => {
    const newStatus = path.status === 'published' ? 'draft' : 'published';
    await fetch(`/api/admin/learning-paths/${path.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchPaths();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce parcours ? Les cours ne seront pas supprimés.')) return;
    setDeleting(id);
    await fetch(`/api/admin/learning-paths/${id}`, { method: 'DELETE' });
    setDeleting(null);
    fetchPaths();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-teal-600" />
            Parcours d'apprentissage
          </h1>
          <p className="text-gray-500 text-sm mt-1">{total} parcours au total</p>
        </div>
        <Link
          href="/admin/learning-paths/new"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouveau parcours
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un parcours..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="published">Publiés</option>
          <option value="draft">Brouillons</option>
          <option value="archived">Archivés</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Chargement...</div>
        ) : paths.length === 0 ? (
          <div className="p-16 text-center">
            <Layers className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Aucun parcours trouvé</p>
            <Link
              href="/admin/learning-paths/new"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer le premier parcours
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Titre</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Niveau</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Cours</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Statut</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paths.map((path) => {
                  const statusInfo = STATUS_LABELS[path.status] ?? { label: path.status, classes: 'bg-gray-100 text-gray-500' };
                  return (
                    <tr key={path.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{path.title}</span>
                          {path.is_featured && (
                            <Star className="w-3.5 h-3.5 text-brand-orange-500 fill-brand-orange-500 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{path.slug}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                        {LEVEL_LABELS[path.level] || path.level}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-center">
                        <span className="inline-flex items-center gap-1 text-gray-600">
                          <BookOpen className="w-3.5 h-3.5" />
                          {path.courses_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.classes}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/parcours/${path.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/learning-paths/${path.id}`}
                            className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(path)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              path.status === 'published'
                                ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={path.status === 'published' ? 'Dépublier' : 'Publier'}
                          >
                            {path.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(path.id)}
                            disabled={deleting === path.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
