'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Gift, ArrowLeft } from 'lucide-react';
import AdminGuard from '@/components/admin/AdminGuard';
import { useToast } from '@/components/admin/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';

interface Category {
  id: string;
  name: string;
}

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const starterCourses = [
  {
    title: 'Introduction à HTML/CSS',
    description: 'Découvrez les bases du développement web avec HTML et CSS. Dans ce cours gratuit de 2 heures, vous apprendrez à créer votre première page web, à structurer le contenu avec HTML et à le styliser avec CSS. Parfait pour les débutants qui veulent tester la qualité de nos formations avant de s\'engager dans un cours complet.',
    shortDescription: 'Apprenez les bases du développement web en 2 heures. Créez votre première page web avec HTML et CSS.',
    duration: 120, // 2 heures en minutes
    level: 'beginner' as const,
    requirements: ['Aucune expérience préalable requise', 'Un ordinateur avec accès Internet', 'Un éditeur de texte (VS Code recommandé)'],
    objectives: ['Créer une page web basique', 'Comprendre la structure HTML', 'Appliquer des styles CSS', 'Mettre en page du contenu'],
    features: ['Vidéos HD', 'Exercices pratiques', 'Support communautaire', 'Accès à vie'],
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
    categoryKeywords: ['web', 'développement'],
  },
  {
    title: 'Premiers pas en Python',
    description: 'Initiez-vous à la programmation avec Python, l\'un des langages les plus populaires au monde. Ce cours gratuit de 90 minutes vous enseignera les concepts fondamentaux : variables, boucles, conditions et fonctions. Idéal pour découvrir si la programmation vous plaît avant d\'investir dans une formation complète.',
    shortDescription: 'Apprenez les bases de Python en 90 minutes. Variables, boucles, conditions et fonctions.',
    duration: 90,
    level: 'beginner' as const,
    requirements: ['Aucune expérience en programmation requise', 'Un ordinateur avec Python installé', 'Curiosité et motivation'],
    objectives: ['Comprendre les bases de Python', 'Écrire vos premiers scripts', 'Utiliser les structures de contrôle', 'Créer des fonctions'],
    features: ['Vidéos explicatives', 'Code source fourni', 'Exercices corrigés', 'Support disponible'],
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop',
    categoryKeywords: ['data', 'python', 'programmation'],
  },
  {
    title: 'Design UX : Les bases',
    description: 'Découvrez les principes fondamentaux du design d\'expérience utilisateur (UX). Dans ce cours gratuit de 2 heures, vous apprendrez à penser comme un designer UX, à comprendre les besoins des utilisateurs et à créer des interfaces intuitives. Un aperçu parfait de notre formation complète en design UX/UI.',
    shortDescription: 'Apprenez les principes fondamentaux du design UX en 2 heures. Créez des interfaces intuitives.',
    duration: 120,
    level: 'beginner' as const,
    requirements: ['Intérêt pour le design', 'Un ordinateur', 'Logiciel de design (Figma gratuit recommandé)'],
    objectives: ['Comprendre les principes UX', 'Analyser les besoins utilisateurs', 'Créer des wireframes', 'Tester des interfaces'],
    features: ['Cas pratiques réels', 'Templates fournis', 'Critiques personnalisées', 'Ressources premium'],
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
    categoryKeywords: ['design', 'ux'],
  },
  {
    title: 'Marketing Digital : Les fondamentaux',
    description: 'Plongez dans le monde du marketing digital avec ce cours gratuit de 90 minutes. Vous découvrirez les concepts clés : SEO, réseaux sociaux, email marketing et publicité en ligne. Un excellent moyen de tester notre approche pédagogique avant de vous lancer dans une formation complète en marketing digital.',
    shortDescription: 'Découvrez les concepts clés du marketing digital en 90 minutes. SEO, réseaux sociaux et publicité.',
    duration: 90,
    level: 'beginner' as const,
    requirements: ['Aucune expérience préalable requise', 'Intérêt pour le marketing', 'Accès à Internet'],
    objectives: ['Comprendre le marketing digital', 'Maîtriser les bases du SEO', 'Utiliser les réseaux sociaux', 'Créer des campagnes'],
    features: ['Stratégies éprouvées', 'Outils gratuits', 'Études de cas', 'Templates pratiques'],
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
    categoryKeywords: ['marketing'],
  },
];

export default function CreateStarterCoursesPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createdCourses, setCreatedCourses] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [papaAbdouInstructor, setPapaAbdouInstructor] = useState<Instructor | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, instructorsRes] = await Promise.all([
        fetch('/api/admin/categories', { credentials: 'include' }),
        fetch('/api/admin/users', { credentials: 'include' }),
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        const cats = Array.isArray(categoriesData) 
          ? categoriesData 
          : (categoriesData.categories || []);
        setCategories(cats.map((cat: any) => ({ id: cat.id, name: cat.name })));
      }

      if (instructorsRes.ok) {
        const instructorsData = await instructorsRes.json();
        const filtered = instructorsData.filter((u: any) => 
          u.role === 'instructor' || u.role === 'admin'
        );
        const mappedInstructors = filtered.map((u: any) => ({
          id: u.id,
          firstName: u.firstName || u.first_name || '',
          lastName: u.lastName || u.last_name || '',
          email: u.email || '',
        }));
        setInstructors(mappedInstructors);
        
        // Chercher spécifiquement "Papa Abdou Khader"
        const papaAbdou = mappedInstructors.find((inst: Instructor) => {
          const fullName = `${inst.firstName} ${inst.lastName}`.trim().toLowerCase();
          return (fullName.includes('papa') && fullName.includes('abdou') && fullName.includes('khader')) ||
                 (fullName.includes('abdou') && fullName.includes('khader')) ||
                 inst.email?.toLowerCase().includes('abdou') ||
                 inst.email?.toLowerCase().includes('khader');
        });
        
        if (papaAbdou) {
          setPapaAbdouInstructor(papaAbdou);
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      showError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const findCategory = (keywords: string[]) => {
    for (const keyword of keywords) {
      const found = categories.find(cat => 
        cat.name.toLowerCase().includes(keyword.toLowerCase())
      );
      if (found) return found.id;
    }
    return categories[0]?.id; // Première catégorie par défaut
  };

  const getInstructorId = () => {
    // Utiliser d'abord "Papa Abdou Khader" si trouvé
    if (papaAbdouInstructor) {
      return papaAbdouInstructor.id;
    }
    
    // Sinon, utiliser l'utilisateur connecté ou le premier instructeur
    if (user?.id) return user.id;
    return instructors[0]?.id;
  };

  const createCourse = async (courseData: typeof starterCourses[0], index: number) => {
    const categoryId = findCategory(courseData.categoryKeywords);
    const instructorId = getInstructorId();

    if (!categoryId || !instructorId) {
      setErrors(prev => ({
        ...prev,
        [index]: 'Catégorie ou instructeur manquant',
      }));
      return false;
    }

    try {
      // Créer le cours via l'API avec TOUS les champs en une seule fois
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: courseData.title,
          description: courseData.description,
          category_id: categoryId,
          instructor_id: instructorId,
          price: 0, // Toujours gratuit pour les cours starter
          duration: courseData.duration,
          level: courseData.level,
          is_published: true,
          is_starter_course: true, // Marquer comme cours starter
          image_url: courseData.imageUrl || null,
          // Tous les champs supplémentaires en une seule fois
          short_description: courseData.shortDescription,
          instructor_name: 'Papa Abdou Khader',
          instructor_bio: 'Instructeur expérimenté avec une passion pour l\'enseignement',
          requirements: courseData.requirements, // Tableau, l'API le convertira en JSON
          objectives: courseData.objectives, // Tableau, l'API le convertira en JSON
          features: courseData.features, // Tableau, l'API le convertira en JSON
          language: 'fr',
          certificate: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || errorData.details || 'Erreur lors de la création';
        console.error('❌ Erreur API:', errorData);
        throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      }

      const result = await response.json();
      
      if (!result.success || !result.course) {
        throw new Error(result.message || 'Cours créé mais réponse invalide');
      }

      const courseId = result.course.id;

      if (!courseId) {
        throw new Error('ID du cours non retourné');
      }

      setCreatedCourses(prev => new Set([...prev, courseData.title]));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur inconnue lors de la création du cours';
      console.error(`❌ Erreur création cours "${courseData.title}":`, err);
      setErrors(prev => ({
        ...prev,
        [index]: errorMessage,
      }));
      return false;
    }
  };

  const createAllCourses = async () => {
    if (categories.length === 0) {
      showError('❌ Aucune catégorie trouvée. Créez d\'abord au moins une catégorie dans /admin/categories');
      return;
    }

    if (instructors.length === 0) {
      showError('❌ Aucun instructeur trouvé. Créez d\'abord un utilisateur avec role = instructor ou admin');
      return;
    }

    setCreating(true);
    setErrors({});
    setCreatedCourses(new Set());

    let successCount = 0;
    let failedCount = 0;
    
    console.log('🚀 Début de la création des cours gratuits...');
    
    for (let i = 0; i < starterCourses.length; i++) {
      const course = starterCourses[i];
      if (!course) continue;
      
      console.log(`📚 Création du cours ${i + 1}/${starterCourses.length}: ${course.title}`);
      const success = await createCourse(course, i);
      if (success) {
        successCount++;
        console.log(`✅ Cours ${i + 1} créé avec succès`);
      } else {
        failedCount++;
        console.error(`❌ Échec de la création du cours ${i + 1}`);
      }
      // Petit délai entre chaque création pour éviter les surcharges
      if (i < starterCourses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setCreating(false);

    console.log(`📊 Résultat: ${successCount} réussis, ${failedCount} échoués`);

    if (successCount === starterCourses.length) {
      success(`✅ ${successCount} cours gratuits de démarrage créés avec succès !`);
      setTimeout(() => {
        router.push('/admin/courses');
      }, 2000);
    } else if (successCount > 0) {
      showError(`⚠️ ${successCount}/${starterCourses.length} cours créés. ${failedCount} cours ont échoué. Vérifiez les erreurs ci-dessous.`);
    } else {
      showError(`❌ Aucun cours n'a pu être créé. Vérifiez les erreurs ci-dessous et assurez-vous que la migration is_starter_course a été appliquée.`);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Créer les Cours Gratuits de Démarrage
            </h1>
            <p className="text-gray-600">
              Créez automatiquement 4 cours gratuits de démarrage pour attirer de nouveaux utilisateurs
            </p>
          </div>

          {/* Vérifications */}
          {categories.length === 0 && (
            <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
              <p className="text-yellow-800">
                ⚠️ <strong>Aucune catégorie trouvée.</strong> Créez d'abord au moins une catégorie dans{' '}
                <a href="/admin/categories" className="underline">/admin/categories</a>
              </p>
            </Card>
          )}

          {instructors.length === 0 && (
            <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
              <p className="text-yellow-800">
                ⚠️ <strong>Aucun instructeur trouvé.</strong> Créez d'abord un utilisateur avec role = instructor ou admin
              </p>
            </Card>
          )}

          {instructors.length > 0 && !papaAbdouInstructor && (
            <Card className="p-6 mb-6 bg-orange-50 border-orange-200">
              <p className="text-orange-800">
                ⚠️ <strong>Instructeur "Papa Abdou Khader" non trouvé.</strong>
                <br />
                Les cours seront créés avec l'instructeur : <strong>{instructors[0]?.firstName} {instructors[0]?.lastName}</strong>
                <br />
                <span className="text-sm mt-2 block">
                  💡 Pour utiliser "Papa Abdou Khader", créez d'abord un utilisateur avec ce nom et role = instructor ou admin dans{' '}
                  <a href="/admin/users" className="underline font-semibold">/admin/users</a>
                </span>
              </p>
            </Card>
          )}

          {papaAbdouInstructor && (
            <Card className="p-6 mb-6 bg-green-50 border-green-200">
              <p className="text-green-800">
                ✅ <strong>Instructeur trouvé :</strong> {papaAbdouInstructor.firstName} {papaAbdouInstructor.lastName}
                <br />
                <span className="text-sm">Les cours seront créés avec cet instructeur et afficheront "Papa Abdou Khader" comme nom</span>
              </p>
            </Card>
          )}

          {/* Liste des cours à créer */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Cours qui seront créés :
            </h2>
            <div className="space-y-4">
              {starterCourses.map((course, index) => {
                const isCreated = createdCourses.has(course.title);
                const hasError = errors[index];

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      isCreated
                        ? 'bg-green-50 border-green-200'
                        : hasError
                          ? 'bg-red-50 border-red-200'
                          : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900">{course.title}</h3>
                          {isCreated && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {hasError && (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{course.shortDescription}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>⏱️ {course.duration} min</span>
                          <span>📚 {course.level}</span>
                          <span>💰 Gratuit</span>
                        </div>
                        {hasError && (
                          <p className="text-sm text-red-600 mt-2">❌ {hasError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Bouton de création */}
          <div className="flex gap-4">
            <button
              onClick={createAllCourses}
              disabled={creating || categories.length === 0 || instructors.length === 0}
              className="flex-1 inline-flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {creating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Créer les 4 cours gratuits de démarrage
                </>
              )}
            </button>
            <button
              onClick={() => router.push('/admin/courses')}
              className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          </div>

          {/* Info */}
          <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Note :</strong> Les cours seront créés avec :
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Prix = 0 FCFA (gratuit)</li>
                <li>Statut = Publié</li>
                <li>Marqué comme "Cours gratuit de démarrage"</li>
                <li>Durée entre 90 et 120 minutes</li>
                <li>Niveau = Débutant</li>
              </ul>
            </p>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}

