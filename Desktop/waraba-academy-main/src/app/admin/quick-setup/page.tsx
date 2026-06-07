'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Rocket, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import AdminGuard from '@/components/admin/AdminGuard';

export default function QuickSetupPage () {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ categories: number; courses: number } | null>(null);
  const [error, setError] = useState('');

  const runSeed = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Échec du seed');
      }
      const data = await res.json();
      setResult({ categories: data.categories, courses: data.courses });
    } catch (e: any) {
      setError(e?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-3">
                <Link href="/admin" className="p-2 text-gray-400 hover:text-gray-600">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Quick Setup</h1>
                  <p className="text-gray-600">Créer des catégories et cours d'exemple</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Card className="p-8 text-center">
            <Rocket className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Données de démonstration</h2>
            <p className="text-gray-600 mb-6">Un clic pour créer des catégories (Tech, Soft Skills, Business, Design, Data & IA) et des cours avec syllabus.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
            )}

            {result ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg inline-flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Catégories: {result.categories} • Cours: {result.courses}</span>
              </div>
            ) : (
              <button
                onClick={runSeed}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Rocket className="w-5 h-5 mr-2" />}
                {loading ? 'Création...' : 'Créer les données' }
              </button>
            )}

            <div className="mt-6">
              <Link href="/admin/courses" className="text-blue-600 hover:text-blue-700">Aller à la gestion des cours</Link>
            </div>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}
