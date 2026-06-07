'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import AdminGuard from '@/components/admin/AdminGuard';
import { useToast } from '@/components/admin/Toast';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="w-full h-48 bg-gray-100 rounded-lg animate-pulse" />,
});
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Clock,
  Loader2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Eye,
  Check,
  Link as LinkIcon,
  Gift,
  Play,
  BookOpen,
  Layers,
  GripVertical,
  X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  course_id: string;
  module_id: string | null;
  title: string;
  description: string;
  content: string;
  video_url: string | null;
  duration: number;
  order: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  is_published: boolean;
}

// ─── Formulaires vides ────────────────────────────────────────────────────────

const emptyLessonForm = () => ({
  title: '',
  description: '',
  video_url: '',
  content: '',
  duration: 0,
  is_free: false,
  lesson_type: 'video' as 'video' | 'text',
});

const emptyModuleForm = () => ({ title: '', description: '' });

// ─── LessonRow ────────────────────────────────────────────────────────────────

function LessonRow({
  lesson, index, totalInGroup, saving, editingId, editForm,
  onStartEdit, onSaveEdit, onCancelEdit, onDelete, onToggleFree, onMove, onEditFormChange,
}: {
  lesson: Lesson; index: number; totalInGroup: number; saving: boolean;
  editingId: string | null; editForm: ReturnType<typeof emptyLessonForm>;
  onStartEdit: (l: Lesson) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: (l: Lesson) => void;
  onToggleFree: (l: Lesson) => void;
  onMove: (lessonId: string, direction: 'up' | 'down') => void;
  onEditFormChange: (f: ReturnType<typeof emptyLessonForm>) => void;
}) {
  const isEditing = editingId === lesson.id;

  if (isEditing) {
    return (
      <div className="p-4 space-y-3 bg-blue-50 rounded-xl border-2 border-blue-200">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
            {lesson.order}
          </span>
          <input
            type="text" value={editForm.title} autoFocus
            onChange={(e) => onEditFormChange({ ...editForm, title: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-sm"
            placeholder="Titre de la leçon"
          />
        </div>
        <textarea
          value={editForm.description} rows={2}
          onChange={(e) => onEditFormChange({ ...editForm, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          placeholder="Description courte (optionnel)"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Type :</span>
          {(['video', 'text'] as const).map(t => (
            <button key={t} type="button"
              onClick={() => onEditFormChange({ ...editForm, lesson_type: t })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                editForm.lesson_type === t
                  ? t === 'video' ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300' : 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'video' ? <Play className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              {t === 'video' ? 'Vidéo' : 'Texte'}
            </button>
          ))}
        </div>
        {editForm.lesson_type === 'text' && (
          <RichTextEditor
            value={editForm.content}
            onChange={(html) => onEditFormChange({ ...editForm, content: html })}
            placeholder="Contenu de la leçon..."
          />
        )}
        <div className="flex flex-wrap items-center gap-4">
          {editForm.lesson_type === 'video' && (
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <LinkIcon className="w-4 h-4 text-gray-400" />
              <input type="url" value={editForm.video_url}
                onChange={(e) => onEditFormChange({ ...editForm, video_url: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="URL vidéo (YouTube, Vimeo...)"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <input type="number" value={editForm.duration || ''} min="0"
              onChange={(e) => onEditFormChange({ ...editForm, duration: parseInt(e.target.value) || 0 })}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="0"
            />
            <span className="text-sm text-gray-500">min</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editForm.is_free}
              onChange={(e) => onEditFormChange({ ...editForm, is_free: e.target.checked })}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Gratuite</span>
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200">
          <button onClick={onCancelEdit} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
          <button onClick={() => onSaveEdit(lesson.id)} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Enregistrer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group">
      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onMove(lesson.id, 'up')} disabled={index === 0}
          className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20" title="Monter">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onMove(lesson.id, 'down')} disabled={index === totalInGroup - 1}
          className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20" title="Descendre">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
      <span className="w-7 h-7 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
        {lesson.order}
      </span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${lesson.video_url ? 'bg-purple-100' : 'bg-gray-100'}`}>
        {lesson.video_url ? <Play className="w-3.5 h-3.5 text-purple-600" /> : <FileText className="w-3.5 h-3.5 text-gray-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{lesson.title}</p>
        {lesson.description && <p className="text-xs text-gray-500 truncate">{lesson.description}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {lesson.duration > 0 && (
          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />{lesson.duration} min
          </span>
        )}
        <button onClick={() => onToggleFree(lesson)}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
            lesson.is_free ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          title={lesson.is_free ? 'Rendre payante' : 'Rendre gratuite'}
        >
          <Gift className="w-3 h-3" />{lesson.is_free ? 'Gratuit' : 'Payant'}
        </button>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => onStartEdit(lesson)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(lesson)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── AddLessonForm ────────────────────────────────────────────────────────────

function AddLessonForm({
  form, saving, nextOrder, onFormChange, onSubmit, onCancel,
}: {
  form: ReturnType<typeof emptyLessonForm>; saving: boolean; nextOrder: number;
  onFormChange: (f: ReturnType<typeof emptyLessonForm>) => void;
  onSubmit: () => void; onCancel: () => void;
}) {
  return (
    <div className="p-4 space-y-3 bg-white rounded-xl border-2 border-dashed border-blue-300">
      <div className="flex items-center gap-3">
        <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
          {nextOrder}
        </span>
        <input type="text" value={form.title} autoFocus
          onChange={(e) => onFormChange({ ...form, title: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-sm"
          placeholder="Titre de la nouvelle leçon"
        />
      </div>
      <textarea value={form.description} rows={2}
        onChange={(e) => onFormChange({ ...form, description: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
        placeholder="Description courte (optionnel)"
      />
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 font-medium">Type :</span>
        {(['video', 'text'] as const).map(t => (
          <button key={t} type="button"
            onClick={() => onFormChange({ ...form, lesson_type: t })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              form.lesson_type === t
                ? t === 'video' ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300' : 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t === 'video' ? <Play className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            {t === 'video' ? 'Vidéo' : 'Texte'}
          </button>
        ))}
      </div>
      {form.lesson_type === 'text' && (
        <RichTextEditor
          value={form.content}
          onChange={(html) => onFormChange({ ...form, content: html })}
          placeholder="Contenu de la leçon..."
        />
      )}
      <div className="flex flex-wrap items-center gap-4">
        {form.lesson_type === 'video' && (
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <LinkIcon className="w-4 h-4 text-gray-400" />
            <input type="url" value={form.video_url}
              onChange={(e) => onFormChange({ ...form, video_url: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="URL vidéo (YouTube, Vimeo...)"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <input type="number" value={form.duration || ''} min="0"
            onChange={(e) => onFormChange({ ...form, duration: parseInt(e.target.value) || 0 })}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="0"
          />
          <span className="text-sm text-gray-500">min</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_free}
            onChange={(e) => onFormChange({ ...form, is_free: e.target.checked })}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
          />
          <span className="text-sm text-gray-700">Gratuite</span>
        </label>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
        <button onClick={onSubmit} disabled={saving || !form.title.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Ajouter
        </button>
      </div>
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────

export default function CourseLessonsPage() {
  const params = useParams();
  const { success, error: toastError } = useToast();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [unassigned, setUnassigned] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Module UI
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleEditForm, setModuleEditForm] = useState(emptyModuleForm());
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleForm, setNewModuleForm] = useState(emptyModuleForm());

  // Lesson UI
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonEditForm, setLessonEditForm] = useState(emptyLessonForm());
  const [addingLessonToModule, setAddingLessonToModule] = useState<string | null>(null);
  const [newLessonForm, setNewLessonForm] = useState(emptyLessonForm());

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [courseRes, modulesRes, lessonsRes] = await Promise.all([
        fetch(`/api/admin/courses/${courseId}`, { credentials: 'include' }),
        fetch(`/api/admin/modules?course_id=${courseId}`, { credentials: 'include' }),
        fetch(`/api/admin/lessons?course_id=${courseId}`, { credentials: 'include' }),
      ]);

      if (courseRes.ok) {
        const d = await courseRes.json();
        setCourse(d.course);
      }

      let rawModules: Module[] = [];
      if (modulesRes.ok) {
        const d = await modulesRes.json();
        rawModules = (d.modules || []).map((m: any) => ({
          ...m,
          lessons: (m.lessons || [])
            .map((l: any) => ({ ...l, order: l.lesson_order ?? l.order ?? 0 }))
            .sort((a: Lesson, b: Lesson) => a.order - b.order),
        }));
        setModules(rawModules);
        setExpandedModules(new Set(rawModules.map((m: Module) => m.id)));
      }

      if (lessonsRes.ok) {
        const ld = await lessonsRes.json();
        const allLessons: Lesson[] = (ld.lessons || []).map((l: any) => ({
          ...l,
          order: l.lesson_order ?? l.order ?? 0,
        }));
        const assignedIds = new Set(rawModules.flatMap(m => m.lessons.map(l => l.id)));
        setUnassigned(
          allLessons
            .filter(l => !assignedIds.has(l.id))
            .sort((a, b) => a.order - b.order),
        );
      }
    } catch {
      toastError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [courseId, toastError]);

  useEffect(() => { if (courseId) fetchData(); }, [courseId, fetchData]);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const allLessons = [...modules.flatMap(m => m.lessons), ...unassigned];
  const totalDuration = allLessons.reduce((s, l) => s + (l.duration || 0), 0);
  const fmt = (min: number) => {
    if (!min) return '0 min';
    const h = Math.floor(min / 60), m = min % 60;
    return h > 0 ? `${h}h ${m}min` : `${m} min`;
  };

  // ── Module CRUD ───────────────────────────────────────────────────────────

  const createModule = async () => {
    if (!newModuleForm.title.trim()) { toastError('Le titre du module est requis'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/modules', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ course_id: courseId, ...newModuleForm }),
      });
      if (res.ok) { success('Module créé'); setIsAddingModule(false); setNewModuleForm(emptyModuleForm()); fetchData(); }
      else { toastError('Erreur lors de la création du module'); }
    } finally { setSaving(false); }
  };

  const saveModule = async (moduleId: string) => {
    if (!moduleEditForm.title.trim()) { toastError('Le titre est requis'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(moduleEditForm),
      });
      if (res.ok) { success('Module mis à jour'); setEditingModuleId(null); fetchData(); }
      else { toastError('Erreur lors de la mise à jour'); }
    } finally { setSaving(false); }
  };

  const deleteModule = async (mod: Module) => {
    if (!confirm(`Supprimer "${mod.title}" ? Les leçons associées sont conservées sans module.`)) return;
    try {
      const res = await fetch(`/api/admin/modules/${mod.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { success('Module supprimé'); fetchData(); }
      else { toastError('Erreur'); }
    } catch { toastError('Erreur'); }
  };

  const moveModule = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= modules.length) return;
    const next = [...modules];
    [next[index], next[newIndex]] = [next[newIndex]!, next[index]!];
    setModules(next.map((m, i) => ({ ...m, order: i + 1 })));
    try {
      await fetch('/api/admin/modules/reorder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ course_id: courseId, modules: next.map((m, i) => ({ id: m.id, order: i + 1 })) }),
      });
    } catch { fetchData(); }
  };

  // ── Lesson CRUD ───────────────────────────────────────────────────────────

  const createLesson = async (moduleId: string | null) => {
    if (!newLessonForm.title.trim()) { toastError('Le titre est requis'); return; }
    const group = moduleId ? (modules.find(m => m.id === moduleId)?.lessons || []) : unassigned;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          course_id: courseId,
          module_id: moduleId,
          title: newLessonForm.title,
          description: newLessonForm.description,
          video_url: newLessonForm.lesson_type === 'video' ? newLessonForm.video_url : '',
          content: newLessonForm.lesson_type === 'text' ? newLessonForm.content : '',
          duration: newLessonForm.duration,
          is_free: newLessonForm.is_free,
          order: group.length + 1,
        }),
      });
      if (res.ok) {
        success('Leçon ajoutée');
        setAddingLessonToModule(null);
        setNewLessonForm(emptyLessonForm());
        fetchData();
      } else {
        const data = await res.json();
        toastError(data.error || 'Erreur lors de la création');
      }
    } finally { setSaving(false); }
  };

  const saveLesson = async (lessonId: string) => {
    if (!lessonEditForm.title.trim()) { toastError('Le titre est requis'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          title: lessonEditForm.title,
          description: lessonEditForm.description,
          video_url: lessonEditForm.lesson_type === 'video' ? lessonEditForm.video_url : '',
          content: lessonEditForm.lesson_type === 'text' ? lessonEditForm.content : '',
          duration: lessonEditForm.duration,
          is_free: lessonEditForm.is_free,
        }),
      });
      if (res.ok) { success('Leçon mise à jour'); setEditingLessonId(null); fetchData(); }
      else { toastError('Erreur lors de la sauvegarde'); }
    } finally { setSaving(false); }
  };

  const deleteLesson = async (lesson: Lesson) => {
    if (!confirm(`Supprimer "${lesson.title}" ?`)) return;
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { success('Leçon supprimée'); fetchData(); }
      else { toastError('Erreur'); }
    } catch { toastError('Erreur'); }
  };

  const toggleFree = async (lesson: Lesson) => {
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ is_free: !lesson.is_free }),
      });
      if (res.ok) { success(lesson.is_free ? 'Leçon payante' : 'Leçon gratuite'); fetchData(); }
    } catch { toastError('Erreur'); }
  };

  const moveLesson = async (lessonId: string, direction: 'up' | 'down', group: Lesson[]) => {
    const i = group.findIndex(l => l.id === lessonId);
    const ni = direction === 'up' ? i - 1 : i + 1;
    if (ni < 0 || ni >= group.length) return;
    const next = [...group];
    [next[i], next[ni]] = [next[ni]!, next[i]!];
    try {
      await fetch('/api/admin/lessons/reorder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ course_id: courseId, lessons: next.map((l, idx) => ({ id: l.id, order: idx + 1 })) }),
      });
      fetchData();
    } catch { fetchData(); }
  };

  const startEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setLessonEditForm({
      title: lesson.title,
      description: lesson.description || '',
      video_url: lesson.video_url || '',
      content: lesson.content || '',
      duration: lesson.duration || 0,
      is_free: lesson.is_free,
      lesson_type: lesson.video_url ? 'video' : 'text',
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">

        {/* Header sticky */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/admin/courses/${courseId}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Modules & Leçons</h1>
                <p className="text-sm text-gray-500 truncate max-w-md">{course?.title}</p>
              </div>
            </div>
            <Link href={`/admin/courses/${courseId}/preview`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-gray-800 hover:bg-gray-900 rounded-lg">
              <Eye className="w-4 h-4" />Prévisualiser
            </Link>
            <Link href={`/courses/${courseId}`} target="_blank"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              <Eye className="w-4 h-4" />Voir le cours
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            {[
              { icon: <Layers className="w-4 h-4" />, value: modules.length, label: `module${modules.length !== 1 ? 's' : ''}` },
              { icon: <BookOpen className="w-4 h-4" />, value: allLessons.length, label: `leçon${allLessons.length !== 1 ? 's' : ''}` },
              { icon: <Clock className="w-4 h-4" />, value: null, label: fmt(totalDuration) },
              { icon: <Gift className="w-4 h-4" />, value: allLessons.filter(l => l.is_free).length, label: `gratuite${allLessons.filter(l => l.is_free).length !== 1 ? 's' : ''}` },
            ].map((s, i) => (
              <span key={i} className="flex items-center gap-2 text-gray-600">
                {s.icon}
                {s.value !== null
                  ? <><strong className="text-gray-900">{s.value}</strong> {s.label}</>
                  : <strong className="text-gray-900">{s.label}</strong>
                }
              </span>
            ))}
          </div>

          {/* Empty state */}
          {modules.length === 0 && !isAddingModule && (
            <div className="text-center py-14 bg-white rounded-2xl border border-gray-200">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun module</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Organisez votre cours en modules, puis ajoutez des leçons dans chaque module.
              </p>
              <button onClick={() => setIsAddingModule(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium">
                <Plus className="w-5 h-5" />Créer le premier module
              </button>
            </div>
          )}

          {/* Liste des modules */}
          {modules.map((mod, modIndex) => {
            const isExpanded = expandedModules.has(mod.id);
            const isEditingMod = editingModuleId === mod.id;
            const isAddingLesson = addingLessonToModule === mod.id;

            return (
              <div key={mod.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                {/* En-tête module */}
                {isEditingMod ? (
                  <div className="p-4 space-y-3 bg-indigo-50 border-b border-indigo-100">
                    <input type="text" value={moduleEditForm.title} autoFocus
                      onChange={(e) => setModuleEditForm({ ...moduleEditForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
                      placeholder="Titre du module"
                    />
                    <textarea value={moduleEditForm.description} rows={2}
                      onChange={(e) => setModuleEditForm({ ...moduleEditForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                      placeholder="Description du module (optionnel)"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingModuleId(null)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                      <button onClick={() => saveModule(mod.id)} disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                    {/* Ordre modules */}
                    <div className="flex flex-col gap-0.5 opacity-50 hover:opacity-100 transition-opacity">
                      <button onClick={() => moveModule(modIndex, 'up')} disabled={modIndex === 0}
                        className="p-0.5 text-gray-400 hover:text-indigo-600 disabled:opacity-20">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => moveModule(modIndex, 'down')} disabled={modIndex === modules.length - 1}
                        className="p-0.5 text-gray-400 hover:text-indigo-600 disabled:opacity-20">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Toggle expand + info */}
                    <button
                      onClick={() => setExpandedModules(prev => {
                        const next = new Set(prev);
                        next.has(mod.id) ? next.delete(mod.id) : next.add(mod.id);
                        return next;
                      })}
                      className="flex items-center gap-3 flex-1 text-left min-w-0"
                    >
                      <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Layers className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-indigo-500 font-medium">Module {mod.order}</span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            {mod.lessons.length} leçon{mod.lessons.length !== 1 && 's'}
                          </span>
                        </div>
                        <h2 className="font-semibold text-gray-900 truncate text-sm">{mod.title}</h2>
                        {mod.description && <p className="text-xs text-gray-500 truncate">{mod.description}</p>}
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Actions module */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => { setEditingModuleId(mod.id); setModuleEditForm({ title: mod.title, description: mod.description || '' }); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Modifier">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteModule(mod)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Leçons du module */}
                {isExpanded && (
                  <div className="p-3 space-y-2">
                    {mod.lessons.length === 0 && !isAddingLesson && (
                      <p className="text-sm text-gray-400 text-center py-3">
                        Aucune leçon — ajoutez-en une ci-dessous
                      </p>
                    )}
                    {mod.lessons.map((lesson, li) => (
                      <LessonRow key={lesson.id} lesson={lesson} index={li} totalInGroup={mod.lessons.length}
                        saving={saving} editingId={editingLessonId} editForm={lessonEditForm}
                        onStartEdit={startEditLesson} onSaveEdit={saveLesson}
                        onCancelEdit={() => setEditingLessonId(null)}
                        onDelete={deleteLesson} onToggleFree={toggleFree}
                        onMove={(id, dir) => moveLesson(id, dir, mod.lessons)}
                        onEditFormChange={setLessonEditForm}
                      />
                    ))}
                    {isAddingLesson ? (
                      <AddLessonForm form={newLessonForm} saving={saving} nextOrder={mod.lessons.length + 1}
                        onFormChange={setNewLessonForm}
                        onSubmit={() => createLesson(mod.id)}
                        onCancel={() => { setAddingLessonToModule(null); setNewLessonForm(emptyLessonForm()); }}
                      />
                    ) : (
                      <button
                        onClick={() => { setAddingLessonToModule(mod.id); setNewLessonForm(emptyLessonForm()); }}
                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" />Ajouter une leçon
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Leçons sans module */}
          {unassigned.length > 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-amber-300 overflow-hidden">
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-700">
                  Leçons sans module ({unassigned.length}) — assignez-les à un module
                </span>
              </div>
              <div className="p-3 space-y-2">
                {unassigned.map((lesson, i) => (
                  <LessonRow key={lesson.id} lesson={lesson} index={i} totalInGroup={unassigned.length}
                    saving={saving} editingId={editingLessonId} editForm={lessonEditForm}
                    onStartEdit={startEditLesson} onSaveEdit={saveLesson}
                    onCancelEdit={() => setEditingLessonId(null)}
                    onDelete={deleteLesson} onToggleFree={toggleFree}
                    onMove={(id, dir) => moveLesson(id, dir, unassigned)}
                    onEditFormChange={setLessonEditForm}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Formulaire nouveau module */}
          {isAddingModule ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-300 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <span className="font-semibold text-indigo-700">Nouveau module</span>
              </div>
              <input type="text" value={newModuleForm.title} autoFocus
                onChange={(e) => setNewModuleForm({ ...newModuleForm, title: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && createModule()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                placeholder="Titre du module (ex : Introduction, Fondamentaux...)"
              />
              <textarea value={newModuleForm.description} rows={2}
                onChange={(e) => setNewModuleForm({ ...newModuleForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                placeholder="Description du module (optionnel)"
              />
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => { setIsAddingModule(false); setNewModuleForm(emptyModuleForm()); }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4" />Annuler
                </button>
                <button onClick={createModule} disabled={saving || !newModuleForm.title.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-medium">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Créer le module
                </button>
              </div>
            </div>
          ) : modules.length > 0 && (
            <button onClick={() => setIsAddingModule(true)}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 font-medium">
              <Plus className="w-5 h-5" />Ajouter un module
            </button>
          )}

        </div>
      </div>
    </AdminGuard>
  );
}
