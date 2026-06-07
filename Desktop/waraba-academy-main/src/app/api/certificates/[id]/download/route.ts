import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAdminSupabaseClient } from '@/lib/supabase-server';
import { ApiErrors } from '@/lib/api/response';
import { generateCertificatePdf } from '@/lib/certificates/generatePdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    // Fetch certificate - use admin client to bypass RLS for admin check
    const adminSupabase = getAdminSupabaseClient();
    const { data: certificate, error: certError } = await adminSupabase
      .from('certificates')
      .select('*')
      .eq('id', id)
      .single();

    if (certError || !certificate) {
      console.error('Certificate not found:', id, certError?.message);
      return ApiErrors.notFound('Certificat', id);
    }

    // Verify ownership (user owns it or user is admin)
    if (certificate.user_id !== user.id) {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        return ApiErrors.forbidden('Vous ne pouvez pas acceder a ce certificat');
      }
    }

    const filename = `certificat-${certificate.certificate_number}.pdf`;

    // Try to get PDF from storage first
    if (certificate.pdf_storage_path) {
      try {
        const { data: fileData, error: downloadError } = await adminSupabase.storage
          .from('certificates')
          .download(certificate.pdf_storage_path);

        if (!downloadError && fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          return new NextResponse(arrayBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Cache-Control': 'private, max-age=3600',
            },
          });
        }
      } catch {
        // Storage download failed, fall through to regeneration
      }
    }

    // Regenerate PDF on-the-fly
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';
    const verificationUrl = `${baseUrl}/certificates/verify/${certificate.verification_token}`;

    const pdfBuffer = await generateCertificatePdf({
      studentName: certificate.student_name || 'Étudiant',
      courseTitle: certificate.course_title || 'Cours',
      certificateNumber: certificate.certificate_number,
      issuedAt: new Date(certificate.issued_at),
      grade: certificate.grade || 100,
      verificationUrl,
    });

    // Cache the regenerated PDF to storage for future downloads (fire-and-forget)
    const storagePath = `${certificate.user_id}/${certificate.certificate_number}.pdf`;
    adminSupabase.storage
      .from('certificates')
      .upload(storagePath, pdfBuffer, { contentType: 'application/pdf', upsert: true })
      .then(({ error: uploadErr }: { error: any }) => {
        if (!uploadErr) {
          adminSupabase
            .from('certificates')
            .update({ pdf_storage_path: storagePath })
            .eq('id', id)
            .then(() => {});
        }
      });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error: unknown) {
    console.error('Certificate download error:', error);
    return ApiErrors.internalError('Erreur lors du telechargement du certificat');
  }
}
