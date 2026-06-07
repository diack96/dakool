import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';

/**
 * POST /api/admin/sync-profiles
 * Crée les profils manquants pour les utilisateurs qui existent dans auth.users
 * mais pas dans la table profiles (cas des inscriptions avant la mise en place du trigger).
 * Idempotent : n'écrase pas les profils existants.
 */
async function POST (_request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();

    // Paginer auth.users pour traiter tous les utilisateurs
    let page = 1;
    const perPage = 1000;
    let created = 0;
    let skipped = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

      if (error) {
        console.error('sync-profiles: erreur listUsers', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      const users = data?.users ?? [];
      if (users.length < perPage) hasMore = false;

      if (users.length === 0) break;

      // Construire les profils à insérer (ignoreDuplicates = ON CONFLICT DO NOTHING)
      const profiles = users.map((u: { id: string; email?: string; user_metadata?: Record<string, unknown> }) => ({
        id: u.id,
        email: u.email ?? null,
        first_name: (u.user_metadata?.first_name as string | undefined) ?? '',
        last_name: (u.user_metadata?.last_name as string | undefined) ?? '',
        full_name: (u.user_metadata?.full_name as string | undefined) ?? '',
        role: (u.user_metadata?.role as string | undefined) ?? 'student',
        welcome_email_sent: false,
        onboarding_completed: false,
      }));

      const { error: upsertError, data: upserted } = await supabase
        .from('profiles')
        .upsert(profiles, { onConflict: 'id', ignoreDuplicates: true })
        .select('id');

      if (upsertError) {
        console.error('sync-profiles: erreur upsert', upsertError);
        return NextResponse.json({ success: false, error: upsertError.message }, { status: 500 });
      }

      created += upserted?.length ?? 0;
      skipped += profiles.length - (upserted?.length ?? 0);
      page++;
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      message: `Synchronisation terminée : ${created} profil(s) créé(s), ${skipped} déjà existant(s).`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('sync-profiles error:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export const POST_handler = withAdminAuth(POST);
export { POST_handler as POST };
