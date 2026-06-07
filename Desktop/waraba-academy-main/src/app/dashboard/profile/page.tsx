'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/admin/Toast';
import { logger } from '@/lib/logger';
import { fetchWithTimeout } from '@/lib/utils/fetchTimeout';
import {
  User,
  Mail,
  Calendar,
  Award,
  BookOpen,
  Clock,
  Edit,
  Save,
  X,
  Camera,
  Loader2,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  joinDate: string;
  totalCourses: number;
  completedCourses: number;
  totalHours: number;
  certificates: number;
  avatarUrl?: string;
}

export default function DashboardProfilePage () {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCertificate = searchParams.get('from') === 'certificate';
  const nextUrl = searchParams.get('next');
  const { user, loading: isLoading, updateProfile } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadUserProfile();
    }
  }, [user, isLoading, router]);

  const loadUserProfile = async () => {
    try {
      // Charger le profil avec les données réelles
      const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.avatarUrl || null;

      // Récupérer les vraies statistiques depuis l'API
      let totalCourses = 0;
      let completedCourses = 0;
      let totalHours = 0;
      let certificates = 0;

      try {
        const enrollmentsResponse = await fetchWithTimeout('/api/enrollments', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json();

          if (enrollmentsData.success && Array.isArray(enrollmentsData.enrollments)) {
            interface Enrollment {
              status: string;
              progress?: number;
              courses?: {
                duration?: string;
              };
            }

            const enrollments = enrollmentsData.enrollments.filter(
              (e: Enrollment) => e.status === 'active' || e.status === 'completed',
            );

            totalCourses = enrollments.length;
            completedCourses = enrollments.filter((e: Enrollment) => e.status === 'completed' || (e.progress || 0) >= 100).length;
            certificates = completedCourses; // Un certificat par cours terminé

            // Calculer les heures totales basées sur la progression réelle
            // On récupère la durée de chaque cours et on calcule les heures complétées

            // Si les cours ont une durée, on l'utilise, sinon on estime 10h par cours
            let estimatedHours = 0;
            for (const enrollment of enrollments) {
              if (enrollment.courses && enrollment.courses.duration) {
                // Si le cours a une durée (en heures), on calcule selon la progression
                const courseHours = parseFloat(enrollment.courses.duration) || 10;
                estimatedHours += (courseHours * (enrollment.progress || 0)) / 100;
              } else {
                // Estimation par défaut : 10h par cours
                estimatedHours += (10 * (enrollment.progress || 0)) / 100;
              }
            }
            totalHours = Math.round(estimatedHours);
          }
        }
      } catch (enrollmentError) {
        logger.warn('Erreur lors de la récupération des inscriptions:', enrollmentError);
        // On continue avec les valeurs par défaut (0)
      }

      // Formater la date de création
      let joinDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR');
      if (user?.created_at) {
        const createdDate = new Date(user.created_at);
        // Vérifier que la date n'est pas dans le futur (bug possible)
        if (createdDate <= new Date()) {
          joinDate = createdDate.toLocaleDateString('fr-FR');
        }
      }

      const realProfile: UserProfile = {
        id: user?.id || '',
        email: user?.email || '',
        firstName: user?.user_metadata?.first_name || user?.user_metadata?.firstName || '',
        lastName: user?.user_metadata?.last_name || user?.user_metadata?.lastName || '',
        role: user?.user_metadata?.role || 'student',
        joinDate: joinDate,
        totalCourses: totalCourses,
        completedCourses: completedCourses,
        totalHours: totalHours,
        certificates: certificates,
        avatarUrl: avatarUrl,
      };

      setProfile(realProfile);
      setEditForm({
        firstName: realProfile.firstName,
        lastName: realProfile.lastName,
      });
    } catch (error) {
      logger.error('Erreur lors du chargement du profil:', error);
    }
  };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showError('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.', 5000);
      return;
    }

    // Vérifier la taille (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      showError('Fichier trop volumineux. Taille maximale: 5 MB', 5000);
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetchWithTimeout('/api/profile/upload-photo', {
        method: 'POST',
        body: formData,
      }, 30000);

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Message d'erreur plus détaillé
        let errorMessage = data.error || 'Erreur lors de l&apos;upload';

        if (data.details) {
          errorMessage += `\n\n${data.details}`;
        }

        // Si c'est une erreur de bucket, donner des instructions claires
        if (errorMessage.includes('bucket') || errorMessage.includes('Bucket')) {
          if (data.solution) {
            errorMessage = `${data.error}\n\n🚀 SOLUTION RAPIDE:\n${data.solution}\n\n📝 OU manuellement:\n${data.details || ''}`;
          } else {
            errorMessage += '\n\n📝 Instructions:\n1. Allez dans Supabase Dashboard → Storage → Buckets\n2. Cliquez sur "New bucket"\n3. Nom: "avatars"\n4. Cochez "Public bucket"\n5. Cliquez sur "Create bucket"';
          }
        }

        throw new Error(errorMessage);
      }

      // Mettre à jour le contexte auth
      if (updateProfile) {
        const result = await updateProfile({ avatar_url: data.url });
        if (result.success) {
          // Mettre à jour le profil local immédiatement pour l'affichage
          setProfile(prev => prev ? { ...prev, avatarUrl: data.url } : null);
          showSuccess('Photo de profil mise à jour avec succès !', 3000);
          // Rafraîchir la page après un court délai pour mettre à jour tous les composants
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          throw new Error(result.error || 'Erreur lors de la mise à jour du profil');
        }
      } else {
        // Fallback si updateProfile n'est pas disponible
        setProfile(prev => prev ? { ...prev, avatarUrl: data.url } : null);
        showSuccess('Photo de profil mise à jour avec succès !', 3000);
        // Recharger la page pour mettre à jour l'état global
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload de la photo';
      logger.error('Erreur upload photo:', error);
      showError(errorMessage, 5000);
    } finally {
      setIsUploadingPhoto(false);
      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user || isSaving) return;
    setIsSaving(true);
    try {
      // 1. Update Supabase auth user_metadata
      const result = await updateProfile({
        first_name: editForm.firstName,
        last_name: editForm.lastName,
      });

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour');
      }

      // 2. Update profiles table
      const { createBrowserClient } = await import('@supabase/ssr');
      const { supabaseConfig } = await import('@/config/supabase');
      const supabase = createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
      await supabase
        .from('profiles')
        .update({ first_name: editForm.firstName, last_name: editForm.lastName })
        .eq('id', user.id);

      setProfile(prev => prev ? { ...prev, firstName: editForm.firstName, lastName: editForm.lastName } : null);
      setIsEditing(false);
      showSuccess('Profil mis à jour avec succès !');
      // Si l'utilisateur vient d'une page certificat, le renvoyer vers celle-ci
      if (nextUrl) {
        setTimeout(() => router.push(nextUrl), 800);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
      showError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Bannière certificat — s'affiche uniquement si redirigé depuis un certificat */}
      {fromCertificate && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">
              Nom requis pour votre certificat
            </p>
            <p className="text-sm text-blue-700 mt-0.5">
              Renseignez votre prénom et nom de famille ci-dessous, puis enregistrez.
              Vous serez automatiquement renvoyé vers votre certificat.
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium text-blue-700 underline hover:text-blue-900 whitespace-nowrap"
            >
              Modifier
            </button>
          )}
        </div>
      )}

      {/* Header de la Page */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles et suivez vos progrès</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne de Gauche - Photo et Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            {/* Photo de Profil */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 border-4 border-white shadow-lg">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Changer la photo de profil"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-500 capitalize">{profile.role}</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier le profil</span>
              </button>
            </div>
          </div>
        </div>

        {/* Colonne de Droite - Informations et Statistiques */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations Personnelles */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Personnelles</h3>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Annuler</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-medium">{profile.firstName} {profile.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Membre depuis</p>
                    <p className="font-medium">{profile.joinDate}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Statistiques */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques d&apos;Apprentissage</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{profile.totalCourses}</p>
                <p className="text-sm text-gray-600">Cours inscrits</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{profile.completedCourses}</p>
                <p className="text-sm text-gray-600">Cours terminés</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{profile.totalHours}h</p>
                <p className="text-sm text-gray-600">Heures d'apprentissage</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{profile.certificates}</p>
                <p className="text-sm text-gray-600">Certificats</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
