'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import QuizPlayer, { QuizResult } from '@/components/quiz/QuizPlayer';
import { Loader2, AlertCircle } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  options?: string[];
  correctAnswer: string;
  points: number;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

export default function QuizPage () {
  const params = useParams();
  const router = useRouter();
  const { user: _user, loading: isLoading } = useAuth();
  const isAuthenticated = !!_user;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isCertifying, setIsCertifying] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const autoRedirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const courseId = params.id as string;
  const quizId = params.quizId as string;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isAuthenticated && !isLoading) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (isAuthenticated) {
      fetchQuizAndCourse();
    }
  }, [isAuthenticated, isLoading, courseId, quizId, router]);

  const fetchQuizAndCourse = async () => {
    try {
      setIsLoadingQuiz(true);
      const token = localStorage.getItem('accessToken');

      // Fetch quiz and course in parallel
      const [quizRes, courseRes] = await Promise.all([
        fetch(`/api/courses/${courseId}/quizzes/${quizId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/courses/${courseId}`, { credentials: 'include' }),
      ]);

      if (!quizRes.ok) {
        if (quizRes.status === 403) {
          setError('Vous devez être inscrit à ce cours pour accéder aux quiz');
        } else if (quizRes.status === 404) {
          setError('Quiz non trouvé');
        } else {
          setError('Erreur lors du chargement du quiz');
        }
        return;
      }

      const quizData = await quizRes.json();
      setQuiz(quizData.quiz);

      if (courseRes.ok) {
        const courseData = await courseRes.json();
        // API wraps data in a `data` key via successResponse()
        const course = courseData.data?.course || courseData.course;
        // certificate: false means not certifying; true or null/undefined means certifying
        setIsCertifying(course?.certificate !== false);
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Called by QuizPlayer after API submission — QuizPlayer handles /api/quiz/attempt itself
  const handleQuizComplete = (result: QuizResult) => {
    if (result.passed) {
      setQuizPassed(true);
      // Redirect to congratulations page after showing result briefly
      const certParam = result.certificateId ? `&certificateId=${result.certificateId}` : '';
      autoRedirectTimer.current = setTimeout(() => {
        router.push(`/courses/${courseId}/success?completed=true${certParam}`);
      }, 1500);
    }
    // If failed: stay on QuizPlayer result screen (retry available)
  };

  const handleExitQuiz = () => {
    // Cancel any pending auto-redirect to avoid double navigation
    if (autoRedirectTimer.current) {
      clearTimeout(autoRedirectTimer.current);
      autoRedirectTimer.current = null;
    }
    if (quizPassed) {
      router.push(`/courses/${courseId}/success?completed=true`);
    } else {
      router.push(`/courses/${courseId}/learn`);
    }
  };

  if (isLoading || isLoadingQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur d&apos;accès</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour au cours
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Quiz non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <QuizPlayer
      quiz={quiz}
      quizId={quizId}
      courseId={courseId}
      isCertifying={isCertifying}
      onComplete={handleQuizComplete}
      onExit={handleExitQuiz}
    />
  );
}
