import { Course, CourseFilters, Enrollment, CourseProgress, CourseLevel, CourseStatus, User, Category } from '@/types/course';
import { demoCourses, getCourseById, getCoursesByCategory, getPopularCourses, getRecommendedCourses } from '@/data/demoData';

export class CourseService {
  private static baseUrl = '/api';

  // Récupérer tous les cours avec filtres
  static async getCourses (filters?: CourseFilters): Promise<Course[]> {
    try {
      // Utiliser l'API réelle /api/courses (même source que l'admin)
      const queryParams = new URLSearchParams();

      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.level) queryParams.append('level', filters.level);
      if (filters?.price) queryParams.append('price', filters.price);
      if (filters?.duration) queryParams.append('duration', filters.duration);
      if (filters?.rating) queryParams.append('rating', filters.rating.toString());
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      // Utiliser le client API sécurisé avec retry automatique
      const { apiClient } = await import('@/lib/api/secureApiClient');
      const result = await apiClient.get<{ success: boolean; courses?: any[] }>(
        `${this.baseUrl}/courses?${queryParams.toString()}`,
        {
          retries: 2,
          retryDelay: 1000,
          timeout: 30000,
        }
      );

      if (result.error) {
        // Gérer les erreurs selon le code
        const errorMessage = result.error.details 
          ? String(result.error.details)
          : result.error.message || 'Erreur lors de la récupération des cours';
        throw new Error(errorMessage);
      }

      const data = result.data;
      if (!data) {
        throw new Error('Aucune donnée reçue de l\'API');
      }
      console.log('📦 CourseService.getCourses: Données reçues de l\'API', {
        success: data.success,
        hasCourses: !!data.courses,
        coursesCount: data.courses?.length || 0,
        isArray: Array.isArray(data),
        dataKeys: Object.keys(data),
      });

      // Si l'API retourne { success: true, courses: [...] }
      if (data.success && data.courses && Array.isArray(data.courses)) {
        console.log(`🔄 CourseService.getCourses: Transformation de ${data.courses.length} cours...`);
        try {
          const transformedCourses = data.courses
            .map((courseData: any, index: number) => {
              try {
                // Vérifier que le cours a au moins un id et un title
                if (!courseData || !courseData.id) {
                  console.warn(`⚠️ CourseService: Cours ${index} sans ID, ignoré`, courseData);
                  return null;
                }
                return this.transformCourseFromDB(courseData);
              } catch (transformError) {
                console.error(`❌ CourseService: Erreur transformation cours ${index}:`, transformError);
                console.error('   Données du cours:', {
                  id: courseData?.id,
                  title: courseData?.title,
                  is_published: courseData?.is_published,
                });
                // En production, essayer de créer un cours minimal plutôt que de le rejeter
                if (process.env.NODE_ENV === 'production' && courseData?.id && courseData?.title) {
                  console.warn(`⚠️ CourseService: Création d'un cours minimal pour ${courseData.id}`);
                  try {
                    return this.createMinimalCourse(courseData);
                  } catch (minimalError) {
                    console.error('❌ CourseService: Impossible de créer un cours minimal', minimalError);
                    return null;
                  }
                }
                return null;
              }
            })
            .filter((course: any) => course !== null && course.id);

          // Filtrer les null (cours invalides)
          const validCourses = transformedCourses.filter((course): course is Course => course !== null);
          console.log(`✅ CourseService.getCourses: ${validCourses.length} cours transformés avec succès`);
          return validCourses;
        } catch (error) {
          console.error('❌ CourseService.getCourses: Erreur lors de la transformation:', error);
          // Retourner un tableau vide plutôt que de lancer une erreur
          return [];
        }
      }

      // Si l'API retourne directement un tableau
      if (Array.isArray(data)) {
        console.log(`🔄 CourseService.getCourses: Format tableau direct, transformation de ${data.length} cours...`);
        try {
          return data
            .map((courseData: any) => {
              try {
                return this.transformCourseFromDB(courseData);
              } catch (error) {
                console.error('❌ CourseService.getCourses: Erreur transformation', error);
                return null;
              }
            })
            .filter((course): course is Course => course !== null && course.id !== undefined);
        } catch (error) {
          console.error('❌ CourseService.getCourses: Erreur transformation tableau', error);
          return [];
        }
      }

      // Si aucun cours trouvé, retourner un tableau vide
      console.warn('⚠️ CourseService.getCourses: Format de réponse inattendu, aucun cours trouvé', data);
      return [];
    } catch (error: any) {
      console.error('❌ Erreur CourseService.getCourses:', error);

      // Si c'est un timeout, lancer une erreur spécifique
      if (error.name === 'AbortError' || error.message?.includes('Timeout') || error.message?.includes('timeout')) {
        throw new Error('La requête a pris trop de temps. Vérifiez votre connexion internet.');
      }

      // Fallback vers les données de démonstration en développement
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ CourseService.getCourses: Utilisation des données de démonstration en développement');
        try {
          return this.filterDemoCourses(demoCourses, filters);
        } catch (fallbackError) {
          console.error('❌ CourseService.getCourses: Erreur même avec fallback', fallbackError);
          return [];
        }
      }

      // En production, retourner un tableau vide plutôt que de lancer une erreur
      // Le store gérera l'affichage d'un message d'erreur approprié
      return [];
    }
  }

  // Récupérer un cours par ID
  static async getCourseById (id: string): Promise<Course> {
    // Vérifier que l'ID est valide avant de faire l'appel
    if (!id || id === 'undefined' || id.trim() === '') {
      throw new Error('ID du cours invalide ou manquant');
    }
    
    try {
      // Utiliser le client API sécurisé avec retry automatique
      const { apiClient } = await import('@/lib/api/secureApiClient');
      const result = await apiClient.get<{ success: boolean; course?: any; data?: any }>(
        `${this.baseUrl}/courses/${id}`,
        {
          retries: 2,
          retryDelay: 1000,
          timeout: 15000,
        }
      );

      if (result.error) {
        // Gérer les erreurs selon le code
        if (result.error.code === 'NOT_FOUND' || result.error.status === 404) {
          // 404: Cours non trouvé, continuer avec le fallback
          console.warn('⚠️ CourseService.getCourseById: 404, tentative avec fallback pour', id);
        } else if (result.error.code === 'FORBIDDEN' || result.error.status === 403) {
          // 403: Cours non accessible (brouillon, etc.)
          throw new Error(result.error.message || 'Ce cours n\'est pas encore disponible. Il est actuellement en brouillon.');
        } else {
          // Autres erreurs: continuer avec le fallback
          console.warn('⚠️ CourseService.getCourseById: Erreur', result.error.code, ', tentative avec fallback');
        }
      } else if (result.data) {
        const data = result.data;
        // L'API peut retourner {success: true, course: {...}} ou {success: true, data: {course: {...}}}
        const course = data.course || (data.data && data.data.course) || data.data;
        if (data.success && course) {
          // Convertir le format de la base de données au format Course
          console.log('✅ CourseService.getCourseById: Cours récupéré de l\'API', id);
          return this.transformCourseFromDB(course);
        }
      }

      // Si l'API échoue, essayer de récupérer tous les cours et filtrer
      console.log('🔄 CourseService.getCourseById: Tentative de récupération depuis la liste complète');
      try {
        const fallbackResult = await apiClient.get<{ success: boolean; courses?: any[] }>(
          `${this.baseUrl}/courses`,
          {
            retries: 1,
            retryDelay: 500,
            timeout: 15000,
          }
        );

        if (!fallbackResult.error && fallbackResult.data?.courses) {
          // Chercher par ID ou par slug
          const course = fallbackResult.data.courses.find((c: any) => 
            c && (c.id === id || c.slug === id)
          );
          if (course) {
            console.log('✅ CourseService.getCourseById: Cours trouvé dans la liste complète', id);
            return this.transformCourseFromDB(course);
          }
        }
      } catch (fallbackError: any) {
        console.warn('⚠️ CourseService.getCourseById: Erreur fallback', fallbackError.message);
      }

      // Si toujours pas trouvé, essayer les données de démonstration en développement
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 CourseService.getCourseById: Tentative avec données de démonstration');
        const course = getCourseById(id);
        if (course) {
          console.log('✅ CourseService.getCourseById: Cours trouvé dans les données de démonstration', id);
          return course;
        }
      }

      // Message d'erreur amélioré qui indique si c'est un slug ou un UUID
      const isSlug = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const errorMessage = isSlug 
        ? `Cours avec le slug "${id}" non trouvé. Vérifiez que le slug existe dans la base de données.`
        : `Cours avec l'ID "${id}" non trouvé`;
      throw new Error(errorMessage);
    } catch (error) {
      console.error('❌ Erreur CourseService.getCourseById:', error);
      if (error instanceof Error) {
        // Si l'erreur est déjà une erreur 403, la propager
        if (error.message?.includes('brouillon') || 
            error.message?.includes('non accessible')) {
          throw error;
        }
        // Améliorer le message d'erreur pour les erreurs réseau
        if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout')) {
          throw new Error('Problème de connexion. Vérifiez votre connexion internet et réessayez.');
        }
        throw error;
      }
      throw new Error(`Erreur lors de la récupération du cours: ${error}`);
    }
  }

  // Créer un cours minimal en cas d'erreur de transformation
  private static createMinimalCourse (courseData: any): Course {
    const parseArray = (value: any): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return value.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }
      return [];
    };

    return {
      id: courseData.id,
      title: courseData.title || 'Cours sans titre',
      description: courseData.description || courseData.short_description || '',
      longDescription: courseData.long_description || courseData.description || '',
      level: (courseData.level || 'beginner').toUpperCase() as CourseLevel,
      status: courseData.is_published ? 'PUBLISHED' : 'DRAFT',
      language: courseData.language || 'fr',
      price: typeof courseData.price === 'number' ? courseData.price : parseFloat(courseData.price) || 0,
      originalPrice: courseData.original_price ? (typeof courseData.original_price === 'number' ? courseData.original_price : parseFloat(courseData.original_price)) : undefined,
      isFree: !courseData.price || courseData.price === 0,
      image: courseData.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
      thumbnail: courseData.image_url || courseData.thumbnail,
      instructor: {
        id: courseData.instructor_id || 'unknown',
        firstName: courseData.instructor_name?.split(' ')[0] || 'Expert',
        lastName: courseData.instructor_name?.split(' ').slice(1).join(' ') || '',
        email: '',
        avatar: undefined,
        bio: courseData.instructor_bio || '',
        role: 'INSTRUCTOR',
      },
      category: {
        id: courseData.category_id || '',
        name: 'Non catégorisé',
        slug: 'non-categorise',
        description: '',
        isActive: true,
      },
      totalLessons: courseData.total_lessons || 0,
      totalDuration: courseData.duration || courseData.total_duration || 0,
      rating: typeof courseData.rating === 'number' ? courseData.rating : parseFloat(courseData.rating) || 4.5,
      totalStudents: courseData.display_students_count ?? courseData.total_students ?? 0,
      totalReviews: courseData.total_reviews || 0,
      isFeatured: courseData.is_featured || false,
      isPopular: courseData.is_popular || false,
      isStarterCourse: courseData.is_starter_course || false,
      isComingSoon: courseData.is_coming_soon || false,
      modules: [],
      requirements: parseArray(courseData.requirements),
      objectives: parseArray(courseData.objectives),
      features: parseArray(courseData.features),
      tags: parseArray(courseData.tags),
      certificate: courseData.certificate !== undefined ? courseData.certificate : true,
      lifetimeAccess: courseData.lifetime_access !== undefined ? courseData.lifetime_access : true,
      createdAt: courseData.created_at || new Date().toISOString(),
      updatedAt: courseData.updated_at || courseData.created_at || new Date().toISOString(),
      lastUpdated: courseData.updated_at || courseData.created_at || new Date().toISOString(),
    };
  }

  // Transformer un cours de la base de données au format Course
  private static transformCourseFromDB (courseData: any): Course {
    if (!courseData || !courseData.id) {
      throw new Error('Données de cours invalides');
    }

    // Convertir le niveau (gérer les différents formats possibles)
    let level: CourseLevel = 'DÉBUTANT';
    const courseLevel = (courseData.level || '').toLowerCase();
    if (courseLevel === 'intermediate' || courseLevel === 'intermédiaire') {
      level = 'INTERMÉDIAIRE';
    } else if (courseLevel === 'advanced' || courseLevel === 'avancé') {
      level = 'AVANCÉ';
    }

    // Convertir le status
    let status: CourseStatus = 'PUBLISHED';
    if (courseData.is_published === false || courseData.status === 'draft') {
      status = 'DRAFT';
    } else if (courseData.status === 'archived') {
      status = 'ARCHIVED';
    }

    // Construire l'instructeur (gérer plusieurs formats possibles)
    let instructor: User;
    const defaultBio = 'Instructeur expérimenté avec une passion pour l\'enseignement et le partage de connaissances.';

    // Vérifier si instructor_name et instructor_bio sont stockés directement dans le cours
    const instructorName = (courseData as any).instructor_name || '';
    const instructorBio = (courseData as any).instructor_bio || '';
    const instructorAvatar = (courseData as any).instructor_avatar_url || '';

    if (courseData.profiles && courseData.profiles.id) {
      // Format avec profiles (depuis l'API enrichie)
      // Priorité : instructor_name/bio explicitement saisis > données du profil lié (qui peut être l'admin créateur)
      const nameParts = instructorName.trim().split(' ');
      instructor = {
        id: courseData.profiles.id || courseData.instructor_id || '',
        firstName: instructorName ? nameParts[0] : (courseData.profiles.first_name || 'Expert'),
        lastName: instructorName ? nameParts.slice(1).join(' ') : (courseData.profiles.last_name || ''),
        email: courseData.profiles.email || '',
        avatar: instructorAvatar || courseData.profiles.avatar_url || undefined,
        bio: instructorBio || courseData.profiles.bio || defaultBio,
        role: 'INSTRUCTOR' as const,
      };
    } else if (courseData.instructor && courseData.instructor.id) {
      // Format alternatif avec objet instructor
      const nameParts = instructorName.trim().split(' ');
      instructor = {
        id: courseData.instructor.id || courseData.instructor_id || '',
        firstName: instructorName ? nameParts[0] : (courseData.instructor.firstName || courseData.instructor.first_name || 'Expert'),
        lastName: instructorName ? nameParts.slice(1).join(' ') : (courseData.instructor.lastName || courseData.instructor.last_name || ''),
        email: courseData.instructor.email || '',
        avatar: instructorAvatar || courseData.instructor.avatar || courseData.instructor.avatar_url || undefined,
        bio: instructorBio || courseData.instructor.bio || defaultBio,
        role: 'INSTRUCTOR' as const,
      };
    } else if (instructorName) {
      // Utiliser instructor_name si disponible
      const nameParts = instructorName.trim().split(' ');
      instructor = {
        id: courseData.instructor_id || 'unknown',
        firstName: nameParts[0] || 'Expert',
        lastName: nameParts.slice(1).join(' ') || '',
        email: '',
        avatar: instructorAvatar || undefined,
        bio: instructorBio || defaultBio,
        role: 'INSTRUCTOR' as const,
      };
    } else {
      // Pas de données d'instructeur, utiliser des valeurs par défaut
      instructor = {
        id: courseData.instructor_id || 'unknown',
        firstName: 'Expert',
        lastName: '',
        email: '',
        avatar: instructorAvatar || undefined,
        bio: instructorBio || defaultBio,
        role: 'INSTRUCTOR' as const,
      };
    }

    // Construire la catégorie (gérer plusieurs formats possibles)
    let category: Category;
    if (courseData.categories) {
      category = {
        id: courseData.categories.id || courseData.category_id || '',
        name: courseData.categories.name || 'Non catégorisé',
        slug: courseData.categories.slug || (courseData.categories.name || '').toLowerCase().replace(/\s+/g, '-') || 'non-categorise',
        description: courseData.categories.description || '',
        isActive: courseData.categories.isActive !== undefined ? courseData.categories.isActive : true,
      };
    } else if (courseData.category) {
      category = {
        id: courseData.category.id || courseData.category_id || '',
        name: courseData.category.name || 'Non catégorisé',
        slug: courseData.category.slug || 'non-categorise',
        description: courseData.category.description || '',
        isActive: true,
      };
    } else {
      category = {
        id: courseData.category_id || '',
        name: 'Non catégorisé',
        slug: 'non-categorise',
        description: '',
        isActive: true,
      };
    }

    // Gérer les modules (peut être un JSON string ou un tableau)
    // Le syllabus est stocké dans la DB, mais on l'appelle "modules" dans le client
    let modules: any[] = [];

    // Log pour debug
    console.log('🔍 transformCourseFromDB - Syllabus:', {
      hasModules: !!courseData.modules,
      hasSyllabus: !!courseData.syllabus,
      modulesType: typeof courseData.modules,
      syllabusType: typeof courseData.syllabus,
      syllabusPreview: typeof courseData.syllabus === 'string' ? courseData.syllabus.substring(0, 200) : 'N/A',
    });

    // Priorité 1: courseData.modules (si déjà transformé)
    if (courseData.modules) {
      if (typeof courseData.modules === 'string') {
        try {
          modules = JSON.parse(courseData.modules);
          console.log('✅ Modules parsés depuis courseData.modules:', modules.length);
        } catch (e) {
          console.error('❌ Erreur parsing courseData.modules:', e);
          modules = [];
        }
      } else if (Array.isArray(courseData.modules)) {
        modules = courseData.modules;
        console.log('✅ Modules utilisés directement depuis courseData.modules:', modules.length);
      }
    }
    // Priorité 2: courseData.syllabus (champ de la base de données)
    else if (courseData.syllabus) {
      if (typeof courseData.syllabus === 'string') {
        try {
          const parsed = JSON.parse(courseData.syllabus);
          modules = Array.isArray(parsed) ? parsed : [];
          console.log('✅ Modules parsés depuis courseData.syllabus:', modules.length);
        } catch (e) {
          console.error('❌ Erreur parsing courseData.syllabus:', e);
          console.error('   Syllabus brut:', courseData.syllabus.substring(0, 500));
          modules = [];
        }
      } else if (Array.isArray(courseData.syllabus)) {
        modules = courseData.syllabus;
        console.log('✅ Modules utilisés directement depuis courseData.syllabus:', modules.length);
      }
    } else {
      console.warn('⚠️ Aucun syllabus ou modules trouvé dans courseData');
    }

    // Transformer lessonList en lessons pour l'affichage (la page de détails attend module.lessons)
    modules = modules.map((module: any) => {
      // Si le module a lessonList, le convertir en lessons
      if (module.lessonList && Array.isArray(module.lessonList)) {
        return {
          ...module,
          lessons: module.lessonList.map((lesson: any) => {
            // Déterminer le type automatiquement si non défini
            let lessonType: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' = lesson.type || 'TEXT';
            if (!lesson.type) {
              if (lesson.videoUrl) {
                lessonType = 'VIDEO';
              } else if (lesson.pdfUrl || lesson.fileUrl) {
                lessonType = 'ASSIGNMENT';
              }
            }

            return {
              ...lesson,
              type: lessonType,
              // Préserver tous les champs de fichiers
              videoUrl: lesson.videoUrl || undefined,
              pdfUrl: lesson.pdfUrl || undefined,
              fileUrl: lesson.fileUrl || undefined,
            };
          }),
        };
      }
      // Si le module a déjà lessons, le garder tel quel mais s'assurer que le type est défini
      if (module.lessons && Array.isArray(module.lessons)) {
        return {
          ...module,
          lessons: module.lessons.map((lesson: any) => {
            // Déterminer le type automatiquement si non défini
            let lessonType: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' = lesson.type || 'TEXT';
            if (!lesson.type) {
              if (lesson.videoUrl) {
                lessonType = 'VIDEO';
              } else if (lesson.pdfUrl || lesson.fileUrl) {
                lessonType = 'ASSIGNMENT';
              }
            }

            return {
              ...lesson,
              type: lessonType,
            };
          }),
        };
      }
      // Sinon, créer un tableau lessons vide
      return {
        ...module,
        lessons: [],
      };
    });

    // Gérer les tableaux (features, requirements, objectives, tags)
    const parseArray = (value: any): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return value.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }
      return [];
    };

    return {
      id: courseData.id,
      slug: courseData.slug || undefined, // Slug pour les URLs lisibles
      title: courseData.title || 'Cours sans titre',
      description: courseData.description || courseData.short_description || '',
      shortDescription: courseData.short_description || courseData.description || '', // Ajouter shortDescription explicitement
      longDescription: courseData.long_description || courseData.description || '',
      instructor,
      category,
      level,
      status,
      language: courseData.language || 'fr',
      modules,
      // Utiliser totalLessons depuis l'API en priorité (source de vérité synchronisée)
      totalLessons: (() => {
        // Priorité 1: Valeur fournie par l'API (depuis table lessons ou syllabus)
        if (typeof courseData.total_lessons === 'number' && courseData.total_lessons > 0) {
          return courseData.total_lessons;
        }
        if (typeof courseData.totalLessons === 'number' && courseData.totalLessons > 0) {
          return courseData.totalLessons;
        }
        // Priorité 2: Calculer depuis les modules (fallback)
        if (modules && Array.isArray(modules)) {
          const total = modules.reduce((sum, module) => {
            if (module.lessons && Array.isArray(module.lessons)) {
              return sum + module.lessons.length;
            }
            if (module.lessonList && Array.isArray(module.lessonList)) {
              return sum + module.lessonList.length;
            }
            return sum;
          }, 0);
          return total > 0 ? total : 0;
        }
        return 0;
      })(),
      // Calculer totalDuration depuis les modules si disponible
      totalDuration: (() => {
        if (courseData.duration) return courseData.duration;
        if (courseData.total_duration) return courseData.total_duration;
        // Calculer depuis les modules/leçons
        if (modules && Array.isArray(modules)) {
          const total = modules.reduce((sum, module) => {
            let moduleDuration = 0;
            if (module.lessons && Array.isArray(module.lessons)) {
              moduleDuration = module.lessons.reduce((s: number, lesson: any) => s + (lesson.duration || 0), 0);
            } else if (module.lessonList && Array.isArray(module.lessonList)) {
              moduleDuration = module.lessonList.reduce((s: number, lesson: any) => s + (lesson.duration || 0), 0);
            }
            return sum + moduleDuration;
          }, 0);
          return total > 0 ? total : 0;
        }
        return 0;
      })(),
      price: typeof courseData.price === 'number' ? courseData.price : parseFloat(courseData.price) || 0,
      originalPrice: courseData.original_price ? (typeof courseData.original_price === 'number' ? courseData.original_price : parseFloat(courseData.original_price)) : undefined,
      isFree: !courseData.price || courseData.price === 0 || parseFloat(courseData.price) === 0,
      certificate: courseData.certificate !== undefined ? courseData.certificate : true,
      lifetimeAccess: courseData.lifetime_access !== undefined ? courseData.lifetime_access : true,
      rating: typeof courseData.rating === 'number' ? courseData.rating : parseFloat(courseData.rating) || 4.5,
      totalStudents: courseData.display_students_count ?? courseData.total_students ?? courseData.totalStudents ?? 0,
      totalReviews: courseData.total_reviews || courseData.totalReviews || 0,
      features: parseArray(courseData.features),
      requirements: parseArray(courseData.requirements),
      objectives: parseArray(courseData.objectives),
      thumbnail: courseData.image_url || courseData.thumbnail,
      image: courseData.image_url || courseData.image,
      videoPreview: courseData.video_preview,
      tags: parseArray(courseData.tags),
      isFeatured: courseData.is_featured || false,
      isPopular: courseData.is_popular || false,
      // Transformer is_starter_course en isStarterCourse (gérer les deux formats)
      isStarterCourse: courseData.is_starter_course === true || courseData.isStarterCourse === true || false,
      isComingSoon: courseData.is_coming_soon === true || courseData.isComingSoon === true || false,
      // Exposer instructor_name, instructor_bio et instructor_avatar_url pour les cours starters
      instructorName: (courseData as any).instructor_name || undefined,
      instructorBio: (courseData as any).instructor_bio || undefined,
      instructorAvatar: (courseData as any).instructor_avatar_url || undefined,
      lastUpdated: courseData.updated_at || courseData.created_at || new Date().toISOString(),
      createdAt: courseData.created_at || new Date().toISOString(),
      updatedAt: courseData.updated_at || courseData.created_at || new Date().toISOString(),
    } as any; // Type assertion pour permettre les propriétés supplémentaires
  }

  // Récupérer les cours par catégorie
  static async getCoursesByCategory (categorySlug: string): Promise<Course[]> {
    try {
      // En mode développement, utiliser les données de démonstration
      if (process.env.NODE_ENV === 'development') {
        return getCoursesByCategory(categorySlug);
      }

      // En production, appeler l'API
      const response = await fetch(`${this.baseUrl}/public/categories/${categorySlug}/courses`);

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des cours de la catégorie: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur CourseService.getCoursesByCategory:', error);
      // Fallback vers les données de démonstration en cas d'erreur
      return getCoursesByCategory(categorySlug);
    }
  }

  // S'inscrire à un cours
  static async enrollInCourse (courseId: string, userId: string): Promise<Enrollment> {
    try {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${this.baseUrl}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur lors de l'inscription: ${response.status}`);
      }

      const data = await response.json();
      // Retourner l'enrollment depuis la réponse de l'API
      return data.enrollment || data;
    } catch (error) {
      console.error('Erreur CourseService.enrollInCourse:', error);
      throw error;
    }
  }

  // Se désinscrire d'un cours
  static async unenrollFromCourse (courseId: string, _userId: string): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${this.baseUrl}/enrollments/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la désinscription: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur CourseService.unenrollFromCourse:', error);
      throw error;
    }
  }

  // Récupérer la progression d'un utilisateur dans un cours
  static async getCourseProgress (courseId: string, _userId: string): Promise<CourseProgress> {
    try {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${this.baseUrl}/courses/${courseId}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération de la progression: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur CourseService.getCourseProgress:', error);
      // Retourner une progression par défaut en cas d'erreur
      return {
        completedLessons: 0,
        totalLessons: 0,
        percentage: 0,
        currentLesson: null,
        timeSpent: 0,
        lastAccessed: new Date().toISOString(),
      };
    }
  }

  // Marquer une leçon comme terminée
  static async completeLesson (lessonId: string, courseId: string, userId: string): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${this.baseUrl}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la validation de la leçon: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur CourseService.completeLesson:', error);
      throw error;
    }
  }

  // Rechercher des cours
  static async searchCourses (query: string, filters?: CourseFilters): Promise<Course[]> {
    try {
      // En mode développement, utiliser les données de démonstration
      if (process.env.NODE_ENV === 'development') {
        const filteredCourses = this.filterDemoCourses(demoCourses, filters);
        return filteredCourses.filter(course =>
          course.title.toLowerCase().includes(query.toLowerCase()) ||
          course.description.toLowerCase().includes(query.toLowerCase()) ||
          course.category.name.toLowerCase().includes(query.toLowerCase()),
        );
      }

      // En production, appeler l'API
      const queryParams = new URLSearchParams();
      queryParams.append('search', query);

      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.level) queryParams.append('level', filters.level);
      if (filters?.price) queryParams.append('price', filters.price);

      const response = await fetch(`${this.baseUrl}/public/courses/search?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Erreur lors de la recherche: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur CourseService.searchCourses:', error);
      // Fallback vers les données de démonstration en cas d'erreur
      return this.filterDemoCourses(demoCourses, filters);
    }
  }

  // Récupérer les cours populaires
  static async getPopularCourses (limit: number = 6): Promise<Course[]> {
    try {
      // En mode développement, utiliser les données de démonstration
      if (process.env.NODE_ENV === 'development') {
        return getPopularCourses(limit);
      }

      // En production, appeler l'API
      const response = await fetch(`${this.baseUrl}/public/courses/popular?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des cours populaires: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur CourseService.getPopularCourses:', error);
      // Fallback vers les données de démonstration en cas d'erreur
      return getPopularCourses(limit);
    }
  }

  // Récupérer les cours recommandés pour un utilisateur
  static async getRecommendedCourses (userId: string, limit: number = 6): Promise<Course[]> {
    try {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // En mode développement, utiliser les données de démonstration
      if (process.env.NODE_ENV === 'development') {
        return getRecommendedCourses(userId, limit);
      }

      // En production, appeler l'API
      const response = await fetch(`${this.baseUrl}/courses/recommended?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des cours recommandés: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur CourseService.getRecommendedCourses:', error);
      // Fallback vers les données de démonstration en cas d'erreur
      return getRecommendedCourses(userId, limit);
    }
  }

  // Filtrer les cours de démonstration
  private static filterDemoCourses (courses: Course[], filters?: CourseFilters): Course[] {
    let filteredCourses = [...courses];

    if (filters?.category) {
      filteredCourses = filteredCourses.filter(course => course.category.id === filters.category);
    }

    if (filters?.level) {
      filteredCourses = filteredCourses.filter(course => course.level === filters.level);
    }

    if (filters?.price) {
      if (filters.price === 'free') {
        filteredCourses = filteredCourses.filter(course => course.isFree);
      } else if (filters.price === 'paid') {
        filteredCourses = filteredCourses.filter(course => !course.isFree);
      }
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.category.name.toLowerCase().includes(searchLower),
      );
    }

    // Tri
    if (filters?.sortBy) {
      switch (filters.sortBy) {
      case 'rating':
        filteredCourses.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filteredCourses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price':
        filteredCourses.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'popular':
      default:
        filteredCourses.sort((a, b) => b.totalStudents - a.totalStudents);
        break;
      }
    }

    return filteredCourses;
  }
}
