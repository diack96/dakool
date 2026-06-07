import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(3, 'Titre trop court').max(255),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/, 'Slug invalide (lettres minuscules, chiffres, tirets)'),
  description: z.string().optional().default(''),
  short_description: z.string().max(500).optional().default(''),
  thumbnail: z.string().url().optional().or(z.literal('')).default(''),
  level: z.enum(['all', 'beginner', 'intermediate', 'advanced']).default('all'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  is_featured: z.boolean().default(false),
});

async function GET(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('learning_paths')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }
    if (search) {
      const s = search.replace(/[%_]/g, '\\$&');
      query = query.ilike('title', `%${s}%`);
    }
    query = query.range(offset, offset + limit - 1);

    const { data: paths, error, count } = await query;
    if (error) {
      return NextResponse.json({ error: 'Erreur DB' }, { status: 500 });
    }

    const pathIds = (paths || []).map((p: any) => p.id);
    let coursesCountMap: Record<string, number> = {};
    if (pathIds.length > 0) {
      const { data: lpCourses } = await supabase
        .from('learning_path_courses')
        .select('learning_path_id')
        .in('learning_path_id', pathIds);
      (lpCourses || []).forEach((lpc: any) => {
        coursesCountMap[lpc.learning_path_id] = (coursesCountMap[lpc.learning_path_id] || 0) + 1;
      });
    }

    const enriched = (paths || []).map((p: any) => ({
      ...p,
      courses_count: coursesCountMap[p.id] || 0,
    }));

    return NextResponse.json({
      success: true,
      paths: enriched,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Données invalides', details: validation.error.errors }, { status: 400 });
    }

    const adminUser = (request as any).adminUser;
    const supabase = getAdminSupabaseClient();
    const { data: path, error } = await supabase
      .from('learning_paths')
      .insert({
        ...validation.data,
        thumbnail: validation.data.thumbnail || null,
        created_by: adminUser?.id || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
    }

    return NextResponse.json({ success: true, path }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export const GET_handler = withAdminAuth(GET);
export const POST_handler = withAdminAuth(POST);
export { GET_handler as GET, POST_handler as POST };
