'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  BookOpen,
  Clock,
  Users,
  Star,
  Info,
  ImageIcon,
  Settings,
  Plus,
  X,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import CourseImageUpload from '@/components/admin/CourseImageUpload';
import Image from 'next/image';

type TabId = 'essential' | 'media' | 'advanced';

interface CourseData {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published';
  thumbnail: string;
  videoUrl: string;
  instructorName: string;
  instructorBio: string;
  instructorAvatar: string;
  objectives: string[];
  requirements: string[];
  certificate: boolean;
  isFeatured: boolean;
  isComingSoon: boolean;
}

interface CourseCreationWizardProps {
  categories: Array<{ id: string; name: string }>;
  userId: string;
  onComplete?: (courseId: string) => void;
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'essential', label: 'Essentiel', icon: BookOpen },
  { id: 'media', label: 'Médias', icon: ImageIcon },
  { id: 'advanced', label: 'Avancé', icon: Settings },
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

export default function CourseCreationWizard({
  categories,
  userId,
  onComplete,
}: CourseCreationWizardProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('essential');

  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    categoryId: '',
    price: 0,
    level: 'beginner',
    status: 'draft',
    thumbnail: '',
    videoUrl: '',
    instructorName: '',
    instructorBio: '',
    instructorAvatar: '',
    objectives: [],
    requirements: [],
    certificate: false,
    isFeatured: false,
    isComingSoon: false,
  });

  const updateField = <K extends keyof CourseData>(field: K, value: CourseData[K]) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const selectedCategory = categories.find(c => c.id === courseData.categoryId);

  // Dynamic list helpers
  const addListItem = (field: 'objectives' | 'requirements') => {
    updateField(field, [...courseData[field], '']);
  };

  const updateListItem = (field: 'objectives' | 'requirements', index: number, value: string) => {
    const updated = [...courseData[field]];
    updated[index] = value;
    updateField(field, updated);
  };

  const removeListItem = (field: 'objectives' | 'requirements', index: number) => {
    updateField(field, courseData[field].filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseData.title.trim()) {
      showError('Le titre est requis');
      setActiveTab('essential');
      return;
    }
    if (courseData.title.length < 5) {
      showError('Le titre doit faire au moins 5 caractères');
      setActiveTab('essential');
      return;
    }
    if (!courseData.description.trim()) {
      showError('La description est requise');
      setActiveTab('essential');
      return;
    }
    if (courseData.description.length < 20) {
      showError('La description doit faire au moins 20 caractères');
      setActiveTab('essential');
      return;
    }
    if (!courseData.categoryId) {
      showError('La catégorie est requise');
      setActiveTab('essential');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: courseData.title.trim(),
          description: courseData.description.trim(),
          category_id: courseData.categoryId,
          instructor_id: userId,
          price: courseData.price || 0,
          level: courseData.level,
          image_url: courseData.thumbnail || null,
          is_published: courseData.status === 'published',
          is_coming_soon: courseData.isComingSoon,
          is_starter_course: courseData.isFeatured,
          instructor_name: courseData.instructorName.trim() || undefined,
          instructor_bio: courseData.instructorBio.trim() || undefined,
          objectives: courseData.objectives.filter(Boolean),
          requirements: courseData.requirements.filter(Boolean),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.details && Array.isArray(errorData.details)) {
          const messages = errorData.details.map((d: { field?: string; message?: string }) =>
            d.field ? `${d.field}: ${d.message}` : d.message
          ).join(', ');
          throw new Error(messages || errorData.error || 'Erreur lors de la création');
        }
        throw new Error(errorData.error || errorData.message || 'Erreur lors de la création');
      }

      const result = await response.json();

      if (result.course?.id) {
        success('Cours créé ! Ajoutez maintenant vos leçons.');
        if (onComplete) onComplete(result.course.id);
        router.push(`/admin/courses/${result.course.id}/lessons`);
      } else {
        throw new Error('Erreur: ID du cours manquant');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Formulaire - 3 colonnes */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tab navigation */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">

              {/* === TAB: Essentiel === */}
              {activeTab === 'essential' && (
                <>
                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Titre du cours <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={courseData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="Ex: Maîtriser Excel en 30 jours"
                      maxLength={100}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                    />
                    <div className="flex justify-between mt-1.5">
                      <p className="text-xs text-gray-500">Un titre accrocheur et descriptif</p>
                      <span className={`text-xs ${courseData.title.length > 80 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {courseData.title.length}/100
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={courseData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Décrivez ce que les étudiants vont apprendre, les prérequis, et pourquoi ce cours est fait pour eux..."
                      rows={5}
                      maxLength={2000}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-gray-900"
                    />
                    <div className="flex justify-between mt-1.5">
                      <p className="text-xs text-gray-500">Minimum 20 caractères</p>
                      <span className={`text-xs ${courseData.description.length > 1800 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {courseData.description.length}/2000
                      </span>
                    </div>
                  </div>

                  {/* Catégorie et Niveau */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Catégorie <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={courseData.categoryId}
                        onChange={(e) => updateField('categoryId', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
                      >
                        <option value="">Choisir...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Niveau
                      </label>
                      <select
                        value={courseData.level}
                        onChange={(e) => updateField('level', e.target.value as CourseData['level'])}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
                      >
                        <option value="beginner">Débutant - Aucun prérequis</option>
                        <option value="intermediate">Intermédiaire - Bases requises</option>
                        <option value="advanced">Avancé - Expérience nécessaire</option>
                      </select>
                    </div>
                  </div>

                  {/* Prix et Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Prix
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={courseData.price || ''}
                          onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                          FCFA
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Info className="w-3.5 h-3.5 text-blue-500" />
                        <p className="text-xs text-gray-600">
                          {courseData.price === 0
                            ? 'Gratuit'
                            : courseData.price < 5000
                              ? 'Prix accessible'
                              : courseData.price < 20000
                                ? 'Prix standard'
                                : 'Prix premium'
                          }
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Statut
                      </label>
                      <select
                        value={courseData.status}
                        onChange={(e) => updateField('status', e.target.value as 'draft' | 'published')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="published">Publié</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        {courseData.status === 'draft'
                          ? 'Non visible par les étudiants'
                          : 'Visible et accessible aux étudiants'}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* === TAB: Médias === */}
              {activeTab === 'media' && (
                <>
                  {/* Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Image de couverture
                    </label>
                    <CourseImageUpload
                      courseId="new"
                      currentImageUrl={courseData.thumbnail}
                      onImageUploaded={(url) => updateField('thumbnail', url)}
                      onImageRemoved={() => updateField('thumbnail', '')}
                      label=""
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Recommandé : 1280x720px (16:9). Une bonne image augmente les inscriptions de 30%.
                    </p>
                  </div>

                  {/* Video URL */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Vidéo de présentation
                    </label>
                    <input
                      type="url"
                      value={courseData.videoUrl}
                      onChange={(e) => updateField('videoUrl', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      URL YouTube ou Vimeo pour la présentation du cours
                    </p>
                  </div>
                </>
              )}

              {/* === TAB: Avancé === */}
              {activeTab === 'advanced' && (
                <>
                  {/* Instructor */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-4">Instructeur</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                        <input
                          type="text"
                          value={courseData.instructorName}
                          onChange={(e) => updateField('instructorName', e.target.value)}
                          placeholder="Nom de l'instructeur"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
                        <textarea
                          value={courseData.instructorBio}
                          onChange={(e) => updateField('instructorBio', e.target.value)}
                          placeholder="Courte biographie de l'instructeur..."
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Objectives */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-800">Objectifs du cours</label>
                      <button
                        type="button"
                        onClick={() => addListItem('objectives')}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ajouter
                      </button>
                    </div>
                    <div className="space-y-2">
                      {courseData.objectives.map((obj, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={obj}
                            onChange={(e) => updateListItem('objectives', i, e.target.value)}
                            placeholder={`Objectif ${i + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem('objectives', i)}
                            className="p-1.5 text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {courseData.objectives.length === 0 && (
                        <p className="text-xs text-gray-400 italic">Aucun objectif ajouté</p>
                      )}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-800">Prérequis</label>
                      <button
                        type="button"
                        onClick={() => addListItem('requirements')}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ajouter
                      </button>
                    </div>
                    <div className="space-y-2">
                      {courseData.requirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={req}
                            onChange={(e) => updateListItem('requirements', i, e.target.value)}
                            placeholder={`Prérequis ${i + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem('requirements', i)}
                            className="p-1.5 text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {courseData.requirements.length === 0 && (
                        <p className="text-xs text-gray-400 italic">Aucun prérequis ajouté</p>
                      )}
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseData.certificate}
                        onChange={(e) => updateField('certificate', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-800">Certificat</span>
                        <p className="text-xs text-gray-500">Délivrer un certificat à la fin du cours</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseData.isFeatured}
                        onChange={(e) => updateField('isFeatured', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-800">Mis en avant</span>
                        <p className="text-xs text-gray-500">Afficher sur la page d&apos;accueil</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseData.isComingSoon}
                        onChange={(e) => updateField('isComingSoon', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-800">Bientôt disponible</span>
                        <p className="text-xs text-gray-500">Marquer comme &quot;coming soon&quot;</p>
                      </div>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={saving || !courseData.title || !courseData.description || !courseData.categoryId}
              className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  Créer le cours et ajouter les leçons
                </>
              )}
            </button>
          </div>

          {/* Aperçu - 2 colonnes */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                Aperçu
              </p>

              {/* Carte de cours simulée */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Image */}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {courseData.thumbnail ? (
                    <Image
                      src={courseData.thumbnail}
                      alt="Aperçu"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Image de couverture</p>
                      </div>
                    </div>
                  )}

                  {/* Badge niveau */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${LEVEL_COLORS[courseData.level]}`}>
                      {LEVEL_LABELS[courseData.level]}
                    </span>
                  </div>

                  {/* Badge prix */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1.5 bg-white/95 backdrop-blur rounded-full text-sm font-bold text-gray-900 shadow">
                      {courseData.price === 0 ? 'Gratuit' : `${courseData.price.toLocaleString()} FCFA`}
                    </span>
                  </div>

                  {/* Coming soon badge */}
                  {courseData.isComingSoon && (
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        Bientôt disponible
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="p-5">
                  {selectedCategory && (
                    <p className="text-xs font-medium text-blue-600 mb-2">
                      {selectedCategory.name}
                    </p>
                  )}

                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                    {courseData.title || 'Titre du cours'}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {courseData.description || 'Description du cours...'}
                  </p>

                  {courseData.instructorName && (
                    <p className="text-xs text-gray-500 mb-3">
                      Par <span className="font-medium text-gray-700">{courseData.instructorName}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>-- heures</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>0 étudiants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500" />
                      <span>Nouveau</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conseils */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Conseils pour un bon cours
                </p>
                <ul className="text-xs text-blue-800 space-y-1.5">
                  <li>• Un titre clair qui décrit le bénéfice</li>
                  <li>• Une description qui répond au &quot;pourquoi&quot;</li>
                  <li>• Une image de qualité professionnelle</li>
                  <li>• Un prix cohérent avec la valeur offerte</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
