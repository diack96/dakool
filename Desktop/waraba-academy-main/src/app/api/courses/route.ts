import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase-server';

import { successResponse, errorResponse, normalizeLevel } from '@/lib/api/apiUtils';

import { apiLogger } from '@/lib/logger';



// Types

interface CourseFilters {

  category?: string;

  level?: string;

  price?: 'free' | 'paid';

  search?: string;

  sortBy?: string;

}



// Constantes de pagination

const DEFAULT_PAGE = 1;

const DEFAULT_LIMIT = 20;

const MAX_LIMIT = 100;



// GET - Récupérer tous les cours publiés

export async function GET(request: NextRequest) {

  try {

    const supabase = await createServerSupabaseClient();

    const { searchParams } = new URL(request.url);



    // Extraire la pagination

    const page = Math.max(1, parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10));

    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)));

    const offset = (page - 1) * limit;



    // Extraire les filtres

    const filters: CourseFilters = {

      category: searchParams.get('category') || undefined,

      level: searchParams.get('level') || undefined,

      price: searchParams.get('price') as 'free' | 'paid' | undefined,

      search: searchParams.get('search') || undefined,

      sortBy: searchParams.get('sortBy') || 'newest',

    };



    // Résoudre le filtre catégorie : si c'est un slug/nom (pas un UUID), chercher l'ID

    let categoryId: string | null = null;

    if (filters.category) {

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (uuidRegex.test(filters.category)) {

        categoryId = filters.category;

      } else {

        const { data: catData } = await supabase

          .from('categories')

          .select('id')

          .or(`name.ilike."${filters.category}",slug.ilike."${filters.category}"`)

          .limit(1)

          .maybeSingle() as { data: { id: string } | null };

        categoryId = catData?.id ?? null;

      }

    }



    // Construire la requête avec comptage total

    // Colonnes ciblées : on exclut les champs JSON lourds inutiles pour le listing

    // (requirements, objectives, materials, features, instructor_bio, target_audience, video_url)

    let query = supabase

      .from('courses')

      .select(

        `id, title, slug, description, short_description,

         price, original_price, level, duration, image_url, thumbnail,

         is_published, is_free, is_featured, is_popular, is_coming_soon,

         display_order, display_students_count, created_at, updated_at, status,

         category_id, instructor_id, instructor_name, certificate,

         syllabus,

         categories(id, name, description, slug)`,

        { count: 'exact' },

      )

      .or('is_published.eq.true,is_coming_soon.eq.true')

      .neq('status', 'ARCHIVED');



    // Appliquer les filtres

    if (categoryId) {

      query = query.eq('category_id', categoryId);

    }



    if (filters.level) {

      query = query.eq('level', normalizeLevel(filters.level));

    }



    // Filtre prix côté DB (avant pagination pour une pagination correcte)

    if (filters.price === 'free') {

      query = query.or('price.is.null,price.eq.0');

    } else if (filters.price === 'paid') {

      query = query.gt('price', 0);

    }



    // Recherche textuelle côté DB via ilike (avant pagination)

    if (filters.search) {

      const s = filters.search.replace(/[%_]/g, '\\$&');

      query = query.or(`title.ilike."%${s}%",description.ilike."%${s}%"`);

    }



    // Tri

    switch (filters.sortBy) {

      case 'rating':

        query = query.order('rating', { ascending: false, nullsFirst: false });

        break;

      case 'price':

        query = query.order('price', { ascending: true });

        break;

      case 'popular':

      case 'newest':

      default:

        query = query.order('created_at', { ascending: false });

        break;

    }



    // Appliquer la pagination

    query = query.range(offset, offset + limit - 1);



    const { data: courses, error, count } = await query;



    if (error) {

      apiLogger.error('[GET /api/courses] DB query error', { code: error.code, message: error.message, hint: error.hint, details: error.details });

      if (error.code === '42501') {

        return errorResponse('Erreur de permissions', { status: 403, code: 'RLS_ERROR' });

      }

      return errorResponse('Erreur lors de la récupération des cours', { status: 500 });

    }



    // Récupérer le nombre de leçons par cours depuis la table lessons

    const courseIds = (courses || []).map((c: any) => c.id);

    let lessonsCountMap: Record<string, number> = {};



    let lessonsDurationMap: Record<string, number> = {};

    let enrollmentCountMap: Record<string, number> = {};



    if (courseIds.length > 0) {

      const [lessonsResult, enrollmentsResult] = await Promise.all([

        supabase

          .from('lessons')

          .select('course_id, duration')

          .in('course_id', courseIds),

        supabase

          .from('enrollments')

          .select('course_id')

          .in('course_id', courseIds)

          .in('status', ['active', 'completed']),

      ]);



      // Compter les leçons et sommer les durées par cours

      if (lessonsResult.data) {

        lessonsResult.data.forEach((lesson: any) => {

          lessonsCountMap[lesson.course_id] = (lessonsCountMap[lesson.course_id] || 0) + 1;

          lessonsDurationMap[lesson.course_id] = (lessonsDurationMap[lesson.course_id] || 0) + (lesson.duration || 0);

        });

      }



      // Compter les étudiants inscrits par cours

      if (enrollmentsResult.data) {

        enrollmentsResult.data.forEach((e: any) => {

          enrollmentCountMap[e.course_id] = (enrollmentCountMap[e.course_id] || 0) + 1;

        });

      }

    }



    // Transformer les données avec le nombre de leçons

    let result = (courses || []).map((course: any) => {

      // Calculer le nombre de leçons : priorité à la table lessons, sinon depuis le syllabus

      let totalLessons = lessonsCountMap[course.id] || 0;



      let totalDuration = lessonsDurationMap[course.id] || 0;



      // Si pas de leçons dans la table, compter depuis le syllabus

      if (totalLessons === 0 && course.syllabus) {

        try {

          const syllabus = typeof course.syllabus === 'string'

            ? JSON.parse(course.syllabus)

            : course.syllabus;



          const modules = Array.isArray(syllabus) ? syllabus : (syllabus?.modules || []);

          totalLessons = modules.reduce((sum: number, mod: any) => {

            const lessons = mod.lessons || mod.lessonList || [];

            return sum + lessons.length;

          }, 0);

          if (totalDuration === 0) {

            totalDuration = modules.reduce((sum: number, mod: any) => {

              const lessons = mod.lessons || mod.lessonList || [];

              return sum + lessons.reduce((s: number, l: any) => s + (l.duration || 0), 0);

            }, 0);

          }

        } catch {

          totalLessons = 0;

        }

      }



      const liveCount = enrollmentCountMap[course.id] || 0;

      const studentCount = course.display_students_count ?? liveCount;



      return {

        ...course,

        category: course.categories || null,

        categories: undefined, // Supprimer le champ original

        total_lessons: totalLessons,

        totalLessons: totalLessons, // Les deux formats pour compatibilité

        total_duration: totalDuration,

        duration: totalDuration || course.duration, // Écraser duration si calculé depuis les leçons

        total_students: studentCount,

        totalStudents: studentCount,

      };

    });



    // Calculer les infos de pagination

    const totalCount = count || 0;

    const totalPages = Math.ceil(totalCount / limit);



    // Désactiver le cache pour garantir la fraîcheur des données

    return NextResponse.json(

      {

        success: true,

        courses: result,

        pagination: {

          page,

          limit,

          totalCount,

          totalPages,

          hasNextPage: page < totalPages,

          hasPrevPage: page > 1,

        },

      },

      {

        headers: {

          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',

        },

      }

    );

  } catch (error) {

    apiLogger.error('[GET /api/courses] Unexpected error', { message: error instanceof Error ? error.message : String(error) });

    return errorResponse('Erreur interne du serveur', { status: 500 });

  }

}



// POST - Créer un nouveau cours (admin uniquement)

export async function POST(request: NextRequest) {

  try {

    const supabase = await createServerSupabaseClient();



    // Vérifier l'authentification

    const { data: { session }, error: authError } = await supabase.auth.getSession();

    const user = session?.user;

    if (authError || !user) {

      return errorResponse('Non authentifié', { status: 401 });

    }



    // Vérifier le rôle admin

    const { data: profile } = await supabase

      .from('profiles')

      .select('role')

      .eq('id', user.id)

      .single();



    const profileData = profile as { role: string } | null;

    if (!profileData || profileData.role !== 'admin') {

      return errorResponse('Accès non autorisé', { status: 403 });

    }



    // Parser le body

    const body = await request.json();



    // Valider les champs requis

    if (!body.title?.trim()) {

      return errorResponse('Le titre est requis', { status: 400, code: 'VALIDATION_ERROR' });

    }



    // Créer le cours

    const courseData = {

      title: body.title.trim(),

      description: body.description?.trim() || null,

      short_description: body.short_description?.trim() || null,

      instructor_id: user.id,

      category_id: body.category_id || null,

      price: parseFloat(body.price) || 0,

      original_price: body.original_price ? parseFloat(body.original_price) : null,

      level: body.level || 'beginner',

      duration: body.duration || null,

      image_url: body.image_url || null,

      thumbnail: body.thumbnail || null,

      video_url: body.video_url || null,

      is_published: body.is_published ?? false,

      is_free: body.is_free ?? (parseFloat(body.price) === 0),

      is_featured: body.is_featured ?? false,

      syllabus: body.syllabus || null,

      requirements: body.requirements || [],

      objectives: body.objectives || [],

      target_audience: body.target_audience || [],

    };



    const { data: course, error } = await supabase

      .from('courses')

      .insert(courseData as never)

      .select()

      .single();



    if (error) {

      return errorResponse('Erreur lors de la création du cours', { status: 500 });

    }



    return successResponse(course, { status: 201 });

  } catch (error) {

    return errorResponse('Erreur interne du serveur', { status: 500 });

  }

}