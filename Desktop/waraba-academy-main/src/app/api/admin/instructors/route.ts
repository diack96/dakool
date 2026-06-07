import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { z } from 'zod';
import { handleApiError, createValidationError, createInternalError } from '@/lib/errors';
// Note: apiLogger (winston) désactivé pour compatibilité Edge Runtime
// Utiliser console.log/error/warn à la place
// import { apiLogger } from '@/lib/logger';

// Schéma de validation pour la création d'instructeur
const createInstructorSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(128),
  first_name: z.string().min(1, 'Le prénom est requis').max(100),
  last_name: z.string().min(1, 'Le nom est requis').max(100),
  bio: z.string().optional(),
  specialization: z.string().optional(),
});

// GET /api/admin/instructors - Liste des instructeurs
async function GET (_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: instructors, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, avatar_url, bio, location, created_at')
      .eq('role', 'instructor')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des instructeurs', error);
      throw createInternalError('Erreur lors de la récupération des instructeurs', { dbError: error.message });
    }

    // Transformer les données pour correspondre à l'interface
    const transformedInstructors = (instructors || []).map((instructor: any) => ({
      id: instructor.id,
      firstName: instructor.first_name || '',
      lastName: instructor.last_name || '',
      email: instructor.email || '',
      bio: instructor.bio || '',
      avatarUrl: instructor.avatar_url || '',
      specialization: instructor.location || '', // Utiliser location pour stocker la spécialisation temporairement
      rating: 0, // À calculer depuis les avis
      totalStudents: 0, // À calculer depuis les enrollments
      totalCourses: 0, // À calculer depuis les cours
      isActive: true,
      createdAt: instructor.created_at || new Date().toISOString(),
    }));

    return NextResponse.json(transformedInstructors);
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération des instructeurs', error);
    return handleApiError(error);
  }
}

// POST /api/admin/instructors - Créer un instructeur
async function POST (request: NextRequest) {
  let emailFromRequest: string | undefined;
  
  try {
    const supabase = await createServerSupabaseClient();

    const body = await request.json();
    emailFromRequest = body?.email; // Stocker l'email pour le logging d'erreur

    // Validation avec Zod
    const validation = createInstructorSchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError('Données invalides', validation.error.issues);
    }

    const { email, password, first_name, last_name, bio, specialization } = validation.data;

    // Créer l'utilisateur dans Supabase Auth avec le rôle instructor
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        role: 'instructor',
      },
    });

    if (authError) {
      console.error('Erreur lors de la création utilisateur auth', authError);
      throw createInternalError('Erreur lors de la création de l\'instructeur', { authError: authError.message });
    }

    // Créer le profil avec le rôle instructor et les informations supplémentaires
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authUser.user.id,
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`,
        email,
        role: 'instructor',
        bio: bio || null,
        location: specialization || null, // Utiliser location pour stocker la spécialisation temporairement
      }] as any);

    if (profileError) {
      console.error('Erreur lors de la création du profil', profileError);
      // Supprimer l'utilisateur auth si le profil échoue
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw createInternalError('Erreur lors de la création du profil', { profileError: profileError.message });
    }

    // Log de l'action
    await logAdminAction({
      user_id: (request as any).adminUser.id,
      action: 'instructors.create',
      resource: '/api/admin/instructors',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { created_instructor_id: authUser.user.id },
    });

    return NextResponse.json({
      success: true,
      instructor: {
        id: authUser.user.id,
        email,
        first_name,
        last_name,
        bio: bio || '',
        specialization: specialization || '',
      },
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Erreur lors de la création de l\'instructeur', error, {
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      email: emailFromRequest,
    });

    const adminUserId = (request as any).adminUser?.id || 'unknown';
    await logAdminAction({
      user_id: adminUserId,
      action: 'instructors.create',
      resource: '/api/admin/instructors',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: false,
      details: { error: error instanceof Error ? error.message : 'Erreur inconnue' },
    });

    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
export const GET_handler = withAdminAuth(GET);
export const POST_handler = withAdminAuth(POST);

export { GET_handler as GET, POST_handler as POST };


