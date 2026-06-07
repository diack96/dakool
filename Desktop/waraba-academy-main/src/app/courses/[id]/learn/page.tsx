'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Play,
  AlertCircle,
  List,
  X,
  Check,
  BookOpen,
  Clock,
  Trophy,
  Sparkles,
  ChevronDown,
  FileText,
  HelpCircle,
  Download,
  Link2,
  Paperclip,
} from 'lucide-react';
import { useCourseStore } from '@/stores/courseStore';
import { useAuth } from '@/contexts/AuthContext';
import VideoPlayer from '@/components/courses/VideoPlayer';
import QuizPlayer, { type Quiz as QuizPlayerQuiz } from '@/components/quiz/QuizPlayer';
import { useToast } from '@/components/admin/Toast';
import { sanitizeHtml } from '@/lib/utils/sanitize';

interface LessonProgress {
  [lessonId: string]: boolean;
}

interface ModuleState {
  [moduleId: string]: boolean;
}

// LocalStorage helpers for offline support
const getLastLessonKey = (courseId: string) => `waraba_last_lesson_${courseId}`;
const getOfflineProgressKey = (courseId: string) => `waraba_offline_progress_${courseId}`;

function saveLastLesson(courseId: string, moduleIndex: number, lessonIndex: number, lessonId: string, lessonTitle: string) {
  try {
    localStorage.setItem(getLastLessonKey(courseId), JSON.stringify({
      moduleIndex, lessonIndex, lessonId, lessonTitle,
      timestamp: new Date().toISOString(),
    }));
  } catch { /* Ignore */ }
}

function saveOfflineProgress(courseId: string, lessonId: string, progress: number, lastPlayedTime: number, isCompleted: boolean) {
  try {
    const key = getOfflineProgressKey(courseId);
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    const pending: any[] = existing.pendingSync || [];
    // Remove previous entry for same lesson to avoid duplicates
    const filtered = pending.filter((p: any) => p.lessonId !== lessonId);
    filtered.push({ lessonId, progress, lastPlayedTime, isCompleted, savedAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify({
      ...existing,
      pendingSync: filtered,
      lastUpdated: new Date().toISOString(),
    }));
  } catch { /* Ignore */ }
}

// Sync pending offline progress to the server when network is available
async function syncOfflineProgress(courseId: string): Promise<{ synced: number; failed: number }> {
  const key = getOfflineProgressKey(courseId);
  let stored: { pendingSync?: any[]; [k: string]: any } = {};
  try {
    stored = JSON.parse(localStorage.getItem(key) || '{}');
  } catch { return { synced: 0, failed: 0 }; }

  const pending: any[] = stored.pendingSync || [];
  if (pending.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  const remaining: any[] = [];

  for (const item of pending) {
    try {
      const res = await fetch(`/api/courses/${courseId}/lessons/${item.lessonId}/progress`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress: item.progress,
          lastPlayedTime: item.lastPlayedTime,
          isCompleted: item.isCompleted,
        }),
      });
      if (res.ok) {
        synced++;
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  try {
    localStorage.setItem(key, JSON.stringify({
      ...stored,
      pendingSync: remaining,
      lastSynced: new Date().toISOString(),
    }));
  } catch { /* Ignore */ }

  return { synced, failed: remaining.length };
}

// Progress Ring Component
const ProgressRing = ({ progress, size = 44, strokeWidth = 3 }: { progress: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-white/10 dark:text-white/10"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-emerald-500 transition-all duration-500 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{progress}%</span>
      </div>
    </div>
  );
};

// Lesson Card Component
const LessonCard = ({
  lesson,
  isActive,
  isCompleted,
  lessonNumber,
  onClick,
}: {
  lesson: any;
  isActive: boolean;
  isCompleted: boolean;
  lessonNumber: number;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      group relative w-full flex items-center gap-4 p-4 rounded-2xl
      transition-all duration-300 ease-out
      ${isActive
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 scale-[1.02]'
        : 'bg-white/5 hover:bg-white/10 hover:scale-[1.01]'
      }
      ${!isActive && 'hover:shadow-lg hover:shadow-white/5'}
      border border-transparent
      ${isActive ? 'border-blue-400/50' : 'hover:border-white/10'}
    `}
  >
    {/* Lesson Number / Status */}
    <div className={`
      relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
      transition-all duration-300
      ${isCompleted
        ? 'bg-emerald-500 text-white'
        : isActive
          ? 'bg-white/20 text-white'
          : 'bg-white/10 text-white/60 group-hover:bg-white/15 group-hover:text-white/80'
      }
    `}>
      {isCompleted ? (
        <CheckCircle className="w-5 h-5" />
      ) : isActive ? (
        lesson.type === 'TEXT' ? <FileText className="w-4 h-4" /> :
        lesson.type === 'QUIZ' ? <HelpCircle className="w-4 h-4" /> :
        <Play className="w-4 h-4 ml-0.5" />
      ) : (
        <span className="text-sm font-semibold">{lessonNumber}</span>
      )}

      {/* Glow effect on hover */}
      <div className={`
        absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ${isCompleted ? 'bg-emerald-400/20' : 'bg-white/10'}
        blur-xl
      `} />
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0 text-left">
      <p className={`
        text-sm font-medium truncate transition-colors duration-200
        ${isActive ? 'text-white' : 'text-white/90 group-hover:text-white'}
      `}>
        {lesson.title}
      </p>
      <div className="flex items-center gap-3 mt-1">
        <span className={`
          text-xs flex items-center gap-1
          ${isActive ? 'text-white/70' : 'text-white/50'}
        `}>
          <Clock className="w-3 h-3" />
          {lesson.duration || 0} min
        </span>
        {lesson.type === 'VIDEO' ? (
          <span className={`text-xs flex items-center gap-1 ${isActive ? 'text-white/70' : 'text-white/50'}`}>
            <Play className="w-3 h-3" />
            Video
          </span>
        ) : lesson.type === 'TEXT' ? (
          <span className={`text-xs flex items-center gap-1 ${isActive ? 'text-white/70' : 'text-white/50'}`}>
            <FileText className="w-3 h-3" />
            Texte
          </span>
        ) : lesson.type === 'QUIZ' ? (
          <span className={`text-xs flex items-center gap-1 ${isActive ? 'text-white/70' : 'text-white/50'}`}>
            <HelpCircle className="w-3 h-3" />
            Quiz
          </span>
        ) : null}
      </div>
    </div>

    {/* Completion indicator */}
    {isCompleted && !isActive && (
      <div className="flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>
    )}
  </button>
);

// Module Accordion Component
const ModuleAccordion = ({
  module,
  moduleIndex,
  isExpanded,
  activeModuleIndex,
  activeLessonIndex,
  lessonProgress,
  moduleQuiz,
  moduleQuizPassed,
  onToggle,
  onSelectLesson,
  onOpenQuiz,
}: {
  module: any;
  moduleIndex: number;
  isExpanded: boolean;
  activeModuleIndex: number;
  activeLessonIndex: number;
  lessonProgress: LessonProgress;
  moduleQuiz?: { id: string; title: string };
  moduleQuizPassed?: boolean;
  onToggle: () => void;
  onSelectLesson: (moduleIndex: number, lessonIndex: number) => void;
  onOpenQuiz?: () => void;
}) => {
  const completedCount = module.lessons.filter((l: any) => lessonProgress[l.id]).length;
  const totalCount = module.lessons.length;
  const allLessonsComplete = totalCount > 0 && completedCount === totalCount;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="mb-3">
      {/* Module Header */}
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between p-4 rounded-2xl
          transition-all duration-300 ease-out
          ${isExpanded ? 'bg-white/10' : 'bg-white/5 hover:bg-white/8'}
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            transition-all duration-300
            ${progress === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'}
          `}>
            {progress === 100 ? (
              <Trophy className="w-5 h-5" />
            ) : (
              <BookOpen className="w-5 h-5" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">{module.title}</p>
            <p className="text-xs text-white/50">
              {completedCount}/{totalCount} leçons
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini progress bar */}
          <div className="hidden sm:block w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ChevronDown className={`
            w-5 h-5 text-white/50 transition-transform duration-300
            ${isExpanded ? 'rotate-180' : ''}
          `} />
        </div>
      </button>

      {/* Lessons List */}
      <div className={`
        overflow-hidden transition-all duration-300 ease-out
        ${isExpanded ? 'max-h-[2000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}
      `}>
        <div className="space-y-2 pl-2">
          {module.lessons.map((lesson: any, lessonIndex: number) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isActive={moduleIndex === activeModuleIndex && lessonIndex === activeLessonIndex}
              isCompleted={lessonProgress[lesson.id] || false}
              lessonNumber={lessonIndex + 1}
              onClick={() => onSelectLesson(moduleIndex, lessonIndex)}
            />
          ))}

          {/* Module Quiz Button — shown when all lessons are complete and a quiz exists */}
          {moduleQuiz && allLessonsComplete && (
            <button
              onClick={onOpenQuiz}
              className={`
                group w-full flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300
                ${moduleQuizPassed
                  ? 'bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 hover:scale-[1.01]'
                }
              `}
            >
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                ${moduleQuizPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}
              `}>
                {moduleQuizPassed ? <CheckCircle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-semibold ${moduleQuizPassed ? 'text-emerald-400' : 'text-orange-300'}`}>
                  {moduleQuizPassed ? 'Quiz réussi ✓' : 'Quiz du module'}
                </p>
                <p className="text-xs text-white/50 mt-0.5">
                  {moduleQuizPassed ? moduleQuiz.title : `Valider : ${moduleQuiz.title}`}
                </p>
              </div>
              {!moduleQuizPassed && (
                <ChevronRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CourseLearnPage() {
  const { id } = useParams();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { currentCourse, isLoading, error, fetchCourseById } = useCourseStore();
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  // State
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [showLessons, setShowLessons] = useState(false);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>({});
  const [courseProgress, setCourseProgress] = useState({ total: 0, completed: 0, percentage: 0 });
  const [expandedModules, setExpandedModules] = useState<ModuleState>({});

  // Video state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [lastPlayedTime, setLastPlayedTime] = useState(0);
  const [maxVideoProgress, setMaxVideoProgress] = useState(0);
  const videoAbortRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedTimeRef = useRef(0);
  // Ref pour stocker l'ID de la leçon active afin de renouveler l'URL signée
  const activeLessonIdRef = useRef<string | null>(null);
  const urlRenewalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydration guard — server renders nothing until client mounts
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Error state
  const [enrollmentError, setEnrollmentError] = useState(false);

  // Quiz state
  const [courseQuiz, setCourseQuiz] = useState<{ id: string; title: string } | null>(null);
  const [moduleQuizzes, setModuleQuizzes] = useState<Record<string, { id: string; title: string }>>({});
  const [moduleQuizPassed, setModuleQuizPassed] = useState<Record<string, boolean>>({});
  const [activeModuleQuiz, setActiveModuleQuiz] = useState<{
    moduleId: string;
    quizId: string;
    quizData: QuizPlayerQuiz | null;
  } | null>(null);
  const [moduleQuizLoading, setModuleQuizLoading] = useState(false);

  // Resources state
  const [showResources, setShowResources] = useState(false);
  const [courseResources, setCourseResources] = useState<Array<{
    id: string;
    title: string;
    type: 'file' | 'link';
    url: string;
    file_name?: string;
    file_size?: number;
  }>>([]);

  const isAuthenticated = !!user;

  // Initialize expanded modules
  useEffect(() => {
    if (currentCourse?.modules) {
      const initialExpanded: ModuleState = {};
      currentCourse.modules.forEach((m: any, i: number) => {
        initialExpanded[m.id] = i === activeModuleIndex;
      });
      setExpandedModules(initialExpanded);
    }
  }, [currentCourse, activeModuleIndex]);

  // Fetch course data
  useEffect(() => {
    if (id) fetchCourseById(id as string);
  }, [id, fetchCourseById]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated && typeof window !== 'undefined') {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuthenticated, authLoading, router]);

  // Redirect if course is "coming soon"
  useEffect(() => {
    if (currentCourse && ((currentCourse as any).is_coming_soon || currentCourse.isComingSoon)) {
      router.replace(`/courses/${id}/coming-soon`);
    }
  }, [currentCourse, id, router]);

  // Load all quizzes for this course (course-level + per-module)
  useEffect(() => {
    const loadAllQuizzes = async () => {
      if (!currentCourse?.id || !isAuthenticated) return;
      try {
        const res = await fetch(`/api/quiz?courseId=${currentCourse.id}&allModules=true`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success || !data.quizzes?.length) return;

        const moduleMap: Record<string, { id: string; title: string }> = {};
        let cQuiz: { id: string; title: string } | null = null;

        for (const q of data.quizzes) {
          if (q.module_id) {
            moduleMap[q.module_id] = { id: q.id, title: q.title };
          } else if (!cQuiz) {
            cQuiz = { id: q.id, title: q.title };
          }
        }

        if (cQuiz) setCourseQuiz(cQuiz);
        if (Object.keys(moduleMap).length > 0) setModuleQuizzes(moduleMap);
      } catch {
        // Silencieux si pas de quiz
      }
    };
    loadAllQuizzes();
  }, [currentCourse?.id, isAuthenticated]);

  // Save last lesson to localStorage whenever active lesson changes
  useEffect(() => {
    if (!currentCourse || !id) return;
    const courseId = currentCourse.id || (id as string);
    const lesson = currentCourse.modules[activeModuleIndex]?.lessons[activeLessonIndex];
    if (!lesson) return;
    saveLastLesson(courseId, activeModuleIndex, activeLessonIndex, lesson.id, lesson.title);
  }, [currentCourse, activeModuleIndex, activeLessonIndex, id]);

  // Sync offline progress when authenticated and course loaded, or when back online
  useEffect(() => {
    if (!isAuthenticated || !currentCourse?.id) return;
    const courseId = currentCourse.id;

    const trySync = async () => {
      const key = getOfflineProgressKey(courseId);
      let stored: { pendingSync?: any[] } = {};
      try { stored = JSON.parse(localStorage.getItem(key) || '{}'); } catch { return; }
      if (!stored.pendingSync?.length) return;

      const { synced } = await syncOfflineProgress(courseId);
      if (synced > 0) {
        showSuccess(`${synced} progression(s) hors-ligne synchronisée(s)`);
      }
    };

    trySync();
    window.addEventListener('online', trySync);
    return () => window.removeEventListener('online', trySync);
  }, [isAuthenticated, currentCourse?.id, showSuccess]);

  // Load progress from API
  useEffect(() => {
    const loadProgress = async () => {
      if (!id || !isAuthenticated) return;

      try {
        const res = await fetch(`/api/courses/${id}/lessons`, { credentials: 'include' });

        if (res.status === 403) {
          setEnrollmentError(true);
          showError('Vous devez être inscrit pour accéder à ce cours');
          setTimeout(() => router.push(`/courses/${id}`), 2000);
          return;
        }

        if (!res.ok) return;

        const json = await res.json();
        if (!json.success || !json.data?.course) return;
        const data = json.data;

        const progressMap: LessonProgress = {};
        if (data.course.lessons) {
          data.course.lessons.forEach((lesson: any) => {
            if (lesson.id) progressMap[lesson.id] = lesson.isCompleted || false;
          });
        }
        setLessonProgress(progressMap);

        if (data.course.progress) {
          setCourseProgress(data.course.progress);
        }

        // Resume at first incomplete lesson
        if (currentCourse?.modules) {
          for (let mi = 0; mi < currentCourse.modules.length; mi++) {
            const module = currentCourse.modules[mi];
            if (!module?.lessons) continue;
            for (let li = 0; li < module.lessons.length; li++) {
              const lesson = module.lessons[li];
              if (lesson?.id && !progressMap[lesson.id]) {
                setActiveModuleIndex(mi);
                setActiveLessonIndex(li);
                return;
              }
            }
          }
        }
      } catch (err) {
        // Silently fallback to localStorage if offline — not an unexpected error
        // Fallback: load last position from localStorage if offline
        if (currentCourse?.id) {
          try {
            const stored = localStorage.getItem(getLastLessonKey(currentCourse.id));
            if (stored) {
              const data = JSON.parse(stored);
              if (typeof data.moduleIndex === 'number' && typeof data.lessonIndex === 'number') {
                setActiveModuleIndex(data.moduleIndex);
                setActiveLessonIndex(data.lessonIndex);
              }
            }
          } catch { /* Ignore */ }
        }
      }
    };

    loadProgress();
  }, [id, isAuthenticated, currentCourse, router, showError]);

  // Load course resources
  useEffect(() => {
    if (!id || !isAuthenticated) return;
    fetch(`/api/courses/${id}/resources`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : { resources: [] })
      .then(data => setCourseResources(data.resources || []))
      .catch(() => {});
  }, [id, isAuthenticated]);

  // Load video when lesson changes
  const loadVideo = useCallback(async (lessonId: string) => {
    if (!id || !isAuthenticated) return;

    // Abort previous request
    videoAbortRef.current?.abort();
    const controller = new AbortController();
    videoAbortRef.current = controller;

    setVideoLoading(true);
    setVideoUrl(null);
    setLastPlayedTime(0);
    lastSavedTimeRef.current = 0;

    try {
      // Fetch video URL and progress in parallel
      const [videoRes, progressRes] = await Promise.all([
        fetch(`/api/courses/${id}/video/${lessonId}`, {
          credentials: 'include',
          signal: controller.signal,
        }),
        fetch(`/api/courses/${id}/lessons/${lessonId}/progress`, {
          credentials: 'include',
          signal: controller.signal,
        }),
      ]);

      if (controller.signal.aborted) return;

      if (videoRes.ok) {
        const data = await videoRes.json();
        const videoUrl = data.data?.videoUrl ?? data.videoUrl;
        if (videoUrl) {
          setVideoUrl(videoUrl);
        }
      }

      if (progressRes.ok) {
        const progressJson = await progressRes.json();
        const progressData = progressJson.data;
        if (progressData?.lastPlayedTime) {
          setLastPlayedTime(progressData.lastPlayedTime);
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
    } finally {
      if (!controller.signal.aborted) {
        setVideoLoading(false);
      }
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (!currentCourse) return;

    const module = currentCourse.modules[activeModuleIndex];
    const lesson = module?.lessons[activeLessonIndex];

    // Annuler le timer de renouvellement de la leçon précédente
    if (urlRenewalTimerRef.current) {
      clearTimeout(urlRenewalTimerRef.current);
      urlRenewalTimerRef.current = null;
    }

    if (lesson?.id && lesson.type === 'VIDEO') {
      activeLessonIdRef.current = lesson.id;
      setMaxVideoProgress(0);
      loadVideo(lesson.id);

      // Renouveler l'URL signée 5 minutes avant son expiration (expire à 1h)
      // Les URLs Supabase signées expirent après 3600s — on renouvelle à 55 min
      urlRenewalTimerRef.current = setTimeout(() => {
        if (activeLessonIdRef.current === lesson.id) {
          loadVideo(lesson.id);
        }
      }, 55 * 60 * 1000); // 55 minutes
    } else {
      activeLessonIdRef.current = null;
      setVideoUrl(null);
      setLastPlayedTime(0);
    }
  }, [currentCourse, activeModuleIndex, activeLessonIndex, loadVideo]);

  // Save video progress (debounced every 15 seconds)
  const handleVideoProgress = useCallback((progress: { played: number; playedSeconds: number }) => {
    const lesson = currentCourse?.modules[activeModuleIndex]?.lessons[activeLessonIndex];
    if (!lesson?.id || !id) return;

    setMaxVideoProgress(prev => Math.max(prev, progress.played));

    // Only save if at least 15 seconds have passed since last save
    const timeSinceLastSave = Math.abs(progress.playedSeconds - lastSavedTimeRef.current);
    if (timeSinceLastSave < 15) return;

    // Clear any pending timer
    if (progressTimerRef.current) clearTimeout(progressTimerRef.current);

    // Debounce: wait 2s after last progress event before saving
    progressTimerRef.current = setTimeout(() => {
      lastSavedTimeRef.current = progress.playedSeconds;
      const courseId = currentCourse?.id || (id as string);
      const progressValue = Math.min(1, Math.max(0, progress.played));
      const playedSeconds = Math.max(0, progress.playedSeconds);

      // Always save offline backup first
      saveOfflineProgress(courseId, lesson.id, progressValue, playedSeconds, false);

      fetch(`/api/courses/${id}/lessons/${lesson.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ progress: progressValue, lastPlayedTime: playedSeconds, isCompleted: false }),
      }).catch(() => { /* Already saved offline */ });
    }, 2000);
  }, [currentCourse, activeModuleIndex, activeLessonIndex, id]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      videoAbortRef.current?.abort();
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      if (urlRenewalTimerRef.current) clearTimeout(urlRenewalTimerRef.current);
    };
  }, []);

  // Mark lesson as complete
  const markLessonComplete = async () => {
    const lesson = currentCourse?.modules[activeModuleIndex]?.lessons[activeLessonIndex];
    if (!lesson?.id || !id) return;

    try {
      const res = await fetch(`/api/courses/${id}/lessons/${lesson.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ progress: 1.0, lastPlayedTime, isCompleted: true }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showError(errData?.error || 'Erreur lors de la sauvegarde de la progression');
        return;
      }

      const json = await res.json();
      const data = json.data;

      setLessonProgress(prev => ({ ...prev, [lesson.id]: true }));

      // Utiliser la progression serveur si disponible
      if (data?.completedCount !== undefined && data?.totalLessons !== undefined) {
        setCourseProgress(prev => ({
          ...prev,
          completed: data.completedCount,
          total: data.totalLessons,
          percentage: data.globalProgress ?? prev.percentage,
        }));
      } else {
        const newCompleted = courseProgress.completed + 1;
        const newPercentage = Math.round((newCompleted / courseProgress.total) * 100);
        setCourseProgress(prev => ({
          ...prev,
          completed: newCompleted,
          percentage: newPercentage,
        }));
      }

      // Cours terminé à 100% → redirection SEULEMENT si le serveur confirme
      if (data?.courseCompleted === true) {
        showSuccess('Cours terminé ! +115 XP 🎓');
        setTimeout(() => {
          if (courseQuiz) {
            router.push(`/courses/${id}/quiz/${courseQuiz.id}`);
          } else {
            router.push(`/courses/${id}/success?completed=true`);
          }
        }, 1500);
        return;
      }

      showSuccess('Leçon terminée ! +15 XP ⭐');
      goToNextLesson();
    } catch (err) {
      // Offline fallback: save locally and update UI optimistically
      const courseId = currentCourse?.id || (id as string);
      saveOfflineProgress(courseId, lesson.id, 1.0, lastPlayedTime, true);
      setLessonProgress(prev => ({ ...prev, [lesson.id]: true }));
      showSuccess('Leçon marquée (synchronisation hors-ligne en attente)');
      goToNextLesson();
    }
  };

  // Navigation
  const goToNextLesson = () => {
    const module = currentCourse?.modules[activeModuleIndex];
    if (!module) return;

    if (activeLessonIndex < module.lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    } else if (activeModuleIndex < (currentCourse?.modules.length || 0) - 1) {
      setActiveModuleIndex(activeModuleIndex + 1);
      setActiveLessonIndex(0);
    }
  };

  const goToPreviousLesson = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(activeLessonIndex - 1);
    } else if (activeModuleIndex > 0) {
      const prevModule = currentCourse?.modules[activeModuleIndex - 1];
      if (prevModule) {
        setActiveModuleIndex(activeModuleIndex - 1);
        setActiveLessonIndex(prevModule.lessons.length - 1);
      }
    }
  };

  const selectLesson = (moduleIndex: number, lessonIndex: number) => {
    setActiveModuleIndex(moduleIndex);
    setActiveLessonIndex(lessonIndex);
    setShowLessons(false);

    // Expand selected module
    const module = currentCourse?.modules[moduleIndex];
    if (module) {
      setExpandedModules(prev => ({ ...prev, [module.id]: true }));
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  // Open inline module quiz
  const openModuleQuiz = async (moduleId: string) => {
    const quiz = moduleQuizzes[moduleId];
    if (!quiz || !id) return;
    setModuleQuizLoading(true);
    setActiveModuleQuiz({ moduleId, quizId: quiz.id, quizData: null });
    try {
      const res = await fetch(`/api/courses/${id}/quizzes/${quiz.id}`, { credentials: 'include' });
      if (!res.ok) {
        showError('Erreur lors du chargement du quiz');
        setActiveModuleQuiz(null);
        return;
      }
      const data = await res.json();
      setActiveModuleQuiz({ moduleId, quizId: quiz.id, quizData: data.quiz });
    } catch {
      showError('Impossible de charger le quiz');
      setActiveModuleQuiz(null);
    } finally {
      setModuleQuizLoading(false);
    }
  };

  // Get all lessons flat for counting
  const getAllLessons = () => {
    if (!currentCourse) return [];
    return currentCourse.modules.flatMap((m: any, mi: number) =>
      m.lessons.map((l: any, li: number) => ({ ...l, moduleIndex: mi, lessonIndex: li }))
    );
  };

  const allLessons = getAllLessons();
  const currentLessonGlobalIndex = allLessons.findIndex(
    (l: any) => l.moduleIndex === activeModuleIndex && l.lessonIndex === activeLessonIndex
  );

  // Remaining time: sum of durations of incomplete lessons
  const remainingMinutes = allLessons
    .filter((l: any) => !lessonProgress[l.id])
    .reduce((sum: number, l: any) => sum + (l.duration || 0), 0);

  // Loading state — !mounted ensures SSR and client initial render match
  if (!mounted || isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-blue-500 animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <p className="text-white/60 text-sm">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentCourse || enrollmentError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">
            {enrollmentError ? 'Inscription requise' : 'Cours non trouvé'}
          </h2>
          <p className="text-white/60 text-sm mb-6">
            {enrollmentError
              ? 'Vous devez être inscrit à ce cours pour accéder au contenu.'
              : 'Ce cours n\'est pas disponible ou a été supprimé.'}
          </p>
          <Link
            href={`/courses/${id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour au cours
          </Link>
        </div>
      </div>
    );
  }

  const course = currentCourse;
  const activeModule = course.modules[activeModuleIndex];
  const activeLesson = activeModule?.lessons[activeLessonIndex];
  const isCompleted = activeLesson?.id ? lessonProgress[activeLesson.id] : false;

  const isFirstLesson = currentLessonGlobalIndex === 0;
  const isLastLesson = currentLessonGlobalIndex === allLessons.length - 1;

  const VIDEO_COMPLETE_THRESHOLD = 0.8;
  const isVideoLesson = activeLesson?.type === 'VIDEO';
  const videoUnlocked = !isVideoLesson || isCompleted || maxVideoProgress >= VIDEO_COMPLETE_THRESHOLD;
  const canGoNext = !isLastLesson && videoUnlocked;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          {/* Back button */}
          <Link
            href={`/courses/${course.slug || course.id}`}
            className="flex items-center gap-2 px-3 py-2 -ml-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:block text-sm font-medium">Retour</span>
          </Link>

          {/* Course title */}
          <div className="flex-1 text-center px-4">
            <p className="text-white font-semibold text-sm truncate max-w-md mx-auto">
              {course.title}
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              Leçon {currentLessonGlobalIndex + 1} sur {allLessons.length}
            </p>
          </div>

          {/* Progress & Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ProgressRing progress={courseProgress.percentage} />
            </div>

            {courseResources.length > 0 && (
              <button
                onClick={() => setShowResources(true)}
                className="relative flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-200"
              >
                <Paperclip className="w-5 h-5" />
                <span className="hidden sm:block text-sm font-medium">Ressources</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {courseResources.length}
                </span>
              </button>
            )}
            <button
              onClick={() => setShowLessons(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-200"
            >
              <List className="w-5 h-5" />
              <span className="hidden sm:block text-sm font-medium">Contenu</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-orange-500 transition-all duration-500"
            style={{ width: `${courseProgress.percentage}%` }}
          />
        </div>
      </header>

      {/* Resources Drawer */}
      {showResources && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowResources(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-gray-900 border-l border-white/10 z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Paperclip className="w-5 h-5 text-blue-400" />
                <h2 className="text-white font-semibold">Ressources du cours</h2>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                  {courseResources.length}
                </span>
              </div>
              <button
                onClick={() => setShowResources(false)}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {courseResources.map(resource => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all duration-200 group"
                >
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                    resource.type === 'file'
                      ? 'bg-blue-500/15 text-blue-400'
                      : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {resource.type === 'file' ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <Link2 className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/90 group-hover:text-white truncate">
                      {resource.title}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {resource.type === 'file'
                        ? resource.file_size ? `${(resource.file_size / 1024).toFixed(0)} KB` : 'Fichier'
                        : 'Lien externe'}
                    </p>
                  </div>
                  <Download className="w-4 h-4 text-white/30 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Desktop only */}
        <aside className="hidden lg:block w-96 xl:w-[420px] h-[calc(100vh-73px)] sticky top-[73px] border-r border-white/5 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Sidebar header */}
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Contenu du cours</h2>
                <ProgressRing progress={courseProgress.percentage} size={48} />
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-white/60">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">{courseProgress.completed} terminées</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">{courseProgress.total} leçons</span>
                </div>
                {remainingMinutes > 0 && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-300">{remainingMinutes} min restantes</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modules list */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {course.modules.map((module: any, moduleIndex: number) => (
                <ModuleAccordion
                  key={module.id}
                  module={module}
                  moduleIndex={moduleIndex}
                  isExpanded={expandedModules[module.id] || false}
                  activeModuleIndex={activeModuleIndex}
                  activeLessonIndex={activeLessonIndex}
                  lessonProgress={lessonProgress}
                  moduleQuiz={moduleQuizzes[module.id]}
                  moduleQuizPassed={moduleQuizPassed[module.id]}
                  onToggle={() => toggleModule(module.id)}
                  onSelectLesson={selectLesson}
                  onOpenQuiz={() => openModuleQuiz(module.id)}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 min-w-0">
          {/* Video Player - only for VIDEO type lessons */}
          {activeLesson?.type === 'VIDEO' && (
            <div className="relative bg-black aspect-video lg:aspect-[16/9] max-h-[50vh] lg:max-h-[60vh]">
              {videoLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                    <p className="text-white/60 text-sm">Chargement de la video...</p>
                  </div>
                </div>
              ) : videoUrl ? (
                <VideoPlayer
                  url={videoUrl}
                  title={activeLesson.title}
                  startTime={lastPlayedTime}
                  onProgress={handleVideoProgress}
                  onEnded={markLessonComplete}
                  className="w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                  <div className="text-center p-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white/30" />
                    </div>
                    <p className="text-white/50 text-sm">Video non disponible</p>
                  </div>
                </div>
              )}

              {/* Video overlay gradient */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Lesson Content */}
          <div className="p-6 lg:p-8 xl:p-10">
            <div className="max-w-3xl mx-auto">
              {/* Lesson header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/10 text-white/70 text-xs font-medium rounded-full">
                    Module {activeModuleIndex + 1}
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/50 text-sm">
                    {activeLesson?.duration || 0} min
                  </span>
                  {activeLesson?.type && activeLesson.type !== 'VIDEO' && (
                    <>
                      <span className="text-white/30">•</span>
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full flex items-center gap-1">
                        {activeLesson.type === 'TEXT' ? <FileText className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
                        {activeLesson.type === 'TEXT' ? 'Lecture' : 'Quiz'}
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                  {activeLesson?.title}
                </h1>

                {activeLesson?.description && (
                  <p className="text-white/60 text-base lg:text-lg leading-relaxed">
                    {activeLesson.description}
                  </p>
                )}
              </div>

              {/* Text content for TEXT/QUIZ lessons */}
              {activeLesson?.content && activeLesson.type !== 'VIDEO' && (
                <div className="mb-8 p-6 lg:p-8 bg-white/5 rounded-2xl border border-white/10">
                  <div
                    className="lesson-content text-white/80 text-base lg:text-lg leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(activeLesson.content) }}
                  />
                </div>
              )}

              {/* Mark Complete Button */}
              <button
                onClick={markLessonComplete}
                disabled={isCompleted}
                className={`
                  w-full py-4 px-6 rounded-2xl font-semibold text-base
                  flex items-center justify-center gap-3
                  transition-all duration-300 transform
                  ${isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
                  }
                `}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Leçon terminée
                    <Sparkles className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Marquer comme terminée
                  </>
                )}
              </button>

              {/* Quiz CTA — visible sur la dernière leçon si un quiz existe */}
              {isLastLesson && courseQuiz && (
                <div className="mt-6 p-6 rounded-2xl bg-orange-500/10 border border-orange-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <HelpCircle className="w-6 h-6 text-orange-400" />
                    <h3 className="text-white font-semibold text-lg">Quiz final</h3>
                  </div>
                  <p className="text-white/60 text-sm mb-4">
                    Terminez toutes les leçons puis passez le quiz final pour valider vos connaissances.
                  </p>
                  <Link
                    href={`/courses/${id}/quiz/${courseQuiz.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 transition-all duration-300"
                  >
                    <HelpCircle className="w-5 h-5" />
                    Commencer le quiz
                  </Link>
                </div>
              )}

              {/* Navigation buttons */}
              {isVideoLesson && !isCompleted && !isLastLesson && (
                <div className="mt-6 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/50">
                      {maxVideoProgress >= VIDEO_COMPLETE_THRESHOLD
                        ? 'Vidéo suffisamment regardée ✓'
                        : `Regardez ${Math.round(VIDEO_COMPLETE_THRESHOLD * 100)}% de la vidéo pour débloquer "Suivant"`}
                    </span>
                    <span className="text-xs font-semibold text-white/60">
                      {Math.round(maxVideoProgress * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        maxVideoProgress >= VIDEO_COMPLETE_THRESHOLD ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.round(maxVideoProgress * 100))}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between gap-4 mt-6">
                <button
                  onClick={goToPreviousLesson}
                  disabled={isFirstLesson}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-xl font-medium
                    transition-all duration-200
                    ${isFirstLesson
                      ? 'opacity-40 cursor-not-allowed bg-white/5 text-white/50'
                      : 'bg-white/10 text-white hover:bg-white/20 active:scale-[0.98]'
                    }
                  `}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:block">Précédent</span>
                </button>

                <button
                  onClick={goToNextLesson}
                  disabled={!canGoNext}
                  title={!videoUnlocked ? `Regardez ${Math.round(VIDEO_COMPLETE_THRESHOLD * 100)}% de la vidéo pour continuer` : undefined}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-xl font-medium
                    transition-all duration-200
                    ${!canGoNext
                      ? 'opacity-40 cursor-not-allowed bg-white/5 text-white/50'
                      : 'bg-white/10 text-white hover:bg-white/20 active:scale-[0.98]'
                    }
                  `}
                >
                  <span className="hidden sm:block">Suivant</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-gray-950/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-between px-4 py-3 safe-area-bottom">
          <button
            onClick={goToPreviousLesson}
            disabled={isFirstLesson}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl
              ${isFirstLesson ? 'opacity-40' : 'bg-white/10 active:bg-white/20'}
            `}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
            <span className="text-white text-sm font-medium">Préc.</span>
          </button>

          {/* Mini progress */}
          <div className="flex-1 mx-4">
            <div className="flex items-center justify-center gap-3">
              <ProgressRing progress={courseProgress.percentage} size={36} strokeWidth={2} />
            </div>
          </div>

          <button
            onClick={goToNextLesson}
            disabled={!canGoNext}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl
              ${!canGoNext ? 'opacity-40' : 'bg-white/10 active:bg-white/20'}
            `}
          >
            <span className="text-white text-sm font-medium">Suiv.</span>
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Lessons Bottom Sheet - Mobile */}
      {showLessons && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowLessons(false)}
          />

          {/* Sheet */}
          <div
            ref={bottomSheetRef}
            className="absolute inset-x-0 bottom-0 bg-gray-900 rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up"
          >
            {/* Handle */}
            <div className="flex justify-center py-4">
              <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Contenu du cours</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-white/50 text-sm">
                    {courseProgress.completed}/{courseProgress.total} terminées
                  </span>
                  <span className="text-emerald-400 text-sm font-semibold">
                    {courseProgress.percentage}%
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowLessons(false)}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${courseProgress.percentage}%` }}
                />
              </div>
            </div>

            {/* Modules List */}
            <div className="flex-1 overflow-y-auto px-4 pb-safe custom-scrollbar">
              {course.modules.map((module: any, moduleIndex: number) => (
                <ModuleAccordion
                  key={module.id}
                  module={module}
                  moduleIndex={moduleIndex}
                  isExpanded={expandedModules[module.id] || moduleIndex === activeModuleIndex}
                  activeModuleIndex={activeModuleIndex}
                  activeLessonIndex={activeLessonIndex}
                  lessonProgress={lessonProgress}
                  moduleQuiz={moduleQuizzes[module.id]}
                  moduleQuizPassed={moduleQuizPassed[module.id]}
                  onToggle={() => toggleModule(module.id)}
                  onSelectLesson={selectLesson}
                  onOpenQuiz={() => { setShowLessons(false); openModuleQuiz(module.id); }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Module Quiz Modal */}
      {activeModuleQuiz && (
        <div className="fixed inset-0 z-[60] bg-gray-950/95 backdrop-blur-sm flex flex-col animate-fade-in">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gray-950/80">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-white font-semibold text-sm">Quiz du module</p>
                {activeModuleQuiz.quizData && (
                  <p className="text-white/50 text-xs">{activeModuleQuiz.quizData.title}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setActiveModuleQuiz(null)}
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto">
            {moduleQuizLoading || !activeModuleQuiz.quizData ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
                  <p className="text-white/60 text-sm">Chargement du quiz...</p>
                </div>
              </div>
            ) : (
              <QuizPlayer
                quiz={{
                  id: activeModuleQuiz.quizId,
                  title: activeModuleQuiz.quizData.title,
                  description: activeModuleQuiz.quizData.description,
                  passingScore: activeModuleQuiz.quizData.passingScore ?? 70,
                  questions: activeModuleQuiz.quizData.questions,
                }}
                quizId={activeModuleQuiz.quizId}
                courseId={id as string}
                isCertifying={false}
                onComplete={(result) => {
                  if (result.passed) {
                    setModuleQuizPassed(prev => ({ ...prev, [activeModuleQuiz.moduleId]: true }));
                    showSuccess('Quiz du module réussi ! Continuez vers le prochain module.');
                  }
                  setActiveModuleQuiz(null);
                }}
                onExit={() => setActiveModuleQuiz(null)}
              />
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }

        .safe-area-bottom {
          padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
        }

        .pb-safe {
          padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Text lesson content styles */
        .lesson-content h1, .lesson-content h2, .lesson-content h3, .lesson-content h4 {
          color: white;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .lesson-content h1 { font-size: 1.5em; }
        .lesson-content h2 { font-size: 1.3em; }
        .lesson-content h3 { font-size: 1.15em; }
        .lesson-content p { margin-bottom: 0.75em; line-height: 1.75; }
        .lesson-content strong, .lesson-content b { color: white; }
        .lesson-content a { color: #60a5fa; text-decoration: underline; }
        .lesson-content a:hover { color: #93bbfd; }
        .lesson-content ul, .lesson-content ol { padding-left: 1.5em; margin-bottom: 0.75em; }
        .lesson-content li { margin-bottom: 0.375em; }
        .lesson-content ul li { list-style-type: disc; }
        .lesson-content ol li { list-style-type: decimal; }
        .lesson-content li::marker { color: #60a5fa; }
        .lesson-content blockquote {
          border-left: 3px solid #3b82f6;
          padding-left: 1em;
          margin: 1em 0;
          color: rgba(255,255,255,0.6);
          font-style: italic;
        }
        .lesson-content code {
          background: rgba(255,255,255,0.1);
          color: #34d399;
          padding: 0.15em 0.4em;
          border-radius: 0.25em;
          font-size: 0.9em;
        }
        .lesson-content pre {
          background: rgba(0,0,0,0.3);
          padding: 1em;
          border-radius: 0.75em;
          overflow-x: auto;
          margin: 1em 0;
        }
        .lesson-content pre code {
          background: none;
          padding: 0;
        }
        .lesson-content hr {
          border-color: rgba(255,255,255,0.1);
          margin: 1.5em 0;
        }
        .lesson-content img {
          border-radius: 0.75em;
          max-width: 100%;
          margin: 1em 0;
        }
        .lesson-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }
        .lesson-content th, .lesson-content td {
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.5em 0.75em;
          text-align: left;
        }
        .lesson-content th {
          background: rgba(255,255,255,0.05);
          color: white;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
