import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';

// PATCH /api/profile — met à jour les champs optionnels du profil (phone, location, bio)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const allowed = ['phone', 'location', 'bio', 'avatar_url'];
    const updates: Record<string, string> = {};

    for (const key of allowed) {
      if (key in body && typeof body[key] === 'string') {
        const val = body[key].trim();
        if (val.length <= 500) updates[key] = val;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true });
    }

    const admin = createAdminSupabaseClient();
    const { error } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id);

    if (error) {
      console.error('[PATCH /api/profile]', error.message);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/profile]', err);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
