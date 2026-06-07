import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/email';
import { courseAbandonedTemplate, courseStartNudgeTemplate } from '@/lib/email/templates';

const DAYS_INACTIVE     = 7;
const REMINDER_COOLDOWN = 14;
const MAX_EMAILS        = 500;

type Filter = 'incomplete' | 'not-started' | 'all';

const VALID_FILTERS: Filter[] = ['incomplete', 'not-started', 'all'];

/**
 * GET /api/cron/course-reminder-broadcast?filter=incomplete|not-started|all
 *
 * - incomplete  : inscriptions avec 0 < progress < 100 (cours commencé, non terminé)
 * - not-started : inscriptions avec progress = 0 (jamais commencé)
 * - all         : les deux (progress < 100)  — comportement identique à /course-reminders
 *
 * Protégé par Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawFilter = searchParams.get('filter') ?? 'all';

  if (!VALID_FILTERS.includes(rawFilter as Filter)) {
    return NextResponse.json(
      { error: `Paramètre filter invalide. Valeurs acceptées : ${VALID_FILTERS.join(', ')}` },
      { status: 400 },
    );
  }

  const filter = rawFilter as Filter;

  const supabase = createAdminSupabaseClient();
  const baseUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';

  const inactiveCutoff  = new Date();
  inactiveCutoff.setDate(inactiveCutoff.getDate() - DAYS_INACTIVE);

  const reminderCutoff  = new Date();
  reminderCutoff.setDate(reminderCutoff.getDate() - REMINDER_COOLDOWN);

  // Construction de la requête selon le filtre
  let query = supabase
    .from('enrollments')
    .select('id, user_id, course_id, progress, created_at, updated_at')
    .eq('status', 'active')
    .lt('updated_at', inactiveCutoff.toISOString())
    .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${reminderCutoff.toISOString()}`)
    .limit(MAX_EMAILS);

  if (filter === 'incomplete') {
    query = query.gt('progress', 0).lt('progress', 100);
  } else if (filter === 'not-started') {
    query = query.eq('progress', 0);
  } else {
    // 'all'
    query = query.lt('progress', 100);
  }

  const { data: enrollments, error: enrollError } = await query;

  if (enrollError) {
    console.error('[cron/course-reminder-broadcast] DB error:', enrollError.message);
    return NextResponse.json({ error: enrollError.message }, { status: 500 });
  }

  if (!enrollments?.length) {
    console.log(`[cron/course-reminder-broadcast] Aucun rappel à envoyer (filter=${filter}).`);
    return NextResponse.json({ success: true, filter, sent: 0 });
  }

  // Batch fetch profils et cours
  const userIds   = [...new Set(enrollments.map((e) => e.user_id))];
  const courseIds = [...new Set(enrollments.map((e) => e.course_id))];

  const [{ data: profiles }, { data: courses }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, email').in('id', userIds).limit(userIds.length),
    supabase.from('courses').select('id, title, slug').in('id', courseIds).limit(courseIds.length),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const courseMap  = new Map((courses  ?? []).map((c) => [c.id, c]));

  let sent = 0, skipped = 0, failed = 0;

  for (const enrollment of enrollments) {
    const profile = profileMap.get(enrollment.user_id);
    const course  = courseMap.get(enrollment.course_id);

    const email       = (profile as any)?.email as string | undefined;
    const userName    = (profile as any)?.first_name || email?.split('@')[0] || 'Apprenant';
    const courseTitle = (course  as any)?.title ?? 'votre cours';
    const courseSlug  = (course  as any)?.slug  as string | undefined;
    const courseUrl   = `${baseUrl}/courses/${courseSlug ?? enrollment.course_id}/learn`;
    const progress    = Math.round((enrollment.progress as number) ?? 0);

    if (!email) { skipped++; continue; }

    try {
      let html: string;
      let text: string;
      let subject: string;

      if (progress === 0) {
        // Jamais commencé → template "nudge démarrage"
        const daysSinceEnrollment = Math.round(
          (Date.now() - new Date(enrollment.created_at as string).getTime()) / (1000 * 60 * 60 * 24),
        );
        ({ html, text } = await courseStartNudgeTemplate({ userName, courseTitle, courseUrl, daysSinceEnrollment }));
        subject = `${userName}, vous n'avez pas encore commencé votre cours !`;
      } else {
        // En cours → template "cours abandonné"
        const daysSince = Math.round(
          (Date.now() - new Date(enrollment.updated_at as string).getTime()) / (1000 * 60 * 60 * 24),
        );
        ({ html, text } = await courseAbandonedTemplate({
          userName,
          courseTitle,
          progressPercent: progress,
          courseUrl,
          daysSinceLastActivity: daysSince,
        }));
        subject = `${userName}, votre cours vous attend ! (${progress}% complété)`;
      }

      // Marquer AVANT l'envoi — anti race condition spam
      await supabase
        .from('enrollments')
        .update({ last_reminder_sent_at: new Date().toISOString() } as never)
        .eq('id', enrollment.id);

      const result = await sendEmail({ to: email, subject, html, text });

      if (result.success) {
        sent++;
      } else {
        failed++;
        console.error(`[cron/course-reminder-broadcast] Échec envoi à ${email}:`, result.error);
      }
    } catch (err) {
      failed++;
      console.error(`[cron/course-reminder-broadcast] Erreur pour ${email}:`, err);
    }
  }

  console.log(`[cron/course-reminder-broadcast] Terminé — filter:${filter} sent:${sent} skipped:${skipped} failed:${failed}`);

  return NextResponse.json({ success: true, filter, sent, skipped, failed });
}
