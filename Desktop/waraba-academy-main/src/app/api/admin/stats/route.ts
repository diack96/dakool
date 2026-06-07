import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { z } from 'zod';
import { handleApiError, createValidationError } from '@/lib/errors';
import { getAdminSupabaseClient } from '@/lib/supabase-server';

// Schéma de validation pour la période
const periodSchema = z.enum(['7d', '30d', '90d', '1y']).default('30d');

// GET /api/admin/stats - Statistiques système complètes (optimisé)
async function GET(request: NextRequest) {
  try {
    // Créer le client admin Supabase
    const supabase = getAdminSupabaseClient();

    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get('period') || '30d';

    // Validation
    const periodValidation = periodSchema.safeParse(periodParam);
    if (!periodValidation.success) {
      throw createValidationError('Période invalide. Valeurs acceptées: 7d, 30d, 90d, 1y');
    }

    const period = periodValidation.data;

    // Calculer la date de début selon la période
    const getStartDate = (period: string) => {
      const now = new Date();
      const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[period] || 30;
      return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    };

    const startDate = getStartDate(period);
    const startDateISO = startDate.toISOString();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // ============================================
    // BATCH 0: Compter les utilisateurs réels dans auth.users
    // ============================================
    let authUsersTotalReal = 0;
    try {
      const { data: authList } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
      // @supabase/auth-js ≥ 2.x expose `total` dans la réponse paginée
      authUsersTotalReal = (authList as any)?.total ?? 0;
      // Fallback si total absent : récupérer la première page et utiliser lastPage
      if (!authUsersTotalReal && (authList as any)?.lastPage) {
        // On ne peut pas connaître le total exact sans tout fetcher, garder 0
        authUsersTotalReal = 0;
      }
    } catch {
      authUsersTotalReal = 0;
    }

    // ============================================
    // BATCH 1: Requêtes de comptage indépendantes
    // ============================================
    const [
      authUsersResult,
      coursesCountResult,
      publishedCoursesResult,
      newCoursesResult,
      enrollmentsCountResult,
      newEnrollmentsResult,
      lessonsCountResult,
      completedLessonsResult,
      paymentsCountResult,
      quizzesCountResult,
      quizAttemptsResult,
      notificationsCountResult,
      unreadNotificationsResult,
      auditLogsCountResult,
    ] = await Promise.all([
      // Utilisateurs — comptage via profiles (fiable quelle que soit la taille)
      Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', startDateISO),
      ]).then(([total, recent]) => ({
        data: { total: total.count ?? 0, recent: recent.count ?? 0 },
      })).catch(() => ({ data: { total: 0, recent: 0 } })),
      // Cours
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      supabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('courses').select('id', { count: 'exact', head: true }).gte('created_at', startDateISO),
      // Inscriptions
      supabase.from('enrollments').select('id', { count: 'exact', head: true }),
      supabase.from('enrollments').select('id', { count: 'exact', head: true }).gte('enrolled_at', startDateISO),
      // Leçons
      supabase.from('lessons').select('id', { count: 'exact', head: true }),
      supabase.from('user_progress').select('id', { count: 'exact', head: true }).eq('is_completed', true).gte('completed_at', startDateISO),
      // Paiements
      supabase.from('payments').select('id', { count: 'exact', head: true }),
      // Quiz
      supabase.from('quizzes').select('id', { count: 'exact', head: true }),
      supabase.from('quiz_attempts').select('id', { count: 'exact', head: true }).gte('created_at', startDateISO),
      // Notifications
      supabase.from('notifications').select('id', { count: 'exact', head: true }),
      supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('is_read', false),
      // Audit
      supabase.from('admin_audit_logs').select('id', { count: 'exact', head: true }),
    ]);

    // ============================================
    // BATCH 2: Requêtes de données détaillées
    // ============================================
    const [
      usersByRoleResult,
      enrollmentsByStatusResult,
      paymentsByStatusResult,
      paymentsThisMonthResult,
      paymentsLastMonthResult,
      reviewsResult,
      recentAuditLogsResult,
    ] = await Promise.all([
      supabase.from('profiles').select('role').gte('created_at', startDateISO),
      // RPC COUNT GROUP BY — évite le full scan enrollments
      supabase.rpc('enrollment_status_counts'),
      supabase.from('payments').select('status, amount').gte('created_at', startDateISO),
      // RPC SUM périodique — évite de charger toutes les lignes amounts
      supabase.rpc('sum_completed_payments_period', { p_start: startOfMonth.toISOString() }),
      supabase.rpc('sum_completed_payments_period', { p_start: startOfLastMonth.toISOString(), p_end: endOfLastMonth.toISOString() }),
      // RPC AVG — évite le full scan course_reviews
      supabase.rpc('avg_course_rating'),
      supabase.from('admin_audit_logs').select('action').gte('timestamp', startDateISO).limit(100),
    ]);

    // ============================================
    // Traitement des résultats
    // ============================================

    // Utilisateurs
    const totalUsers = authUsersResult.data?.total ?? 0;
    const newUsers   = authUsersResult.data?.recent ?? 0;

    // Distribution par rôle
    const roleDistribution = (usersByRoleResult.data || []).reduce((acc: any, user: { role: string }) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Cours
    const totalCourses = coursesCountResult.count || 0;
    const publishedCourses = publishedCoursesResult.count || 0;
    const newCourses = newCoursesResult.count || 0;

    // Inscriptions
    const totalEnrollments = enrollmentsCountResult.count || 0;
    const newEnrollments = newEnrollmentsResult.count || 0;
    // RPC enrollment_status_counts retourne [{status, count}]
    const enrollmentStatusDistribution = ((enrollmentsByStatusResult.data as any[]) || []).reduce((acc: any, row: { status: string; count: number }) => {
      acc[row.status || 'unknown'] = Number(row.count) || 0;
      return acc;
    }, {});

    // Leçons et progression
    const totalLessons = lessonsCountResult.count || 0;
    const completedLessons = completedLessonsResult.count || 0;

    // Paiements
    const totalPayments = paymentsCountResult.count || 0;
    const paymentStats = (paymentsByStatusResult.data || []).reduce((acc: any, payment: { status: string; amount?: number }) => {
      if (!acc[payment.status]) {
        acc[payment.status] = { count: 0, total: 0 };
      }
      acc[payment.status].count++;
      acc[payment.status].total += payment.amount || 0;
      return acc;
    }, {});

    // RPC sum_completed_payments_period retourne un nombre directement
    const revenueThisMonth = Number(paymentsThisMonthResult.data) || 0;
    const revenueLastMonth = Number(paymentsLastMonthResult.data) || 0;
    const revenueGrowth = revenueLastMonth > 0
      ? parseFloat((((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(2))
      : revenueThisMonth > 0 ? 100 : 0;

    // Quiz
    const totalQuizzes = quizzesCountResult.count || 0;
    const quizAttempts = quizAttemptsResult.count || 0;

    // RPC avg_course_rating retourne un nombre directement
    const averageRating = Number(reviewsResult.data) || 0;

    // Notifications
    const totalNotifications = notificationsCountResult.count || 0;
    const unreadNotifications = unreadNotificationsResult.count || 0;

    // Audit
    const totalAuditLogs = auditLogsCountResult.count || 0;
    const auditActionDistribution = (recentAuditLogsResult.data || []).reduce((acc: any, log: { action: string }) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});

    // Calcul des taux
    const enrollmentRate = totalUsers ? (totalEnrollments / totalUsers * 100).toFixed(2) : '0';
    const completionRate = totalEnrollments ? (completedLessons / totalEnrollments * 100).toFixed(2) : '0';
    const paymentSuccessRate = totalPayments ? ((paymentStats.completed?.count || 0) / totalPayments * 100).toFixed(2) : '0';

    // Log de l'action admin
    await logAdminAction({
      user_id: (request as any).adminUser.id,
      action: 'stats.view',
      resource: '/api/admin/stats',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { period },
    });

    const stats = {
      period,
      startDate: startDateISO,
      users: {
        total: totalUsers,
        new: newUsers,
        byRole: roleDistribution,
        growth: {
          rate: totalUsers ? ((newUsers / totalUsers) * 100).toFixed(2) : '0',
          trend: 'increasing',
        },
        authTotal: authUsersTotalReal,
        profilesOutOfSync: authUsersTotalReal > 0 && authUsersTotalReal > totalUsers,
        missingSyncCount: authUsersTotalReal > totalUsers ? authUsersTotalReal - totalUsers : 0,
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        new: newCourses,
        publishRate: totalCourses ? ((publishedCourses / totalCourses) * 100).toFixed(2) : '0',
      },
      enrollments: {
        total: totalEnrollments,
        new: newEnrollments,
        byStatus: enrollmentStatusDistribution,
        rate: enrollmentRate,
      },
      progress: {
        totalLessons,
        completedLessons,
        completionRate,
      },
      payments: {
        total: totalPayments,
        byStatus: paymentStats,
        successRate: paymentSuccessRate,
        revenue: Object.values(paymentStats).reduce((t: number, s: any) => t + (s.total || 0), 0),
        revenueThisMonth,
        revenueGrowth,
      },
      averageRating,
      quizzes: {
        total: totalQuizzes,
        attempts: quizAttempts,
      },
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications,
        readRate: totalNotifications ? (((totalNotifications - unreadNotifications) / totalNotifications) * 100).toFixed(2) : '0',
      },
      audit: {
        totalLogs: totalAuditLogs,
        recentActions: auditActionDistribution,
        period,
      },
      system: {
        uptime: '99.9%',
        lastBackup: new Date().toISOString(),
        databaseSize: 'N/A',
        activeConnections: 'N/A',
      },
    };

    return NextResponse.json(
      {
        success: true,
        stats,
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          // Stats admin : pas de données utilisateur cross-session → private OK.
          // max-age=60 : le navigateur peut réutiliser la réponse 60s (évite les
          // doubles fetch si l'admin navigue vite). stale-while-revalidate=60 :
          // sert le cache périmé pendant que la mise à jour se fait en arrière-plan.
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=60',
        },
      },
    );
  } catch (error: unknown) {
    console.error('Erreur stats:', error);

    const adminUserId = (request as any).adminUser?.id || 'unknown';
    await logAdminAction({
      user_id: adminUserId,
      action: 'stats.view',
      resource: '/api/admin/stats',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: false,
      details: { error: error instanceof Error ? error.message : 'Erreur inconnue' },
    });

    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
export const GET_handler = withAdminAuth(GET);

export { GET_handler as GET };
