import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/email';
import { courseAbandonedTemplate } from '@/lib/email/templates';

const MAX_EMAILS = 500;

/**
 * GET /api/admin/nudge-in-progress
 *
 * Envoie un rappel à TOUS les inscrits actifs avec 0 < progress < 100,
 * sans filtre d'inactivité.
 *
 * Query params :
 *   dryRun=true  — simule sans envoyer (défaut: false)
 *   limit=500    — max emails (1–500, défaut: 500)
 *
 * Protégé par Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dryRun   = searchParams.get('dryRun') === 'true';
  const rawLimit = parseInt(searchParams.get('limit') ?? String(MAX_EMAILS), 10);
  const limit    = Math.min(Math.max(1, isNaN(rawLimit) ? MAX_EMAILS : rawLimit), MAX_EMAILS);

  const supabase = createAdminSupabaseClient();
  const baseUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';

  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, progress, updated_at')
    .eq('status', 'active')
    .gt('progress', 0)
    .lt('progress', 100)
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!enrollments?.length) {
    return NextResponse.json({ success: true, dryRun, sent: 0, reason: 'Aucun inscrit en cours' });
  }

  const userIds   = [...new Set(enrollments.map((e) => e.user_id))];
  const courseIds = [...new Set(enrollments.map((e) => e.course_id))];

  const [{ data: profiles }, { data: courses }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, email').in('id', userIds).limit(userIds.length),
    supabase.from('courses').select('id, title, slug').in('id', courseIds).limit(courseIds.length),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const courseMap  = new Map((courses  ?? []).map((c) => [c.id, c]));

  if (dryRun) {
    const preview = enrollments.slice(0, 5).map((e) => {
      const profile = profileMap.get(e.user_id) as any;
      const course  = courseMap.get(e.course_id) as any;
      return {
        email:    profile?.email ?? '?',
        firstName: profile?.first_name ?? null,
        course:   course?.title ?? '?',
        progress: Math.round((e.progress as number) ?? 0),
      };
    });
    return NextResponse.json({ success: true, dryRun: true, wouldSend: enrollments.length, preview });
  }

  let sent = 0, skipped = 0, failed = 0;

  for (const enrollment of enrollments) {
    const profile = profileMap.get(enrollment.user_id) as any;
    const course  = courseMap.get(enrollment.course_id) as any;

    const email        = profile?.email as string | undefined;
    const userName     = profile?.first_name || email?.split('@')[0] || 'Apprenant';
    const courseTitle  = course?.title ?? 'votre cours';
    const courseSlug   = course?.slug as string | undefined;
    const courseUrl    = `${baseUrl}/courses/${courseSlug ?? enrollment.course_id}/learn`;
    const progress     = Math.round((enrollment.progress as number) ?? 0);
    const daysSince    = Math.round(
      (Date.now() - new Date(enrollment.updated_at as string).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (!email) { skipped++; continue; }

    try {
      await supabase
        .from('enrollments')
        .update({ last_reminder_sent_at: new Date().toISOString() } as never)
        .eq('id', enrollment.id);

      const { html, text } = await courseAbandonedTemplate({
        userName,
        courseTitle,
        progressPercent: progress,
        courseUrl,
        daysSinceLastActivity: daysSince,
      });

      const result = await sendEmail({
        to: email,
        subject: `${userName}, votre cours vous attend ! (${progress}% complété)`,
        html,
        text,
      });

      if (result.success) { sent++; } else { failed++; }
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ success: true, dryRun: false, sent, skipped, failed, total: enrollments.length });
}
