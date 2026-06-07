'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import {
  ArrowLeft,
  Play,
  FileText,
  Clock,
  ChevronRight,
  ChevronDown,
  Eye,
  Gift,
  Layers,
  BookOpen,
  Loader2,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  video_url: string | null;
  duration: number;
  lesson_order: number;
  is_free: boolean;
  module_id: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  status: string;
  description: string;
}

// ─── Convertit n'importe quelle URL vidéo en URL embeddable ─────────────────

function getEmbedUrl(url: string): { type: 'youtube' | 'vimeo' | 'loom' | 'direct'; src: string } | null {
  if (!url) return null;

  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return {
      type: 'youtube',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1`,
    };
  }

  // Loom
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (loomMatch) {
    return {
      type: 'loom',
      src: `https://www.loom.com/embed/${loomMatch[1]}`,
    };
  }

  // Vidéo directe (mp4, webm, etc.)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.includes('supabase') || url.includes('storage')) {
    return { type: 'direct', src: url };
  }

  return null;
}

// ─── Lecteur vidéo ───────────────────────────────────────────────────────────

function VideoPlayer({ url }: { url: string }) {
  const embed = getEmbedUrl(url);

  if (!embed) {
    return (
      <div className="w-full aspect-video bg-gray-900 flex flex-col items-center justify-center rounded-xl text-gray-400 gap-3">
        <Play className="w-10 h-10 opacity-40" />
        <p className="text-sm">URL non reconnue</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 underline break-all max-w-sm text-center"
        >
          {url}
        </a>
      </div>
    );
  }

  if (embed.type === 'direct') {
    return (
      <video
        key={url}
        controls
        className="w-full aspect-video rounded-xl bg-black"
        src={embed.src}
      >
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      <iframe
        key={embed.src}
        src={embed.src}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        title="Lecteur vidéo"
      />
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function AdminCoursePreviewPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [unassigned, setUnassigned] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            .map((l: any) => ({ ...l, lesson_order: l.lesson_order ?? l.order ?? 0 }))
            .sort((a: Lesson, b: Lesson) => a.lesson_order - b.lesson_order),
        }));
        setModules(rawModules);
        setExpandedModules(new Set(rawModules.map((m: Module) => m.id)));
      }

      if (lessonsRes.ok) {
        const ld = await lessonsRes.json();
        const allLessons: Lesson[] = (ld.lessons || []).map((l: any) => ({
          ...l,
          lesson_order: l.lesson_order ?? l.order ?? 0,
        }));
        const assignedIds = new Set(rawModules.flatMap(m => m.lessons.map(l => l.id)));
        const unassignedLessons = allLessons
          .filter(l => !assignedIds.has(l.id))
          .sort((a, b) => a.lesson_order - b.lesson_order);
        setUnassigned(unassignedLessons);

        // Activer la première leçon automatiquement
        const firstLesson = rawModules[0]?.lessons[0] || unassignedLessons[0] || null;
        if (firstLesson) setActiveLesson(firstLesson);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const allLessons = [...modules.flatMap(m => m.lessons), ...unassigned];
  const totalDuration = allLessons.reduce((s, l) => s + (l.duration || 0), 0);
  const fmt = (min: number) => {
    if (!min) return '0 min';
    const h = Math.floor(min / 60), m = min % 60;
    return h > 0 ? `${h}h ${m > 0 ? ` ${m}min` : ''}` : `${m} min`;
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const lessonIndex = activeLesson ? allLessons.findIndex(l => l.id === activeLesson.id) : -1;
  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;

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
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-950">

        {/* Bandeau admin */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-amber-500 text-amber-950 text-sm font-medium shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Toggle sidebar mobile */}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="md:hidden shrink-0 p-1 rounded hover:bg-amber-400 transition-colors"
              aria-label="Ouvrir la liste des leçons"
            >
              <Menu className="w-5 h-5" />
            </button>
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Mode prévisualisation admin
              <span className="hidden sm:inline">
                {course?.status !== 'published' && ' — cours non publié, invisible aux apprenants'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/admin/courses/${courseId}/lessons`}
              className="hidden sm:inline text-amber-900 hover:text-amber-950 underline whitespace-nowrap"
            >
              Gérer les leçons
            </Link>
            <Link
              href={`/admin/courses/${courseId}`}
              className="flex items-center gap-1.5 text-amber-900 hover:text-amber-950 whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Retour</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">

          {/* ── Overlay mobile ──────────────────────────────────────────────── */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/60 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ── Sidebar : liste des leçons ──────────────────────────────────── */}
          <aside className={`
            fixed inset-y-0 left-0 z-30 w-72 bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden
            transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:relative md:translate-x-0 md:z-auto md:shrink-0
          `}>
            {/* En-tête */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-white font-semibold text-sm truncate">{course?.title}</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden shrink-0 p-1 rounded hover:bg-gray-700 text-gray-400"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-gray-400 text-xs">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />{allLessons.length} leçon{allLessons.length !== 1 && 's'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />{fmt(totalDuration)}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-2">
              {modules.map((mod) => (
                <div key={mod.id}>
                  {/* En-tête module */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-800 transition-colors group"
                  >
                    <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="flex-1 text-xs font-semibold text-gray-300 uppercase tracking-wide truncate">
                      {mod.title}
                    </span>
                    <span className="text-xs text-gray-500">{mod.lessons.length}</span>
                    {expandedModules.has(mod.id)
                      ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                      : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                    }
                  </button>

                  {/* Leçons du module */}
                  {expandedModules.has(mod.id) && mod.lessons.map((lesson) => (
                    <LessonNavItem
                      key={lesson.id}
                      lesson={lesson}
                      isActive={activeLesson?.id === lesson.id}
                      onClick={() => { setActiveLesson(lesson); setSidebarOpen(false); }}
                    />
                  ))}
                </div>
              ))}

              {/* Leçons sans module */}
              {unassigned.length > 0 && (
                <>
                  {modules.length > 0 && (
                    <div className="px-4 py-2 mt-2">
                      <p className="text-xs text-amber-400 font-medium">Sans module</p>
                    </div>
                  )}
                  {unassigned.map((lesson) => (
                    <LessonNavItem
                      key={lesson.id}
                      lesson={lesson}
                      isActive={activeLesson?.id === lesson.id}
                      onClick={() => { setActiveLesson(lesson); setSidebarOpen(false); }}
                    />
                  ))}
                </>
              )}

              {allLessons.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  Aucune leçon dans ce cours
                </div>
              )}
            </nav>
          </aside>

          {/* ── Zone de lecture principale ──────────────────────────────────── */}
          <main className="flex-1 overflow-y-auto bg-gray-950">
            {activeLesson ? (
              <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">

                {/* Vidéo ou contenu texte */}
                {activeLesson.video_url ? (
                  <VideoPlayer url={activeLesson.video_url} />
                ) : (
                  <div className="w-full aspect-video bg-gray-900 rounded-xl flex flex-col items-center justify-center text-gray-500 gap-3">
                    <FileText className="w-12 h-12 opacity-30" />
                    <p className="text-sm">Leçon textuelle — pas de vidéo</p>
                  </div>
                )}

                {/* Infos leçon */}
                <div className="mt-5">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-xl font-bold text-white">{activeLesson.title}</h1>
                    <div className="flex items-center gap-2 shrink-0">
                      {activeLesson.is_free && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded-full">
                          <Gift className="w-3 h-3" />Gratuit
                        </span>
                      )}
                      {activeLesson.duration > 0 && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                          <Clock className="w-3 h-3" />{activeLesson.duration} min
                        </span>
                      )}
                    </div>
                  </div>

                  {activeLesson.description && (
                    <p className="mt-2 text-gray-400 text-sm">{activeLesson.description}</p>
                  )}

                  {/* Contenu texte riche */}
                  {activeLesson.content && (
                    <div
                      className="mt-6 prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                    />
                  )}

                  {/* Navigation prev / next */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
                    <button
                      onClick={() => prevLesson && setActiveLesson(prevLesson)}
                      disabled={!prevLesson}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {prevLesson ? prevLesson.title : 'Précédent'}
                    </button>

                    <span className="text-gray-600 text-xs">
                      {lessonIndex + 1} / {allLessons.length}
                    </span>

                    <button
                      onClick={() => nextLesson && setActiveLesson(nextLesson)}
                      disabled={!nextLesson}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      {nextLesson ? nextLesson.title : 'Suivant'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                <Eye className="w-16 h-16 opacity-20" />
                <p>Sélectionnez une leçon pour la prévisualiser</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}

// ─── Item de navigation sidebar ─────────────────────────────────────────────

function LessonNavItem({
  lesson,
  isActive,
  onClick,
}: {
  lesson: Lesson;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
        isActive
          ? 'bg-blue-600/20 border-r-2 border-blue-500'
          : 'hover:bg-gray-800/60'
      }`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
        lesson.video_url ? 'bg-purple-900/60' : 'bg-gray-800'
      }`}>
        {lesson.video_url
          ? <Play className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-purple-400'}`} />
          : <FileText className="w-3.5 h-3.5 text-gray-500" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
          {lesson.title}
        </p>
        {lesson.duration > 0 && (
          <p className="text-xs text-gray-500">{lesson.duration} min</p>
        )}
      </div>
      {lesson.is_free && (
        <Gift className="w-3 h-3 text-green-500 shrink-0" />
      )}
    </button>
  );
}
