import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { contactNotificationTemplate, contactConfirmationTemplate } from '@/lib/email/templates';
import { dbRateLimit } from '@/lib/dbRateLimit';

// 5 messages par IP par heure — DB-based (fonctionne sur serverless)
const RATE_LIMIT     = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded
      ? forwarded.split(',').at(0)?.trim() ?? 'unknown'
      : (request.headers.get('x-real-ip') ?? 'unknown');

    const blocked = await dbRateLimit(`contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
    if (blocked) {
      return NextResponse.json(
        { error: 'Trop de messages envoyés. Réessayez dans une heure.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, subject, message } = body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    // Validation
    if (!firstName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis (prénom, email, sujet, message).' },
        { status: 400 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: 'Message trop court (minimum 10 caractères)' }, { status: 400 });
    }

    const teamEmail =
      process.env.CONTACT_NOTIFICATION_EMAIL ||
      process.env.RESEND_FROM_EMAIL?.match(/<(.+)>/)?.[1] ||
      'contact@waraba-academy.com';

    // 1. Notification à l'équipe
    const { html: notifHtml, text: notifText } = await contactNotificationTemplate({
      firstName,
      lastName: lastName || '',
      email,
      subject,
      message,
    });
    await sendEmail({
      to: teamEmail,
      subject: `📩 Nouveau contact: ${subject}`,
      html: notifHtml,
      text: notifText,
    });

    // 2. Accusé de réception à l'utilisateur — non bloquant
    const { html: ackHtml, text: ackText } = await contactConfirmationTemplate({ firstName, subject });
    sendEmail({
      to: email,
      subject: '📬 Message bien reçu — Waraba Academy',
      html: ackHtml,
      text: ackText,
    }).catch((err) => console.error('Erreur accusé réception:', err));

    console.log(`✅ Contact reçu de ${email} — sujet: ${subject}`);

    return NextResponse.json({
      success: true,
      message: 'Message envoyé ! Notre équipe vous répondra sous 24-48h.',
    });
  } catch (error) {
    console.error('Erreur /api/contact/send:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
