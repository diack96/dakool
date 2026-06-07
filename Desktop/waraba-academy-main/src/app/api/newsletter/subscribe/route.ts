import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, addContactToAudience } from '@/lib/email';
import { newsletterConfirmationTemplate } from '@/lib/email/templates';
import { dbRateLimit } from '@/lib/dbRateLimit';

// 3 soumissions par email par heure — DB-based (fonctionne sur serverless)
const RATE_LIMIT     = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Rate limit par email (DB-based — persiste entre instances serverless)
    const blocked = await dbRateLimit(`newsletter:${email.toLowerCase()}`, RATE_LIMIT, RATE_WINDOW_MS);
    if (blocked) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans une heure.' },
        { status: 429 },
      );
    }

    // 1. Ajouter à Resend Audience — non bloquant
    addContactToAudience({ email }).catch((err) => {
      console.error('Erreur audience (non bloquant):', err);
    });

    // 2. Email de confirmation
    const { html, text } = await newsletterConfirmationTemplate({});
    const emailResult = await sendEmail({
      to: email,
      subject: '✅ Bienvenue dans la newsletter Waraba Academy',
      html,
      text,
    });

    if (!emailResult.success) {
      console.error('Erreur envoi confirmation newsletter:', emailResult.error);
    }

    console.log(`✅ Newsletter: ${email} inscrit (email envoyé: ${emailResult.success})`);

    return NextResponse.json({
      success: true,
      message: 'Inscription confirmée ! Vérifiez votre boîte mail.',
    });
  } catch (error) {
    console.error('Erreur /api/newsletter/subscribe:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
