import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, AdminUser } from '@/middleware/adminAuth';
import { sendEmail, isEmailConfigured } from '@/lib/email';

/**
 * POST /api/admin/test-email
 * Envoie un email de test Resend pour vérifier la configuration.
 * Accessible uniquement aux admins authentifiés.
 *
 * Body (optionnel) : { "to": "cible@example.com" }
 * Par défaut, envoie à l'email de l'admin connecté.
 */
async function POST(request: NextRequest) {
  const adminUser = (request as NextRequest & { adminUser: AdminUser }).adminUser;

  // Diagnostic des variables d'environnement
  const diagnostics = {
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || null,
    RESEND_AUDIENCE_ID: !!process.env.RESEND_AUDIENCE_ID,
    CONTACT_NOTIFICATION_EMAIL: process.env.CONTACT_NOTIFICATION_EMAIL || null,
    isEmailConfigured: isEmailConfigured(),
  };

  if (!diagnostics.isEmailConfigured) {
    return NextResponse.json({
      success: false,
      error: 'RESEND_API_KEY non configuré — impossible d\'envoyer des emails.',
      diagnostics,
    }, { status: 503 });
  }

  // Destination : body.to ou email de l'admin
  let to = adminUser.email;
  try {
    const body = await request.json().catch(() => ({}));
    if (body?.to && typeof body.to === 'string') {
      to = body.to;
    }
  } catch {
    // pas de body, on garde l'email admin
  }

  const sentAt = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' });
  const fromEmail = diagnostics.RESEND_FROM_EMAIL || 'Waraba Academy <noreply@waraba-academy.com>';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 20px;">
  <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e5e7eb;">
    <div style="text-align:center;font-size:48px;margin-bottom:16px;">✅</div>
    <h1 style="text-align:center;font-size:22px;color:#111827;margin:0 0 8px">Email de test Resend</h1>
    <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 32px">
      Si vous recevez cet email, Resend est correctement configuré.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:10px 0;color:#6b7280;width:40%">Envoyé à</td>
        <td style="padding:10px 0;color:#111827;font-weight:600">${to}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:10px 0;color:#6b7280">Depuis</td>
        <td style="padding:10px 0;color:#111827">${fromEmail}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:10px 0;color:#6b7280">Admin déclencheur</td>
        <td style="padding:10px 0;color:#111827">${adminUser.email}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#6b7280">Date</td>
        <td style="padding:10px 0;color:#111827">${sentAt}</td>
      </tr>
    </table>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:32px;">
      Waraba Academy — Email de test automatique
    </p>
  </div>
</body>
</html>`;

  const text = `Email de test Resend — Waraba Academy\n\nSi vous recevez cet email, Resend est correctement configuré.\n\nEnvoyé à : ${to}\nDepuis : ${fromEmail}\nAdmin : ${adminUser.email}\nDate : ${sentAt}`;

  const result = await sendEmail({
    to,
    subject: `[TEST] Resend opérationnel — Waraba Academy`,
    html,
    text,
  });

  return NextResponse.json({
    success: result.success,
    messageId: result.messageId ?? null,
    error: result.error ?? null,
    sentTo: to,
    diagnostics,
  }, { status: result.success ? 200 : 500 });
}

export const POST_handler = withAdminAuth(POST);
export { POST_handler as POST };
