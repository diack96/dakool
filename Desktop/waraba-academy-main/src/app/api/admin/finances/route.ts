import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError } from '@/lib/errors';

// GET /api/admin/finances - Données financières
async function GET(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const { searchParams } = new URL(request.url);

    const range = parseInt(searchParams.get('range') || '30');
    const statusFilter = searchParams.get('status') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const offset = (page - 1) * limit;

    // Dates
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);
    const startDateISO = startDate.toISOString();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

    // Période précédente pour comparaison
    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - range * 2);
    const previousEndDate = new Date();
    previousEndDate.setDate(previousEndDate.getDate() - range);
    const previousStartISO = previousStartDate.toISOString();
    const previousEndISO = previousEndDate.toISOString();

    // Construire la requête paginée avant le Promise.all pour la paralléliser
    let paymentsQuery = supabase
      .from('payments')
      .select(`
        id,
        user_id,
        course_id,
        amount,
        currency,
        status,
        payment_method,
        created_at,
        paid_at,
        profiles:user_id (
          email,
          first_name,
          last_name
        ),
        courses:course_id (
          title
        )
      `, { count: 'exact' })
      .gte('created_at', startDateISO)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (statusFilter !== 'all') {
      paymentsQuery = paymentsQuery.eq('status', statusFilter);
    }

    // =========================================================================
    // BATCH — 3 requêtes en parallèle (au lieu de 2 séquentielles)
    // =========================================================================
    const [periodStatsData, paymentsResult, allTimeRevenueData] = await Promise.all([
      // 1. Paiements complétés sur la fenêtre 2×range (couvre période + comparaison)
      //    Borné dans le temps → payload maîtrisé (remplace allCompleted sans filtre)
      supabase
        .from('payments')
        .select('amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', previousStartISO),

      // 2. Liste paginée avec relations (pour le tableau)
      paymentsQuery,

      // 3. Revenue total (toute l'histoire) — RPC SUM, évite de charger toutes les lignes
      supabase.rpc('sum_completed_payments'),
    ]);

    const { data: payments, error: paymentsError, count: paymentsCount } = paymentsResult;

    if (paymentsError) {
      console.error('Erreur récupération paiements:', paymentsError);
    }

    // =========================================================================
    // Calculs en mémoire — une seule passe sur periodStatsData
    // =========================================================================
    let periodRevenue = 0;
    let monthlyRevenue = 0;
    let weeklyRevenue = 0;
    let todayRevenue = 0;
    let previousRevenue = 0;
    let completedCountInPeriod = 0;

    // dailyRevenue: graphique sur la période courante uniquement (startDateISO → now)
    const dailyRevenueMap: Record<string, { revenue: number; count: number }> = {};

    for (const p of (periodStatsData.data || [])) {
      const amount = p.amount || 0;
      const createdAt = p.created_at as string;

      if (createdAt >= startDateISO) {
        periodRevenue += amount;
        completedCountInPeriod++;

        // Graphique quotidien — seule la période courante (pas la précédente)
        const dateKey = createdAt.slice(0, 10);
        if (!dailyRevenueMap[dateKey]) dailyRevenueMap[dateKey] = { revenue: 0, count: 0 };
        dailyRevenueMap[dateKey].revenue += amount;
        dailyRevenueMap[dateKey].count++;
      } else if (createdAt >= previousStartISO && createdAt < previousEndISO) {
        previousRevenue += amount;
      }

      if (createdAt >= startOfMonth)  monthlyRevenue += amount;
      if (createdAt >= startOfWeek)   weeklyRevenue  += amount;
      if (createdAt >= startOfToday)  todayRevenue   += amount;
    }

    // Revenue total (toute l'histoire) — valeur directe depuis la RPC SUM
    const totalRevenue = Number(allTimeRevenueData.data) || 0;

    // =========================================================================
    // Stats à partir de la liste paginée (scope = page courante)
    // =========================================================================
    const formattedPayments = (payments || []).map((p: any) => ({
      ...p,
      user: p.profiles,
      course: p.courses,
    }));

    const completedPayments = (payments || []).filter((p: any) => p.status === 'completed');
    const pendingPayments   = (payments || []).filter((p: any) => p.status === 'pending');
    const failedPayments    = (payments || []).filter((p: any) => p.status === 'failed');
    const refundedPayments  = (payments || []).filter((p: any) => p.status === 'refunded');

    const refundedAmount = refundedPayments
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    // averageOrderValue: diviseur correct = nombre de complétés sur TOUTE la période
    // (pas seulement la page courante)
    const averageOrderValue = completedCountInPeriod > 0
      ? periodRevenue / completedCountInPeriod
      : 0;

    // Croissance
    const revenueGrowth = previousRevenue > 0
      ? ((periodRevenue - previousRevenue) / previousRevenue) * 100
      : (periodRevenue > 0 ? 100 : 0);

    // =========================================================================
    // Graphique quotidien — remplir les jours sans ventes
    // =========================================================================
    const dailyRevenue: { date: string; revenue: number; count: number }[] = [];
    const cursor = new Date(startDateISO);
    const endDate = new Date();

    while (cursor <= endDate) {
      const dateStr = cursor.toISOString().slice(0, 10);
      dailyRevenue.push({
        date: dateStr,
        revenue: dailyRevenueMap[dateStr]?.revenue || 0,
        count:   dailyRevenueMap[dateStr]?.count   || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const stats = {
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      todayRevenue,
      totalTransactions:     paymentsCount || 0,
      completedTransactions: completedPayments.length,
      pendingTransactions:   pendingPayments.length,
      failedTransactions:    failedPayments.length,
      refundedAmount,
      averageOrderValue: Math.round(averageOrderValue),
      revenueGrowth:     Math.round(revenueGrowth * 100) / 100,
    };

    return NextResponse.json(
      {
        success: true,
        stats,
        payments: formattedPayments,
        dailyRevenue,
        pagination: {
          page,
          limit,
          totalCount: paymentsCount || 0,
          totalPages: Math.ceil((paymentsCount || 0) / limit),
        },
      },
      {
        headers: {
          // Données financières : cache côté client 30s, CDN 60s
          'Cache-Control': 'private, max-age=30, s-maxage=60, stale-while-revalidate=120',
        },
      },
    );
  } catch (error) {
    console.error('Erreur API finances:', error);
    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
export const GET_handler = withAdminAuth(GET);

export { GET_handler as GET };
