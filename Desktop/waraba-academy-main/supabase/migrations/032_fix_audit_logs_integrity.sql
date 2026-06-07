-- ============================================================================
-- Migration 032: Intégrité référentielle — admin_audit_logs
-- ============================================================================
-- PROBLÈME : La colonne user_id dans admin_audit_logs n'a pas de clé
-- étrangère vers auth.users(id). Des logs peuvent référencer des utilisateurs
-- supprimés, rendant les JOIN impossibles et les données d'audit non fiables.
--
-- CORRECTION :
--   1. Rendre user_id nullable (pour les actions système sans user)
--   2. Ajouter la FK avec ON DELETE SET NULL
--      → Si un user est supprimé, les logs sont conservés mais user_id = NULL
-- ============================================================================

-- 1. Rendre user_id nullable pour les actions système et les users supprimés
ALTER TABLE public.admin_audit_logs
    ALTER COLUMN user_id DROP NOT NULL;

-- 2. Ajouter la clé étrangère avec SET NULL à la suppression
--    (préserve l'historique des logs même si le user est supprimé)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'admin_audit_logs_user_id_fkey'
          AND table_name = 'admin_audit_logs'
    ) THEN
        ALTER TABLE public.admin_audit_logs
            ADD CONSTRAINT admin_audit_logs_user_id_fkey
            FOREIGN KEY (user_id)
            REFERENCES auth.users(id)
            ON DELETE SET NULL;
        RAISE NOTICE '✅ FK admin_audit_logs_user_id_fkey créée';
    ELSE
        RAISE NOTICE 'ℹ️  FK admin_audit_logs_user_id_fkey existe déjà';
    END IF;
END $$;

-- 3. Ajouter une colonne email_snapshot pour conserver l'email même après
--    suppression du user (données d'audit complètes)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'admin_audit_logs'
          AND column_name = 'user_email_snapshot'
    ) THEN
        ALTER TABLE public.admin_audit_logs
            ADD COLUMN user_email_snapshot VARCHAR(255);
        COMMENT ON COLUMN public.admin_audit_logs.user_email_snapshot IS
            'Email de l''utilisateur au moment de l''action (conservé même si le compte est supprimé)';
        RAISE NOTICE '✅ Colonne user_email_snapshot ajoutée';
    ELSE
        RAISE NOTICE 'ℹ️  Colonne user_email_snapshot existe déjà';
    END IF;
END $$;

-- Vérification finale
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'admin_audit_logs_user_id_fkey'
    ) THEN
        RAISE NOTICE '✅ Migration 032 : Intégrité admin_audit_logs corrigée avec succès';
    ELSE
        RAISE EXCEPTION '❌ Migration 032 : Erreur — FK non créée';
    END IF;
END $$;
