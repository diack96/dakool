import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { parseDisplayName } from '@/lib/certificates/nameUtils';

const isValidRedirect = (url: string): boolean => {
  if (!url.startsWith('/') || url.startsWith('//')) return false;
  if (/^(javascript|data|vbscript):/i.test(url)) return false;
  return true;
};

export async function GET (request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code  = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const nextParam = requestUrl.searchParams.get('next') ?? '/dashboard';
  const next = isValidRedirect(nextParam) ? nextParam : '/dashboard';

  // Supabase / Google sometimes redirects back with ?error= instead of ?code=
  if (error) {
    const msg = errorDescription || error;
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=${encodeURIComponent(msg)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/login`);
  }

  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll () {
            return cookieStore.getAll();
          },
          setAll (cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Called from a Server Component — safe to ignore; middleware refreshes session
            }
          },
        },
      },
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[auth/callback] exchangeCodeForSession error:', exchangeError.message);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=${encodeURIComponent('Erreur lors de la connexion. Veuillez réessayer.')}`,
      );
    }

    // Synchroniser les métadonnées OAuth → profil (silencieux, ne bloque pas la redirection)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const meta = user.user_metadata ?? {};

        // Garantir l'existence du profil (cas des inscriptions sans trigger DB)
        await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              email: user.email ?? null,
              role: 'student',
              welcome_email_sent: false,
              onboarding_completed: false,
            },
            { onConflict: 'id', ignoreDuplicates: true },
          );

        // Mettre à jour prénom/nom si manquants
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();

        if (!profile?.first_name?.trim() || !profile?.last_name?.trim()) {
          const givenName  = (meta.given_name  ?? '').trim();
          const familyName = (meta.family_name ?? '').trim();
          const fullName   = (meta.full_name ?? meta.name ?? '').trim();

          let firstName = givenName;
          let lastName  = familyName;

          if ((!firstName || !lastName) && fullName) {
            const parsed = parseDisplayName(fullName);
            if (parsed) {
              firstName = firstName || parsed.firstName;
              lastName  = lastName  || parsed.lastName;
            }
          }

          if (firstName && lastName) {
            await supabase
              .from('profiles')
              .update({ first_name: firstName, last_name: lastName })
              .eq('id', user.id);
          }
        }
      }
    } catch (syncErr) {
      console.error('[auth/callback] OAuth profile sync error (non-blocking):', syncErr);
    }

    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  } catch (err) {
    console.error('[auth/callback] Unexpected error:', err);
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=${encodeURIComponent('Erreur inattendue. Veuillez réessayer.')}`,
    );
  }
}
