import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/email';
import { paymentReminderTemplate } from '@/lib/email/templates';

const MAX_EMAILS = 200;

/**
 * GET /api/cron/payment-reminder
 *
 * Envoie un rappel aux utilisateurs dont le paiement est resté en "pending"
 * entre 3h et 7h après la création (fenêtre étroite = 1 seul rappel par paiement).
 *
 * Schedulé toutes les 4h dans vercel.json.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';

  // Fenêtre : paiements créés entre 3h et 7h (1 seul rappel)
  const minDate = new Date(Date.now() - 7 * 60 * 60 * 1000); // il y a 7h
  const maxDate = new Date(Date.now() - 3 * 60 * 60 * 1000); // il y a 3h

  // Paiements pending dans la fenêtre
  const { data: payments, error } = await supabase
    .from('payments')
    .select('id, user_id, course_id, amount, currency, created_at')
    .eq('status', 'pending')
    .gte('created_at', minDate.toISOString())
    .lte('created_at', maxDate.toISOString())
    .limit(MAX_EMAILS);

  if (error) {
    console.error('[cron/payment-reminder] DB error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!payments?.length) {
    return NextResponse.json({ success: true, sent: 0 });
  }

  // Vérifier qu'il n'existe pas déjà un paiement complété pour le même user+course
  const userIds   = [...new Set(payments.map((p) => p.user_id))];
  const courseIds = [...new Set(payments.map((p) => p.course_id))];

  const [profilesRes, coursesRes, completedRes] = await Promise.all([
    supabase.from('profiles').select('id, first_name, last_name, email').in('id', userIds),
    supabase.from('courses').select('id, title, slug').in('id', courseIds),
    supabase
      .from('payments')
      .select('user_id, course_id')
      .eq('status', 'completed')
      .in('user_id', userIds)
      .in('course_id', courseIds),
  ]);

  const profiles  = profilesRes.data  || [];
  const courses   = coursesRes.data   || [];
  const completed = completedRes.data || [];

  // Index pour lookup rapide
  const profileMap  = Object.fromEntries(profiles.map((p) => [p.id, p]));
  const courseMap   = Object.fromEntries(courses.map((c) => [c.id, c]));
  const completedSet = new Set(completed.map((c) => `${c.user_id}:${c.course_id}`));

  let sent = 0;
  let skipped = 0;

  for (const payment of payments) {
    // Ignorer si paiement déjà complété pour ce user+cours
    if (completedSet.has(`${payment.user_id}:${payment.course_id}`)) {
      skipped++;
      continue;
    }

    const profile = profileMap[payment.user_id];
    const course  = courseMap[payment.course_id];

    if (!profile?.email || !course) {
      skipped++;
      continue;
    }

    const userName   = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Étudiant';
    const courseSlug = course.slug || payment.course_id;
    const paymentUrl = `${siteUrl}/courses/${courseSlug}/payment`;

    try {
      const { html, text } = await paymentReminderTemplate({
        userName,
        courseTitle: course.title,
        amount:      parseFloat(String(payment.amount)) || 0,
        currency:    payment.currency || 'XOF',
        paymentUrl,
      });

      const result = await sendEmail({
        to:      profile.email,
        subject: `Finalisez votre inscription — ${course.title}`,
        html,
        text,
      });

      if (result.success) {
        sent++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error('[cron/payment-reminder] Erreur email:', err);
      skipped++;
    }
  }

  console.log(`[cron/payment-reminder] Terminé — envoyés: ${sent}, ignorés: ${skipped}`);
  return NextResponse.json({ success: true, sent, skipped });
}
