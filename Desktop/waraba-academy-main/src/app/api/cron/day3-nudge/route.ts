import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/email';
import { courseStartNudgeTemplate } from '@/lib/email/templates';

const MIN_DAYS    = 3;   // Inscrit depuis au moins 3 jours
const MAX_DAYS    = 7;   // Mais pas plus de 7 jours (sinon course-reminders prend le relai)
const MAX_EMAILS  = 300;

/**
 * GET /api/cron/day3-nudge
 * Ciblage précoce : utilisateurs inscrits depuis 3-7 jours, 0% de progression,
 * qui n'ont jamais reçu de rappel.
 * Appelé tous les jours à 8h UTC.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const baseUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';

  const minDate = new Date(Date.now() - MAX_DAYS * 24 * 60 * 60 * 1000);
  const maxDate = new Date(Date.now() - MIN_DAYS * 24 * 60 * 60 * 1000);

  // Inscriptions récentes (3-7 jours), 0% progression, jamais de rappel envoyé
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, enrolled_at')
    .eq('status', 'active')
    .eq('progress', 0)
    .is('last_reminder_sent_at', null)
    .gte('enrolled_at', minDate.toISOString())
    .lte('enrolled_at', maxDate.toISOString())
    .limit(MAX_EMAILS);

  if (error) {
    console.error('[cron/day3-nudge] DB error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!enrollments?.length) {
    return NextResponse.json({ success: true, sent: 0 });
  }

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

    const email    = (profile as any)?.email as string | undefined;
    const userName = (profile as any)?.first_name || email?.split('@')[0] || 'Apprenant';
    const courseTitle = (course as any)?.title ?? 'votre cours';
    const courseSlug  = (course as any)?.slug as string | undefined;
    const courseUrl   = `${baseUrl}/courses/${courseSlug ?? enrollment.course_id}/learn`;
    const daysSince   = Math.round(
      (Date.now() - new Date(enrollment.enrolled_at as string).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (!email) { skipped++; continue; }

    try {
      // Marquer AVANT l'envoi pour éviter les doublons
      await supabase
        .from('enrollments')
        .update({ last_reminder_sent_at: new Date().toISOString() } as never)
        .eq('id', enrollment.id);

      const { html, text } = await courseStartNudgeTemplate({
        userName,
        courseTitle,
        courseUrl,
        daysSinceEnrollment: daysSince,
      });

      const result = await sendEmail({
        to: email,
        subject: `${userName}, votre cours ${courseTitle} vous attend !`,
        html,
        text,
      });

      if (result.success) { sent++; } else { failed++; }
    } catch {
      failed++;
    }
  }

  console.log(`[cron/day3-nudge] Terminé — sent:${sent} skipped:${skipped} failed:${failed}`);
  return NextResponse.json({ success: true, sent, skipped, failed });
}
