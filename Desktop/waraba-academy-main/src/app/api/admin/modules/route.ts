import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError } from '@/lib/errors';
import { z } from 'zod';

const moduleSchema = z.object({
  course_id: z.string().uuid('course_id doit être un UUID valide'),
  title: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().optional().default(''),
  order: z.union([z.number(), z.string()])
    .transform(val => Number(val) || 0)
    .optional(),
});

// GET /api/admin/modules?course_id=xxx
async function GET(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'course_id est requis' },
        { status: 400 },
      );
    }

    const { data: modules, error } = await supabase
      .from('modules')
      .select(`
        *,
        lessons (
          id, title, description, video_url, duration, lesson_order, is_free, module_id
        )
      `)
      .eq('course_id', courseId)
      .order('order', { ascending: true });

    if (error) {
      console.error('Erreur GET modules:', error.message);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des modules' },
        { status: 500 },
      );
    }

    // Trier les leçons par lesson_order dans chaque module
    const sortedModules = (modules || []).map((mod: any) => ({
      ...mod,
      lessons: (mod.lessons || []).sort(
        (a: any, b: any) => (a.lesson_order ?? 0) - (b.lesson_order ?? 0),
      ),
    }));

    return NextResponse.json({ success: true, modules: sortedModules });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/admin/modules
async function POST(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const body = await request.json();

    const validation = moduleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validation.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Si order non fourni, mettre à la fin
    if (data.order === undefined || data.order === 0) {
      const { count } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', data.course_id);
      data.order = (count || 0) + 1;
    }

    const { data: module, error } = await supabase
      .from('modules')
      .insert([{
        course_id: data.course_id,
        title: data.title,
        description: data.description,
        order: data.order,
      }])
      .select()
      .single();

    if (error) {
      console.error('Erreur création module:', error.message);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du module' },
        { status: 500 },
      );
    }

    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'modules.create',
      resource: '/api/admin/modules',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { module_id: module.id, course_id: data.course_id },
    }).catch(() => {});

    return NextResponse.json({ success: true, module }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET_handler = withAdminAuth(GET);
export const POST_handler = withAdminAuth(POST);
export { GET_handler as GET, POST_handler as POST };
