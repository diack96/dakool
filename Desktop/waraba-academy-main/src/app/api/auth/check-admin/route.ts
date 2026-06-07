import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { apiRateLimiter } from '@/lib/rateLimit';

// Client admin pour contourner RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

async function handler(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Vérifier la session utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ isAdmin: false, error: 'Non authentifié' }, { status: 401 });
    }

    // Utiliser le client admin pour lire le profil (contourne RLS)
    const adminClient = getAdminClient();

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Créer le profil s'il n'existe pas
      const { error: insertError } = await adminClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          role: 'student',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
        });

      if (insertError) {
        console.error('Erreur création profil:', insertError);
      }

      return NextResponse.json({
        isAdmin: false,
        role: 'student',
        error: 'Profil créé avec rôle student'
      });
    }

    const isAdmin = profile.role === 'admin';

    return NextResponse.json({
      isAdmin,
      role: profile.role,
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error('Erreur check-admin:', error);
    return NextResponse.json({ isAdmin: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// Route appelée après authentification (pas un vecteur brute-force) → rate limit souple
export async function GET(request: NextRequest) {
  const rateLimitResponse = await apiRateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;
  return handler(request);
}
