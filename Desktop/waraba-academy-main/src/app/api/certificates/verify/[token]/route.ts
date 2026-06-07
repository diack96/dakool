import { NextRequest } from 'next/server';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { CACHE_HEADERS } from '@/lib/api/apiUtils';

// GET - Public verification endpoint (no auth required)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!token || token.length < 8 || token.length > 20) {
      return ApiErrors.validationError('Token de verification invalide');
    }

    const supabase = getAdminSupabaseClient();

    const { data: certificate, error } = await supabase
      .from('certificates')
      .select('certificate_number, student_name, course_title, issued_at, status, grade')
      .eq('verification_token', token)
      .single();

    if (error || !certificate) {
      return ApiErrors.notFound('Certificat');
    }

    return successResponse(
      {
        certificateNumber: certificate.certificate_number,
        studentName: certificate.student_name,
        courseTitle: certificate.course_title,
        issuedAt: certificate.issued_at,
        status: certificate.status,
        grade: certificate.grade,
      },
      undefined,
      200,
      CACHE_HEADERS.LONG,
    );
  } catch (error: unknown) {
    console.error('Certificate verification error:', error);
    return ApiErrors.internalError('Erreur lors de la verification');
  }
}
