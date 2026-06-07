import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError } from '@/lib/errors';

// GET /api/admin/reports - Récupérer les données de rapports
async function GET (request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get('range') || '30');

    // Calculer les dates une seule fois
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);
    const startDateISO = startDate.toISOString();

    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - range * 2);
    const previousStartDateISO = previousStartDate.toISOString();

    // =========================================================================
    // BATCH 1 — Toutes les requêtes indépendantes en parallèle (10 requêtes)
    // =========================================================================
    const [
      totalUsersCount,
      totalCoursesCount,
      totalEnrollmentsCount,
      totalRevenueData,
      usersData,
      coursesData,
      enrollmentsData,
      paymentsData,
      // Catégories avec JOIN en une seule requête (remplace les 2 requêtes séquentielles)
      categoryStatsRaw,
      topCoursesData,
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      // COUNT + SUM en parallèle — évite de charger toutes les lignes en mémoire
      Promise.all([
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.rpc('sum_completed_payments'),
      ]).then(([countRes, sumRes]) => ({
        data: { count: countRes.count ?? 0, sum: Number(sumRes.data) || 0 },
      })),

      // Données récentes
      supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role, created_at')
        .gte('created_at', startDateISO)
        .order('created_at', { ascending: false }),
      supabase
        .from('courses')
        .select('id, title, price, is_published, created_at')
        .gte('created_at', startDateISO)
        .order('created_at', { ascending: false }),
      supabase
        .from('enrollments')
        .select('id, user_id, course_id, enrolled_at, status')
        .or(`enrolled_at.gte.${startDateISO},and(enrolled_at.is.null,created_at.gte.${startDateISO})`)
        .order('enrolled_at', { ascending: false }),
      supabase
        .from('payments')
        .select('id, user_id, course_id, amount, status, created_at')
        .gte('created_at', startDateISO)
        .eq('status', 'completed')
        .order('created_at', { ascending: false }),

      // Catégories: JOIN en une passe (course → categories) — remplace 2 requêtes séquentielles
      supabase
        .from('courses')
        .select('category_id, categories:category_id(name)')
        .is('deleted_at', null),

      // Top 10 cours pour les stats de complétion (triés par inscriptions ensuite)
      supabase
        .from('courses')
        .select('id, title')
        .eq('is_published', true)
        .limit(20),
    ]);

    const topCourseIds = (topCoursesData.data || []).map((c: any) => c.id);

    // =========================================================================
    // BATCH 2 — Période précédente + stats de complétion en parallèle (5 requêtes)
    // Remplace la boucle N+1 : 20 requêtes → 1 seule requête pour les 10 cours
    // =========================================================================
    const completionPromise = topCourseIds.length > 0
      ? supabase
          .from('enrollments')
          .select('course_id, status')
          .in('course_id', topCourseIds)
          .in('status', ['active', 'completed'])
      : Promise.resolve({ data: [] as Array<{ course_id: string; status: string }> });

    const [
      previousUsersData,
      previousCoursesData,
      previousEnrollmentsData,
      previousPaymentsData,
      completionData,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', previousStartDateISO)
        .lt('created_at', startDateISO),
      supabase
        .from('courses')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', previousStartDateISO)
        .lt('created_at', startDateISO),
      supabase
        .from('enrollments')
        .select('id', { count: 'exact', head: true })
        .or(`enrolled_at.gte.${previousStartDateISO},and(enrolled_at.is.null,created_at.gte.${previousStartDateISO})`)
        .or(`enrolled_at.lt.${startDateISO},and(enrolled_at.is.null,created_at.lt.${startDateISO})`),
      supabase
        .from('payments')
        .select('amount', { count: 'exact' })
        .gte('created_at', previousStartDateISO)
        .lt('created_at', startDateISO)
        .eq('status', 'completed'),
      completionPromise,
    ]);

    // =========================================================================
    // Calculs en mémoire
    // =========================================================================

    // Totaux absolus
    const totalUsers = totalUsersCount.count || 0;
    const totalCourses = totalCoursesCount.count || 0;
    const totalEnrollments = totalEnrollmentsCount.count || 0;
    const totalPayments = (totalRevenueData.data as any)?.count || 0;
    const totalRevenue  = (totalRevenueData.data as any)?.sum  || 0;

    // Tendances
    const previousUsers = previousUsersData.count || 0;
    const previousCourses = previousCoursesData.count || 0;
    const previousEnrollments = previousEnrollmentsData.count || 0;
    const previousRevenue = previousPaymentsData.data?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

    const currentPeriodUsers = usersData.data?.length || 0;
    const currentPeriodCourses = coursesData.data?.length || 0;
    const currentPeriodEnrollments = enrollmentsData.data?.length || 0;
    const currentPeriodRevenue = paymentsData.data?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

    const calcGrowth = (current: number, previous: number) =>
      previous > 0 ? (current - previous) / previous * 100 : (current > 0 ? 100 : 0);

    // Catégories: agréger en JS depuis la requête jointe (évite la 2e requête)
    const categoryCounts: Record<string, { name: string; count: number }> = {};
    if (categoryStatsRaw.data) {
      categoryStatsRaw.data.forEach((course: any) => {
        if (course.category_id) {
          if (!categoryCounts[course.category_id]) {
            categoryCounts[course.category_id] = {
              name: (course.categories as any)?.name || 'Non catégorisé',
              count: 0,
            };
          }
          categoryCounts[course.category_id]!.count++;
        }
      });
    }

    const categoryBreakdown = Object.entries(categoryCounts).map(([id, { name, count }]) => ({
      categoryId: id,
      categoryName: name,
      count,
    }));

    // Stats de complétion: agréger en JS depuis la requête unique (remplace la boucle N+1)
    const enrollmentsByCourse = new Map<string, { total: number; completed: number }>();
    for (const e of (completionData.data || [])) {
      const entry = enrollmentsByCourse.get(e.course_id) ?? { total: 0, completed: 0 };
      entry.total++;
      if (e.status === 'completed') entry.completed++;
      enrollmentsByCourse.set(e.course_id, entry);
    }

    const courseCompletion = (topCoursesData.data || []).map((course: any) => {
      const stats = enrollmentsByCourse.get(course.id) ?? { total: 0, completed: 0 };
      return {
        title: course.title,
        completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
        totalStudents: stats.total,
      };
    }).sort((a: any, b: any) => b.totalStudents - a.totalStudents);

    return NextResponse.json({
      success: true,
      period: `${range} jours`,
      summary: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalPayments,
        totalRevenue,
        usersGrowth: Math.round(calcGrowth(currentPeriodUsers, previousUsers) * 100) / 100,
        coursesGrowth: Math.round(calcGrowth(currentPeriodCourses, previousCourses) * 100) / 100,
        enrollmentsGrowth: Math.round(calcGrowth(currentPeriodEnrollments, previousEnrollments) * 100) / 100,
        revenueGrowth: Math.round(calcGrowth(currentPeriodRevenue, previousRevenue) * 100) / 100,
      },
      categoryBreakdown,
      courseCompletion,
      users: usersData.data || [],
      courses: coursesData.data || [],
      enrollments: enrollmentsData.data || [],
      payments: paymentsData.data || [],
    });
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération des rapports:', error);
    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
export const GET_handler = withAdminAuth(GET);

export { GET_handler as GET };
