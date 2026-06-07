import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { successResponse, ApiErrors } from '@/lib/api/response';

// GET - Retrieve certificates for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // getSession() : validation JWT locale, zéro appel réseau Auth
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0') || 0);

    // Query from the certificates table
    const { data: certificates, error: certError } = await supabase
      .from('certificates')
      .select('id, certificate_number, course_id, verification_token, issued_at, grade, status, student_name, course_title')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (certError) {
      console.error('Error fetching certificates:', certError);
      return ApiErrors.databaseError('Erreur lors de la recuperation des certificats');
    }

    // Get course categories for each certificate
    const courseIds = [...new Set((certificates || []).map((c: any) => c.course_id))];
    let categoryMap: Record<string, string> = {};

    if (courseIds.length > 0) {
      const { data: courses } = await supabase
        .from('courses')
        .select('id, categories(name)')
        .in('id', courseIds);

      if (courses) {
        for (const course of courses as any[]) {
          const cat = course.categories;
          categoryMap[course.id] = cat?.name || 'Non categorise';
        }
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';

    const transformed = (certificates || []).map((cert: any) => ({
      id: cert.id,
      certificateNumber: cert.certificate_number,
      courseId: cert.course_id,
      courseName: cert.course_title || 'Cours',
      studentName: cert.student_name || 'Étudiant',
      courseCategory: categoryMap[cert.course_id] || 'Non catégorisé',
      issueDate: cert.issued_at,
      status: cert.status,
      grade: cert.grade || 100,
      downloadUrl: `/api/certificates/${cert.id}/download`,
      viewUrl: `/certificates/${cert.id}`,
      verificationUrl: `${baseUrl}/certificates/verify/${cert.verification_token}`,
    }));

    return successResponse({
      certificates: transformed,
    });
  } catch (error: unknown) {
    console.error('Certificates API error:', error);
    return ApiErrors.internalError('Erreur interne du serveur');
  }
}
