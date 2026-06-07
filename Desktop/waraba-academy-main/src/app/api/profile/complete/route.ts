import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * POST /api/profile/complete
 * Met à jour first_name + last_name dans la table profiles.
 * Utilisé par ProfileNameGuard pour forcer la complétion du profil
 * avant l'accès au certificat.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const firstName = (body.firstName ?? '').trim();
    const lastName  = (body.lastName  ?? '').trim();

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Le prénom et le nom de famille sont obligatoires.' },
        { status: 400 },
      );
    }

    // Refuser les valeurs suspectes (email, username avec chiffres…)
    const { isNameSuspicious } = await import('@/lib/certificates/nameUtils');
    if (isNameSuspicious(`${firstName} ${lastName}`)) {
      return NextResponse.json(
        { error: 'Veuillez saisir votre vrai prénom et votre vrai nom de famille.' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch { /* Server Component — ignoré */ }
          },
        },
      },
    );

    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert(
        { id: user.id, email: user.email ?? null, first_name: firstName, last_name: lastName, role: 'student' },
        { onConflict: 'id' },
      );

    if (updateError) {
      console.error('Profile complete update error:', updateError.message);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, firstName, lastName });
  } catch (err) {
    console.error('POST /api/profile/complete error:', err);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
