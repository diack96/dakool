'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Award, Download, Copy, CheckCircle, ArrowLeft } from 'lucide-react';
import ProfileNameGuard from '@/components/certificates/ProfileNameGuard';

interface CertificateDetail {
  id: string;
  certificateNumber: string;
  courseId: string;
  courseName: string;
  studentName: string;
  courseCategory: string;
  issueDate: string;
  status: string;
  grade: number;
  downloadUrl: string;
  verificationUrl: string;
}

export default function CertificateViewPage() {
  const params = useParams();
  const router = useRouter();
  const certId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const [certificate, setCertificate] = useState<CertificateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && certId) {
      fetch('/api/certificates', { credentials: 'include', cache: 'no-store' })
        .then(async (res) => {
          if (!res.ok) throw new Error('Erreur');
          const json = await res.json();
          const certs = json.success ? (json.data?.certificates || json.certificates || []) : [];
          const found = certs.find((c: any) => c.id === certId);
          if (found) setCertificate(found);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, certId, router]);

  const handleDownload = async () => {
    if (!certificate?.downloadUrl || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(certificate.downloadUrl, { credentials: 'include' });
      if (!res.ok) {
        alert('Erreur lors du téléchargement du certificat. Veuillez réessayer.');
        return;
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('pdf')) {
        alert('Erreur : le serveur n\'a pas retourné un PDF.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificat-${certificate.certificateNumber || certificate.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!certificate?.verificationUrl) return;
    try {
      await navigator.clipboard.writeText(certificate.verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificat non trouvé</h1>
          <Link
            href="/dashboard/certificates"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Retour à mes certificats
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(certificate.issueDate).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <ProfileNameGuard>
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/dashboard/certificates"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Mes Certificats
        </Link>

        {/* Certificate Preview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Certificate visual - matches PDF styling */}
          <div className="relative bg-slate-50 p-8 md:p-12">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-blue-700"></div>
            <div className="absolute top-2 left-0 w-1/3 h-1 bg-orange-500"></div>

            <div className="text-center space-y-6">
              {/* Header */}
              <div>
                <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase">Waraba Academy</p>
                <div className="w-24 h-0.5 bg-orange-500 mx-auto mt-2"></div>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-blue-800">
                CERTIFICAT D&apos;ACHÈVEMENT
              </h1>

              <p className="text-sm text-gray-500">Ce certificat est décerné à</p>

              <p className="text-3xl md:text-4xl font-bold text-blue-600">
                {certificate.studentName}
              </p>

              <div className="w-48 h-0.5 bg-orange-500 mx-auto"></div>

              <p className="text-sm text-gray-500">pour avoir complété avec succès le cours</p>

              <p className="text-xl md:text-2xl font-bold text-gray-800">
                {certificate.courseName}
              </p>

              <p className="text-lg font-bold text-orange-500">
                Note : {certificate.grade}%
              </p>

              <p className="text-sm text-gray-500">
                Délivré le {formattedDate}
              </p>

              <p className="text-xs text-gray-400 font-mono">
                N° {certificate.certificateNumber}
              </p>
            </div>

            {/* Bottom accent bar */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-blue-700"></div>
            <div className="absolute bottom-2 right-0 w-1/3 h-1 bg-orange-500"></div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-white border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
              >
                <Download className="w-5 h-5 mr-2" />
                {downloading ? 'Téléchargement...' : 'Télécharger le PDF'}
              </button>

              {certificate.verificationUrl && (
                <a
                  href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificate.courseName)}&organizationName=Waraba%20Academy&certUrl=${encodeURIComponent(certificate.verificationUrl)}&certId=${encodeURIComponent(certificate.certificateNumber || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A66C2] text-white rounded-xl hover:bg-[#004182] transition-colors font-semibold"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Partager sur LinkedIn
                </a>
              )}

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Lien copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    Copier le lien
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProfileNameGuard>
  );
}
