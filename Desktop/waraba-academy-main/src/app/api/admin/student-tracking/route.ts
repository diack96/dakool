import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError } from '@/lib/errors';

export type EnrollmentStatus = 'not_started' | 'in_progress' | 'completed';
export type ExtendedStatusFilter = EnrollmentStatus | 'all' | 'inactive';

export interface TrackingRow {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  email: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  progress: number; // 0-100
  status: EnrollmentStatus;
  certificateGenerated: boolean;
  certificateDate: string | null;
  certificateNumber: string | null;
}

export interface TrackingStats {
  totalEnrollments: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  certificatesIssued: number;
  avgProgress: number;
}

interface ProfileRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface EnrollmentRow {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  progress: number | null;
  updated_at: string;
}

interface CourseRow {
  id: string;
  title: string;
}

interface CertificateRow {
  user_id: string;
  course_id: string;
  issued_at: string;
  certificate_number: string;
}

async function GET(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const { searchParams } = request.nextUrl;
    const courseId = searchParams.get('courseId');
    const statusFilter = searchParams.get('status') as ExtendedStatusFilter | null;
    const format = searchParams.get('format'); // 'csv' or null
    const search = searchParams.get('search') || '';
    const inactivityDays = 30;

    // 1. Get enrollments (optionally filtered by course)
    let enrollmentsQuery = supabase
      .from('enrollments')
      .select('id, user_id, course_id, status, enrolled_at, completed_at, progress, updated_at')
      .order('enrolled_at', { ascending: false });

    if (courseId) {
      enrollmentsQuery = enrollmentsQuery.eq('course_id', courseId);
    }

    if (statusFilter === 'inactive') {
      const cutoff = new Date(Date.now() - inactivityDays * 24 * 60 * 60 * 1000).toISOString();
      enrollmentsQuery = enrollmentsQuery
        .neq('status', 'completed')
        .lt('updated_at', cutoff);
    }

    const { data: enrollments, error: enrollmentsError } = await enrollmentsQuery;
    if (enrollmentsError) throw new Error(`Enrollments error: ${enrollmentsError.message}`);

    if (!enrollments || enrollments.length === 0) {
      if (format === 'csv') {
        return buildCsvResponse([]);
      }
      const stats: TrackingStats = {
        totalEnrollments: 0,
        notStarted: 0,
        inProgress: 0,
        completed: 0,
        certificatesIssued: 0,
        avgProgress: 0,
      };
      return NextResponse.json({ data: [], total: 0, stats });
    }

    const typedEnrollments = enrollments as unknown as EnrollmentRow[];

    // 2. Get student profiles (only role=student)
    const userIds = [...new Set(typedEnrollments.map((e) => e.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('role', 'student')
      .in('id', userIds);

    if (profilesError) throw new Error(`Profiles error: ${profilesError.message}`);

    const studentProfileMap = new Map<string, ProfileRow>();
    for (const p of (profiles as unknown as ProfileRow[]) || []) {
      studentProfileMap.set(p.id, p);
    }

    // 3. Get courses
    const courseIds = [...new Set(typedEnrollments.map((e) => e.course_id))];
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .in('id', courseIds);

    const courseMap = new Map<string, string>();
    for (const c of (courses as unknown as CourseRow[]) || []) {
      courseMap.set(c.id, c.title);
    }

    // 4. Get active certificates
    const { data: certificates } = await supabase
      .from('certificates')
      .select('user_id, course_id, issued_at, certificate_number')
      .in('user_id', userIds)
      .eq('status', 'active');

    const certMap = new Map<string, { issued_at: string; certificate_number: string }>();
    for (const cert of (certificates as unknown as CertificateRow[]) || []) {
      certMap.set(`${cert.user_id}:${cert.course_id}`, {
        issued_at: cert.issued_at,
        certificate_number: cert.certificate_number,
      });
    }

    // 5. Build tracking rows (only student enrollments)
    let rows: TrackingRow[] = typedEnrollments
      .filter((e) => studentProfileMap.has(e.user_id))
      .map((e) => {
        const profile = studentProfileMap.get(e.user_id)!;
        const progress = e.progress ?? 0;

        let status: EnrollmentStatus;
        if (e.status === 'completed') {
          status = 'completed';
        } else if (progress > 0) {
          status = 'in_progress';
        } else {
          status = 'not_started';
        }

        const certKey = `${e.user_id}:${e.course_id}`;
        const cert = certMap.get(certKey);

        return {
          enrollmentId: e.id,
          studentId: e.user_id,
          studentName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Inconnu',
          email: profile.email,
          courseId: e.course_id,
          courseTitle: courseMap.get(e.course_id) || 'Cours inconnu',
          enrolledAt: e.enrolled_at,
          progress,
          status,
          certificateGenerated: !!cert,
          certificateDate: cert?.issued_at || null,
          certificateNumber: cert?.certificate_number || null,
        };
      });

    // 6. Apply status filter
    if (statusFilter && statusFilter !== 'all' && statusFilter !== 'inactive') {
      rows = rows.filter((r) => r.status === statusFilter);
    }

    // 7. Apply search filter
    if (search) {
      const term = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.studentName.toLowerCase().includes(term) ||
          r.email.toLowerCase().includes(term) ||
          r.courseTitle.toLowerCase().includes(term)
      );
    }

    // 8. Compute stats (on the full unfiltered slice for accurate summary)
    const allRows: TrackingRow[] = typedEnrollments
      .filter((e) => studentProfileMap.has(e.user_id))
      .map((e) => {
        const progress = e.progress ?? 0;
        let status: EnrollmentStatus;
        if (e.status === 'completed') status = 'completed';
        else if (progress > 0) status = 'in_progress';
        else status = 'not_started';
        const cert = certMap.get(`${e.user_id}:${e.course_id}`);
        return {
          enrollmentId: e.id,
          studentId: e.user_id,
          studentName: '',
          email: '',
          courseId: e.course_id,
          courseTitle: '',
          enrolledAt: e.enrolled_at,
          progress,
          status,
          certificateGenerated: !!cert,
          certificateDate: null,
          certificateNumber: null,
        };
      });

    const stats: TrackingStats = {
      totalEnrollments: allRows.length,
      notStarted: allRows.filter((r) => r.status === 'not_started').length,
      inProgress: allRows.filter((r) => r.status === 'in_progress').length,
      completed: allRows.filter((r) => r.status === 'completed').length,
      certificatesIssued: allRows.filter((r) => r.certificateGenerated).length,
      avgProgress:
        allRows.length > 0
          ? Math.round(allRows.reduce((sum, r) => sum + r.progress, 0) / allRows.length)
          : 0,
    };

    // 9. CSV export
    if (format === 'csv') {
      return buildCsvResponse(rows);
    }

    return NextResponse.json({ data: rows, total: rows.length, stats });
  } catch (error) {
    console.error('Erreur GET /api/admin/student-tracking:', error);
    return handleApiError(error);
  }
}

function buildCsvResponse(rows: TrackingRow[]): NextResponse {
  const BOM = '\uFEFF';
  const statusLabels: Record<EnrollmentStatus, string> = {
    not_started: 'Non commencé',
    in_progress: 'En cours',
    completed: 'Terminé',
  };

  const headers = [
    'Étudiant',
    'Email',
    'Cours',
    "Date d'inscription",
    '% Avancement',
    'Statut',
    'Certificat',
    "Date d'obtention",
    'N° Certificat',
  ];

  const escape = (v: string | number | null) =>
    `"${String(v ?? '').replace(/"/g, '""')}"`;

  const csvLines = [
    headers.map(escape).join(';'),
    ...rows.map((r) =>
      [
        r.studentName,
        r.email,
        r.courseTitle,
        new Date(r.enrolledAt).toLocaleDateString('fr-FR'),
        `${r.progress}%`,
        statusLabels[r.status],
        r.certificateGenerated ? 'Oui' : 'Non',
        r.certificateDate
          ? new Date(r.certificateDate).toLocaleDateString('fr-FR')
          : '-',
        r.certificateNumber || '-',
      ]
        .map(escape)
        .join(';')
    ),
  ].join('\r\n');

  return new NextResponse(BOM + csvLines, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="suivi-etudiants-${
        new Date().toISOString().split('T')[0]
      }.csv"`,
    },
  });
}

const GET_handler = withAdminAuth(GET);
export { GET_handler as GET };
