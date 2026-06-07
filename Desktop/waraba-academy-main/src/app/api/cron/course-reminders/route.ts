import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/email';
import { courseAbandonedTemplate } from '@/lib/email/templates';

const DAYS_INACTIVE     = 7;   // Inactif depuis N jours
const REMINDER_COOLDOWN = 14;  // Max 1 rappel toutes les 2 semaines (était 30j)
const MIN_PROGRESS      = 0;   // Inclut les 0% (jamais commencé)
const MAX_EMAILS        = 500; // Limite de sécurité par exécution (était 200)

/**
 * GET /api/cron/course-reminders
 * Appelé automatiquement par Vercel Cron (tous les lundis à 9h UTC).
 * Protégé par Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(request: NextRequest) {
  // Vérification du secret Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const baseUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';

  const inactiveCutoff = new Date();
  inactiveCutoff.setDate(inactiveCutoff.getDate() - DAYS_INACTIVE);

  const reminderCutoff = new Date();
  reminderCutoff.setDate(reminderCutoff.getDate() - REMINDER_COOLDOWN);

  // 1. Enrollments éligibles
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, progress, updated_at')
    .eq('status', 'active')
    .gte('progress', MIN_PROGRESS)
    .lt('progress', 100)
    .lt('updated_at', inactiveCutoff.toISOString())
    .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${reminderCutoff.toISOString()}`)
    .limit(MAX_EMAILS);

  if (enrollError) {
    console.error('[cron/course-reminders] DB error:', enrollError.message);
    return NextResponse.json({ error: enrollError.message }, { status: 500 });
  }

  if (!enrollments?.length) {
    console.log('[cron/course-reminders] Aucun rappel à envoyer.');
    return NextResponse.json({ success: true, sent: 0 });
  }

  // 2. Batch fetch profils et cours
  const userIds   = [...new Set(enrollments.map((e) => e.user_id))];
  const courseIds = [...new Set(enrollments.map((e) => e.course_id))];

  const [{ data: profiles }, { data: courses }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, email').in('id', userIds).limit(userIds.length),
    supabase.from('courses').select('id, title, slug').in('id', courseIds).limit(courseIds.length),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const courseMap  = new Map((courses  ?? []).map((c) => [c.id, c]));

  // 3. Envoi
  let sent = 0, skipped = 0, failed = 0;

  for (const enrollment of enrollments) {
    const profile = profileMap.get(enrollment.user_id);
    const course  = courseMap.get(enrollment.course_id);

    const email       = (profile as any)?.email as string | undefined;
    const userName    = (profile as any)?.first_name || email?.split('@')[0] || 'Apprenant';
    const courseTitle = (course  as any)?.title ?? 'votre cours';
    const courseSlug  = (course  as any)?.slug  as string | undefined;
    const courseUrl   = `${baseUrl}/courses/${courseSlug ?? enrollment.course_id}/learn`;
    const progressPercent = Math.round((enrollment.progress as number) ?? 0);
    const daysSince = Math.round(
      (Date.now() - new Date(enrollment.updated_at as string).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (!email) { skipped++; continue; }

    try {
      const { html, text } = await courseAbandonedTemplate({
        userName,
        courseTitle,
        progressPercent,
        courseUrl,
        daysSinceLastActivity: daysSince,
      });

      // Marquer AVANT l'envoi — évite le spam si le update DB échoue après l'email
      await supabase
        .from('enrollments')
        .update({ last_reminder_sent_at: new Date().toISOString() } as never)
        .eq('id', enrollment.id);

      const subject = progressPercent === 0
        ? `${userName}, vous n'avez pas encore commencé votre cours !`
        : `${userName}, votre cours vous attend ! (${progressPercent}% complété)`;

      const result = await sendEmail({
        to: email,
        subject,
        html,
        text,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
        console.error(`[cron/course-reminders] Échec envoi à ${email}:`, result.error);
      }
    } catch (err) {
      failed++;
      console.error(`[cron/course-reminders] Erreur pour ${email}:`, err);
    }
  }

  console.log(`[cron/course-reminders] Terminé — sent:${sent} skipped:${skipped} failed:${failed}`);

  return NextResponse.json({ success: true, sent, skipped, failed });
}
