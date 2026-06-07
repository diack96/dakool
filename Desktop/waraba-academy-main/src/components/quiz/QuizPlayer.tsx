'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  AlertCircle,
  Loader2,
  Award,
  Download,
  UserCircle,
  XCircle,
} from 'lucide-react';

// ─── Data types ──────────────────────────────────────────────────────────────

/** Answer option with its UUID (required for real API submission) */
export interface QuizAnswer {
  id: string;
  text: string;
}

/**
 * Quiz question.
 * If `answers` is provided the component will use real UUID-based submission.
 * `options` and `correctAnswer` (text) are kept for backward compatibility /
 * client-side feedback display.
 */
export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  /** Full answer objects with UUIDs — required for real API submission */
  answers?: QuizAnswer[];
  /** Plain-text options (backward compat / client-side display fallback) */
  options?: string[];
  /** Text of the correct answer — used for instant feedback only */
  correctAnswer: string;
  points: number;
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  passingScore?: number; // percentage threshold, default 70
  questions: QuizQuestion[];
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  passed: boolean;
  percentage: number;
  certificateId?: string | null;
  profileIncomplete?: boolean;
}

export interface QuizPlayerProps {
  quiz: Quiz;
  /** Used to submit to the real API — required for certificate generation */
  quizId?: string;
  /** Needed so the results screen can link to the right certificate URL */
  courseId?: string;
  /** Whether the course delivers a certificate on completion */
  isCertifying?: boolean;
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Resolve the display options for a question */
function getDisplayOptions(question: QuizQuestion): string[] {
  if (question.answers && question.answers.length > 0) {
    return question.answers.map((a) => a.text);
  }
  if (question.type === 'true_false') return ['Vrai', 'Faux'];
  return question.options ?? [];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function QuizPlayer({
  quiz,
  quizId,
  courseId: _courseId,
  isCertifying = false,
  onComplete,
  onExit,
}: QuizPlayerProps) {
  const [currentIdx, setCurrentIdx]       = useState(0);
  const [selectedTexts, setSelectedTexts] = useState<(string | null)[]>([]);
  const [timeSpent, setTimeSpent]         = useState(0);
  const [isPaused, setIsPaused]           = useState(false);
  const [showFeedback, setShowFeedback]   = useState(false);
  const [isCorrect, setIsCorrect]         = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [result, setResult]               = useState<QuizResult | null>(null);

  const currentQuestion  = quiz.questions[currentIdx];
  const totalQuestions   = quiz.questions.length;
  const progress         = ((currentIdx + 1) / totalQuestions) * 100;
  const selectedText     = selectedTexts[currentIdx] ?? null;
  const passingThreshold = quiz.passingScore ?? 70;

  // Timer
  useEffect(() => {
    if (isPaused || result) return;
    const id = setInterval(() => setTimeSpent((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isPaused, result]);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Question introuvable.</p>
      </div>
    );
  }

  // ── Answer selection ──────────────────────────────────────────────────────

  const handleSelect = (text: string) => {
    if (showFeedback) return;
    setSelectedTexts((prev) => {
      const next = [...prev];
      next[currentIdx] = text;
      return next;
    });
  };

  // ── Validate answer + show feedback ──────────────────────────────────────

  const handleValidate = () => {
    if (!selectedText) return;
    setIsCorrect(selectedText === currentQuestion.correctAnswer);
    setShowFeedback(true);
  };

  // ── Navigate to next question ─────────────────────────────────────────────

  const handleNext = () => {
    if (!showFeedback) { handleValidate(); return; }

    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((i) => i + 1);
      setShowFeedback(false);
      setIsCorrect(null);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setShowFeedback(false);
      setIsCorrect(null);
    }
  };

  // ── Build API payload ─────────────────────────────────────────────────────

  function buildApiPayload(): Array<{ questionId: string; answerId: string }> {
    return quiz.questions
      .map((q, idx) => {
        const text = selectedTexts[idx];
        if (!text) return null;
        // Resolve UUID from answers array if available, else use text as fallback
        const answerId = q.answers?.find((a) => a.text === text)?.id ?? text;
        return { questionId: q.id, answerId };
      })
      .filter((x): x is { questionId: string; answerId: string } => x !== null);
  }

  // ── Client-side score (for immediate display) ─────────────────────────────

  function computeClientScore(): { correctAnswers: number; percentage: number; passed: boolean } {
    let correct = 0;
    let earned  = 0;
    let total   = 0;

    quiz.questions.forEach((q, idx) => {
      total  += q.points;
      const txt = selectedTexts[idx];
      if (txt && txt === q.correctAnswer) {
        correct++;
        earned += q.points;
      }
    });

    const pct    = total > 0 ? Math.round((earned / total) * 100) : 0;
    return { correctAnswers: correct, percentage: pct, passed: pct >= passingThreshold };
  }

  // ── Submit to real API ────────────────────────────────────────────────────

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);

    const clientScore = computeClientScore();

    // If no quizId provided, fall back to client-side result
    if (!quizId) {
      const finalResult: QuizResult = {
        score: clientScore.percentage,
        totalQuestions,
        correctAnswers: clientScore.correctAnswers,
        timeSpent,
        passed: clientScore.passed,
        percentage: clientScore.percentage,
      };
      setResult(finalResult);
      onComplete(finalResult);
      setIsSubmitting(false);
      return;
    }

    // ── Real API submission ──
    try {
      const res = await fetch('/api/quiz/attempt', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          answers: buildApiPayload(),
          timeTaken: timeSpent,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      const apiResult = data.result ?? {};

      const finalResult: QuizResult = {
        score:          apiResult.percentage  ?? clientScore.percentage,
        totalQuestions,
        correctAnswers: clientScore.correctAnswers,
        timeSpent,
        passed:         apiResult.passed      ?? clientScore.passed,
        percentage:     apiResult.percentage  ?? clientScore.percentage,
        certificateId:  apiResult.certificateId  ?? null,
        profileIncomplete: apiResult.profileIncomplete ?? false,
      };

      setResult(finalResult);
      onComplete(finalResult);
    } catch (err) {
      console.error('Quiz API submission failed, falling back to client score:', err);
      const finalResult: QuizResult = {
        score: clientScore.percentage,
        totalQuestions,
        correctAnswers: clientScore.correctAnswers,
        timeSpent,
        passed: clientScore.passed,
        percentage: clientScore.percentage,
      };
      setResult(finalResult);
      onComplete(finalResult);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedTexts([]);
    setTimeSpent(0);
    setIsPaused(false);
    setShowFeedback(false);
    setIsCorrect(null);
    setResult(null);
  };

  // ─── Results screen ───────────────────────────────────────────────────────

  if (result) {
    const showCertBtn = result.passed && isCertifying && result.certificateId;
    const showProfilePrompt = result.passed && isCertifying && !result.certificateId && result.profileIncomplete;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center">
          {/* Icon */}
          <div className="mb-6">
            {result.passed ? (
              <div className="relative inline-block">
                <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
                {isCertifying && result.certificateId && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                    ✓
                  </span>
                )}
              </div>
            ) : (
              <AlertCircle className="w-20 h-20 mx-auto text-orange-500 mb-4" />
            )}

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {result.passed ? 'Félicitations !' : 'Continuez vos efforts'}
            </h2>
            <p className="text-gray-500 text-sm">
              {result.passed
                ? isCertifying
                  ? 'Vous avez réussi ce cours certifiant.'
                  : 'Vous avez réussi le quiz !'
                : `Score requis : ${passingThreshold}%. Votre score : ${result.percentage}%.`}
            </p>
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-blue-50 p-3 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{result.percentage}%</p>
              <p className="text-xs text-blue-500 mt-0.5">Score</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
              <p className="text-xs text-green-500 mt-0.5">Correctes</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-2xl font-bold text-gray-700">{formatTime(result.timeSpent)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Temps</p>
            </div>
          </div>

          {/* ── Certificate CTA (cours certifiant + réussite) ── */}
          {showCertBtn && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Award className="w-5 h-5 text-yellow-600" />
                <p className="font-semibold text-yellow-800 text-sm">Votre certificat est prêt !</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href={`/certificates/${result.certificateId}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  <Award className="w-4 h-4" />
                  Voir mon certificat
                </Link>
                <Link
                  href={`/api/certificates/${result.certificateId}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-yellow-300 hover:bg-yellow-50 text-yellow-800 rounded-lg font-semibold text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Télécharger PDF
                </Link>
              </div>
            </div>
          )}

          {/* Profile incomplete prompt */}
          {showProfilePrompt && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl text-left">
              <div className="flex items-start gap-3">
                <UserCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-800 text-sm">Complétez votre profil</p>
                  <p className="text-orange-700 text-xs mt-1">
                    Pour générer votre certificat, veuillez ajouter votre prénom et nom dans votre profil.
                  </p>
                  <Link
                    href="/profile"
                    className="inline-block mt-2 text-xs font-semibold text-orange-700 underline hover:text-orange-900"
                  >
                    Mettre à jour mon profil →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Failure CTA — certificate available if certifying but failed */}
          {!result.passed && isCertifying && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
              <XCircle className="w-4 h-4 inline mr-1 text-blue-400" />
              Un score de <strong>{passingThreshold}%</strong> minimum est requis pour obtenir le certificat.
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            {!result.passed && (
              <button
                onClick={resetQuiz}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Recommencer le quiz
              </button>
            )}
            <button
              onClick={onExit}
              className="w-full px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold transition-colors text-sm"
            >
              {result.passed ? 'Retour au cours' : 'Retour aux cours'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Quiz screen ──────────────────────────────────────────────────────────

  const displayOptions = getDisplayOptions(currentQuestion);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-sm text-gray-500">{quiz.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-mono text-sm font-medium text-gray-700">
                  {formatTime(timeSpent)}
                </span>
              </div>
              <button
                onClick={() => setIsPaused((p) => !p)}
                className="p-2 text-gray-500 hover:text-gray-800 transition-colors"
                title={isPaused ? 'Reprendre' : 'Pause'}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Question {currentIdx + 1} / {totalQuestions}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                Question {currentQuestion.order}
              </span>
              <span className="text-xs text-gray-400">
                {currentQuestion.points} pt{currentQuestion.points > 1 ? 's' : ''}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>

            {/* Answer options */}
            <div className={currentQuestion.type === 'true_false' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
              {displayOptions.map((option, i) => {
                const isSelected      = selectedText === option;
                const isCorrectAns    = option === currentQuestion.correctAnswer;
                const showResult      = showFeedback && (isSelected || isCorrectAns);

                const baseClass = 'w-full text-left p-4 rounded-xl border-2 transition-all';
                const stateClass = showResult
                  ? isCorrectAns
                    ? 'border-green-400 bg-green-50 text-green-800'
                    : isSelected
                    ? 'border-red-400 bg-red-50 text-red-800'
                    : 'border-gray-200 opacity-60'
                  : isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
                const cursorClass = showFeedback ? 'cursor-not-allowed' : 'cursor-pointer';

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(option)}
                    disabled={showFeedback}
                    className={`${baseClass} ${stateClass} ${cursorClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          showResult
                            ? isCorrectAns ? 'border-green-500 bg-green-500' : isSelected ? 'border-red-500 bg-red-500' : 'border-gray-300'
                            : isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}
                      >
                        {showResult && isCorrectAns && <CheckCircle className="w-3 h-3 text-white" />}
                        {showResult && isSelected && !isCorrectAns && <span className="text-white text-xs font-bold">✕</span>}
                        {!showResult && isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-medium">{option}</span>
                      {showResult && isCorrectAns && (
                        <span className="ml-auto text-xs font-semibold text-green-600">✓ Correct</span>
                      )}
                      {showResult && isSelected && !isCorrectAns && (
                        <span className="ml-auto text-xs font-semibold text-red-600">✕ Incorrect</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Instant feedback */}
            {showFeedback && (
              <div className={`mt-6 p-4 rounded-xl border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {isCorrect
                    ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    : <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                  <div>
                    <p className={`font-semibold text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? 'Bonne réponse ! 🎉' : 'Mauvaise réponse'}
                    </p>
                    {!isCorrect && (
                      <p className="text-xs text-red-700 mt-1">
                        La bonne réponse est : <strong>{currentQuestion.correctAnswer}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              Précédente
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onExit}
                className="px-5 py-2.5 text-gray-500 hover:text-gray-700 transition-colors font-medium text-sm"
              >
                Quitter
              </button>

              <button
                onClick={handleNext}
                disabled={(!selectedText && !showFeedback) || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Envoi en cours…
                  </>
                ) : currentIdx === totalQuestions - 1 ? (
                  'Terminer le quiz'
                ) : (
                  'Question suivante'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
