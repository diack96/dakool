import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/email';

const DAYS_INACTIVE     = 30;  // Inactif depuis 30 jours minimum
const REENGAGE_COOLDOWN = 60;  // 1 re-engagement email tous les 2 mois max
const MAX_EMAILS        = 100;

/**
 * GET /api/cron/reengage-inactive
 * Appelé le 1er de chaque mois à 10h UTC.
 * Cible les étudiants inactifs depuis 30j avec peu ou aucune progression.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const baseUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';

  const inactiveCutoff  = new Date(Date.now() - DAYS_INACTIVE * 24 * 60 * 60 * 1000);
  const reengageCutoff  = new Date(Date.now() - REENGAGE_COOLDOWN * 24 * 60 * 60 * 1000);

  // Étudiants actifs, 0-20% de progression, inactifs depuis 30j, pas re-engagés récemment
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, progress, updated_at')
    .eq('status', 'active')
    .lt('progress', 20)
    .lt('updated_at', inactiveCutoff.toISOString())
    .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${reengageCutoff.toISOString()}`)
    .limit(MAX_EMAILS);

  if (error) {
    console.error('[cron/reengage-inactive] DB error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!enrollments?.length) {
    return NextResponse.json({ success: true, sent: 0 });
  }

  const userIds   = [...new Set(enrollments.map((e) => e.user_id))];
  const courseIds = [...new Set(enrollments.map((e) => e.course_id))];

  const [{ data: profiles }, { data: courses }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, email').in('id', userIds).limit(userIds.length),
    supabase.from('courses').select('id, title, slug, level').in('id', courseIds).limit(courseIds.length),
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
    const courseLevel = ((course as any)?.level ?? 'beginner') as string;
    const courseUrl   = `${baseUrl}/courses/${courseSlug ?? enrollment.course_id}`;

    if (!email) { skipped++; continue; }

    // Segmentation par niveau de cours
    const levelMessages: Record<string, { hook: string; cta: string; subject: string }> = {
      beginner: {
        subject: `${userName}, votre aventure dans ${courseTitle} commence ici !`,
        hook:    "Pas besoin d'expérience préalable — chaque expert a un jour été débutant. Votre premier pas prend moins de 15 minutes.",
        cta:     'Faire mon premier pas →',
      },
      intermediate: {
        subject: `${userName}, vos compétences en ${courseTitle} n'attendent que vous`,
        hook:    'Vous avez déjà les bases. Ce cours va transformer votre niveau en expertise concrète et reconnue.',
        cta:     'Continuer ma progression →',
      },
      advanced: {
        subject: `${userName}, maîtrisez ${courseTitle} — votre prochaine étape vous attend`,
        hook:    "Ce niveau avancé est fait pour ceux qui veulent aller plus loin. Votre certificat d'expert est à portée de main.",
        cta:     'Accéder au niveau avancé →',
      },
    };
    const msg = levelMessages[courseLevel] ?? levelMessages['beginner']!;

    try {
      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#111">
          <h1 style="font-size:22px;font-weight:700;margin-bottom:8px">On pense à vous, ${userName} 👋</h1>
          <p style="font-size:16px;color:#374151;line-height:1.6">
            Il y a un mois, vous avez rejoint <strong>${courseTitle}</strong>.<br>
            ${msg.hook}
          </p>
          <p style="font-size:16px;color:#374151;line-height:1.6">
            Même 15 minutes par jour font une vraie différence. Vos compétences, votre certificat,
            votre réussite — tout commence avec un premier clic.
          </p>
          <a href="${courseUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#2563eb;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px">
            ${msg.cta}
          </a>
          <p style="font-size:13px;color:#9ca3af;margin-top:32px">
            Waraba Academy · <a href="${baseUrl}/unsubscribe" style="color:#9ca3af">Se désabonner</a>
          </p>
        </div>
      `;
      const text = `${userName}, votre cours ${courseTitle} vous attend !\n\n${msg.hook}\n\nCommencez maintenant : ${courseUrl}`;

      // Marquer avant envoi (anti-spam)
      await supabase
        .from('enrollments')
        .update({ last_reminder_sent_at: new Date().toISOString() } as never)
        .eq('id', enrollment.id);

      const result = await sendEmail({
        to: email,
        subject: msg.subject,
        html,
        text,
      });

      if (result.success) { sent++; } else { failed++; }
    } catch {
      failed++;
    }
  }

  console.log(`[cron/reengage-inactive] sent:${sent} skipped:${skipped} failed:${failed}`);
  return NextResponse.json({ success: true, sent, skipped, failed });
}
