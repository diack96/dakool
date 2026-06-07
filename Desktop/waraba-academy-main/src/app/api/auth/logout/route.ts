import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// POST /api/auth/logout - Déconnexion côté serveur (efface les cookies de session)
export async function POST(request: NextRequest) {
  const redirectUrl = new URL('/auth/login', request.url);
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Révoquer la session côté serveur et effacer les cookies
  await supabase.auth.signOut({ scope: 'global' });

  return response;
}
