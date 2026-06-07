import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError } from '@/lib/errors';
import { z } from 'zod';

// Schéma de validation pour une leçon
const lessonSchema = z.object({
  course_id: z.string().uuid(),
  module_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().optional().default(''),
  content: z.string().optional().default(''),
  video_url: z.string().optional().nullable().transform(val => val === '' ? null : val),
  duration: z.union([z.number(), z.string()]).transform(val => Number(val) || 0).optional().default(0),
  order: z.union([z.number(), z.string()]).transform(val => Number(val) || 0).optional(), // mapped to lesson_order in DB
  is_free: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').optional().default(false),
});

// GET /api/admin/lessons - Liste des leçons (avec filtre par course_id)
async function GET(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const { searchParams } = new URL(request.url);

    const courseId = searchParams.get('course_id');
    const search = searchParams.get('search');

    // Colonnes explicites — évite de charger content (HTML potentiellement volumineux) sur la liste
    let query = supabase
      .from('lessons')
      .select('id, course_id, module_id, title, description, video_url, duration, lesson_order, is_free, created_at, updated_at')
      .order('lesson_order', { ascending: true });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (search) {
      const sanitized = search
        .substring(0, 100)
        .replace(/[%_\\]/g, (c) => `\\${c}`)
        .replace(/[,().]/g, '');
      query = query.ilike('title', `%${sanitized}%`);
    }

    const { data: lessons, error, count } = await query;

    if (error) {
      console.error('Erreur récupération leçons:', error.message);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des leçons',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      lessons: lessons || [],
      total: count || lessons?.length || 0,
    });
  } catch (error) {
    console.error('Erreur GET lessons:', error);
    return handleApiError(error);
  }
}

// POST /api/admin/lessons - Créer une leçon
async function POST(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON leçon:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Format JSON invalide',
      }, { status: 400 });
    }

    // Validation
    const validation = lessonSchema.safeParse(body);
    if (!validation.success) {
      console.error('❌ Erreur validation leçon:', validation.error.issues);
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        details: validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      }, { status: 400 });
    }

    const data = validation.data;

    // Si order n'est pas spécifié, placer après la dernière leçon existante
    if (data.order === undefined) {
      const { data: lastLesson } = await supabase
        .from('lessons')
        .select('lesson_order')
        .eq('course_id', data.course_id)
        .order('lesson_order', { ascending: false })
        .limit(1)
        .maybeSingle();

      data.order = ((lastLesson as any)?.lesson_order ?? 0) + 1;
    }

    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert([{
        course_id: data.course_id,
        module_id: data.module_id ?? null,
        title: data.title,
        description: data.description,
        content: data.content,
        video_url: data.video_url,
        duration: data.duration,
        lesson_order: data.order,
        is_free: data.is_free,
      }])
      .select()
      .single();

    if (error) {
      // Log full details server-side only — never expose DB internals to client
      console.error('Erreur création leçon DB:', error.message, error.code);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la création de la leçon',
      }, { status: 500 });
    }

    // Log de l'action
    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'lessons.create',
      resource: '/api/admin/lessons',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { lesson_id: lesson.id, course_id: data.course_id },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error('Erreur POST lessons:', error);
    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
export const GET_handler = withAdminAuth(GET);
export const POST_handler = withAdminAuth(POST);

export { GET_handler as GET, POST_handler as POST };
