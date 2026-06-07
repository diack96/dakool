import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { issueCertificate } from '@/lib/certificates/issueCertificate';

// GET - List all certificates with pagination and filters
async function GET(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const { searchParams } = new URL(request.url);

    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0') || 0);
    const status = searchParams.get('status'); // 'active' | 'revoked'
    const search = searchParams.get('search');

    let query = supabase
      .from('certificates')
      .select('*', { count: 'exact' })
      .order('issued_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && ['active', 'revoked'].includes(status)) {
      query = query.eq('status', status);
    }

    if (search) {
      // Sanitize search input
      const sanitized = search.replace(/[%_\\]/g, '').trim();
      if (sanitized.length > 0) {
        query = query.or(
          `student_name.ilike.%${sanitized}%,course_title.ilike.%${sanitized}%,certificate_number.ilike.%${sanitized}%`,
        );
      }
    }

    const { data: certificates, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: 'Erreur base de donnees', details: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      certificates: certificates || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: unknown) {
    console.error('Admin certificates list error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// POST - Manually issue a certificate
async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId } = body;

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'userId et courseId requis' }, { status: 400 });
    }

    const supabase = getAdminSupabaseClient();

    // Get user profile for student name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, first_name, last_name, email')
      .eq('id', userId)
      .single();

    const studentName = profile?.full_name
      || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
      || profile?.email
      || 'Etudiant';

    // Get course title
    const { data: course } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single();

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouve' }, { status: 404 });
    }

    // Get enrollment if exists
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, progress')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    const result = await issueCertificate({
      userId,
      courseId,
      enrollmentId: enrollment?.id,
      studentName,
      courseTitle: course.title,
      grade: enrollment?.progress || 100,
    });

    return NextResponse.json({ success: true, certificate: result.certificate }, { status: 201 });
  } catch (error: unknown) {
    console.error('Admin certificate issue error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la creation du certificat', details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

// PATCH - Revoke or reactivate a certificate
async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { certificateId, status } = body;

    if (!certificateId || !status || !['active', 'revoked'].includes(status)) {
      return NextResponse.json(
        { error: 'certificateId et status (active|revoked) requis' },
        { status: 400 },
      );
    }

    const supabase = getAdminSupabaseClient();

    const { data: certificate, error } = await supabase
      .from('certificates')
      .update({ status })
      .eq('id', certificateId)
      .select('id, certificate_number, status')
      .single();

    if (error || !certificate) {
      return NextResponse.json({ error: 'Certificat non trouve' }, { status: 404 });
    }

    return NextResponse.json({ success: true, certificate });
  } catch (error: unknown) {
    console.error('Admin certificate update error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export const GET_handler = withAdminAuth(GET);
export const POST_handler = withAdminAuth(POST);
export const PATCH_handler = withAdminAuth(PATCH);

export { GET_handler as GET, POST_handler as POST, PATCH_handler as PATCH };
