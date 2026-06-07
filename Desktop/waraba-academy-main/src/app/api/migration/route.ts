import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { apiLogger } from '@/lib/logger';

// SECURITY: Only allow student and instructor roles — never admin
const ALLOWED_MIGRATION_ROLES = ['student', 'instructor'] as const;
type MigrationRole = typeof ALLOWED_MIGRATION_ROLES[number];

interface AccountToMigrate {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: MigrationRole;
  createdAt: string;
}

interface MigrationResponse {
  success: boolean;
  message: string;
  migratedCount: number;
  errors: string[];
  details: {
    successful: string[];
    failed: string[];
  };
}

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Block in production — migration is a one-time operation
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MIGRATION !== 'true') {
      return NextResponse.json(
        { error: 'Migration endpoint is disabled in production. Set ALLOW_MIGRATION=true to enable.' },
        { status: 403 },
      );
    }

    // Verify authentication
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 },
      );
    }

    // SECURITY: Verify admin role from DB
    const { checkUserRoleFromDB } = await import('@/lib/security/roleCheck');
    const roleCheck = await checkUserRoleFromDB(user.id);

    if (!roleCheck.isAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé - Rôle administrateur requis' },
        { status: 403 },
      );
    }

    // SECURITY: Require service role client for auth.admin operations
    const adminClient = getServiceRoleClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: 'Configuration serveur incomplète (service role key manquante)' },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { accounts }: { accounts: AccountToMigrate[] } = body;

    if (!Array.isArray(accounts) || accounts.length === 0) {
      return NextResponse.json(
        { error: 'Données de migration invalides' },
        { status: 400 },
      );
    }

    // Limit batch size to prevent abuse
    if (accounts.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 comptes par batch de migration' },
        { status: 400 },
      );
    }

    const validationErrors: string[] = [];
    const validAccounts: AccountToMigrate[] = [];

    for (const account of accounts) {
      const errors: string[] = [];

      if (!account.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) {
        errors.push('Email invalide');
      }

      if (!account.password || account.password.length < 6) {
        errors.push('Mot de passe invalide');
      }

      if (!account.firstName || account.firstName.trim().length < 2) {
        errors.push('Prénom invalide');
      }

      if (!account.lastName || account.lastName.trim().length < 2) {
        errors.push('Nom invalide');
      }

      // SECURITY: Only allow student/instructor — NEVER admin
      if (!(ALLOWED_MIGRATION_ROLES as readonly string[]).includes(account.role)) {
        errors.push(`Rôle invalide: "${account.role}". Seuls student et instructor sont autorisés.`);
      }

      if (errors.length === 0) {
        validAccounts.push(account);
      } else {
        validationErrors.push(`${account.email}: ${errors.join(', ')}`);
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation échouée', details: validationErrors },
        { status: 400 },
      );
    }

    const migrationResult: MigrationResponse = {
      success: false,
      message: '',
      migratedCount: 0,
      errors: [],
      details: { successful: [], failed: [] },
    };

    let successCount = 0;
    let errorCount = 0;

    for (const account of validAccounts) {
      try {
        // Use service role client for admin operations
        const { data, error } = await adminClient.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            first_name: account.firstName,
            last_name: account.lastName,
            full_name: `${account.firstName} ${account.lastName}`,
            role: account.role,
            migrated_from: 'legacy_system',
            migrated_at: new Date().toISOString(),
          },
        });

        if (error) {
          const errorMsg = `${account.email}: ${error.message}`;
          migrationResult.details.failed.push(errorMsg);
          migrationResult.errors.push(errorMsg);
          errorCount++;
          continue;
        }

        if (data.user) {
          const { error: profileError } = await adminClient
            .from('profiles')
            .insert({
              id: data.user.id,
              email: account.email,
              first_name: account.firstName,
              last_name: account.lastName,
              full_name: `${account.firstName} ${account.lastName}`,
              role: account.role,
              created_at: account.createdAt,
              updated_at: new Date().toISOString(),
            });

          if (profileError) {
            apiLogger.error('Erreur profil migration', profileError, {
              email: account.email,
              userId: data.user.id,
            });
          }
        }

        successCount++;
        migrationResult.details.successful.push(account.email);
        apiLogger.info('Compte migré', { email: account.email, role: account.role });

        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        migrationResult.details.failed.push(`${account.email}: ${errorMessage}`);
        migrationResult.errors.push(`${account.email}: ${errorMessage}`);
        errorCount++;
        apiLogger.error('Erreur migration', error, { email: account.email });
      }
    }

    migrationResult.migratedCount = successCount;
    migrationResult.success = errorCount === 0;
    migrationResult.message = errorCount === 0
      ? `Migration terminée avec succès ! ${successCount} comptes migrés.`
      : `Migration partiellement réussie. ${successCount} migrés, ${errorCount} échecs.`;

    apiLogger.info('Migration terminée', { successCount, errorCount, total: validAccounts.length });

    return NextResponse.json(migrationResult);
  } catch (error: unknown) {
    apiLogger.error('Erreur serveur migration', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la migration' },
      { status: 500 },
    );
  }
}
