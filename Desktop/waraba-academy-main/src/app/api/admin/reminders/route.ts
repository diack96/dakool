import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/email';
import { courseAbandonedTemplate } from '@/lib/email/templates';

const DEFAULT_DAYS_INACTIVE = 7;   // Inactif depuis N jours
const REMINDER_COOLDOWN_DAYS = 7;  // Ne pas renvoyer avant N jours
const MIN_PROGRESS = 0;            // Inclut les 0% (jamais commencé)
const MAX_EMAILS = 100;            // Limite de sécurité par appel

/**
 * POST /api/admin/reminders
 *
 * Envoie des rappels aux utilisateurs qui n'ont pas terminé leur cours
 * et sont inactifs depuis X jours.
 *
 * Body (optionnel) :
 *   { daysInactive?: number, dryRun?: boolean, maxEmails?: number }
 *
 * dryRun = true  → liste les destinataires sans envoyer
 * dryRun = false → envoie les emails (défaut)
 */
async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const daysInactive: number = Number(body?.daysInactive ?? DEFAULT_DAYS_INACTIVE);
  const dryRun: boolean = body?.dryRun === true;
  const maxEmails: number = Math.min(Number(body?.maxEmails ?? MAX_EMAILS), MAX_EMAILS);

  const supabase = createAdminSupabaseClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';

  // Date limite d'inactivité
  const inactiveCutoff = new Date();
  inactiveCutoff.setDate(inactiveCutoff.getDate() - daysInactive);

  // Date limite pour le cooldown (ne pas renvoyer avant N jours)
  const reminderCooloff = new Date();
  reminderCooloff.setDate(reminderCooloff.getDate() - REMINDER_COOLDOWN_DAYS);

  // 1. Récupérer les enrollments éligibles
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, progress, updated_at, last_reminder_sent_at')
    .eq('status', 'active')
    .gte('progress', MIN_PROGRESS)
    .lt('progress', 100)
    .lt('updated_at', inactiveCutoff.toISOString())
    .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${reminderCooloff.toISOString()}`)
    .limit(maxEmails);

  if (enrollError) {
    return NextResponse.json(
      { error: 'Erreur base de données', details: enrollError.message },
      { status: 500 },
    );
  }

  if (!enrollments?.length) {
    return NextResponse.json({ success: true, total: 0, sent: 0, skipped: 0, failed: 0, results: [] });
  }

  // 2. Batch fetch profils et cours (évite les N+1)
  const userIds = [...new Set(enrollments.map((e) => e.user_id))];
  const courseIds = [...new Set(enrollments.map((e) => e.course_id))];

  const [{ data: profiles }, { data: courses }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, last_name, email').in('id', userIds),
    supabase.from('courses').select('id, title, slug').in('id', courseIds),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const courseMap  = new Map((courses  ?? []).map((c) => [c.id, c]));

  // 3. Envoyer les rappels
  let sent = 0, skipped = 0, failed = 0;
  const results: Array<{
    email: string;
    courseTitle: string;
    progressPercent: number;
    daysSince: number;
    status: string;
    error?: string;
  }> = [];

  for (const enrollment of enrollments) {
    const profile = profileMap.get(enrollment.user_id);
    const course  = courseMap.get(enrollment.course_id);

    const email       = (profile as any)?.email as string | undefined;
    const firstName   = (profile as any)?.first_name as string | undefined;
    const userName    = firstName || email?.split('@')[0] || 'Apprenant';
    const courseTitle = (course as any)?.title  as string ?? 'votre cours';
    const courseSlug  = (course as any)?.slug   as string | undefined;
    const courseUrl   = `${baseUrl}/courses/${courseSlug ?? enrollment.course_id}/learn`;
    const progressPercent = Math.round((enrollment.progress as number) ?? 0);
    const daysSince = Math.round(
      (Date.now() - new Date(enrollment.updated_at as string).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (!email) {
      skipped++;
      continue;
    }

    if (dryRun) {
      results.push({ email, courseTitle, progressPercent, daysSince, status: 'dry_run' });
      continue;
    }

    try {
      const { html, text } = await courseAbandonedTemplate({
        userName,
        courseTitle,
        progressPercent,
        courseUrl,
        daysSinceLastActivity: daysSince,
      });

      const subject = progressPercent === 0
        ? `${userName}, vous n'avez pas encore commencé votre cours !`
        : `${userName}, votre cours vous attend ! (${progressPercent}% complété)`;

      // Marquer AVANT l'envoi — évite le spam si le update DB échoue après l'email
      await supabase
        .from('enrollments')
        .update({ last_reminder_sent_at: new Date().toISOString() } as never)
        .eq('id', enrollment.id);

      const emailResult = await sendEmail({
        to: email,
        subject,
        html,
        text,
      });

      if (emailResult.success) {
        sent++;
        results.push({ email, courseTitle, progressPercent, daysSince, status: 'sent' });
      } else {
        failed++;
        results.push({ email, courseTitle, progressPercent, daysSince, status: 'failed', error: emailResult.error });
      }
    } catch {
      failed++;
      results.push({ email, courseTitle, progressPercent, daysSince, status: 'error' });
    }
  }

  return NextResponse.json({
    success: true,
    dryRun,
    daysInactive,
    total: enrollments.length,
    sent,
    skipped,
    failed,
    results,
  });
}

const POST_handler = withAdminAuth(POST);
export { POST_handler as POST };
