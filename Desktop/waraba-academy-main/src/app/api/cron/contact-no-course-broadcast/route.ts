import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/email';
import { contactNoCourseTemplate } from '@/lib/email/templates';

const DEFAULT_LIMIT = 500;
const MAX_LIMIT     = 1000;

// Délai entre envois (ms) — évite de saturer Resend sur les gros volumes
const SEND_DELAY_MS = 100;

/**
 * GET /api/cron/contact-no-course-broadcast
 *
 * Envoie un email "Découvrez nos formations" aux contacts Resend
 * qui n'ont aucun enrollment actif en base.
 *
 * Query params :
 *   dryRun=true              — simule sans envoyer (défaut: false)
 *   featuredCourseSlug=xxx   — met un cours en avant dans l'email (optionnel)
 *   limit=500                — max emails à envoyer (1–1000, défaut: 500)
 *
 * Protégé par Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Params ───────────────────────────────────────────────────────────────────
  const { searchParams } = new URL(request.url);
  const dryRun             = searchParams.get('dryRun') === 'true';
  const featuredCourseSlug = searchParams.get('featuredCourseSlug') ?? null;
  const rawLimit           = parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
  const limit              = Math.min(Math.max(1, isNaN(rawLimit) ? DEFAULT_LIMIT : rawLimit), MAX_LIMIT);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';

  // ── Clients ──────────────────────────────────────────────────────────────────
  const apiKey     = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY ou RESEND_AUDIENCE_ID non configuré' },
      { status: 500 },
    );
  }

  const resend   = new Resend(apiKey);
  const supabase = createAdminSupabaseClient();

  // ── 1. Cours vedette (optionnel) ─────────────────────────────────────────────
  let featuredCourseTitle: string | undefined;
  let featuredCourseUrl: string | undefined;
  let featuredCourseDescription: string | undefined;

  if (featuredCourseSlug) {
    const { data: course } = await supabase
      .from('courses')
      .select('title, slug, description')
      .eq('slug', featuredCourseSlug)
      .single();

    if (course) {
      featuredCourseTitle       = (course as any).title;
      featuredCourseUrl         = `${baseUrl}/courses/${(course as any).slug}`;
      featuredCourseDescription = (course as any).description ?? undefined;
    } else {
      console.warn(`[contact-no-course-broadcast] Cours introuvable : ${featuredCourseSlug}`);
    }
  }

  // ── 2. Récupérer tous les contacts Resend (pagination) ────────────────────────
  let allContacts: Array<{ email: string; firstName?: string; unsubscribed: boolean }> = [];

  try {
    // Resend SDK retourne jusqu'à ~1000 contacts par appel.
    // On pagine via cursor si la liste est plus grande.
    let cursor: string | undefined;

    do {
      const params: Parameters<typeof resend.contacts.list>[0] = { audienceId };
      if (cursor) (params as any).cursor = cursor;

      const { data, error } = await resend.contacts.list(params);

      if (error) {
        console.error('[contact-no-course-broadcast] Erreur Resend contacts.list:', error);
        return NextResponse.json({ error: 'Erreur récupération contacts Resend' }, { status: 500 });
      }

      const page = (data as any)?.data ?? [];
      allContacts = allContacts.concat(
        page.map((c: any) => ({
          email:        c.email as string,
          firstName:    (c.first_name as string | undefined) || undefined,
          unsubscribed: Boolean(c.unsubscribed),
        })),
      );

      cursor = (data as any)?.cursor ?? undefined;
    } while (cursor);
  } catch (err) {
    console.error('[contact-no-course-broadcast] Erreur Resend:', err);
    return NextResponse.json({ error: 'Erreur API Resend' }, { status: 500 });
  }

  // ── 3. Filtrer les désinscrits ────────────────────────────────────────────────
  const subscribedContacts = allContacts.filter((c) => !c.unsubscribed);
  const contactEmails      = subscribedContacts.map((c) => c.email.toLowerCase());

  if (!contactEmails.length) {
    return NextResponse.json({ success: true, dryRun, sent: 0, reason: 'Aucun contact abonné' });
  }

  // ── 4. Cross-reference DB — trouver les emails AVEC enrollment ────────────────
  //    profiles → user_id → enrollments (status=active)
  //    On récupère en batch pour éviter N+1.
  const BATCH = 500;
  const enrolledEmails = new Set<string>();

  for (let i = 0; i < contactEmails.length; i += BATCH) {
    const chunk = contactEmails.slice(i, i + BATCH);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('email', chunk)
      .limit(chunk.length);

    if (!profiles?.length) continue;

    const userIds = profiles.map((p) => (p as any).id as string);

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('user_id')
      .in('user_id', userIds)
      .limit(userIds.length);

    if (!enrollments?.length) continue;

    const enrolledUserIds = new Set(enrollments.map((e) => (e as any).user_id as string));

    for (const profile of profiles) {
      if (enrolledUserIds.has((profile as any).id)) {
        enrolledEmails.add(((profile as any).email as string).toLowerCase());
      }
    }
  }

  // ── 5. Contacts cibles = abonnés sans enrollment ──────────────────────────────
  const targets = subscribedContacts
    .filter((c) => !enrolledEmails.has(c.email.toLowerCase()))
    .slice(0, limit);

  console.log(
    `[contact-no-course-broadcast] Total abonnés: ${subscribedContacts.length} | ` +
    `Avec cours: ${enrolledEmails.size} | Cibles: ${targets.length} | dryRun: ${dryRun}`,
  );

  if (!targets.length) {
    return NextResponse.json({
      success: true,
      dryRun,
      sent: 0,
      totalSubscribed: subscribedContacts.length,
      alreadyEnrolled: enrolledEmails.size,
      reason: 'Tous les contacts abonnés ont déjà un enrollment',
    });
  }

  // ── 6. DryRun — retourner un aperçu sans envoyer ─────────────────────────────
  if (dryRun) {
    return NextResponse.json({
      success: true,
      dryRun: true,
      wouldSend: targets.length,
      totalSubscribed: subscribedContacts.length,
      alreadyEnrolled: enrolledEmails.size,
      unsubscribed: allContacts.length - subscribedContacts.length,
      limit,
      featuredCourse: featuredCourseTitle ?? null,
      preview: targets.slice(0, 5).map((c) => ({ email: c.email, firstName: c.firstName ?? null })),
    });
  }

  // ── 7. Envoi ──────────────────────────────────────────────────────────────────
  const catalogUrl = `${baseUrl}/courses`;
  let sent = 0, failed = 0;
  const errors: string[] = [];

  for (const contact of targets) {
    const userName = contact.firstName || contact.email.split('@')[0] || 'Apprenant';

    try {
      const { html, text } = await contactNoCourseTemplate({
        userName,
        catalogUrl,
        featuredCourseTitle,
        featuredCourseUrl,
        featuredCourseDescription,
      });

      const result = await sendEmail({
        to: contact.email,
        subject: `${userName}, vos formations Waraba Academy vous attendent !`,
        html,
        text,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(`${contact.email}: ${result.error}`);
      }
    } catch (err) {
      failed++;
      errors.push(`${contact.email}: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }

    // Délai anti-saturation
    if (SEND_DELAY_MS > 0 && sent % 10 === 0) {
      await new Promise((r) => setTimeout(r, SEND_DELAY_MS));
    }
  }

  console.log(
    `[contact-no-course-broadcast] Terminé — sent:${sent} failed:${failed} ` +
    `totalSubscribed:${subscribedContacts.length} alreadyEnrolled:${enrolledEmails.size}`,
  );

  return NextResponse.json({
    success: true,
    dryRun: false,
    sent,
    failed,
    totalSubscribed: subscribedContacts.length,
    alreadyEnrolled: enrolledEmails.size,
    unsubscribed: allContacts.length - subscribedContacts.length,
    limit,
    ...(errors.length ? { errors: errors.slice(0, 10) } : {}),
  });
}
