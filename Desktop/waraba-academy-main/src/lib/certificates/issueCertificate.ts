import crypto from 'crypto';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { generateCertificatePdf } from './generatePdf';
import { isNameSuspicious } from './nameUtils';
import { sendEmail } from '@/lib/email';
import { certificateObtainedTemplate } from '@/lib/email/templates';

interface IssueCertificateParams {
  userId: string;
  courseId: string;
  enrollmentId?: string;
  studentName: string;
  courseTitle: string;
  grade?: number;
}

interface IssueCertificateResult {
  certificate: {
    id: string;
    certificate_number: string;
    verification_token: string;
    pdf_storage_path: string | null;
  };
}

/**
 * Generate a unique certificate number: WA-YYYY-XXXXX
 */
function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1 for clarity
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[crypto.randomInt(chars.length)];
  }
  return `WA-${year}-${code}`;
}

/**
 * Generate a 12-char URL-safe verification token
 */
function generateVerificationToken(): string {
  return crypto.randomBytes(9).toString('base64url').slice(0, 12);
}

/**
 * Validate and normalise the student name before generating a certificate.
 *
 * Rejects :
 *   - empty strings and placeholders ("etudiant", "user", …)
 *   - e-mail addresses ("jules@gmail.com")
 *   - e-mail prefixes / usernames with digits ("julesmendy26")
 *   - any single-word value (prénom seul insuffisant)
 *
 * Throws a descriptive error so callers can surface it to the user.
 */
export function validateStudentName(raw: string | null | undefined): string {
  const trimmed = (raw ?? '').trim();
  if (isNameSuspicious(trimmed)) {
    throw new Error(
      `Nom d'étudiant invalide : "${trimmed}". ` +
      `Veuillez compléter votre profil avec votre prénom et votre nom de famille réels ` +
      `avant de générer un certificat.`,
    );
  }
  return trimmed;
}

/**
 * Issue a certificate: create DB row, generate PDF, upload to storage.
 * Validates the student name before writing anything.
 */
export async function issueCertificate(params: IssueCertificateParams): Promise<IssueCertificateResult> {
  const { userId, courseId, enrollmentId, studentName: rawName, courseTitle, grade = 100 } = params;

  // Validate name BEFORE any DB work — fail fast with a clear message
  const studentName = validateStudentName(rawName);

  const supabase = createAdminSupabaseClient();

  // Check if certificate already exists for this user+course
  const { data: existing } = await supabase
    .from('certificates')
    .select('id, certificate_number, verification_token, pdf_storage_path')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (existing) {
    return { certificate: existing };
  }

  // Generate unique identifiers (retry on collision)
  let certificateNumber = generateCertificateNumber();
  let verificationToken = generateVerificationToken();

  // Ensure uniqueness with up to 3 retries
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: collision } = await supabase
      .from('certificates')
      .select('id')
      .or(`certificate_number.eq.${certificateNumber},verification_token.eq.${verificationToken}`)
      .limit(1)
      .single();

    if (!collision) break;
    certificateNumber = generateCertificateNumber();
    verificationToken = generateVerificationToken();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';
  const verificationUrl = `${baseUrl}/certificates/verify/${verificationToken}`;

  // Generate PDF
  let pdfStoragePath: string | null = null;
  try {
    const pdfBuffer = await generateCertificatePdf({
      studentName,
      courseTitle,
      certificateNumber,
      issuedAt: new Date(),
      grade,
      verificationUrl,
    });

    // Upload to Supabase Storage
    const storagePath = `${userId}/${certificateNumber}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (!uploadError) {
      pdfStoragePath = storagePath;
    } else {
      console.error('Certificate PDF upload failed:', uploadError.message);
    }
  } catch (err) {
    console.error('Certificate PDF generation failed:', err);
    // Continue without PDF - it can be regenerated on download
  }

  // Insert certificate record
  const { data: certificate, error: insertError } = await supabase
    .from('certificates')
    .insert({
      certificate_number: certificateNumber,
      user_id: userId,
      course_id: courseId,
      enrollment_id: enrollmentId || null,
      grade,
      verification_token: verificationToken,
      pdf_storage_path: pdfStoragePath,
      student_name: studentName,
      course_title: courseTitle,
      status: 'active',
    })
    .select('id, certificate_number, verification_token, pdf_storage_path')
    .single();

  if (insertError) {
    throw new Error(`Failed to insert certificate: ${insertError.message}`);
  }

  // Send certificate email (non-blocking)
  try {
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    const userEmail = profileRow?.email;
    if (userEmail) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://waraba-academy.com';
      const downloadUrl = `${baseUrl}/certificates/${certificate.id}`;
      const verifyUrl = `${baseUrl}/certificates/verify/${certificate.verification_token}`;

      const { html, text } = await certificateObtainedTemplate({
        userName: studentName,
        courseTitle,
        grade,
        certificateNumber: certificate.certificate_number,
        downloadUrl,
        verifyUrl,
        issuedAt: new Date().toISOString(),
      });

      await sendEmail({
        to: userEmail,
        subject: `🏆 Votre certificat "${courseTitle}" est disponible !`,
        html,
        text,
      });
    }
  } catch (emailErr) {
    // Never block certificate issuance for an email failure
    console.error('Certificate email send failed (non-blocking):', emailErr);
  }

  return { certificate };
}
