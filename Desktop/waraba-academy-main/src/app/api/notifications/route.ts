import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { apiLogger } from '@/lib/logger';
import { z } from 'zod';

// GET - Récupérer les notifications de l'utilisateur connecté
export async function GET (request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // getSession() lit depuis le cookie localement (pas d'appel réseau Auth)
    // suffisant pour un GET en lecture seule — getUser() n'est nécessaire que
    // pour valider la révocation côté serveur (opérations sensibles uniquement)
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));

    // Construire la requête
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      apiLogger.error('Erreur lors de la récupération des notifications', error, {
        userId: user.id,
        unreadOnly,
        limit,
      });
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des notifications' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      count: notifications?.length || 0,
    });
  } catch (error: unknown) {
    apiLogger.error('Erreur serveur lors de la récupération des notifications', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}

// Schéma de validation pour créer une notification
const createNotificationSchema = z.object({
  user_id: z.string().uuid('ID utilisateur invalide'),
  title: z.string().min(1, 'Le titre est requis').max(255, 'Le titre est trop long'),
  message: z.string().min(1, 'Le message est requis').max(1000, 'Le message est trop long'),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  action_url: z.string().url('URL d\'action invalide').optional().nullable(),
});

// POST - Créer une nouvelle notification
export async function POST (request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validation avec Zod
    // SECURITY: Only admins can specify a different user_id.
    // Instructors can only create notifications for themselves.
    let targetUserId = user.id;
    if (body.userId && body.userId !== user.id) {
      const { checkUserRoleFromDB } = await import('@/lib/security/roleCheck');
      const callerRole = await checkUserRoleFromDB(user.id);
      if (!callerRole.isAdmin) {
        return NextResponse.json(
          { error: 'Seuls les administrateurs peuvent envoyer des notifications à d\'autres utilisateurs' },
          { status: 403 },
        );
      }
      targetUserId = body.userId;
    }

    const validation = createNotificationSchema.safeParse({
      user_id: targetUserId,
      title: body.title,
      message: body.message,
      type: body.type || 'info',
      action_url: body.actionUrl || null,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    const { title, message, type, action_url, user_id } = validation.data;

    // SÉCURITÉ: Vérifier les permissions depuis la DB
    const { hasAnyRole } = await import('@/lib/security/roleCheck');
    const hasPermission = await hasAnyRole(user.id, ['admin', 'instructor']);

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Accès refusé - Rôle administrateur ou instructeur requis' },
        { status: 403 },
      );
    }

    // Créer la notification avec données validées
    const notificationData = {
      user_id,
      title: title.trim(),
      message: message.trim(),
      type,
      action_url,
    };

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert(notificationData as never)
      .select()
      .single();

    if (error) {
      apiLogger.error('Erreur lors de la création de la notification', error, {
        userId: user.id,
        targetUserId: user_id,
        title: title.substring(0, 50),
      });
      return NextResponse.json(
        { error: 'Erreur lors de la création de la notification' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification créée avec succès',
      notification,
    });
  } catch (error: unknown) {
    apiLogger.error('Erreur serveur lors de la création de la notification', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}

// Schéma de validation pour marquer une notification comme lue
const markNotificationReadSchema = z.object({
  notificationId: z.string().uuid('ID de notification invalide').optional(),
  markAllAsRead: z.boolean().optional(),
});

// PATCH - Marquer une notification comme lue
export async function PATCH (request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { markAllAsRead } = body;

    if (markAllAsRead) {
      // Marquer toutes les notifications comme lues
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        } as never)
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        apiLogger.error('Erreur lors du marquage de toutes les notifications', error, {
          userId: user.id,
        });
        return NextResponse.json(
          { error: 'Erreur lors du marquage des notifications' },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Toutes les notifications ont été marquées comme lues',
      });
    }

    // Validation avec Zod
    const validation = markNotificationReadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    const { notificationId } = validation.data;

    // Marquer une notification spécifique comme lue
    if (!notificationId) {
      return NextResponse.json(
        { error: 'ID de notification requis' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      } as never)
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      apiLogger.error('Erreur lors du marquage de la notification', error, {
        userId: user.id,
        notificationId,
      });
      return NextResponse.json(
        { error: 'Erreur lors du marquage de la notification' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marquée comme lue',
    });
  } catch (error: unknown) {
    apiLogger.error('Erreur serveur lors du marquage de la notification', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}
