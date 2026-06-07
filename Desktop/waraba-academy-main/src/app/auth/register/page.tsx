'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Mail, Lock, User, BookOpen, Award, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/admin/Toast';
import WelcomeOnboarding from '@/components/onboarding/WelcomeOnboarding';

function RegisterForm () {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, signInWithGoogle, user, loading } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  useEffect(() => {
    if (!loading && user) {
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      router.push(redirectUrl);
    }
  }, [user, loading, router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Redirection...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Le prénom est requis');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Le nom est requis');
      return false;
    }
    if (!formData.email.trim()) {
      setError('L\'email est requis');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Adresse email invalide');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signUp(formData.email, formData.password, {
        role: 'student',
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      });

      if (result.success) {
        if (result.requiresEmailConfirmation) {
          setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
          showSuccess('✅ Vérifiez votre email pour confirmer votre compte.', 5000);
          setTimeout(() => router.push('/auth/login'), 2000);
        } else {
          setShowOnboarding(true);
          showSuccess('🎉 Bienvenue ! Votre compte a été créé avec succès.', 3000);
        }
      } else {
        const msg = result.error || 'Erreur lors de la création du compte';
        setError(msg);
        showError(msg, 5000);
      }
    } catch {
      const msg = 'Erreur inattendue lors de la création du compte';
      setError(msg);
      showError(msg, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showOnboarding && (
        <WelcomeOnboarding
          onComplete={() => {
            setShowOnboarding(false);
            router.push(searchParams.get('redirect') || '/dashboard');
          }}
          onSkip={() => {
            setShowOnboarding(false);
            router.push(searchParams.get('redirect') || '/dashboard');
          }}
        />
      )}

      <div className="min-h-screen flex">
        {/* Panneau gauche */}
        <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 relative overflow-hidden flex-col justify-between p-12">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 mb-12">
              <Image src="/waraba-academy.svg" alt="Waraba Academy" width={44} height={44} />
              <span className="text-white text-xl font-bold">Waraba Academy</span>
            </Link>

            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Commencez votre<br />
              <span className="text-blue-200">parcours dès aujourd'hui</span>
            </h1>
            <p className="text-blue-100 text-lg mb-10 leading-relaxed">
              Rejoignez des milliers d'apprenants qui transforment leur avenir avec nos formations.
            </p>

            <div className="space-y-5">
              {[
                { icon: BookOpen, title: 'Formations certifiantes', desc: 'Obtenez un certificat reconnu à la fin de chaque cours' },
                { icon: Award,    title: 'Accès à vie',             desc: 'Revisitez le contenu à tout moment, sans limite' },
                { icon: Users,    title: 'Communauté active',       desc: 'Apprenez avec des milliers d\'étudiants motivés' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{title}</p>
                    <p className="text-blue-200 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-12">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex -space-x-2">
                {['A','B','C','D'].map((l) => (
                  <div key={l} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">{l}</div>
                ))}
              </div>
              <p className="text-white text-sm"><span className="font-semibold">+1 200 étudiants</span> nous ont rejoints ce mois</p>
            </div>
          </div>
        </div>

        {/* Panneau droit — Formulaire */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
          <div className="w-full max-w-lg">
            {/* Logo mobile */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <Image src="/waraba-academy.svg" alt="Waraba Academy" width={40} height={40} />
                <span className="text-xl font-bold text-gray-900 dark:text-white">Waraba Academy</span>
              </Link>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Créer un compte</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Remplissez le formulaire pour commencer gratuitement</p>
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={async () => {
                setError('');
                const result = await signInWithGoogle();
                if (!result.success && result.error) setError(result.error);
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-gray-50 dark:bg-gray-900 text-gray-400">ou avec votre email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Prénom + Nom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Prénom *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Abdou"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Nom *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Diack"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="votre@email.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 8 caractères"
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthColors[passwordStrength]}`}
                        style={{ width: `${((passwordStrength + 1) / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength >= 3 ? 'text-green-600' : passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {strengthLabels[passwordStrength]}
                    </span>
                  </div>
                )}
              </div>

              {/* Erreur */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                </div>
              )}

              {/* Succès */}
              {success && (
                <div className="flex items-start gap-2.5 p-3.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-green-700 dark:text-green-300">{success}</span>
                </div>
              )}

              {/* Bouton submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-1">
                Déjà un compte ?{' '}
                <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Se connecter
                </Link>
              </p>

              <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                En créant un compte, vous acceptez nos{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">conditions d'utilisation</Link>{' '}
                et notre{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">politique de confidentialité</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default function RegisterPage () {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
