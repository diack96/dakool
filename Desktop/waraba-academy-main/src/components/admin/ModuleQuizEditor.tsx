'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, X, HelpCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface QuizAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'text';
  points: number;
  orderIndex: number;
  answers: QuizAnswer[];
}

interface ExistingQuizData {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimit?: number;
  questions: Array<{
    id?: string;
    questionText: string;
    questionType: 'multiple_choice' | 'true_false' | 'text';
    points: number;
    orderIndex: number;
    answers: Array<{
      id?: string;
      text: string;
      isCorrect: boolean;
      orderIndex: number;
    }>;
  }>;
}

interface ModuleQuizEditorProps {
  courseId: string;
  moduleId?: string;
  moduleTitle?: string;
  existingQuizId?: string;
  existingQuizData?: ExistingQuizData;
  onSave: (quizData: {
    id?: string;
    title: string;
    description: string;
    passingScore: number;
    timeLimit?: number;
    questions: Array<{
      questionText: string;
      questionType: 'multiple_choice' | 'true_false' | 'text';
      points: number;
      orderIndex: number;
      answers: Array<{
        text: string;
        isCorrect: boolean;
        orderIndex: number;
      }>;
    }>;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function ModuleQuizEditor({
  courseId: _courseId,
  moduleId: _moduleId,
  moduleTitle,
  existingQuizId,
  existingQuizData,
  onSave,
  onCancel,
}: ModuleQuizEditorProps) {
  const [title, setTitle] = useState(
    existingQuizData?.title || (moduleTitle ? `Quiz - ${moduleTitle}` : 'Nouveau Quiz')
  );
  const [description, setDescription] = useState(existingQuizData?.description || '');
  const [passingScore, setPassingScore] = useState(existingQuizData?.passingScore || 70);
  const [timeLimit, setTimeLimit] = useState<number | undefined>(existingQuizData?.timeLimit);
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    existingQuizData?.questions?.map(q => ({
      id: q.id || crypto.randomUUID(),
      questionText: q.questionText,
      questionType: q.questionType,
      points: q.points,
      orderIndex: q.orderIndex,
      answers: q.answers.map(a => ({
        id: a.id || crypto.randomUUID(),
        text: a.text,
        isCorrect: a.isCorrect,
        orderIndex: a.orderIndex,
      })),
    })) || []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      questionText: '',
      questionType: 'multiple_choice',
      points: 1,
      orderIndex: questions.length,
      answers: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId).map((q, index) => ({
      ...q,
      orderIndex: index,
    })));
  };

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const updated = { ...q, ...updates };
        // Si on change le type en true_false, créer automatiquement les réponses
        if (updates.questionType === 'true_false' && updated.answers.length === 0) {
          updated.answers = [
            { id: crypto.randomUUID(), text: 'Vrai', isCorrect: false, orderIndex: 0 },
            { id: crypto.randomUUID(), text: 'Faux', isCorrect: false, orderIndex: 1 },
          ];
        }
        // Si on change en text, supprimer les réponses
        if (updates.questionType === 'text') {
          updated.answers = [];
        }
        // Si on change en multiple_choice et qu'il n'y a pas de réponses, en ajouter une
        if (updates.questionType === 'multiple_choice' && updated.answers.length === 0) {
          updated.answers = [
            { id: crypto.randomUUID(), text: '', isCorrect: false, orderIndex: 0 },
          ];
        }
        return updated;
      }
      return q;
    }));
  };

  const addAnswer = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: [
            ...q.answers,
            {
              id: crypto.randomUUID(),
              text: '',
              isCorrect: false,
              orderIndex: q.answers.length,
            },
          ],
        };
      }
      return q;
    }));
  };

  const removeAnswer = (questionId: string, answerId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.filter(a => a.id !== answerId).map((a, index) => ({
            ...a,
            orderIndex: index,
          })),
        };
      }
      return q;
    }));
  };

  const updateAnswer = (questionId: string, answerId: string, updates: Partial<QuizAnswer>) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.map(a => {
            if (a.id === answerId) {
              return { ...a, ...updates };
            }
            // Pour true/false, s'assurer qu'une seule réponse est correcte
            if (q.questionType === 'true_false' && updates.isCorrect) {
              return { ...a, isCorrect: false };
            }
            return a;
          }),
        };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    setError('');
    
    // Validation
    if (!title.trim()) {
      setError('Le titre du quiz est requis');
      return;
    }

    if (questions.length === 0) {
      setError('Ajoutez au moins une question au quiz');
      return;
    }

    // Valider chaque question
    for (const question of questions) {
      if (!question.questionText.trim()) {
        setError(`La question ${questions.indexOf(question) + 1} doit avoir un texte`);
        return;
      }

      if (question.questionType === 'multiple_choice' || question.questionType === 'true_false') {
        if (question.answers.length < 2) {
          setError(`La question ${questions.indexOf(question) + 1} doit avoir au moins 2 réponses`);
          return;
        }

        const hasCorrectAnswer = question.answers.some(a => a.isCorrect);
        if (!hasCorrectAnswer) {
          setError(`La question ${questions.indexOf(question) + 1} doit avoir au moins une réponse correcte`);
          return;
        }

        // Valider que chaque réponse a un texte
        for (const answer of question.answers) {
          if (!answer.text.trim()) {
            setError(`La question ${questions.indexOf(question) + 1} a une réponse vide`);
            return;
          }
        }
      }
    }

    setSaving(true);
    try {
      await onSave({
        id: existingQuizId,
        title: title.trim(),
        description: description.trim(),
        passingScore,
        timeLimit: timeLimit || undefined,
        questions: questions.map((q, index) => ({
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          points: q.points,
          orderIndex: index,
          answers: q.answers.map((a, aIndex) => ({
            text: a.text.trim(),
            isCorrect: a.isCorrect,
            orderIndex: aIndex,
          })),
        })),
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde du quiz');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6 border-l-4 border-l-purple-500">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <HelpCircle className="w-5 h-5 mr-2 text-purple-600" />
          {existingQuizData ? 'Modifier le Quiz' : moduleTitle ? 'Créer un Quiz pour le Module' : 'Créer un Quiz'}
        </h3>
        <p className="text-sm text-gray-600">
          {existingQuizData
            ? 'Modifiez les questions et réponses du quiz'
            : 'Créez un quiz pour évaluer les connaissances acquises'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Informations du quiz */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre du quiz <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Quiz Module 1 - Fondamentaux"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnel)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description du quiz..."
            rows={2}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Score de passage (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(Math.min(100, Math.max(0, Number(e.target.value))))}
              min="0"
              max="100"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Score minimum pour réussir (par défaut: 70%)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite de temps (minutes) - Optionnel
            </label>
            <input
              type="number"
              value={timeLimit || ''}
              onChange={(e) => setTimeLimit(e.target.value ? Number(e.target.value) : undefined)}
              min="1"
              placeholder="Pas de limite"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Laissez vide pour pas de limite de temps</p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-gray-900">
            Questions ({questions.length})
          </h4>
          <button
            onClick={addQuestion}
            className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter une question
          </button>
        </div>

        {questions.length === 0 && (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
            <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune question. Cliquez sur "Ajouter une question" pour commencer.</p>
          </div>
        )}

        {questions.map((question, qIndex) => (
          <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-600">Question {qIndex + 1}</span>
                <select
                  value={question.questionType}
                  onChange={(e) => updateQuestion(question.id, { questionType: e.target.value as any })}
                  className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                >
                  <option value="multiple_choice">QCM (Choix multiples)</option>
                  <option value="true_false">Vrai/Faux</option>
                  <option value="text">Texte libre</option>
                </select>
                <input
                  type="number"
                  value={question.points}
                  onChange={(e) => updateQuestion(question.id, { points: Math.max(1, Number(e.target.value)) })}
                  min="1"
                  className="w-20 text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                  placeholder="Points"
                />
                <span className="text-xs text-gray-500">point(s)</span>
              </div>
              <button
                onClick={() => removeQuestion(question.id)}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Supprimer la question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={question.questionText}
              onChange={(e) => updateQuestion(question.id, { questionText: e.target.value })}
              placeholder="Entrez votre question ici..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500"
            />

            {/* Réponses pour QCM et Vrai/Faux */}
            {(question.questionType === 'multiple_choice' || question.questionType === 'true_false') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Réponses {question.questionType === 'true_false' && '(Cochez la bonne réponse)'}
                  </label>
                  {question.questionType === 'multiple_choice' && (
                    <button
                      onClick={() => addAnswer(question.id)}
                      className="text-xs text-purple-600 hover:text-purple-700 flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Ajouter une réponse
                    </button>
                  )}
                </div>

                {question.answers.map((answer, aIndex) => (
                  <div key={answer.id} className="flex items-center space-x-2 bg-white p-2 rounded border border-gray-200">
                    <input
                      type="checkbox"
                      checked={answer.isCorrect}
                      onChange={(e) => updateAnswer(question.id, answer.id, { isCorrect: e.target.checked })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      title="Réponse correcte"
                    />
                    <input
                      type="text"
                      value={answer.text}
                      onChange={(e) => updateAnswer(question.id, answer.id, { text: e.target.value })}
                      placeholder={`Réponse ${aIndex + 1}...`}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                      readOnly={question.questionType === 'true_false'}
                    />
                    {question.questionType === 'multiple_choice' && question.answers.length > 2 && (
                      <button
                        onClick={() => removeAnswer(question.id, answer.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                        title="Supprimer cette réponse"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                {question.questionType === 'multiple_choice' && question.answers.length < 2 && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Ajoutez au moins 2 réponses pour cette question
                  </p>
                )}
              </div>
            )}

            {/* Message pour texte libre */}
            {question.questionType === 'text' && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Les questions à texte libre nécessitent une correction manuelle.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={saving}
        >
          <X className="w-4 h-4 inline mr-2" />
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving || questions.length === 0}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer le quiz
            </>
          )}
        </button>
      </div>
    </Card>
  );
}

