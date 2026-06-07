import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
// Note: apiLogger (winston) désactivé pour compatibilité Edge Runtime
// Utiliser console.log/error/warn à la place
// import { apiLogger } from '@/lib/logger';

// GET /api/stats - Statistiques publiques pour la page d'accueil
export async function GET (_request: NextRequest) {
  // Vérifier si on est en production (Vercel définit automatiquement VERCEL)
  const isProduction = (process.env.NODE_ENV as string) === 'production' || !!process.env.VERCEL;
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // En production, retourner des statistiques par défaut plutôt qu'une erreur 500
      if (isProduction) {
        console.warn('Variables d\'environnement Supabase manquantes en production, retour de statistiques par défaut');
        return NextResponse.json({
          success: true,
          stats: {
            users: { total: 0 },
            courses: { published: 0 },
            enrollments: { total: 0 },
            progress: { completionRate: 0 },
          },
        }, { status: 200 });
      }
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration Supabase manquante',
        },
        { status: 500 },
      );
    }

    let cookieStore;
    try {
      cookieStore = await cookies();
    } catch (cookieError) {
      console.error('Erreur lors de la récupération des cookies pour stats', cookieError);
      // En cas d'erreur de cookies, retourner des statistiques par défaut
      return NextResponse.json({
        success: true,
        stats: {
          users: { total: 0 },
          courses: { published: 0 },
          enrollments: { total: 0 },
          progress: { completionRate: 0 },
        },
      });
    }
    
    let supabase;
    try {
      supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll () {
              try {
                return cookieStore.getAll();
              } catch {
                return [];
              }
            },
            setAll (cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options),
                );
              } catch {
                // Ignorer les erreurs de cookies
              }
            },
          },
        },
      );
    } catch (clientError) {
      console.error('Failed to create Supabase client for stats', clientError);
      // En cas d'erreur, retourner des statistiques par défaut
      return NextResponse.json({
        success: true,
        stats: {
          users: { total: 0 },
          courses: { published: 0 },
          enrollments: { total: 0 },
          progress: { completionRate: 0 },
        },
      });
    }

    // Récupérer les statistiques avec gestion d'erreur individuelle
    const [usersResult, coursesResult, enrollmentsResult, progressResult, lessonsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student'),
      // En production, compter tous les cours (même non publiés) pour affichage
      // En développement, filtrer par is_published
      isProduction
        ? supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
        : supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true),
      supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true),
      supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true }),
    ]);
    
    // Vérifier les erreurs individuelles et les logger
    if (usersResult.error) {
      console.warn('Erreur lors de la récupération des utilisateurs', usersResult.error);
    }
    
    if (coursesResult.error) {
      console.warn('Erreur lors de la récupération des cours', coursesResult.error);
    }
    
    if (enrollmentsResult.error) {
      console.warn('Erreur lors de la récupération des inscriptions', enrollmentsResult.error);
    }
    
    if (progressResult.error) {
      console.warn('Erreur lors de la récupération de la progression', progressResult.error);
    }
    
    if (lessonsResult.error) {
      console.warn('Erreur lors de la récupération des leçons', lessonsResult.error);
    }

    // Si erreur RLS critique, en production retourner des stats par défaut
    if (coursesResult.error && (coursesResult.error.code === '42501' || coursesResult.error.message?.includes('permission denied'))) {
      if (isProduction) {
        console.warn('Erreur RLS en production, retour de statistiques par défaut', {
          error: coursesResult.error.message,
          code: coursesResult.error.code,
        });
        return NextResponse.json({
          success: true,
          stats: {
            users: { total: 0 },
            courses: { published: 0 },
            enrollments: { total: 0 },
            progress: { completionRate: 0 },
          },
        }, { status: 200 });
      }
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur de permissions - Vérifiez les politiques RLS pour la table courses',
          details: coursesResult.error.message,
          code: coursesResult.error.code,
        },
        { status: 403 },
      );
    }

    // Extraire les comptes (utiliser 0 si erreur)
    const totalUsers = usersResult.error ? 0 : (usersResult.count || 0);
    const publishedCourses = coursesResult.error ? 0 : (coursesResult.count || 0);
    const totalEnrollments = enrollmentsResult.error ? 0 : (enrollmentsResult.count || 0);
    const completedLessons = progressResult.error ? 0 : (progressResult.count || 0);
    const totalLessons = lessonsResult.error ? 0 : (lessonsResult.count || 0);

    // Calculer le taux de complétion
    const completionRate = totalLessons > 0
      ? ((completedLessons / totalLessons) * 100)
      : 0;

    const stats = {
      users: {
        total: totalUsers,
      },
      courses: {
        published: publishedCourses,
      },
      enrollments: {
        total: totalEnrollments,
      },
      progress: {
        completionRate: Math.round(completionRate),
      },
    };

    const response = NextResponse.json(
      { success: true, stats },
      { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600' } },
    );
    return response;
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération des statistiques publiques', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as any)?.code;
    
    // En production, toujours retourner des statistiques par défaut plutôt qu'une erreur 500
    // Cela permet à l'application de continuer à fonctionner
    if (isProduction) {
        console.warn('Erreur en production, retour de statistiques par défaut pour éviter 500', {
        error: errorMessage,
        code: errorCode,
      });
      return NextResponse.json({
        success: true,
        stats: {
          users: { total: 0 },
          courses: { published: 0 },
          enrollments: { total: 0 },
          progress: { completionRate: 0 },
        },
      }, { status: 200 });
    }
    
    // En développement, retourner l'erreur détaillée
    if (errorMessage?.includes('cookies') || errorMessage?.includes('Dynamic server usage')) {
      console.warn('Erreur liée aux cookies, retour de statistiques par défaut', error);
      return NextResponse.json({
        success: true,
        stats: {
          users: { total: 0 },
          courses: { published: 0 },
          enrollments: { total: 0 },
          progress: { completionRate: 0 },
        },
      });
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
        details: errorMessage,
        code: errorCode,
        type: error instanceof Error ? error.name : typeof error,
      },
      { status: 500 },
    );
  }
}
