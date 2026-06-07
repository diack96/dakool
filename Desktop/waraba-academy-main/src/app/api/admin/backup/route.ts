import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';

// POST /api/admin/backup - Créer une sauvegarde du système
async function POST (request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll () {
            return cookieStore.getAll();
          },
          setAll (cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Ignorer les erreurs de cookies côté serveur
            }
          },
        },
      },
    );

    const body = await request.json();
    const { type = 'full', tables = [] } = body;

    // Vérifier le type de sauvegarde
    if (!['full', 'partial', 'custom'].includes(type)) {
      return NextResponse.json(
        { error: 'Type de sauvegarde invalide' },
        { status: 400 },
      );
    }

    // Définir les tables à sauvegarder selon le type
    let tablesToBackup: string[] = [];

    if (type === 'full') {
      tablesToBackup = [
        'profiles',
        'categories',
        'courses',
        'lessons',
        'enrollments',
        'user_progress',
        'quizzes',
        'quiz_questions',
        'quiz_answers',
        'notifications',
        'payments',
        'course_reviews',
        'admin_audit_logs',
        'admin_permissions',
        'admin_roles',
      ];
    } else if (type === 'partial') {
      tablesToBackup = [
        'profiles',
        'courses',
        'enrollments',
        'user_progress',
      ];
    } else if (type === 'custom' && tables.length > 0) {
      // SECURITY: Only allow whitelisted tables for custom backup
      const ALLOWED_BACKUP_TABLES = [
        'profiles', 'categories', 'courses', 'lessons',
        'enrollments', 'user_progress', 'quizzes', 'quiz_questions',
        'quiz_answers', 'notifications', 'payments', 'course_reviews',
        'admin_audit_logs', 'admin_permissions', 'admin_roles',
      ];
      tablesToBackup = tables.filter((t: string) => ALLOWED_BACKUP_TABLES.includes(t));
      if (tablesToBackup.length === 0) {
        return NextResponse.json(
          { error: 'Aucune table valide sélectionnée pour la sauvegarde' },
          { status: 400 },
        );
      }
    }

    // Créer la sauvegarde
    const backupData: any = {
      metadata: {
        created_at: new Date().toISOString(),
        type,
        tables: tablesToBackup,
        version: '1.0.0',
        created_by: (request as any).adminUser.id,
      },
      data: {},
    };

    // Récupérer les données de chaque table
    for (const tableName of tablesToBackup) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*');

        if (error) {
          console.warn(`Erreur lors de la sauvegarde de ${tableName}:`, error);
          backupData.data[tableName] = { error: error.message, data: [] };
        } else {
          backupData.data[tableName] = data || [];
        }
      } catch (error) {
        console.warn(`Erreur lors de la sauvegarde de ${tableName}:`, error);
        backupData.data[tableName] = { error: 'Erreur de connexion', data: [] };
      }
    }

    // Créer un enregistrement de sauvegarde
    const { data: backupRecord, error: backupError } = await supabase
      .from('admin_audit_logs')
      .insert([{
        user_id: (request as any).adminUser.id,
        action: 'backup.create',
        resource: '/api/admin/backup',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        success: true,
        details: {
          backup_type: type,
          tables_count: tablesToBackup.length,
          total_records: Object.values(backupData.data).reduce((total: number, tableData: any) => {
            return total + (Array.isArray(tableData) ? tableData.length : 0);
          }, 0),
        },
      }])
      .select()
      .single();

    if (backupError) {
      console.warn('Erreur lors de l\'enregistrement du log de sauvegarde:', backupError);
    }

    // Log de l'action
    await logAdminAction({
      user_id: (request as any).adminUser.id,
      action: 'backup.create',
      resource: '/api/admin/backup',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: {
        backup_type: type,
        tables_count: tablesToBackup.length,
        backup_id: backupRecord?.id,
      },
    });

    return NextResponse.json({
      success: true,
      backup: {
        id: backupRecord?.id,
        type,
        tables: tablesToBackup,
        created_at: backupData.metadata.created_at,
        total_records: Object.values(backupData.data).reduce((total: number, tableData: any) => {
          return total + (Array.isArray(tableData) ? tableData.length : 0);
        }, 0),
      },
      message: `Sauvegarde ${type} créée avec succès`,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de la sauvegarde:', error);

    await logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'backup.create',
      resource: '/api/admin/backup',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: false,
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: 'Erreur lors de la création de la sauvegarde' },
      { status: 500 },
    );
  }
}

// GET /api/admin/backup - Lister les sauvegardes disponibles
async function GET (request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll () {
            return cookieStore.getAll();
          },
          setAll (cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Ignorer les erreurs de cookies côté serveur
            }
          },
        },
      },
    );

    // Récupérer l'historique des sauvegardes depuis les logs
    const { data: backupLogs, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .eq('action', 'backup.create')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    // Transformer les logs en format de sauvegarde
    const backups = backupLogs?.map(log => ({
      id: log.id,
      type: log.details?.backup_type || 'unknown',
      tables_count: log.details?.tables_count || 0,
      total_records: log.details?.total_records || 0,
      created_at: log.timestamp,
      created_by: log.user_id,
      status: log.success ? 'success' : 'failed',
    })) || [];

    // Log de l'action
    await logAdminAction({
      user_id: (request as any).adminUser.id,
      action: 'backup.list',
      resource: '/api/admin/backup',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { total_backups: backups.length },
    });

    return NextResponse.json({
      success: true,
      backups,
      total: backups.length,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des sauvegardes:', error);

    await logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'backup.list',
      resource: '/api/admin/backup',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: false,
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sauvegardes' },
      { status: 500 },
    );
  }
}

// Wrapper avec authentification admin
export const GET_handler = withAdminAuth(GET);
export const POST_handler = withAdminAuth(POST);

export { GET_handler as GET, POST_handler as POST };

