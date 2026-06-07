'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminRoute from '@/components/auth/AdminRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
} from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function AdminDiagnostic () {
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setRunning(true);
    setLoading(true);
    const results: DiagnosticResult[] = [];

    try {
      // Test 1: Vérification de l'authentification
      results.push({
        test: 'Authentification utilisateur',
        status: user ? 'success' : 'error',
        message: user ? 'Utilisateur connecté' : 'Aucun utilisateur connecté',
        details: user ? `Email: ${user.email}` : undefined,
      });

      // Test 2: Vérification du rôle admin
      const isAdmin = user?.role === 'admin' || user?.user_metadata?.role === 'admin';
      results.push({
        test: 'Rôle administrateur',
        status: isAdmin ? 'success' : 'error',
        message: isAdmin ? 'Rôle admin détecté' : 'Rôle admin non trouvé',
        details: isAdmin ? `Rôle: ${user?.role || user?.user_metadata?.role}` : undefined,
      });

      // Test 3: Test de l'API admin
      try {
        const response = await fetch('/api/admin/stats');
        results.push({
          test: 'API Admin Stats',
          status: response.ok ? 'success' : 'error',
          message: response.ok ? 'API accessible' : `Erreur ${response.status}`,
          details: response.ok ? 'Endpoint /api/admin/stats fonctionnel' : await response.text(),
        });
      } catch (error) {
        results.push({
          test: 'API Admin Stats',
          status: 'error',
          message: 'API inaccessible',
          details: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }

      // Test 4: Test des permissions
      try {
        const response = await fetch('/api/admin/check-permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions: ['users.read'] }),
        });
        results.push({
          test: 'Système de permissions',
          status: response.ok ? 'success' : 'error',
          message: response.ok ? 'Permissions fonctionnelles' : `Erreur ${response.status}`,
          details: response.ok ? 'Vérification des permissions réussie' : await response.text(),
        });
      } catch (error) {
        results.push({
          test: 'Système de permissions',
          status: 'error',
          message: 'Permissions inaccessibles',
          details: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }

      // Test 5: Test de la base de données
      try {
        const response = await fetch('/api/admin/users');
        results.push({
          test: 'Base de données',
          status: response.ok ? 'success' : 'error',
          message: response.ok ? 'Base de données accessible' : `Erreur ${response.status}`,
          details: response.ok ? 'Connexion à la base de données réussie' : await response.text(),
        });
      } catch (error) {
        results.push({
          test: 'Base de données',
          status: 'error',
          message: 'Base de données inaccessible',
          details: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }

      // Test 6: Variables d'environnement
      const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      results.push({
        test: 'Configuration Supabase',
        status: hasSupabaseUrl && hasSupabaseKey ? 'success' : 'error',
        message: hasSupabaseUrl && hasSupabaseKey ? 'Configuration complète' : 'Configuration manquante',
        details: `URL: ${hasSupabaseUrl ? '✅' : '❌'}, Clé: ${hasSupabaseKey ? '✅' : '❌'}`,
      });
    } catch (error) {
      results.push({
        test: 'Diagnostic général',
        status: 'error',
        message: 'Erreur lors du diagnostic',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }

    setDiagnostics(results);
    setLoading(false);
    setRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'error':
      return 'bg-red-50 border-red-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200';
    default:
      return 'bg-gray-50 border-gray-200';
    }
  };

  const successCount = diagnostics.filter(d => d.status === 'success').length;
  const errorCount = diagnostics.filter(d => d.status === 'error').length;
  const warningCount = diagnostics.filter(d => d.status === 'warning').length;

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Diagnostic Admin</h1>
              </div>
              <button
                onClick={runDiagnostics}
                disabled={running}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${running ? 'animate-spin' : ''}`} />
                {running ? 'Diagnostic...' : 'Relancer'}
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Résumé */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé du diagnostic</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  {successCount} test(s) réussi(s)
                </span>
              </div>
              <div className="flex items-center">
                <XCircle className="h-6 w-6 text-red-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  {errorCount} erreur(s)
                </span>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  {warningCount} avertissement(s)
                </span>
              </div>
            </div>
          </div>

          {/* Résultats détaillés */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Résultats détaillés</h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                {diagnostics.map((diagnostic, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getStatusColor(diagnostic.status)}`}
                  >
                    <div className="flex items-start">
                      {getStatusIcon(diagnostic.status)}
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {diagnostic.test}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {diagnostic.message}
                        </p>
                        {diagnostic.details && (
                          <p className="text-xs text-gray-500 mt-2 font-mono">
                            {diagnostic.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions recommandées */}
          {errorCount > 0 && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                Actions recommandées
              </h3>
              <div className="space-y-2 text-sm text-yellow-700">
                <p>• Exécutez le script de réparation : <code className="bg-yellow-100 px-2 py-1 rounded">node scripts/fix-admin-system.js</code></p>
                <p>• Vérifiez les variables d'environnement dans <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code></p>
                <p>• Assurez-vous que Supabase est accessible et configuré</p>
                <p>• Relancez le diagnostic après les corrections</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
}

