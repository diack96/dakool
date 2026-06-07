import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { handleApiError } from '@/lib/errors';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
// Note: apiLogger (winston) désactivé pour compatibilité Edge Runtime
// Utiliser console.log/error/warn à la place
// import { apiLogger } from '@/lib/logger';

// GET /api/admin/users/stats - Statistiques des utilisateurs
async function GET (_request: NextRequest) {
  try {
    // Utiliser le client admin avec SERVICE_ROLE_KEY pour contourner RLS
    const supabase = getAdminSupabaseClient();

    // Récupérer toutes les statistiques en parallèle
    const [
      { count: totalUsers },
      { count: adminUsers },
      { count: instructorUsers },
      { count: studentUsers },
    ] = await Promise.all([
      // Total utilisateurs
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),

      // Administrateurs
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin'),

      // Instructeurs
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'instructor'),

      // Étudiants
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student'),
    ]);

    // Pour les utilisateurs actifs, on considère tous les utilisateurs comme actifs
    // car last_sign_in_at n'existe pas dans profiles
    // On pourrait récupérer cette info depuis auth.users si nécessaire
    const activeUsers = totalUsers || 0;

    const stats = {
      total: totalUsers || 0,
      active: activeUsers, // Tous les utilisateurs sont considérés comme actifs pour l'instant
      admins: adminUsers || 0,
      instructors: instructorUsers || 0,
      students: studentUsers || 0,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération des statistiques utilisateurs', error);
    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
export const GET_handler = withAdminAuth(GET);

export { GET_handler as GET };


