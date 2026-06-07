'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Award, CheckCircle, XCircle, Shield } from 'lucide-react';

interface VerificationData {
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  status: 'active' | 'revoked';
  grade: number;
}

export default function CertificateVerifyPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/certificates/verify/${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Certificat non trouvé');
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Certificat non trouvé');
        setData(json.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificat non trouvé</h1>
          <p className="text-gray-600 mb-6">
            Ce lien de vérification est invalide ou le certificat n&apos;existe pas.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  const isValid = data.status === 'active';
  const formattedDate = new Date(data.issuedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <Shield className="w-10 h-10 text-blue-600 mx-auto mb-2" />
          <h1 className="text-lg font-semibold text-gray-700">Vérification de Certificat</h1>
          <p className="text-sm text-gray-500">Waraba Academy</p>
        </div>

        {/* Certificate Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Status Banner */}
          <div className={`px-6 py-4 flex items-center gap-3 ${isValid ? 'bg-green-50' : 'bg-red-50'}`}>
            {isValid ? (
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
            )}
            <div>
              <p className={`text-lg font-bold ${isValid ? 'text-green-800' : 'text-red-800'}`}>
                {isValid ? 'Certificat Valide' : 'Certificat Révoqué'}
              </p>
              <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                {isValid
                  ? 'Ce certificat est authentique et actif'
                  : 'Ce certificat a été révoqué'}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Certificat N°</p>
                <p className="text-sm font-mono font-semibold text-gray-900">{data.certificateNumber}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 grid grid-cols-1 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Étudiant</p>
                <p className="text-base font-semibold text-gray-900">{data.studentName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Cours</p>
                <p className="text-base font-semibold text-gray-900">{data.courseTitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Note</p>
                  <p className="text-base font-semibold text-blue-600">{data.grade}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Date de délivrance</p>
                  <p className="text-base font-semibold text-gray-900">{formattedDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 text-center">
            <p className="text-xs text-gray-400">
              Délivré par Waraba Academy
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            waraba-academy.com
          </Link>
        </div>
      </div>
    </div>
  );
}
