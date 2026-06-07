-- Migration 029: Table des logs d'audit pour les actions admin
-- Cette table est requêtée par /api/admin/stats et utilisée par logAdminAction()

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    action VARCHAR(255) NOT NULL,
    resource TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_user_id ON public.admin_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_timestamp ON public.admin_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);

-- RLS : seuls les admins peuvent lire les logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Les admins peuvent tout lire
CREATE POLICY "Admins can view all audit logs" ON public.admin_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Seul le service_role peut insérer (les insertions viennent du serveur)
-- Pas de policy INSERT pour le rôle anon/authenticated → seul service_role bypass RLS
