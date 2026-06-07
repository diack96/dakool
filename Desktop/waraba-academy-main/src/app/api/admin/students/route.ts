import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError } from '@/lib/errors';

interface QuizScore {
  quizTitle: string;
  score: number;
  maxScore: number;
  passed: boolean;
}

interface StudentResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrolledAt: string;
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  lastActivity: string;
  isActive: boolean;
  isAbandoned: boolean;
  quizScores: QuizScore[];
  enrollmentStatus?: string;
}

interface ProfileRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

interface EnrollmentRow {
  user_id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  updated_at: string;
}

interface ProgressRow {
  user_id: string;
  course_id: string;
  lesson_id: string;
  is_completed: boolean;
  updated_at: string;
}

interface QuizAttemptRow {
  user_id: string;
  quiz_id: string;
  score: number;
  max_score: number;
  passed: boolean;
  completed_at: string | null;
  quizzes: { title: string } | null;
}

async function GET(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const courseId = request.nextUrl.searchParams.get('courseId');

    // If filtering by course, get enrolled user IDs first
    let courseFilteredUserIds: string[] | null = null;
    const enrollmentStatusMap = new Map<string, string>();

    if (courseId) {
      const { data: courseEnrollments, error: ceError } = await supabase
        .from('enrollments')
        .select('user_id, status')
        .eq('course_id', courseId);

      if (ceError) {
        throw new Error(`Erreur enrollments cours: ${ceError.message}`);
      }

      if (!courseEnrollments || courseEnrollments.length === 0) {
        return NextResponse.json([]);
      }

      courseFilteredUserIds = courseEnrollments.map((e: { user_id: string; status: string }) => e.user_id);
      for (const e of courseEnrollments as { user_id: string; status: string }[]) {
        enrollmentStatusMap.set(e.user_id, e.status);
      }
    }

    // 1. Get student profiles (filtered by course enrollment if applicable)
    let profilesQuery = supabase
      .from('profiles')
      .select('id, email, first_name, last_name, created_at, updated_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (courseFilteredUserIds) {
      profilesQuery = profilesQuery.in('id', courseFilteredUserIds);
    }

    const { data: profiles, error: profilesError } = await profilesQuery;

    if (profilesError) {
      throw new Error(`Erreur profils: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json([]);
    }

    const typedProfiles = profiles as unknown as ProfileRow[];
    const userIds = typedProfiles.map((p: ProfileRow) => p.id);

    // 2. Batch queries in parallel
    const [enrollmentsResult, progressResult, quizResult] = await Promise.all([
      supabase
        .from('enrollments')
        .select('user_id, course_id, status, enrolled_at, updated_at')
        .in('user_id', userIds),
      supabase
        .from('user_progress')
        .select('user_id, course_id, lesson_id, is_completed, updated_at')
        .in('user_id', userIds),
      supabase
        .from('quiz_attempts')
        .select('user_id, quiz_id, score, max_score, passed, completed_at, quizzes(title)')
        .in('user_id', userIds)
        .order('completed_at', { ascending: false }),
    ]);

    const enrollments = (enrollmentsResult.data || []) as unknown as EnrollmentRow[];
    const progressData = (progressResult.data || []) as unknown as ProgressRow[];
    const quizAttempts = (quizResult.data || []) as unknown as QuizAttemptRow[];

    // 3. Build lookup maps
    const enrollmentsByUser = new Map<string, EnrollmentRow[]>();
    for (const e of enrollments) {
      const list = enrollmentsByUser.get(e.user_id) || [];
      list.push(e);
      enrollmentsByUser.set(e.user_id, list);
    }

    const progressByUser = new Map<string, ProgressRow[]>();
    for (const p of progressData) {
      const list = progressByUser.get(p.user_id) || [];
      list.push(p);
      progressByUser.set(p.user_id, list);
    }

    const quizByUser = new Map<string, QuizAttemptRow[]>();
    for (const q of quizAttempts) {
      const list = quizByUser.get(q.user_id) || [];
      list.push(q);
      quizByUser.set(q.user_id, list);
    }

    // 4. Get total lessons per course for enrolled courses
    const allCourseIds = [...new Set(enrollments.map((e: EnrollmentRow) => e.course_id))];
    const lessonCountByCourse = new Map<string, number>();
    if (allCourseIds.length > 0) {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('course_id')
        .in('course_id', allCourseIds);

      for (const l of (lessons || []) as { course_id: string }[]) {
        lessonCountByCourse.set(l.course_id, (lessonCountByCourse.get(l.course_id) || 0) + 1);
      }
    }

    // 5. Build response
    const now = Date.now();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    const students: StudentResponse[] = typedProfiles.map((profile: ProfileRow) => {
      const userEnrollments = enrollmentsByUser.get(profile.id) || [];
      const userProgress = progressByUser.get(profile.id) || [];
      const userQuizAttempts = quizByUser.get(profile.id) || [];

      const totalCourses = userEnrollments.length;
      const completedCourses = userEnrollments.filter((e: EnrollmentRow) => e.status === 'completed').length;

      const totalLessons = userEnrollments.reduce(
        (sum: number, e: EnrollmentRow) => sum + (lessonCountByCourse.get(e.course_id) || 0),
        0
      );
      const completedLessons = userProgress.filter((p: ProgressRow) => p.is_completed).length;

      // Best score per quiz
      const bestByQuiz = new Map<string, QuizAttemptRow>();
      for (const attempt of userQuizAttempts) {
        const existing = bestByQuiz.get(attempt.quiz_id);
        if (!existing || attempt.score > existing.score) {
          bestByQuiz.set(attempt.quiz_id, attempt);
        }
      }

      const quizScores: QuizScore[] = Array.from(bestByQuiz.values()).map((a: QuizAttemptRow) => ({
        quizTitle: a.quizzes?.title || 'Quiz inconnu',
        score: a.score,
        maxScore: a.max_score,
        passed: a.passed,
      }));

      // Last activity = most recent date across enrollments, progress, quiz attempts
      const dates: number[] = [new Date(profile.created_at).getTime()];
      for (const e of userEnrollments) {
        if (e.updated_at) dates.push(new Date(e.updated_at).getTime());
        if (e.enrolled_at) dates.push(new Date(e.enrolled_at).getTime());
      }
      for (const p of userProgress) {
        if (p.updated_at) dates.push(new Date(p.updated_at).getTime());
      }
      for (const q of userQuizAttempts) {
        if (q.completed_at) dates.push(new Date(q.completed_at).getTime());
      }
      const lastActivityMs = Math.max(...dates);
      const lastActivity = new Date(lastActivityMs).toISOString();
      const isActive = now - lastActivityMs < THIRTY_DAYS_MS;
      const isAbandoned = !isActive && totalCourses > 0 && completedCourses < totalCourses;

      const result: StudentResponse = {
        id: profile.id,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email,
        enrolledAt: profile.created_at,
        totalCourses,
        completedCourses,
        totalLessons,
        completedLessons,
        lastActivity,
        isActive,
        isAbandoned,
        quizScores,
      };

      if (courseId) {
        result.enrollmentStatus = enrollmentStatusMap.get(profile.id);
      }

      return result;
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Erreur GET /api/admin/students:', error);
    return handleApiError(error);
  }
}

const GET_handler = withAdminAuth(GET);
export { GET_handler as GET };
