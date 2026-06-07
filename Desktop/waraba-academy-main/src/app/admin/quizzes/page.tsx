'use client';

import { useState, useEffect } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/admin/Toast';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Clock,
  Users,
  CheckCircle,
  RefreshCw,
  Save,
  X,
  AlertCircle,
} from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitle: string;
  questionCount: number;
  timeLimit: number | null;
  passingScore: number;
  status: string;
  createdAt: string;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface Course {
  id: string;
  title: string;
}

export default function QuizzesAdminPage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<{
    id?: string;
    title: string;
    description: string;
    courseId: string;
    timeLimit: string;
    passingScore: number;
    questions: Question[];
  } | null>(null);
  const [savingQuiz, setSavingQuiz] = useState(false);

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/admin/quizzes', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        const courseList = data.courses || data;
        setCourses(Array.isArray(courseList) ? courseList.map((c: any) => ({ id: c.id, title: c.title })) : []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des cours:', error);
    }
  };

  const openNewQuizForm = () => {
    setEditingQuiz({
      title: '',
      description: '',
      courseId: '',
      timeLimit: '',
      passingScore: 70,
      questions: [],
    });
    setShowAddForm(true);
  };

  const openEditQuizForm = async (quiz: Quiz) => {
    // Load full quiz with questions from the detail endpoint
    try {
      const res = await fetch(`/api/admin/quizzes/${quiz.id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Quiz non trouvé');
      const data = await res.json();
      const fullQuiz = data.quiz || data;

      // Transform API questions to frontend format
      const questions: Question[] = (fullQuiz.questions || []).map((q: any, idx: number) => {
        const answers = q.answers || [];
        const correctAnswer = answers.find((a: any) => a.isCorrect || a.is_correct);
        return {
          id: q.id || `q-${idx}`,
          type: q.questionType || q.question_type || 'multiple_choice',
          question: q.questionText || q.question_text || '',
          options: answers.map((a: any) => a.text || a.answer_text || ''),
          correctAnswer: correctAnswer ? (correctAnswer.text || correctAnswer.answer_text || '') : '',
          points: q.points || 1,
        };
      });

      setEditingQuiz({
        id: quiz.id,
        title: fullQuiz.title || quiz.title,
        description: fullQuiz.description || quiz.description || '',
        courseId: fullQuiz.courseId || fullQuiz.course_id || quiz.courseId,
        timeLimit: fullQuiz.timeLimit || fullQuiz.time_limit ? String(fullQuiz.timeLimit || fullQuiz.time_limit) : '',
        passingScore: fullQuiz.passingScore || fullQuiz.passing_score || quiz.passingScore,
        questions,
      });
      setShowAddForm(true);
    } catch {
      toastError('Erreur lors du chargement du quiz');
    }
  };

  const handleSaveQuiz = async () => {
    if (!editingQuiz) return;

    if (!editingQuiz.title.trim()) {
      toastError('Le titre est requis');
      return;
    }
    if (!editingQuiz.courseId) {
      toastError('Veuillez sélectionner un cours');
      return;
    }
    if (editingQuiz.questions.length === 0) {
      toastError('Ajoutez au moins une question');
      return;
    }

    // Validate questions
    for (let i = 0; i < editingQuiz.questions.length; i++) {
      const q = editingQuiz.questions[i]!;
      if (!q.question.trim()) {
        toastError(`La question ${i + 1} est vide`);
        return;
      }
      if (q.type === 'multiple_choice') {
        const nonEmptyOptions = q.options.filter(o => o.trim());
        if (nonEmptyOptions.length < 2) {
          toastError(`La question ${i + 1} doit avoir au moins 2 options`);
          return;
        }
        if (!q.correctAnswer) {
          toastError(`Sélectionnez la bonne réponse pour la question ${i + 1}`);
          return;
        }
      }
    }

    setSavingQuiz(true);

    // Transform to API format
    const apiPayload = {
      course_id: editingQuiz.courseId,
      title: editingQuiz.title.trim(),
      description: editingQuiz.description.trim(),
      passing_score: editingQuiz.passingScore,
      time_limit: editingQuiz.timeLimit ? parseInt(editingQuiz.timeLimit) : null,
      questions: editingQuiz.questions.map((q, qIdx) => {
        const answers = q.type === 'multiple_choice'
          ? q.options.filter(o => o.trim()).map((opt, oIdx) => ({
              text: opt,
              isCorrect: opt === q.correctAnswer,
              orderIndex: oIdx,
            }))
          : q.type === 'true_false'
            ? [
                { text: 'Vrai', isCorrect: q.correctAnswer === 'true', orderIndex: 0 },
                { text: 'Faux', isCorrect: q.correctAnswer === 'false', orderIndex: 1 },
              ]
            : [{ text: q.correctAnswer || '', isCorrect: true, orderIndex: 0 }];

        return {
          questionText: q.question,
          questionType: q.type === 'text' ? 'text' : q.type,
          points: q.points || 1,
          orderIndex: qIdx,
          answers,
        };
      }),
    };

    try {
      const isEditing = !!editingQuiz.id;
      const url = isEditing ? `/api/admin/quizzes/${editingQuiz.id}` : '/api/admin/quizzes';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.details
          ? (Array.isArray(errData.details) ? errData.details.map((d: any) => d.message || d.field).join(', ') : errData.details)
          : errData.error || 'Erreur lors de la sauvegarde';
        throw new Error(msg);
      }

      toastSuccess(isEditing ? 'Quiz mis à jour' : 'Quiz créé');
      await fetchQuizzes();
      setShowAddForm(false);
      setEditingQuiz(null);
    } catch (error: any) {
      toastError(error.message || 'Erreur lors de la sauvegarde du quiz');
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) return;

    try {
      const response = await fetch(`/api/admin/quizzes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toastSuccess('Quiz supprimé');
        await fetchQuizzes();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du quiz:', error);
    }
  };

  const addQuestion = () => {
    if (!editingQuiz) return;

    const newQuestion: Question = {
      id: `new-${Date.now()}`,
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
    };

    setEditingQuiz({
      ...editingQuiz,
      questions: [...editingQuiz.questions, newQuestion],
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    if (!editingQuiz) return;

    setEditingQuiz({
      ...editingQuiz,
      questions: editingQuiz.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q,
      ),
    });
  };

  const removeQuestion = (questionId: string) => {
    if (!editingQuiz) return;

    setEditingQuiz({
      ...editingQuiz,
      questions: editingQuiz.questions.filter(q => q.id !== questionId),
    });
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestion des Quiz</h1>
          <button
            onClick={openNewQuizForm}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer un Quiz
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Quiz</p>
                <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Publiés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quizzes.filter(q => q.status === 'published').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quizzes.reduce((sum, q) => sum + (q.questionCount || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Liste des Quiz */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">Quiz</th>
                  <th className="text-left py-3 px-4 font-semibold">Cours</th>
                  <th className="text-left py-3 px-4 font-semibold">Questions</th>
                  <th className="text-left py-3 px-4 font-semibold">Durée</th>
                  <th className="text-left py-3 px-4 font-semibold">Score Min</th>
                  <th className="text-left py-3 px-4 font-semibold">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{quiz.title}</p>
                        <p className="text-sm text-gray-600">{quiz.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{quiz.courseTitle}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium">{quiz.questionCount}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {quiz.timeLimit ? `${quiz.timeLimit} min` : 'Illimité'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium">{quiz.passingScore}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        quiz.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {quiz.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditQuizForm(quiz)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {quizzes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun quiz créé pour le moment
              </div>
            )}
          </div>
        </Card>

        {/* Formulaire d'ajout/édition de Quiz */}
        {showAddForm && editingQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {editingQuiz.id ? 'Modifier le Quiz' : 'Créer un nouveau Quiz'}
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Titre du quiz"
                    value={editingQuiz.title}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={editingQuiz.courseId}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, courseId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un cours</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  placeholder="Description du quiz"
                  value={editingQuiz.description}
                  onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Durée en minutes (optionnel)</label>
                    <input
                      type="number"
                      placeholder="Ex: 30"
                      value={editingQuiz.timeLimit}
                      onChange={(e) => setEditingQuiz({ ...editingQuiz, timeLimit: e.target.value })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Score minimum (%)</label>
                    <input
                      type="number"
                      value={editingQuiz.passingScore}
                      onChange={(e) => setEditingQuiz({ ...editingQuiz, passingScore: parseInt(e.target.value) || 70 })}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Gestion des Questions */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium">Questions ({editingQuiz.questions.length})</h4>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Ajouter une question
                    </button>
                  </div>

                  {editingQuiz.questions.length === 0 && (
                    <div className="flex items-center gap-2 p-4 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Ajoutez au moins une question pour pouvoir enregistrer le quiz
                    </div>
                  )}

                  <div className="space-y-4">
                    {editingQuiz.questions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium">Question {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeQuestion(question.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <select
                            value={question.type}
                            onChange={(e) => updateQuestion(question.id, { type: e.target.value as any })}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="multiple_choice">QCM</option>
                            <option value="true_false">Vrai/Faux</option>
                            <option value="text">Texte libre</option>
                          </select>
                          <input
                            type="number"
                            placeholder="Points"
                            value={question.points}
                            onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <textarea
                          placeholder="Question"
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                        />

                        {question.type === 'multiple_choice' && (
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct_${question.id}`}
                                  checked={question.correctAnswer === option && option !== ''}
                                  onChange={() => updateQuestion(question.id, { correctAnswer: option })}
                                  className="text-blue-600"
                                />
                                <input
                                  type="text"
                                  placeholder={`Option ${optIndex + 1}`}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options];
                                    const oldVal = newOptions[optIndex];
                                    newOptions[optIndex] = e.target.value;
                                    const updates: Partial<Question> = { options: newOptions };
                                    if (question.correctAnswer === oldVal) {
                                      updates.correctAnswer = e.target.value;
                                    }
                                    updateQuestion(question.id, updates);
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === 'true_false' && (
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct_${question.id}`}
                                value="true"
                                checked={question.correctAnswer === 'true'}
                                onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                                className="text-blue-600"
                              />
                              Vrai
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct_${question.id}`}
                                value="false"
                                checked={question.correctAnswer === 'false'}
                                onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                                className="text-blue-600"
                              />
                              Faux
                            </label>
                          </div>
                        )}

                        {question.type === 'text' && (
                          <input
                            type="text"
                            placeholder="Réponse correcte"
                            value={question.correctAnswer}
                            onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingQuiz(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 inline mr-2" />
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuiz}
                    disabled={savingQuiz}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingQuiz ? (
                      <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 inline mr-2" />
                    )}
                    {editingQuiz.id ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
