import { Resend } from 'resend';

// Instance Resend (lazy initialization)
let resendInstance: Resend | null = null;

function getResendInstance(): Resend | null {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  const resend = getResendInstance();

  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY not configured. Email not sent:', options.subject);
    return {
      success: false,
      error: 'Service email non configuré',
    };
  }

  const fromAddress = options.from || process.env.RESEND_FROM_EMAIL || 'Waraba Academy <noreply@waraba-academy.com>';

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('❌ Erreur envoi email:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Email envoyé:', { to: options.to, subject: options.subject, id: data?.id });
    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('❌ Erreur envoi email:', message);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export interface AddContactResult {
  success: boolean;
  error?: string;
}

/**
 * Add or update a contact in a Resend Audience.
 * Gracefully degrades if RESEND_AUDIENCE_ID is not configured.
 */
export async function addContactToAudience(options: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<AddContactResult> {
  const resend = getResendInstance();
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY non configuré — contact non ajouté à l\'audience');
    return { success: false, error: 'Service email non configuré' };
  }

  if (!audienceId) {
    console.warn('⚠️ RESEND_AUDIENCE_ID non configuré — contact non ajouté à l\'audience');
    return { success: false, error: 'RESEND_AUDIENCE_ID manquant' };
  }

  try {
    const { error } = await resend.contacts.create({
      email: options.email,
      firstName: options.firstName,
      lastName: options.lastName,
      unsubscribed: false,
      audienceId,
    });

    if (error) {
      console.error('❌ Erreur ajout contact audience:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Contact ajouté à l\'audience Resend:', options.email);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('❌ Erreur ajout contact audience:', message);
    return { success: false, error: message };
  }
}
