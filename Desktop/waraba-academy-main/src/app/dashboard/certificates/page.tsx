'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/admin/Toast';
import { logger } from '@/lib/logger';
import { fetchWithTimeout } from '@/lib/utils/fetchTimeout';
import {
  Award,
  Eye,
  Calendar,
  Star,
  CheckCircle,
  Download,
} from 'lucide-react';

interface Certificate {
  id: string;
  certificateNumber?: string;
  courseName: string;
  courseCategory: string;
  issueDate: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'pending';
  grade: number;
  downloadUrl?: string;
  viewUrl?: string;
  verificationUrl?: string;
  courseId?: string;
}

export default function DashboardCertificatesPage () {
  const router = useRouter();
  const { user, loading: isLoading } = useAuth();
  const { error: toastError } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadCertificates();
    }
  }, [user, isLoading, router]);

  const loadCertificates = async () => {
    try {
      setLoading(true);

      // Récupérer les certificats réels depuis l'API
      const response = await fetchWithTimeout('/api/certificates', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des certificats');
      }

      const data = await response.json();

      // Handle both { success, data: { certificates } } and { success, certificates } shapes
      const certs = data.data?.certificates || data.certificates;
      if (!data.success || !Array.isArray(certs)) {
        setCertificates([]);
        return;
      }

      // Transformer les données de l'API au format Certificate
      const transformedCertificates: Certificate[] = certs.map((cert: any) => {
        const issueDate = new Date(cert.issueDate);
        const formattedDate = issueDate.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

        return {
          id: cert.id,
          certificateNumber: cert.certificateNumber,
          courseName: cert.courseName,
          courseCategory: cert.courseCategory,
          issueDate: formattedDate,
          status: cert.status || 'active',
          grade: cert.grade || cert.progress || 100,
          downloadUrl: cert.downloadUrl || `/api/certificates/${cert.id}/download`,
          viewUrl: cert.viewUrl || `/certificates/${cert.id}`,
          verificationUrl: cert.verificationUrl,
          courseId: cert.courseId,
        };
      });

      setCertificates(transformedCertificates);
    } catch (error) {
      logger.error('Erreur lors du chargement des certificats:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
    }
  };

  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (cert: Certificate) => {
    if (!cert.downloadUrl || downloading) return;
    setDownloading(cert.id);
    try {
      const res = await fetch(cert.downloadUrl, { credentials: 'include' });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        logger.error('Download failed:', res.status, errText);
        toastError('Erreur lors du téléchargement du certificat. Veuillez réessayer.');
        return;
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('pdf')) {
        logger.error('Unexpected content-type:', contentType);
        toastError('Erreur : le serveur n\'a pas retourné un PDF.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificat-${cert.certificateNumber || cert.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      logger.error('Download error:', err);
      toastError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setDownloading(null);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
    case 'active':
      return 'Actif';
    case 'expired':
      return 'Expiré';
    case 'pending':
      return 'En attente';
    default:
      return 'Inconnu';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header de la Page */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Certificats</h1>
        <p className="text-gray-600">Consultez et téléchargez vos diplômes et certifications</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Certificats</p>
              <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {certificates.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Moyenne</p>
              <p className="text-2xl font-bold text-gray-900">
                {certificates.length > 0
                  ? Math.round(certificates.reduce((acc, c) => acc + c.grade, 0) / certificates.length)
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dernier</p>
              <p className="text-2xl font-bold text-gray-900">
                {certificates.length > 0 && certificates[0] ? certificates[0].issueDate.split('/')[2] : '-'}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des Certificats */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Certificats Obtenus</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos certificats...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun certificat obtenu</h3>
            <p className="text-gray-600 mb-6">
              Commencez par terminer vos premiers cours pour obtenir des certificats.
            </p>
            <Link
              href="/dashboard/courses"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              <Award className="w-5 h-5 mr-2" />
              Voir mes cours
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  {/* Header du Certificat */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(certificate.status)}`}>
                      {getStatusText(certificate.status)}
                    </span>
                  </div>

                  {/* Informations du Cours */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{certificate.courseName}</h3>
                  {certificate.certificateNumber && (
                    <p className="text-xs font-mono text-gray-400 mb-1">N° {certificate.certificateNumber}</p>
                  )}
                  <p className="text-sm text-gray-600 mb-3">{certificate.courseCategory}</p>

                  {/* Détails */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Note obtenue</p>
                      <p className="font-medium text-lg text-blue-600">{certificate.grade}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date d&apos;obtention</p>
                      <p className="font-medium">{certificate.issueDate}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2">
                    {certificate.viewUrl && certificate.viewUrl !== '#' ? (
                      <Link
                        href={certificate.viewUrl}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Link>
                    ) : certificate.courseId ? (
                      <Link
                        href={`/courses/${certificate.courseId}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir le cours
                      </Link>
                    ) : (
                      <span className="inline-flex items-center text-gray-400 font-medium text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </span>
                    )}
                    {certificate.verificationUrl && (
                      <a
                        href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificate.courseName)}&organizationName=Waraba%20Academy&certUrl=${encodeURIComponent(certificate.verificationUrl)}&certId=${encodeURIComponent(certificate.certificateNumber || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition-colors font-medium text-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Partager
                      </a>
                    )}
                    {certificate.downloadUrl && certificate.downloadUrl !== '#' ? (
                      <button
                        onClick={() => handleDownload(certificate)}
                        disabled={downloading === certificate.id}
                        className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        <Download className={`w-4 h-4 mr-1 ${downloading === certificate.id ? 'animate-bounce' : ''}`} />
                        {downloading === certificate.id ? 'Téléchargement...' : 'Télécharger'}
                      </button>
                    ) : (
                      <span className="inline-flex items-center text-gray-400 font-medium text-sm">
                        <Download className="w-4 h-4 mr-1" />
                        Télécharger
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
