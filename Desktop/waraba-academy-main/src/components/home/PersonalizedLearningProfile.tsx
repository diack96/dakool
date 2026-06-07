'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Brain, Target, Clock, BookOpen, Star, Zap, TrendingUp, Users, Lightbulb, Globe } from 'lucide-react';
import AIService, { LearningProfile, CourseRecommendation, PersonalizedLearningPath } from '@/services/aiService';

interface PersonalizedLearningProfileProps {
  userId?: string;
}

const PersonalizedLearningProfile: React.FC<PersonalizedLearningProfileProps> = ({ userId = 'user-1' }) => {
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [learningPath, setLearningPath] = useState<PersonalizedLearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'recommendations' | 'path'>('profile');

  const aiService = AIService.getInstance();

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    const existingProfile = aiService.getLearningProfile(userId);
    if (existingProfile) {
      setProfile(existingProfile);
      await loadRecommendations();
    } else {
      setIsCreatingProfile(true);
    }
  };

  const loadRecommendations = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const recs = await aiService.generateCourseRecommendations(userId);
      setRecommendations(recs);
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async (profileData: Partial<LearningProfile>) => {
    setIsLoading(true);
    try {
      const newProfile: LearningProfile = {
        userId,
        interests: profileData.interests || [],
        skillLevel: profileData.skillLevel || 'beginner',
        learningStyle: profileData.learningStyle || 'visual',
        preferredLanguages: profileData.preferredLanguages || ['Français'],
        timeAvailability: profileData.timeAvailability || 10,
        goals: profileData.goals || [],
        completedCourses: profileData.completedCourses || [],
        currentProgress: profileData.currentProgress || {},
      };

      const enhancedProfile = await aiService.createLearningProfile(newProfile);
      setProfile(enhancedProfile);
      setIsCreatingProfile(false);

      // Charger les recommandations après création du profil
      await loadRecommendations();
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createLearningPath = async (goal: string, timeframe: number) => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const path = await aiService.createPersonalizedLearningPath(userId, goal, timeframe);
      setLearningPath(path);
      setActiveTab('path');
    } catch (error) {
      console.error('Erreur lors de la création du parcours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ProfileCreationForm = () => {
    const [formData, setFormData] = useState({
      interests: [] as string[],
      skillLevel: 'beginner' as LearningProfile['skillLevel'],
      learningStyle: 'visual' as LearningProfile['learningStyle'],
      preferredLanguages: ['Français'] as string[],
      timeAvailability: 10,
      goals: [] as string[],
    });

    const interestsOptions = [
      'Développement Web', 'Mobile Development', 'Data Science', 'DevOps',
      'UX/UI Design', 'Cybersécurité', 'Machine Learning', 'Cloud Computing',
    ];

    const learningStyleOptions = [
      { value: 'visual', label: 'Visuel', icon: '👁️' },
      { value: 'auditory', label: 'Auditif', icon: '👂' },
      { value: 'kinesthetic', label: 'Kinesthésique', icon: '✋' },
      { value: 'reading', label: 'Lecture', icon: '📖' },
    ];

    const handleInterestToggle = (interest: string) => {
      setFormData(prev => ({
        ...prev,
        interests: prev.interests.includes(interest)
          ? prev.interests.filter(i => i !== interest)
          : [...prev.interests, interest],
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createProfile(formData);
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden ring-4 ring-blue-100">
            <Image
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces"
              alt="Profil d'apprentissage"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Créer votre profil d'apprentissage
          </h2>
          <p className="text-gray-600">
            L'IA va analyser vos préférences pour créer un parcours personnalisé
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Intérêts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quels domaines vous intéressent le plus ?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {interestsOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.interests.includes(interest)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Niveau de compétence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quel est votre niveau actuel ?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, skillLevel: level }))}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.skillLevel === level
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {level === 'beginner' && 'Débutant'}
                  {level === 'intermediate' && 'Intermédiaire'}
                  {level === 'advanced' && 'Avancé'}
                  {level === 'expert' && 'Expert'}
                </button>
              ))}
            </div>
          </div>

          {/* Style d'apprentissage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Comment préférez-vous apprendre ?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {learningStyleOptions.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, learningStyle: style.value as LearningProfile['learningStyle'] }))}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.learningStyle === style.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{style.icon}</div>
                  <div className="text-sm">{style.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Temps disponible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Combien d'heures pouvez-vous consacrer à l'apprentissage par semaine ?
            </label>
            <input
              type="range"
              min="1"
              max="40"
              value={formData.timeAvailability}
              onChange={(e) => setFormData(prev => ({ ...prev, timeAvailability: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center text-lg font-semibold text-blue-600 mt-2">
              {formData.timeAvailability} heures par semaine
            </div>
          </div>

          {/* Objectifs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quels sont vos objectifs d'apprentissage ?
            </label>
            <textarea
              placeholder="Ex: Développer des applications web modernes, obtenir un emploi en tech, créer ma startup..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              value={formData.goals.join('\n')}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                goals: e.target.value.split('\n').filter(g => g.trim()),
              }))}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-xl hover:from-blue-700 hover:to-orange-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Création en cours...
              </div>
            ) : (
              'Créer mon profil IA'
            )}
          </button>
        </form>
      </div>
    );
  };

  const ProfileDisplay = () => {
    if (!profile) return null;

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-blue-200">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces"
                alt="Profil IA"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Profil IA</h2>
              <p className="text-gray-600">Personnalisé selon vos préférences</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreatingProfile(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Modifier
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Niveau :</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {profile.skillLevel === 'beginner' && 'Débutant'}
                {profile.skillLevel === 'intermediate' && 'Intermédiaire'}
                {profile.skillLevel === 'advanced' && 'Avancé'}
                {profile.skillLevel === 'expert' && 'Expert'}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Style :</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {profile.learningStyle === 'visual' && 'Visuel'}
                {profile.learningStyle === 'auditory' && 'Auditif'}
                {profile.learningStyle === 'kinesthetic' && 'Kinesthésique'}
                {profile.learningStyle === 'reading' && 'Lecture'}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="font-medium">Temps :</span>
              <span className="text-gray-700">{profile.timeAvailability}h/semaine</span>
            </div>

            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-orange-600" />
              <span className="font-medium">Langues :</span>
              <span className="text-gray-700">{profile.preferredLanguages.join(', ')}</span>
            </div>
          </div>

          {/* Intérêts et objectifs */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Intérêts</h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Objectifs</h4>
              <div className="space-y-2">
                {profile.goals.map((goal, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RecommendationsDisplay = () => {
    if (recommendations.length === 0) return null;

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Lightbulb className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">Recommandations IA</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <div
              key={rec.courseId}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">{rec.confidence}%</span>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{rec.reason}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Difficulté :</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rec.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      rec.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                  }`}>
                    {rec.difficulty === 'beginner' && 'Débutant'}
                    {rec.difficulty === 'intermediate' && 'Intermédiaire'}
                    {rec.difficulty === 'advanced' && 'Avancé'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Durée :</span>
                  <span className="font-medium text-gray-700">{rec.estimatedDuration}h</span>
                </div>

                {rec.prerequisites.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Prérequis :</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rec.prerequisites.map((prereq) => (
                        <span
                          key={prereq}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Commencer ce cours
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const LearningPathDisplay = () => {
    if (!learningPath) return null;

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <BookOpen className="w-8 h-8 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900">Parcours d'Apprentissage</h2>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{learningPath.title}</h3>
          <p className="text-gray-600 mb-4">{learningPath.description}</p>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{learningPath.estimatedTotalDuration}h total</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{learningPath.courses.length} cours</span>
            </div>
          </div>
        </div>

        {/* Jalons */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Jalons du parcours</h4>
          <div className="space-y-3">
            {learningPath.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                </div>
                <span className="text-gray-700">{milestone}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ajustements adaptatifs */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Ajustements adaptatifs</h4>
          <div className="space-y-2">
            {learningPath.adaptativeAdjustments.map((adjustment, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-700">{adjustment}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const CreateLearningPathForm = () => {
    const [goal, setGoal] = useState('');
    const [timeframe, setTimeframe] = useState(12);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (goal.trim()) {
        createLearningPath(goal, timeframe);
      }
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <BookOpen className="w-12 h-12 text-purple-600 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-gray-900">Créer un parcours personnalisé</h3>
          <p className="text-gray-600">L'IA va créer un parcours adapté à vos objectifs</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quel est votre objectif principal ?
            </label>
            <input
              type="text"
              placeholder="Ex: Devenir développeur full-stack, maîtriser React, créer une application mobile..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dans combien de semaines voulez-vous atteindre cet objectif ?
            </label>
            <input
              type="range"
              min="4"
              max="52"
              value={timeframe}
              onChange={(e) => setTimeframe(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center text-lg font-semibold text-purple-600 mt-2">
              {timeframe} semaines
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !goal.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-lg hover:from-blue-700 hover:to-orange-600 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Création en cours...' : 'Créer mon parcours IA'}
          </button>
        </form>
      </div>
    );
  };

  if (isCreatingProfile) {
    return <ProfileCreationForm />;
  }

  if (!profile) {
    return <ProfileCreationForm />;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-6">
            <Brain className="w-4 h-4 mr-2" />
            IA d'Apprentissage
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Votre
            <span className="text-transparent bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text">
              {' '}assistant IA personnel
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            L'intelligence artificielle analyse votre profil et crée un parcours d'apprentissage
            parfaitement adapté à vos objectifs, votre style et votre rythme.
          </p>
        </div>

        {/* Navigation des onglets */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg">
            <div className="flex space-x-1">
              {[
                { id: 'profile', label: 'Profil IA', icon: Brain },
                { id: 'recommendations', label: 'Recommandations', icon: Lightbulb },
                { id: 'path', label: 'Parcours', icon: BookOpen },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-8">
          {activeTab === 'profile' && <ProfileDisplay />}
          {activeTab === 'recommendations' && <RecommendationsDisplay />}
          {activeTab === 'path' && (
            learningPath ? <LearningPathDisplay /> : <CreateLearningPathForm />
          )}
        </div>
      </div>
    </section>
  );
};

export default PersonalizedLearningProfile;
