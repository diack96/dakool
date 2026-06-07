'use client';

import { useEffect, useState, useCallback, use, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Save,
  ArrowLeft,
  Loader2,
  BookOpen,
  ImageIcon,
  Settings,
  Eye,
  Clock,
  Users,
  ExternalLink,
  Check,
  AlertCircle,
  Plus,
  X,
  HelpCircle,
  Trash2,
  Edit3,
  Paperclip,
  Link2,
  Upload,
  FileText,
} from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase-helpers';
import AdminGuard from '@/components/admin/AdminGuard';
import { useToast } from '@/components/admin/Toast';
import CourseImageUpload from '@/components/admin/CourseImageUpload';
import ModuleQuizEditor from '@/components/admin/ModuleQuizEditor';

type TabId = 'essential' | 'media' | 'advanced' | 'quiz' | 'resources';

interface Category {
  id: string;
  name: string;
}

interface QuizSummary {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimit: number | null;
  questionCount: number;
}

interface CourseResource {
  id: string;
  title: string;
  type: 'file' | 'link';
  url: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  order: number;
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'essential',  label: 'Essentiel',  icon: BookOpen },
  { id: 'media',      label: 'Médias',     icon: ImageIcon },
  { id: 'advanced',   label: 'Avancé',     icon: Settings },
  { id: 'quiz',       label: 'Quiz',       icon: HelpCircle },
  { id: 'resources',  label: 'Ressources', icon: Paperclip },
];

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function AdminCourseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('essential');

  // Essential fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // Media fields
  const [thumbnail, setThumbnail] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Advanced fields
  const [instructorName, setInstructorName] = useState('');
  const [instructorBio, setInstructorBio] = useState('');
  const [instructorAvatar, setInstructorAvatar] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [certificate, setCertificate] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [displayStudentsCount, setDisplayStudentsCount] = useState<number | null>(null);

  // Quiz state
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [editingQuizData, setEditingQuizData] = useState<any>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);

  // Resources state
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);
  const [resourceMode, setResourceMode] = useState<'link' | 'file'>('link');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [addingResource, setAddingResource] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const resourceFileRef = useRef<HTMLInputElement>(null);

  // Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessonsCount, setLessonsCount] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);

  // Load categories
  useEffect(() => {
    fetch('/api/admin/categories', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const cats = Array.isArray(data) ? data : data.categories || [];
        setCategories(cats.map((c: any) => ({ id: c.id, name: c.name })));
      })
      .catch(() => {});
  }, []);

  // Load course
  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/courses/${id}`, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Cours non trouvé');

        const { course } = await res.json();

        setTitle(course.title || '');
        setDescription(course.description || '');
        setCategoryId(course.categoryId || '');
        setLevel(course.level || 'beginner');
        setPrice(Number(course.price) || 0);
        setStatus(course.status === 'published' ? 'published' : 'draft');
        setThumbnail(course.thumbnail || '');
        setVideoUrl(course.videoUrl || '');
        setInstructorName(course.instructorName || course.instructor?.fullName || '');
        setInstructorBio(course.instructorBio || '');
        setInstructorAvatar(course.instructorAvatar || '');
        setObjectives(Array.isArray(course.objectives) ? course.objectives : []);
        setRequirements(Array.isArray(course.requirements) ? course.requirements : []);
        setCertificate(course.certificate || false);
        setIsFeatured(course.isFeatured || false);
        setIsComingSoon(course.isComingSoon || false);
        setStudentsCount(course.totalStudents || 0);
        setDisplayStudentsCount((course as any).displayStudentsCount ?? null);

        // Fetch lessons from lessons table
        try {
          const lessonsRes = await fetch(`/api/admin/lessons?course_id=${id}`, {
            credentials: 'include',
          });
          if (lessonsRes.ok) {
            const lessonsData = await lessonsRes.json();
            const lessonsList = lessonsData.lessons || [];
            setLessonsCount(lessonsList.length);
            const totalDur = lessonsList.reduce((sum: number, l: any) => sum + (l.duration || 0), 0);
            setTotalDuration(totalDur);
          }
        } catch {
          // Fallback to syllabus if lessons API fails
          let syllabus = [];
          if (course.syllabus) {
            try {
              syllabus = typeof course.syllabus === 'string' ? JSON.parse(course.syllabus) : course.syllabus;
            } catch { syllabus = []; }
          }
          let lessons = 0;
          let duration = 0;
          syllabus.forEach((m: any) => {
            const list = m.lessonList || [];
            lessons += list.length;
            list.forEach((l: any) => { duration += l.duration || 0; });
          });
          setLessonsCount(lessons);
          setTotalDuration(duration);
        }

      } catch (err: any) {
        showError(err.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id, showError]);

  // Load quizzes for this course
  const loadQuizzes = useCallback(async () => {
    setLoadingQuizzes(true);
    try {
      const res = await fetch(`/api/admin/quizzes?course_id=${id}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
      }
    } catch {
      // Silently fail - quizzes are optional
    } finally {
      setLoadingQuizzes(false);
    }
  }, [id]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  // Load resources
  const loadResources = useCallback(async () => {
    setLoadingResources(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}/resources`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingResources(false);
    }
  }, [id]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Add link resource
  const handleAddLink = async () => {
    if (!resourceTitle.trim() || !resourceUrl.trim()) {
      showError('Titre et URL requis');
      return;
    }
    setAddingResource(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: resourceTitle.trim(),
          type: 'link',
          url: resourceUrl.trim(),
          order: resources.length,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur');
      }
      const data = await res.json();
      setResources(prev => [...prev, data.resource]);
      setResourceTitle('');
      setResourceUrl('');
      success('Lien ajouté');
    } catch (err: any) {
      showError(err.message);
    } finally {
      setAddingResource(false);
    }
  };

  // Upload file resource
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !resourceTitle.trim()) {
      if (!resourceTitle.trim()) showError('Entrez un titre avant d\'uploader');
      return;
    }

    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_SIZE) {
      showError('Fichier trop volumineux (max 20 MB)');
      return;
    }

    setUploadingFile(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const filePath = `${id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const { data: upload, error: uploadError } = await supabase.storage
        .from('course-resources')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('course-resources')
        .getPublicUrl(upload.path);

      const res = await fetch(`/api/admin/courses/${id}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title:     resourceTitle.trim(),
          type:      'file',
          url:       publicUrl,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          order:     resources.length,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Erreur API');
      }

      const d = await res.json();
      setResources(prev => [...prev, d.resource]);
      setResourceTitle('');
      if (resourceFileRef.current) resourceFileRef.current.value = '';
      success('Fichier uploadé');
    } catch (err: any) {
      showError(err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  // Delete resource
  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Supprimer cette ressource ?')) return;
    setDeletingResourceId(resourceId);
    try {
      const res = await fetch(
        `/api/admin/courses/${id}/resources?resourceId=${resourceId}`,
        { method: 'DELETE', credentials: 'include' },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur de suppression');
      }
      setResources(prev => prev.filter(r => r.id !== resourceId));
      success('Ressource supprimée');
    } catch (err: any) {
      showError(err.message);
    } finally {
      setDeletingResourceId(null);
    }
  };

  // Save
  const handleSave = async () => {
    if (!title.trim()) {
      showError('Le titre est requis');
      return;
    }
    if (!description.trim()) {
      showError('La description est requise');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category_id: categoryId || undefined,
          level,
          price: Number(price) || 0,
          status,
          thumbnail: thumbnail || null,
          videoUrl: videoUrl || null,
          instructorName: instructorName.trim() || undefined,
          instructorBio: instructorBio.trim() || undefined,
          instructorAvatar: instructorAvatar || null,
          objectives: objectives.filter(Boolean),
          requirements: requirements.filter(Boolean),
          certificate,
          isFeatured,
          isComingSoon,
          displayStudentsCount: displayStudentsCount ?? null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur de sauvegarde');
      }

      success('Cours mis à jour');
    } catch (err: any) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Quiz handlers
  const handleEditQuiz = async (quizId: string) => {
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Quiz non trouvé');
      const { quiz } = await res.json();
      setEditingQuizId(quizId);
      setEditingQuizData(quiz);
      setShowQuizEditor(true);
    } catch (err: any) {
      showError(err.message || 'Erreur de chargement du quiz');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Supprimer ce quiz et toutes ses questions ?')) return;
    setDeletingQuizId(quizId);
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur de suppression');
      success('Quiz supprimé');
      await loadQuizzes();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setDeletingQuizId(null);
    }
  };

  const handleSaveQuiz = async (quizData: any) => {
    const isUpdate = !!quizData.id;
    const url = isUpdate
      ? `/api/admin/quizzes/${quizData.id}`
      : '/api/admin/quizzes';

    const res = await fetch(url, {
      method: isUpdate ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        course_id: id,
        title: quizData.title,
        description: quizData.description,
        passing_score: quizData.passingScore,
        time_limit: quizData.timeLimit || null,
        questions: quizData.questions,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Erreur de sauvegarde du quiz');
    }

    success(isUpdate ? 'Quiz mis à jour' : 'Quiz créé');
    setShowQuizEditor(false);
    setEditingQuizId(null);
    setEditingQuizData(null);
    await loadQuizzes();
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  const formatDuration = (min: number) => {
    if (!min) return '0 min';
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m} min`;
  };

  // List helpers
  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const updateItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header sticky */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/courses/${id}`}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Modifier le cours</h1>
                  <p className="text-sm text-gray-500 truncate max-w-md">{title || 'Sans titre'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/courses/${id}/lessons`}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Gérer les leçons</span>
                  <span className="sm:hidden">Leçons</span>
                </Link>

                <Link
                  href={`/courses/${id}`}
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Aperçu</span>
                </Link>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                  {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                          isActive
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="p-6">
                  {/* Essential Tab */}
                  {activeTab === 'essential' && (
                    <div className="space-y-5">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Titre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Ex: Maîtriser Excel en 30 jours"
                          maxLength={100}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">{title.length}/100 caractères</p>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Décrivez ce que les étudiants vont apprendre..."
                          rows={5}
                          maxLength={2000}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">{description.length}/2000 caractères</p>
                      </div>

                      {/* Category & Level */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Catégorie
                          </label>
                          <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          >
                            <option value="">Choisir...</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Niveau
                          </label>
                          <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value as any)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          >
                            <option value="beginner">Débutant</option>
                            <option value="intermediate">Intermédiaire</option>
                            <option value="advanced">Avancé</option>
                          </select>
                        </div>
                      </div>

                      {/* Students count override */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Nombre d'étudiants affiché (override)
                        </label>
                        <input
                          type="number"
                          value={displayStudentsCount ?? ''}
                          onChange={(e) => setDisplayStudentsCount(e.target.value === '' ? null : Number(e.target.value))}
                          placeholder={`Réel : ${studentsCount}`}
                          min="0"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">
                          Laisser vide pour afficher le compte réel ({studentsCount} inscrits actifs)
                        </p>
                      </div>

                      {/* Price & Status */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Prix (FCFA)
                          </label>
                          <input
                            type="number"
                            value={price || ''}
                            onChange={(e) => setPrice(Number(e.target.value) || 0)}
                            placeholder="0 = Gratuit"
                            min="0"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1.5">
                            {price === 0 ? 'Gratuit' : `${price.toLocaleString()} FCFA`}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Statut
                          </label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                              status === 'published' ? 'border-green-300' : 'border-gray-300'
                            }`}
                          >
                            <option value="draft">Brouillon</option>
                            <option value="published">Publié</option>
                          </select>
                          <p className="text-xs mt-1.5">
                            {status === 'published' ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Visible par les étudiants
                              </span>
                            ) : (
                              <span className="text-orange-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Non visible
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Media Tab */}
                  {activeTab === 'media' && (
                    <div className="space-y-6">
                      {/* Thumbnail */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Image de couverture
                        </label>
                        <CourseImageUpload
                          courseId={id}
                          currentImageUrl={thumbnail}
                          onImageUploaded={setThumbnail}
                          onImageRemoved={() => setThumbnail('')}
                          label=""
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Recommandé : 1280x720px (16:9)
                        </p>
                      </div>

                      {/* Video URL */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Vidéo de présentation (optionnel)
                        </label>
                        <input
                          type="url"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">
                          Une vidéo de présentation augmente les inscriptions de 30%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Advanced Tab */}
                  {activeTab === 'advanced' && (
                    <div className="space-y-6">
                      {/* Instructor Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Nom de l&apos;instructeur
                        </label>
                        <input
                          type="text"
                          value={instructorName}
                          onChange={(e) => setInstructorName(e.target.value)}
                          placeholder="Nom affiché sur le cours"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Instructor Bio */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Bio de l&apos;instructeur
                        </label>
                        <textarea
                          value={instructorBio}
                          onChange={(e) => setInstructorBio(e.target.value)}
                          placeholder="Parcours, expertise et expérience de l'instructeur..."
                          rows={3}
                          maxLength={500}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">{instructorBio.length}/500 caractères</p>
                      </div>

                      {/* Instructor Photo */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Photo de l&apos;instructeur
                        </label>
                        <CourseImageUpload
                          courseId={id}
                          currentImageUrl={instructorAvatar}
                          onImageUploaded={setInstructorAvatar}
                          onImageRemoved={() => setInstructorAvatar('')}
                          label=""
                          uploadType="instructor-avatar"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Recommandé : photo carrée 200x200px
                        </p>
                      </div>

                      {/* Objectives */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Ce que vous apprendrez
                        </label>
                        <div className="space-y-2">
                          {objectives.map((obj, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={obj}
                                onChange={(e) => updateItem(setObjectives, i, e.target.value)}
                                placeholder="Ex: Créer des tableaux croisés dynamiques"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                              <button
                                onClick={() => removeItem(setObjectives, i)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addItem(setObjectives)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Plus className="w-4 h-4" />
                            Ajouter un objectif
                          </button>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Prérequis
                        </label>
                        <div className="space-y-2">
                          {requirements.map((req, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={req}
                                onChange={(e) => updateItem(setRequirements, i, e.target.value)}
                                placeholder="Ex: Connaissance de base d'Excel"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                              <button
                                onClick={() => removeItem(setRequirements, i)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addItem(setRequirements)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Plus className="w-4 h-4" />
                            Ajouter un prérequis
                          </button>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="pt-4 border-t border-gray-200">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Options
                        </label>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={certificate}
                              onChange={(e) => setCertificate(e.target.checked)}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Certificat de fin inclus</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isFeatured}
                              onChange={(e) => setIsFeatured(e.target.checked)}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Mettre en avant sur la homepage</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isComingSoon}
                              onChange={(e) => setIsComingSoon(e.target.checked)}
                              className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                            />
                            <div>
                              <span className="text-sm text-gray-700">Bientôt disponible</span>
                              <p className="text-xs text-gray-500">Les utilisateurs peuvent s&apos;inscrire mais ne peuvent pas accéder au contenu</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resources Tab */}
                  {activeTab === 'resources' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Ressources du cours</h3>
                        <p className="text-sm text-gray-500">
                          Fichiers et liens accessibles aux étudiants inscrits depuis la page d&apos;apprentissage.
                        </p>
                      </div>

                      {/* Add resource form */}
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                        {/* Mode toggle */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setResourceMode('link')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              resourceMode === 'link'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <Link2 className="w-4 h-4" />
                            Lien externe
                          </button>
                          <button
                            type="button"
                            onClick={() => setResourceMode('file')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              resourceMode === 'file'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <Upload className="w-4 h-4" />
                            Uploader un fichier
                          </button>
                        </div>

                        {/* Title */}
                        <input
                          type="text"
                          value={resourceTitle}
                          onChange={e => setResourceTitle(e.target.value)}
                          placeholder="Titre de la ressource"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                        />

                        {resourceMode === 'link' ? (
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={resourceUrl}
                              onChange={e => setResourceUrl(e.target.value)}
                              placeholder="https://..."
                              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                            />
                            <button
                              type="button"
                              onClick={handleAddLink}
                              disabled={addingResource}
                              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
                            >
                              {addingResource ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                              Ajouter
                            </button>
                          </div>
                        ) : (
                          <div>
                            <input
                              ref={resourceFileRef}
                              type="file"
                              accept=".pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
                              onChange={handleFileUpload}
                              disabled={uploadingFile}
                              className="hidden"
                              id="resource-file-input"
                            />
                            <label
                              htmlFor="resource-file-input"
                              className={`flex items-center justify-center gap-3 w-full py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                                uploadingFile
                                  ? 'border-blue-300 bg-blue-50 cursor-wait'
                                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                              }`}
                            >
                              {uploadingFile ? (
                                <>
                                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                  <span className="text-sm text-blue-600 font-medium">Upload en cours...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-5 h-5 text-gray-400" />
                                  <div className="text-center">
                                    <p className="text-sm text-gray-600 font-medium">Cliquez pour uploader</p>
                                    <p className="text-xs text-gray-400 mt-0.5">PDF, ZIP, Word, Excel — max 20 MB</p>
                                  </div>
                                </>
                              )}
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Resources list */}
                      {loadingResources ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                      ) : resources.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                          <Paperclip className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-gray-500 mb-1">Aucune ressource pour ce cours</p>
                          <p className="text-sm text-gray-400">
                            Ajoutez des fichiers ou liens accessibles à vos étudiants
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {resources.map(resource => (
                            <div
                              key={resource.id}
                              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                              <div className={`p-2 rounded-lg flex-shrink-0 ${
                                resource.type === 'file'
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'bg-green-50 text-green-600'
                              }`}>
                                {resource.type === 'file' ? (
                                  <FileText className="w-4 h-4" />
                                ) : (
                                  <Link2 className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{resource.title}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                  <span>{resource.type === 'file' ? 'Fichier' : 'Lien'}</span>
                                  {resource.file_size && (
                                    <span>· {(resource.file_size / 1024).toFixed(0)} KB</span>
                                  )}
                                  {resource.file_name && (
                                    <span className="truncate">· {resource.file_name}</span>
                                  )}
                                </div>
                              </div>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Ouvrir"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteResource(resource.id)}
                                disabled={deletingResourceId === resource.id}
                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                title="Supprimer"
                              >
                                {deletingResourceId === resource.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quiz Tab */}
                  {activeTab === 'quiz' && (
                    <div className="space-y-6">
                      {showQuizEditor ? (
                        <ModuleQuizEditor
                          courseId={id}
                          existingQuizId={editingQuizId || undefined}
                          existingQuizData={editingQuizData || undefined}
                          onSave={handleSaveQuiz}
                          onCancel={() => {
                            setShowQuizEditor(false);
                            setEditingQuizId(null);
                            setEditingQuizData(null);
                          }}
                        />
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">Quiz du cours</h3>
                              <p className="text-sm text-gray-500">
                                Créez des quiz pour évaluer les connaissances des étudiants
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setEditingQuizId(null);
                                setEditingQuizData(null);
                                setShowQuizEditor(true);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                            >
                              <Plus className="w-4 h-4" />
                              Ajouter un quiz
                            </button>
                          </div>

                          {loadingQuizzes ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                            </div>
                          ) : quizzes.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-gray-500 mb-1">Aucun quiz pour ce cours</p>
                              <p className="text-sm text-gray-400">
                                Ajoutez un quiz pour évaluer les connaissances des étudiants
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {quizzes.map(quiz => (
                                <div
                                  key={quiz.id}
                                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{quiz.title}</h4>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                      <span>{quiz.questionCount} question{quiz.questionCount !== 1 ? 's' : ''}</span>
                                      <span>Score min: {quiz.passingScore}%</span>
                                      {quiz.timeLimit && <span>{quiz.timeLimit} min</span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <button
                                      onClick={() => handleEditQuiz(quiz.id)}
                                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Modifier"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuiz(quiz.id)}
                                      disabled={deletingQuizId === quiz.id}
                                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                      title="Supprimer"
                                    >
                                      {deletingQuizId === quiz.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Course Card Preview */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b">
                    Aperçu
                  </p>

                  {/* Image */}
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt="Aperçu"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-gray-300" />
                      </div>
                    )}

                    {/* Level badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${LEVEL_COLORS[level]}`}>
                        {LEVEL_LABELS[level]}
                      </span>
                    </div>

                    {/* Price badge */}
                    <div className="absolute top-2 right-2">
                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur rounded-full text-sm font-bold text-gray-900 shadow">
                        {price === 0 ? 'Gratuit' : `${price.toLocaleString()} F`}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {selectedCategory && (
                      <p className="text-xs font-medium text-blue-600 mb-1">{selectedCategory.name}</p>
                    )}
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">
                      {title || 'Titre du cours'}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {description || 'Description...'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDuration(totalDuration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{lessonsCount} leçons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{studentsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions rapides
                  </p>

                  <Link
                    href={`/admin/courses/${id}/lessons`}
                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span>Gérer les leçons</span>
                    </div>
                    <span className="text-xs text-gray-400">{lessonsCount}</span>
                  </Link>

                  <Link
                    href={`/courses/${id}`}
                    target="_blank"
                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      <span>Voir la page publique</span>
                    </div>
                  </Link>
                </div>

                {/* Status indicator */}
                <div className={`rounded-xl p-4 ${
                  status === 'published'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-orange-50 border border-orange-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {status === 'published' ? (
                      <>
                        <Check className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-semibold text-green-900">Cours publié</p>
                          <p className="text-xs text-green-700">Visible par les étudiants</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-semibold text-orange-900">Brouillon</p>
                          <p className="text-xs text-orange-700">Non visible publiquement</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
