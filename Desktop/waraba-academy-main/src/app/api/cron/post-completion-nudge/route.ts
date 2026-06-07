import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/email';
import { nextCourseTemplate } from '@/lib/email/templates';

const MIN_DAYS_AFTER_COMPLETION = 3;   // Attendre 3 jours après la complétion
const MAX_DAYS_AFTER_COMPLETION = 7;   // Ne cibler que les complétions récentes (< 7 jours)
const MAX_EMAILS = 200;

/**
 * GET /api/cron/post-completion-nudge
 * Appelé tous les jours à 10h30 UTC.
 * Cible les étudiants ayant terminé un cours il y a 3-7 jours
 * et qui n'ont pas encore reçu de recommandation de prochain cours.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const baseUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';

  const minCompletedAt = new Date(Date.now() - MAX_DAYS_AFTER_COMPLETION * 24 * 60 * 60 * 1000);
  const maxCompletedAt = new Date(Date.now() - MIN_DAYS_AFTER_COMPLETION * 24 * 60 * 60 * 1000);

  // Enrollments complétés il y a 3-7 jours, jamais relancés post-complétion
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, completed_at')
    .eq('status', 'completed')
    .gte('completed_at', minCompletedAt.toISOString())
    .lte('completed_at', maxCompletedAt.toISOString())
    .is('last_reminder_sent_at', null)
    .limit(MAX_EMAILS);

  if (error) {
    console.error('[cron/post-completion-nudge] DB error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!enrollments?.length) {
    return NextResponse.json({ success: true, sent: 0 });
  }

  const userIds   = [...new Set(enrollments.map((e) => e.user_id))];
  const courseIds = [...new Set(enrollments.map((e) => e.course_id))];

  // Récupérer profils, cours complétés et catégories en parallèle
  const [{ data: profiles }, { data: completedCourses }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, email').in('id', userIds).limit(userIds.length),
    supabase.from('courses').select('id, title, category_id').in('id', courseIds).limit(courseIds.length),
  ]);

  const profileMap      = new Map((profiles       ?? []).map((p) => [p.id, p]));
  const completedCourseMap = new Map((completedCourses ?? []).map((c) => [c.id, c]));

  // Récupérer les catégories des cours complétés pour les recommandations
  const categoryIds = [...new Set(
    (completedCourses ?? [])
      .map((c) => (c as any).category_id as string | null)
      .filter(Boolean),
  )] as string[];

  // Cours disponibles dans les mêmes catégories (hors ceux déjà suivis)
  const { data: candidateCourses } = categoryIds.length
    ? await supabase
        .from('courses')
        .select('id, title, slug, description, category_id')
        .in('category_id', categoryIds)
        .not('id', 'in', `(${courseIds.join(',')})`)
        .eq('is_published', true)
        .limit(50)
    : { data: [] };

  // Grouper les cours candidats par catégorie
  const coursesByCategory = new Map<string, any[]>();
  for (const course of (candidateCourses ?? [])) {
    const catId = (course as any).category_id as string;
    if (!coursesByCategory.has(catId)) coursesByCategory.set(catId, []);
    coursesByCategory.get(catId)!.push(course);
  }

  let sent = 0, skipped = 0, failed = 0;

  for (const enrollment of enrollments) {
    const profile = profileMap.get(enrollment.user_id);
    const completedCourse = completedCourseMap.get(enrollment.course_id);

    const email    = (profile as any)?.email as string | undefined;
    const userName = (profile as any)?.first_name || email?.split('@')[0] || 'Apprenant';

    if (!email) { skipped++; continue; }

    const completedCourseTitle = (completedCourse as any)?.title ?? 'votre cours';
    const categoryId           = (completedCourse as any)?.category_id as string | undefined;

    // Trouver un cours recommandé dans la même catégorie
    const categoryCourses = categoryId ? (coursesByCategory.get(categoryId) ?? []) : [];
    const recommended     = categoryCourses[0] ?? null;

    const nextCourseTitle       = (recommended as any)?.title ?? 'notre prochaine formation';
    const nextCourseSlug        = (recommended as any)?.slug  as string | undefined;
    const nextCourseId          = (recommended as any)?.id    as string | undefined;
    const nextCourseDescription = (recommended as any)?.description as string | undefined;
    const nextCourseUrl         = nextCourseId
      ? `${baseUrl}/courses/${nextCourseSlug ?? nextCourseId}`
      : `${baseUrl}/courses`;
    const catalogUrl = `${baseUrl}/courses`;

    try {
      // Marquer AVANT l'envoi pour éviter les doublons
      await supabase
        .from('enrollments')
        .update({ last_reminder_sent_at: new Date().toISOString() } as never)
        .eq('id', enrollment.id);

      const { html, text } = await nextCourseTemplate({
        userName,
        completedCourseTitle,
        nextCourseTitle,
        nextCourseUrl,
        nextCourseDescription: nextCourseDescription ?? undefined,
        catalogUrl,
      });

      const result = await sendEmail({
        to: email,
        subject: `${userName}, continuez sur votre lancée — votre prochain cours vous attend !`,
        html,
        text,
      });

      if (result.success) { sent++; } else { failed++; }
    } catch {
      failed++;
    }
  }

  console.log(`[cron/post-completion-nudge] sent:${sent} skipped:${skipped} failed:${failed}`);
  return NextResponse.json({ success: true, sent, skipped, failed });
}
