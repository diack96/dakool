import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '@/middleware/adminAuth';
import { createAdminSupabaseClient } from '@/lib/supabase-server';

const CreateSchema = z.object({
  title:     z.string().min(1).max(200),
  type:      z.enum(['file', 'link']),
  url:       z.string().url(),
  file_name: z.string().max(255).optional(),
  file_size: z.number().int().positive().optional(),
  mime_type: z.string().max(100).optional(),
  order:     z.number().int().min(0).default(0),
});

// GET /api/admin/courses/[id]/resources
async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await params;
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('course_resources')
    .select('*')
    .eq('course_id', courseId)
    .order('order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ resources: data ?? [] });
}

// POST /api/admin/courses/[id]/resources
async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await params;
  const body = await req.json().catch(() => ({}));

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = createAdminSupabaseClient();

  // Vérifier que le cours existe
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .single();

  if (!course) {
    return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('course_resources')
    .insert({
      course_id: courseId,
      title:     parsed.data.title,
      type:      parsed.data.type,
      url:       parsed.data.url,
      file_name: parsed.data.file_name ?? null,
      file_size: parsed.data.file_size ?? null,
      mime_type: parsed.data.mime_type ?? null,
      order:     parsed.data.order,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ resource: data }, { status: 201 });
}

// DELETE /api/admin/courses/[id]/resources?resourceId=...
async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await params;
  const resourceId = req.nextUrl.searchParams.get('resourceId');

  if (!resourceId) {
    return NextResponse.json({ error: 'resourceId requis' }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  // Récupérer d'abord pour supprimer le fichier storage si besoin
  const { data: resource } = await supabase
    .from('course_resources')
    .select('type, url')
    .eq('id', resourceId)
    .eq('course_id', courseId)
    .single();

  if (!resource) {
    return NextResponse.json({ error: 'Ressource introuvable' }, { status: 404 });
  }

  // Supprimer le fichier du storage si c'est un upload
  if (resource.type === 'file') {
    try {
      const resourceUrl = resource.url as string;
      const pathMatch = resourceUrl.match(/course-resources\/(.+)$/);
      if (pathMatch?.[1]) {
        await supabase.storage.from('course-resources').remove([pathMatch[1]]);
      }
    } catch {
      // Continuer même si la suppression storage échoue
    }
  }

  const { error } = await supabase
    .from('course_resources')
    .delete()
    .eq('id', resourceId)
    .eq('course_id', courseId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

const GET_handler    = withAdminAuth(GET as any);
const POST_handler   = withAdminAuth(POST as any);
const DELETE_handler = withAdminAuth(DELETE as any);

export { GET_handler as GET, POST_handler as POST, DELETE_handler as DELETE };
