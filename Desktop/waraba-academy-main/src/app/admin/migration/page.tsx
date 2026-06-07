'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ExistingAccount, MigrationResult } from '@/lib/migration';
import { Download, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function MigrationPage () {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<ExistingAccount[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  // Vérifier que l'utilisateur est admin
  if (!user || user.user_metadata?.role !== 'admin') {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Migration des Comptes
              </h1>
              <p className="text-gray-600">
                Cette page est réservée aux administrateurs.
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      readFileContent(file);
    } else {
      alert('Veuillez sélectionner un fichier JSON valide.');
    }
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (Array.isArray(content)) {
          setAccounts(content);
        } else {
          alert('Le fichier doit contenir un tableau de comptes.');
        }
      } catch (error) {
        alert('Erreur lors de la lecture du fichier JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleMigration = async () => {
    if (accounts.length === 0) {
      alert('Aucun compte à migrer.');
      return;
    }

    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const response = await fetch('/api/migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accounts }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la migration');
      }

      const result = await response.json();
      setMigrationResult(result);
    } catch (error: any) {
      setMigrationResult({
        success: false,
        message: `Erreur lors de la migration: ${error.message}`,
        migratedCount: 0,
        errors: [error.message],
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        id: '1',
        email: 'exemple@email.com',
        password: 'motdepasse123',
        firstName: 'Prénom',
        lastName: 'Nom',
        role: 'student',
        createdAt: new Date().toISOString(),
      },
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-migration-comptes.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Migration des Comptes Existants
            </h1>
            <p className="text-gray-600">
              Migrez vos comptes existants vers Supabase.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Étape 1: Importer les données
            </h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger le modèle</span>
                </button>

                <div className="flex-1">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {accounts.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Comptes à migrer ({accounts.length})
                  </h3>
                  <div className="space-y-2">
                    {accounts.slice(0, 5).map((account, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {account.email} - {account.role}
                      </div>
                    ))}
                    {accounts.length > 5 && (
                      <div className="text-sm text-gray-500">
                        ... et {accounts.length - 5} autres comptes
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {accounts.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Étape 2: Lancer la migration
              </h2>

              <button
                onClick={handleMigration}
                disabled={isMigrating}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isMigrating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                <span>
                  {isMigrating ? 'Migration en cours...' : 'Lancer la migration'}
                </span>
              </button>
            </div>
          )}

          {migrationResult && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Résultats de la migration
              </h2>

              <div className={`p-4 rounded-lg ${
                migrationResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {migrationResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    migrationResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {migrationResult.message}
                  </span>
                </div>

                <div className="text-sm text-gray-700">
                  <p>Comptes migrés: {migrationResult.migratedCount}</p>
                  {migrationResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Erreurs:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {migrationResult.errors.map((error, index) => (
                          <li key={index} className="text-red-700">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
