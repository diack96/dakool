'use client';

import { useState } from 'react';
import { Sparkles, Wand2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration: number;
  order: number;
  videoUrl?: string;
  pdfUrl?: string;
  fileUrl?: string;
  type?: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT';
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration?: string;
  lessons?: number;
  lessonList?: Lesson[];
  order?: number;
}

interface SyllabusGeneratorProps {
  courseTitle: string;
  courseDescription: string;
  courseLevel: string;
  courseDuration: number; // en minutes
  currentModules: Module[];
  onModulesGenerated: (_modules: Module[]) => void;
}

export default function SyllabusGenerator ({
  courseTitle,
  courseDescription,
  courseLevel,
  courseDuration,
  currentModules,
  onModulesGenerated,
}: SyllabusGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);

  // Générer un syllabus intelligent basé sur le contenu du cours
  const generateIntelligentSyllabus = async () => {
    setIsGenerating(true);
    setError('');

    try {
      // Analyser le titre et la description pour générer des modules pertinents
      const keywords = extractKeywords(courseTitle, courseDescription);
      const modules = createModulesFromKeywords(keywords, courseLevel, courseDuration);

      // S'assurer que tous les modules ont un order défini
      const modulesWithOrder = modules.map((m, index) => ({
        ...m,
        order: m.order || index + 1,
        lessons: m.lessons || (m.lessonList ? m.lessonList.length : 0),
      }));

      onModulesGenerated(modulesWithOrder);
      setShowGenerator(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération du syllabus');
    } finally {
      setIsGenerating(false);
    }
  };

  // Extraire les mots-clés du titre et de la description
  const extractKeywords = (title: string, description: string): string[] => {
    const text = `${title} ${description}`.toLowerCase();

    // Mots-clés techniques communs
    const techKeywords = [
      'javascript', 'react', 'node', 'python', 'java', 'html', 'css', 'typescript',
      'vue', 'angular', 'next', 'express', 'mongodb', 'sql', 'api', 'rest', 'graphql',
      'docker', 'kubernetes', 'aws', 'azure', 'git', 'github', 'testing', 'jest',
      'design', 'ui', 'ux', 'mobile', 'web', 'app', 'database', 'backend', 'frontend',
      'algorithm', 'data structure', 'machine learning', 'ai', 'blockchain', 'crypto',
      'marketing', 'seo', 'social media', 'content', 'strategy', 'business', 'finance',
      'photography', 'video', 'editing', 'photoshop', 'illustrator', 'figma', 'sketch',
    ];

    const foundKeywords: string[] = [];
    techKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });

    return foundKeywords.length > 0 ? foundKeywords : ['introduction', 'fondamentaux', 'pratique', 'avancé'];
  };

  // Créer des modules basés sur les mots-clés et le niveau
  const createModulesFromKeywords = (
    keywords: string[],
    level: string,
    totalDuration: number,
  ): Module[] => {
    const modules: Module[] = [];
    const moduleCount = level === 'beginner' ? 4 : level === 'intermediate' ? 5 : 6;
    const avgModuleDuration = Math.floor(totalDuration / moduleCount);
    const lessonsPerModule = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 5;

    // Module 1: Introduction (toujours présent)
    modules.push({
      id: crypto.randomUUID(),
      title: 'Introduction et Préparation',
      description: 'Découvrez les bases et préparez-vous pour ce cours. Apprenez les concepts fondamentaux et configurez votre environnement de travail.',
      duration: `${Math.floor(avgModuleDuration / 60)}h${avgModuleDuration % 60}min`,
      order: 1,
      lessonList: generateLessonsForModule('Introduction', lessonsPerModule, 1),
    });

    // Modules basés sur les mots-clés
    const mainTopics = keywords.slice(0, moduleCount - 1);
    mainTopics.forEach((keyword, index) => {
      const moduleTitle = capitalizeFirst(keyword);
      modules.push({
        id: crypto.randomUUID(),
        title: `${moduleTitle}: Concepts et Pratique`,
        description: `Approfondissez vos connaissances en ${keyword}. Apprenez les concepts avancés et mettez-les en pratique avec des exercices concrets.`,
        duration: `${Math.floor(avgModuleDuration / 60)}h${avgModuleDuration % 60}min`,
        order: index + 2,
        lessonList: generateLessonsForModule(moduleTitle, lessonsPerModule, index + 2),
      });
    });

    // Module final: Projet pratique (toujours présent)
    modules.push({
      id: crypto.randomUUID(),
      title: 'Projet Final et Certification',
      description: 'Appliquez toutes vos connaissances dans un projet complet. Créez quelque chose de concret et obtenez votre certification.',
      duration: `${Math.floor(avgModuleDuration / 60)}h${avgModuleDuration % 60}min`,
      order: modules.length + 1,
      lessonList: generateLessonsForModule('Projet Final', Math.max(3, lessonsPerModule - 1), modules.length + 1),
    });

    return modules;
  };

  // Générer des leçons pour un module
  const generateLessonsForModule = (
    moduleTitle: string,
    lessonCount: number,
    _moduleOrder: number,
  ): Lesson[] => {
    const lessons: Lesson[] = [];
    const lessonTemplates = [
      { title: 'Introduction', type: 'TEXT' as const },
      { title: 'Concepts Fondamentaux', type: 'VIDEO' as const },
      { title: 'Exemples Pratiques', type: 'VIDEO' as const },
      { title: 'Exercices Guidés', type: 'ASSIGNMENT' as const },
      { title: 'Quiz de Vérification', type: 'QUIZ' as const },
      { title: 'Cas d\'Usage Réels', type: 'VIDEO' as const },
      { title: 'Bonnes Pratiques', type: 'TEXT' as const },
      { title: 'Projet Pratique', type: 'ASSIGNMENT' as const },
    ];

    for (let i = 0; i < lessonCount; i++) {
      const template = lessonTemplates[i % lessonTemplates.length]!;
      lessons.push({
        id: crypto.randomUUID(),
        title: `${moduleTitle} - ${template.title}`,
        description: `Leçon ${i + 1} du module ${moduleTitle}: ${template.title.toLowerCase()}`,
        duration: 15 + (i * 5), // Durée progressive
        order: i + 1,
        type: template.type,
      });
    }

    return lessons;
  };

  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setShowGenerator(!showGenerator)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <Wand2 className="w-5 h-5" />
        <span className="font-medium">
          {showGenerator ? 'Masquer' : 'Générer'} un Syllabus Intelligent
        </span>
        <Sparkles className="w-4 h-4" />
      </button>

      {showGenerator && (
        <div className="mt-4 p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Générateur de Syllabus Intelligent
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Notre IA va analyser le titre et la description de votre cours pour générer automatiquement un syllabus complet et structuré avec des modules et des leçons pertinents.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Paramètres détectés :</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>Titre :</strong> {courseTitle || 'Non défini'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>Niveau :</strong> {courseLevel === 'beginner' ? 'Débutant' : courseLevel === 'intermediate' ? 'Intermédiaire' : 'Avancé'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>Durée totale :</strong> {Math.floor(courseDuration / 60)}h {courseDuration % 60}min</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={generateIntelligentSyllabus}
                  disabled={isGenerating || !courseTitle || !courseDescription}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Génération en cours...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Générer le Syllabus</span>
                    </>
                  )}
                </button>
                {currentModules.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{currentModules.length}</span> module(s) existant(s) seront remplacés
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>💡 Astuce :</strong> Vous pourrez toujours modifier, ajouter ou supprimer des modules et leçons après la génération automatique.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

