import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getAdminSupabaseClient } from '@/lib/supabase-server';
import { getLevel } from '@/lib/gamification';
import { CACHE_HEADERS } from '@/lib/api/apiUtils';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const admin = getAdminSupabaseClient();

    const [profileRes, allBadgesRes, earnedRes] = await Promise.all([
      admin
        .from('profiles')
        .select('xp_total, current_streak, longest_streak, lessons_completed')
        .eq('id', user.id)
        .single(),
      admin.from('badges').select('id, slug, name, description, icon, xp_reward').order('condition_value'),
      admin.from('user_badges').select('badge_id, earned_at').eq('user_id', user.id),
    ]);

    const profile = profileRes.data ?? {
      xp_total: 0,
      current_streak: 0,
      longest_streak: 0,
      lessons_completed: 0,
    };

    const xp             = (profile as any).xp_total          ?? 0;
    const currentStreak  = (profile as any).current_streak    ?? 0;
    const longestStreak  = (profile as any).longest_streak    ?? 0;
    const lessonsCompleted = (profile as any).lessons_completed ?? 0;

    const earnedMap = new Map(
      (earnedRes.data ?? []).map((b: any) => [b.badge_id, b.earned_at])
    );

    const badges = (allBadgesRes.data ?? []).map((badge: any) => ({
      ...badge,
      earned:    earnedMap.has(badge.id),
      earned_at: earnedMap.get(badge.id) ?? null,
    }));

    return NextResponse.json(
      {
        xp_total:          xp,
        current_streak:    currentStreak,
        longest_streak:    longestStreak,
        lessons_completed: lessonsCompleted,
        level:             getLevel(xp),
        badges,
      },
      { headers: CACHE_HEADERS.PRIVATE_SHORT }
    );
  } catch (err) {
    console.error('[gamification/stats]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
