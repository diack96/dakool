'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Layers, ArrowLeft, Save, Plus, Trash2, GripVertical,
  Search, BookOpen, Star,
} from 'lucide-react';
import type { LearningPathFormData, LearningPathCourse } from '@/types/learning-path';

interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  level: string;
  status: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function LearningPathForm({ pathId }: { pathId?: string }) {
  const router = useRouter();
  const isEdit = !!pathId;

  const [form, setForm] = useState<LearningPathFormData>({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    thumbnail: '',
    level: 'all',
    status: 'draft',
    is_featured: false,
  });
  const [pathCourses, setPathCourses] = useState<LearningPathCourse[]>([]);
  const [allCourses, setAllCourses] = useState<AdminCourse[]>([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [slugManual, setSlugManual] = useState(false);

  // Charger le parcours existant
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    fetch(`/api/admin/learning-paths/${pathId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const p = data.path;
          setForm({
            title: p.title,
            slug: p.slug,
            description: p.description || '',
            short_description: p.short_description || '',
            thumbnail: p.thumbnail || '',
            level: p.level,
            status: p.status,
            is_featured: p.is_featured,
          });
          setPathCourses(p.courses || []);
          setSlugManual(true);
        }
      })
      .finally(() => setLoading(false));
  }, [pathId, isEdit]);

  // Charger tous les cours publiés
  useEffect(() => {
    fetch('/api/admin/courses?limit=100&status=published', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.success) setAllCourses(data.courses || []);
      });
  }, []);

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: slugManual ? f.slug : slugify(title) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = isEdit ? `/api/admin/learning-paths/${pathId}` : '/api/admin/learning-paths';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Erreur lors de la sauvegarde');
        return;
      }
      router.push('/admin/learning-paths');
    } finally {
      setSaving(false);
    }
  };

  const addCourse = async (course: AdminCourse) => {
    if (!isEdit) {
      setError('Sauvegardez d\'abord le parcours avant d\'ajouter des cours.');
      return;
    }
    if (pathCourses.find(lpc => lpc.course_id === course.id)) return;

    const nextOrder = pathCourses.length;
    const res = await fetch(`/api/admin/learning-paths/${pathId}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: course.id, course_order: nextOrder }),
    });
    const data = await res.json();
    if (data.success) {
      setPathCourses(prev => [...prev, {
        ...data.data,
        course: { id: course.id, title: course.title, slug: course.slug, level: course.level } as any,
      }]);
    }
  };

  const removeCourse = async (courseId: string) => {
    if (!isEdit) return;
    await fetch(`/api/admin/learning-paths/${pathId}/courses?courseId=${courseId}`, { method: 'DELETE' });
    setPathCourses(prev => prev.filter(lpc => lpc.course_id !== courseId));
  };

  const filteredCourses = allCourses.filter(c =>
    !pathCourses.find(lpc => lpc.course_id === c.id) &&
    c.title.toLowerCase().includes(courseSearch.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/learning-paths"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-teal-600" />
            {isEdit ? 'Modifier le parcours' : 'Nouveau parcours'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit ? 'Modifiez les informations et gérez les cours' : 'Créez un nouveau parcours d\'apprentissage'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Informations générales</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Ex: Devenez développeur web en 3 mois"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={e => { setSlugManual(true); setForm(f => ({ ...f, slug: e.target.value })); }}
                placeholder="developpeur-web"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">/parcours/{form.slug || '...'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
              <select
                value={form.level}
                onChange={e => setForm(f => ({ ...f, level: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="all">Tous niveaux</option>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description courte</label>
              <input
                type="text"
                value={form.short_description}
                onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
                maxLength={500}
                placeholder="Résumé en une phrase (affiché sur les cartes)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description complète</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                placeholder="Décrivez les objectifs, le public cible, ce que l'étudiant apprendra..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de la miniature</label>
              <input
                type="url"
                value={form.thumbnail}
                onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Star className="w-4 h-4 text-brand-orange-500" />
                  Parcours recommandé (mis en avant)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Bouton sauvegarder */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-60 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer les modifications' : 'Créer le parcours'}
          </button>
        </div>
      </form>

      {/* Gestion des cours — seulement en mode édition */}
      {isEdit && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            Cours du parcours
            <span className="ml-auto text-sm font-normal text-gray-500">{pathCourses.length} cours</span>
          </h2>

          {/* Cours déjà dans le parcours */}
          {pathCourses.length > 0 && (
            <div className="space-y-2">
              {pathCourses.map((lpc, index) => (
                <div
                  key={lpc.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-2 text-gray-400">
                    <GripVertical className="w-4 h-4" />
                    <span className="text-sm font-bold w-5 text-center text-gray-500">{index + 1}</span>
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-800">
                    {lpc.course?.title || lpc.course_id}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCourse(lpc.course_id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Retirer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recherche de cours à ajouter */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Ajouter un cours</p>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher parmi les cours publiés..."
                value={courseSearch}
                onChange={e => setCourseSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredCourses.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  {courseSearch ? 'Aucun cours trouvé' : 'Tous les cours publiés sont déjà dans ce parcours'}
                </p>
              ) : (
                filteredCourses.slice(0, 20).map(course => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => addCourse(course)}
                    className="w-full flex items-center justify-between p-2.5 text-sm text-left rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors group"
                  >
                    <span className="font-medium text-gray-700 group-hover:text-teal-700">{course.title}</span>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-teal-600 flex-shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {!isEdit && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-700">
          💡 Après avoir créé le parcours, vous pourrez y ajouter des cours depuis la page de modification.
        </div>
      )}
    </div>
  );
}
