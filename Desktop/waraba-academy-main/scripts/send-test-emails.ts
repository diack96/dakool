/**
 * Script de test — envoie tous les templates email à une adresse donnée.
 * Usage: npx tsx scripts/send-test-emails.ts [email_destinataire]
 * Requiert RESEND_API_KEY dans .env.local
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { Resend } from 'resend';
import { welcomeWithCourseTemplate } from '../emails/welcome-course';
import { enrollmentConfirmationTemplate } from '../emails/enrollment';
import { passwordResetTemplate } from '../emails/password-reset';
import { newsletterConfirmationTemplate } from '../emails/newsletter';
import { contactNotificationTemplate } from '../emails/contact-team';
import { contactConfirmationTemplate } from '../emails/contact-user';
import { certificateObtainedTemplate } from '../emails/certificate';
import { courseCompletedTemplate } from '../emails/course-completed';
import { courseAbandonedTemplate } from '../emails/course-abandoned';
import { paymentFailedTemplate } from '../emails/payment-failed';
import { adminNewPaymentTemplate } from '../emails/admin-payment';

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('❌ RESEND_API_KEY manquant dans .env.local');
  process.exit(1);
}

const FROM = process.env.RESEND_FROM_EMAIL || 'Waraba Academy <noreply@waraba-academy.com>';
const TO = process.argv[2] || 'abdoudiack96@gmail.com';
const SITE = process.env.NEXT_PUBLIC_APP_URL || 'https://waraba-academy.com';

const resend = new Resend(apiKey);

async function send(subject: string, tpl: { html: string; text: string }) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: TO,
    subject: `[TEST] ${subject}`,
    html: tpl.html,
    text: tpl.text,
  });
  if (error) {
    console.error(`  ❌ ${subject}:`, error.message);
  } else {
    console.log(`  ✅ ${subject} — id: ${data?.id}`);
  }
  // Petite pause pour ne pas déclencher le rate-limit Resend
  await new Promise(r => setTimeout(r, 400));
}

async function main() {
  console.log(`\n📧 Envoi de 11 templates à ${TO}\n`);

await send('Bienvenue + Cours', await welcomeWithCourseTemplate({
    userName: 'Abdou Diack',
    courseTitle: 'React & Next.js — De Zéro à Expert',
    courseDescription: 'Maîtrisez React 19, Next.js 15 et TypeScript à travers des projets concrets. Apprenez les hooks, le Server Side Rendering, les Server Components et bien plus encore.',
    courseUrl: `${SITE}/courses/react-nextjs`,
    dashboardUrl: `${SITE}/dashboard`,
  }));

  await send('Confirmation inscription', await enrollmentConfirmationTemplate({
    userName: 'Abdou Diack',
    courseTitle: 'React & Next.js — De Zéro à Expert',
    courseUrl: `${SITE}/courses/react-nextjs/learn`,
    enrollmentDate: new Date().toISOString(),
    isFreeCourse: false,
    amount: 49000,
    currency: 'FCFA',
  }));

  await send('Réinitialisation mot de passe', await passwordResetTemplate({
    userName: 'Abdou Diack',
    resetUrl: `${SITE}/auth/reset-password?token=abc123xyz`,
    expiresIn: '1 heure',
  }));

await send('Confirmation newsletter', await newsletterConfirmationTemplate({
    unsubscribeUrl: `${SITE}/unsubscribe?token=abc123`,
  }));

  await send('Notification contact (équipe)', await contactNotificationTemplate({
    firstName: 'Abdou',
    lastName: 'Diack',
    email: 'abdodiack96@gmail.com',
    subject: 'Question sur le cours React',
    message: 'Bonjour, je voudrais savoir si le cours React est disponible en version téléchargeable. Merci pour votre réponse rapide !',
  }));

  await send('Accusé réception contact (utilisateur)', await contactConfirmationTemplate({
    firstName: 'Abdou',
    subject: 'Question sur le cours React',
  }));

  await send('Certificat obtenu', await certificateObtainedTemplate({
    userName: 'Abdou Diack',
    courseTitle: 'React & Next.js — De Zéro à Expert',
    grade: 87,
    certificateNumber: 'WA-2026-00142',
    downloadUrl: `${SITE}/certificates/WA-2026-00142/download`,
    verifyUrl: `${SITE}/certificates/verify/abc123token`,
    issuedAt: new Date().toISOString(),
  }));

  await send('Cours terminé (avec quiz)', await courseCompletedTemplate({
    userName: 'Abdou Diack',
    courseTitle: 'React & Next.js — De Zéro à Expert',
    courseUrl: `${SITE}/courses/react-nextjs/learn`,
    hasQuiz: true,
    quizUrl: `${SITE}/courses/react-nextjs/quiz/final`,
  }));

  await send('Cours abandonné', await courseAbandonedTemplate({
    userName: 'Abdou',
    courseTitle: 'React & Next.js — De Zéro à Expert',
    progressPercent: 68,
    courseUrl: `${SITE}/courses/react-nextjs/learn`,
    daysSinceLastActivity: 9,
  }));

  await send('Paiement échoué', await paymentFailedTemplate({
    userName: 'Abdou Diack',
    courseTitle: 'React & Next.js — De Zéro à Expert',
    amount: 49000,
    currency: 'FCFA',
    retryUrl: `${SITE}/courses/react-nextjs/checkout`,
    supportUrl: `${SITE}/contact`,
  }));

  await send('Nouveau paiement (admin)', await adminNewPaymentTemplate({
    studentName: 'Abdou Diack',
    studentEmail: 'abdodiack96@gmail.com',
    courseTitle: 'React & Next.js — De Zéro à Expert',
    amount: 49000,
    currency: 'FCFA',
    paymentMethod: 'Wave',
    transactionId: 'TXN-20260226-78542',
    paidAt: new Date().toISOString(),
  }));

  console.log('\n🎉 Terminé !\n');
}

main().catch(console.error);
