import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { devtools, persist } from 'zustand/middleware';
import { Course, CourseFilters, CourseProgress } from '@/types/course';
import { CourseService } from '@/services/courseService';

// Debounce timer pour la recherche
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

interface CourseState {
  // État des cours
  courses: Course[];
  currentCourse: Course | null;
  filteredCourses: Course[];

  // État de la progression
  userProgress: Record<string, CourseProgress>;

  // État de l'interface
  isLoading: boolean;
  error: string | null;

  // Filtres et recherche
  filters: CourseFilters;
  searchQuery: string;

  // Pagination
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

interface CourseActions {
  // Actions de récupération des cours
  fetchCourses: (filters?: CourseFilters) => Promise<void>;
  fetchCourseById: (id: string) => Promise<void>;
  fetchCoursesByCategory: (categorySlug: string) => Promise<void>;

  // Actions de progression
  fetchUserProgress: (courseId: string, userId: string) => Promise<void>;
  completeLesson: (lessonId: string, courseId: string, userId: string) => Promise<void>;

  // Actions d'inscription
  enrollInCourse: (courseId: string, userId: string) => Promise<void>;
  unenrollFromCourse: (courseId: string, userId: string) => Promise<void>;

  // Actions de filtrage et recherche
  setFilters: (filters: Partial<CourseFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;

  // Actions de pagination
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;

  // Actions utilitaires
  setCurrentCourse: (course: Course | null) => void;
  clearError: () => void;
  resetState: () => void;
}

type CourseStore = CourseState & CourseActions;

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  filteredCourses: [],
  userProgress: {},
  isLoading: false,
  error: null,
  filters: {},
  searchQuery: '',
  currentPage: 1,
  totalPages: 1,
  itemsPerPage: 12,
};

export const useCourseStore = create<CourseStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Actions de récupération des cours
        fetchCourses: async (filters?: CourseFilters) => {
          try {
            set({ isLoading: true, error: null });

            // Si des filtres sont explicitement passés, les utiliser
            // Si undefined, utiliser les filtres du store (qui peuvent être persistés)
            // IMPORTANT: Pour avoir TOUS les cours, passer explicitement {}
            const newFilters = filters !== undefined ? filters : get().filters;

            // Timeout pour les requêtes mobiles
            const fetchWithTimeout = async (promise: Promise<any>, timeoutMs: number = 10000) => {
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), timeoutMs),
              );
              return Promise.race([promise, timeoutPromise]);
            };

            let courses;
            try {
              courses = await fetchWithTimeout(CourseService.getCourses(newFilters), 10000) as any;

              // Vérifier que courses est un tableau valide
              if (!Array.isArray(courses)) {
                console.warn('⚠️ fetchCourses: Réponse invalide, utilisation d\'un tableau vide');
                courses = [];
              }
            } catch (apiError: any) {
              console.warn('⚠️ fetchCourses: Erreur API', apiError?.message || apiError);

              // En cas d'erreur, essayer sans filtres pour avoir au moins quelques cours
              if (newFilters && Object.keys(newFilters).length > 0) {
                try {
                  console.log('🔄 fetchCourses: Tentative sans filtres');
                  courses = await fetchWithTimeout(CourseService.getCourses({}), 10000) as any;
                  if (!Array.isArray(courses)) {
                    courses = [];
                  }
                } catch (fallbackError: any) {
                  console.error('❌ fetchCourses: Erreur même sans filtres', fallbackError?.message || fallbackError);
                  courses = [];
                }
              } else {
                courses = [];
              }

              // Si toujours vide, définir un message d'erreur approprié
              if (courses.length === 0) {
                const errorMessage = apiError?.message?.includes('Timeout') || apiError?.message?.includes('timeout')
                  ? 'La connexion est trop lente. Vérifiez votre connexion internet.'
                  : 'Impossible de charger les cours pour le moment.';
                set({
                  error: errorMessage,
                  isLoading: false,
                  courses: [],
                  filteredCourses: [],
                });
                return;
              }
            }

            set({
              courses,
              filteredCourses: courses,
              filters: newFilters,
              isLoading: false,
              currentPage: 1,
              error: null, // Réinitialiser l'erreur en cas de succès
            });
          } catch (error: any) {
            const errorMessage = error instanceof Error
              ? (error.message.includes('Timeout') || error.message.includes('timeout')
                ? 'La connexion est trop lente. Vérifiez votre connexion internet.'
                : error.message)
              : 'Erreur lors de la récupération des cours';
            console.error('❌ fetchCourses: Erreur finale', errorMessage, error);

            set({
              error: errorMessage,
              isLoading: false,
              courses: [],
              filteredCourses: [],
            });
          }
        },

        fetchCourseById: async (id: string) => {
          try {
            // Vérifier que l'ID est valide avant de faire l'appel
            if (!id || id === 'undefined' || id.trim() === '') {
              set({
                error: 'ID du cours invalide ou manquant',
                isLoading: false,
                currentCourse: null,
              });
              return;
            }
            
            set({ isLoading: true, error: null });

            // Essayer de récupérer le cours avec timeout
            let course;
            const fetchWithTimeout = async (promise: Promise<any>, timeoutMs: number = 10000) => {
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), timeoutMs),
              );
              return Promise.race([promise, timeoutPromise]);
            };

            try {
              course = await fetchWithTimeout(CourseService.getCourseById(id), 10000) as any;
            } catch (apiError: any) {
              console.warn('⚠️ Erreur API getCourseById, tentative de récupération depuis la liste complète:', apiError?.message || apiError);

              // Fallback: essayer de récupérer depuis la liste complète des cours
              try {
                const allCourses = await fetchWithTimeout(CourseService.getCourses({}), 10000) as any;
                if (Array.isArray(allCourses)) {
                  // Chercher par ID ou par slug
                  course = allCourses.find((c: any) => c && (c.id === id || c.slug === id));
                }

                if (!course) {
                  // Ne pas lancer d'erreur, juste définir un message d'erreur
                  // Vérifier si l'erreur originale indique un problème d'accès
                  const isAccessError = apiError?.message?.includes('brouillon') || 
                                       apiError?.message?.includes('non accessible') ||
                                       apiError?.message?.includes('pas encore disponible');
                  
                  // Détecter si c'est un slug ou un UUID pour améliorer le message
                  const isSlug = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
                  const errorMessage = isAccessError 
                    ? apiError.message 
                    : isSlug
                      ? `Cours avec le slug "${id}" non trouvé. Vérifiez que le slug existe dans la base de données.`
                      : `Cours avec l'ID "${id}" non trouvé`;
                  
                  console.error('❌ Cours non trouvé:', {
                    id,
                    isSlug,
                    errorMessage: apiError?.message,
                    allCoursesCount: Array.isArray(allCourses) ? allCourses.length : 0,
                  });
                  
                  set({
                    error: errorMessage,
                    isLoading: false,
                    currentCourse: null,
                  });
                  return;
                }
                console.log('✅ Cours récupéré depuis la liste complète');
              } catch (fallbackError: any) {
                console.error('❌ Erreur même avec fallback:', fallbackError?.message || fallbackError);
                // Ne pas lancer d'erreur, juste définir un message d'erreur
                let errorMessage: string;
                if (apiError?.message?.includes('Timeout') || apiError?.message?.includes('timeout') || fallbackError?.message?.includes('Timeout')) {
                  errorMessage = 'La connexion est trop lente. Vérifiez votre connexion internet.';
                } else if (apiError?.message?.includes('brouillon') || apiError?.message?.includes('non accessible') || apiError?.message?.includes('pas encore disponible')) {
                  errorMessage = apiError.message;
                } else {
                  errorMessage = `Cours avec l'ID "${id}" non trouvé`;
                }
                
                set({
                  error: errorMessage,
                  isLoading: false,
                  currentCourse: null,
                });
                return;
              }
            }

            if (!course) {
              set({
                error: `Cours avec l'ID "${id}" non trouvé`,
                isLoading: false,
                currentCourse: null,
              });
              return;
            }

            console.log('✅ fetchCourseById - Cours récupéré:', {
              id: course.id,
              title: course.title,
              modulesCount: course.modules?.length || 0,
              hasModules: !!course.modules,
            });

            set({
              currentCourse: course,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            const errorMessage = error instanceof Error
              ? (error.message.includes('Timeout') || error.message.includes('timeout')
                ? 'La connexion est trop lente. Vérifiez votre connexion internet.'
                : error.message)
              : 'Erreur lors de la récupération du cours';
            console.error('❌ Erreur fetchCourseById:', errorMessage, error);

            set({
              error: errorMessage,
              isLoading: false,
              currentCourse: null,
            });
          }
        },

        fetchCoursesByCategory: async (categorySlug: string) => {
          try {
            set({ isLoading: true, error: null });

            const courses = await CourseService.getCoursesByCategory(categorySlug);

            set({
              courses,
              filteredCourses: courses,
              isLoading: false,
              currentPage: 1,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Erreur lors de la récupération des cours de la catégorie',
              isLoading: false,
            });
          }
        },

        // Actions de progression
        fetchUserProgress: async (courseId: string, userId: string) => {
          try {
            const progress = await CourseService.getCourseProgress(courseId, userId);

            set(state => ({
              userProgress: {
                ...state.userProgress,
                [courseId]: progress,
              },
            }));
          } catch (error) {
            // Log l'erreur mais ne pas bloquer l'interface
            console.error('Erreur lors de la récupération de la progression:', error);
          }
        },

        completeLesson: async (lessonId: string, courseId: string, userId: string) => {
          try {
            await CourseService.completeLesson(lessonId, courseId, userId);

            // Mettre à jour la progression locale
            const currentProgress = get().userProgress[courseId];
            if (currentProgress) {
              const updatedProgress = {
                ...currentProgress,
                completedLessons: currentProgress.completedLessons + 1,
                percentage: Math.round(((currentProgress.completedLessons + 1) / currentProgress.totalLessons) * 100),
              };

              set(state => ({
                userProgress: {
                  ...state.userProgress,
                  [courseId]: updatedProgress,
                },
              }));
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Erreur lors de la validation de la leçon',
            });
          }
        },

        // Actions d'inscription
        enrollInCourse: async (courseId: string, userId: string): Promise<void> => {
          try {
            set({ isLoading: true, error: null });

            await CourseService.enrollInCourse(courseId, userId);

            // Mettre à jour l'état local
            set(state => ({
              courses: state.courses.map(course =>
                course.id === courseId
                  ? { ...course, totalStudents: course.totalStudents + 1 }
                  : course,
              ),
              filteredCourses: state.filteredCourses.map(course =>
                course.id === courseId
                  ? { ...course, totalStudents: course.totalStudents + 1 }
                  : course,
              ),
              isLoading: false,
            }));

            // L'enrollment est stocké dans l'état, pas besoin de le retourner
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription',
              isLoading: false,
            });
            throw error;
          }
        },

        unenrollFromCourse: async (courseId: string, userId: string) => {
          try {
            set({ isLoading: true, error: null });

            await CourseService.unenrollFromCourse(courseId, userId);

            // Mettre à jour l'état local
            set(state => ({
              courses: state.courses.map(course =>
                course.id === courseId
                  ? { ...course, totalStudents: Math.max(0, course.totalStudents - 1) }
                  : course,
              ),
              filteredCourses: state.filteredCourses.map(course =>
                course.id === courseId
                  ? { ...course, totalStudents: Math.max(0, course.totalStudents - 1) }
                  : course,
              ),
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Erreur lors de la désinscription',
              isLoading: false,
            });
          }
        },

        // Actions de filtrage et recherche
        setFilters: (newFilters: Partial<CourseFilters>) => {
          // Remplacer les filtres (pas merger) : _Client.tsx passe toujours
          // le snapshot complet des filtres actifs via storeFilters. Merger
          // avec les filtres persistés localStorage causait une race condition
          // qui affichait 0 cours si des filtres d'une session précédente
          // ne correspondaient à aucun cours.
          set({ filters: newFilters });
          get().fetchCourses(newFilters);
        },

        setSearchQuery: (query: string) => {
          set({ searchQuery: query });

          // Debounce 300ms pour éviter un appel API à chaque frappe
          if (searchDebounceTimer) clearTimeout(searchDebounceTimer);

          searchDebounceTimer = setTimeout(() => {
            if (query.trim()) {
              CourseService.searchCourses(query, get().filters).then(courses => {
                set({ filteredCourses: courses });
              }).catch(() => {
                set({ filteredCourses: get().courses });
              });
            } else {
              set({ filteredCourses: get().courses });
            }
          }, 300);
        },

        clearFilters: () => {
          const clearedFilters: CourseFilters = {};
          set({ filters: clearedFilters });
          get().fetchCourses(clearedFilters);
        },

        // Actions de pagination
        setCurrentPage: (page: number) => {
          set({ currentPage: page });
        },

        setItemsPerPage: (items: number) => {
          set({ itemsPerPage: items, currentPage: 1 });
        },

        // Actions utilitaires
        setCurrentCourse: (course: Course | null) => {
          set({ currentCourse: course });
        },

        clearError: () => {
          set({ error: null });
        },

        resetState: () => {
          set(initialState);
        },
      }),
      {
        name: 'course-store',
        partialize: (state) => ({
          filters: state.filters,
          searchQuery: state.searchQuery,
          currentPage: state.currentPage,
          itemsPerPage: state.itemsPerPage,
        }),
      },
    ),
    {
      name: 'course-store',
    },
  ),
);

// Sélecteurs utiles
export const useCourseSelectors = () => {
  const { courses, userProgress, filteredCourses, filters, currentPage, itemsPerPage } =
    useCourseStore(
      useShallow((s) => ({
        courses:         s.courses,
        userProgress:    s.userProgress,
        filteredCourses: s.filteredCourses,
        filters:         s.filters,
        currentPage:     s.currentPage,
        itemsPerPage:    s.itemsPerPage,
      })),
    );

  return {
    // Sélecteurs de cours
    getCourseById: (id: string) => courses.find(course => course.id === id || course.slug === id),
    getCoursesByCategory: (categoryId: string) => courses.filter(course => course.category.id === categoryId),
    getPopularCourses: () => courses.filter(course => course.isPopular).slice(0, 6),
    getFeaturedCourses: () => courses.filter(course => course.isFeatured).slice(0, 6),

    // Sélecteurs de progression
    getUserProgress: (courseId: string) => userProgress[courseId],
    isUserEnrolled: (courseId: string) => !!userProgress[courseId],

    // Sélecteurs de filtrage
    getFilteredCourses: () => filteredCourses,
    getActiveFilters: () => filters,

    // Sélecteurs de pagination
    getPaginatedCourses: () => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredCourses.slice(startIndex, endIndex);
    },
  };
};
