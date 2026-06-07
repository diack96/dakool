import { getAdminSupabaseClient } from '@/lib/supabase-server';

// ─── Constantes XP ────────────────────────────────────────────────────────────
export const XP_PER_LESSON    = 15;
export const XP_COURSE_BONUS  = 100;

// ─── Niveaux ──────────────────────────────────────────────────────────────────
const LEVEL_THRESHOLDS: number[] = [0, 100, 250, 500, 1000, 2000, 5000];
const LEVEL_LABELS: string[]     = ['Débutant', 'Curieux', 'Apprenant', 'Assidu', 'Expert', 'Maître', 'Légende'];

export interface LevelInfo {
  level: number;
  label: string;
  currentXP: number;
  nextLevelXP: number;
  progressPercent: number;
}

export function getLevel(xp: number): LevelInfo {
  let idx = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    const threshold = LEVEL_THRESHOLDS[i] ?? 0;
    if (xp >= threshold) idx = i;
  }
  const floor = LEVEL_THRESHOLDS[idx] ?? 0;
  const ceil  = LEVEL_THRESHOLDS[idx + 1] ?? floor * 2 + 100;
  const cur   = xp - floor;
  const next  = ceil - floor;
  return {
    level:           idx + 1,
    label:           LEVEL_LABELS[idx] ?? 'Légende',
    currentXP:       cur,
    nextLevelXP:     next,
    progressPercent: Math.min(100, Math.round((cur / next) * 100)),
  };
}

// ─── Point d'entrée principal ─────────────────────────────────────────────────
/**
 * Appelé depuis /api/enrollments PATCH quand la progression augmente.
 * Fire-and-forget : ne bloque pas la réponse à l'utilisateur.
 */
export function trackProgress(
  userId: string,
  oldProgress: number,
  newProgress: number,
): void {
  if (newProgress <= oldProgress) return;

  const xp = newProgress === 100
    ? XP_PER_LESSON + XP_COURSE_BONUS
    : XP_PER_LESSON;

  _handleGamification(userId, xp).catch((err) => {
    console.error('[gamification] Error:', err);
  });
}

// Appelé depuis la route POST lesson progress quand isCompleted = true (nouvelle complétion).
export function trackLessonComplete(userId: string, isCourseDone: boolean): void {
  const xp = isCourseDone ? XP_PER_LESSON + XP_COURSE_BONUS : XP_PER_LESSON;
  _handleGamification(userId, xp).catch((err) => {
    console.error('[gamification] Error:', err);
  });
}

async function _handleGamification(userId: string, xp: number) {
  const supabase = getAdminSupabaseClient();

  // Atomique : XP + lessons_completed
  await supabase.rpc('increment_user_xp', { p_user_id: userId, p_xp: xp });

  // Streak
  await supabase.rpc('update_user_streak', { p_user_id: userId });

  // Badges (tolérant aux erreurs)
  await _checkAndAwardBadges(supabase, userId);
}

async function _checkAndAwardBadges(supabase: ReturnType<typeof getAdminSupabaseClient>, userId: string) {
  const [profileRes, enrollmentsRes, allBadgesRes, earnedRes] = await Promise.all([
    supabase.from('profiles').select('xp_total, current_streak, lessons_completed').eq('id', userId).single(),
    supabase.from('enrollments').select('progress, status').eq('user_id', userId),
    supabase.from('badges').select('id, condition_type, condition_value'),
    supabase.from('user_badges').select('badge_id').eq('user_id', userId),
  ]);

  const profile    = profileRes.data;
  if (!profile) return;

  const enrollments  = enrollmentsRes.data ?? [];
  const allBadges    = allBadgesRes.data   ?? [];
  const earnedIds    = new Set((earnedRes.data ?? []).map((b: any) => b.badge_id));

  const coursesStarted   = enrollments.filter((e: any) => e.progress > 0).length;
  const coursesCompleted = enrollments.filter((e: any) => e.progress >= 100 || e.status === 'completed').length;
  const hasHalfway       = enrollments.some((e: any) => e.progress >= 50);

  const toAward: string[] = [];

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;

    let earned = false;
    switch (badge.condition_type) {
      case 'lessons_completed': earned = (profile as any).lessons_completed >= badge.condition_value; break;
      case 'courses_completed': earned = coursesCompleted >= badge.condition_value; break;
      case 'streak_reached':    earned = (profile as any).current_streak >= badge.condition_value; break;
      case 'xp_reached':        earned = (profile as any).xp_total >= badge.condition_value; break;
      case 'courses_started':   earned = coursesStarted >= badge.condition_value; break;
      case 'progress_reached':  earned = hasHalfway; break;
    }

    if (earned) toAward.push(badge.id);
  }

  if (toAward.length > 0) {
    await supabase.from('user_badges').insert(
      toAward.map((badge_id) => ({ user_id: userId, badge_id }))
    );
  }
}
