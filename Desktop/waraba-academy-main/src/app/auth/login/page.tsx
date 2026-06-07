'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Users,
  Award,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { validateLoginForm } from '@/lib/validation';
import { useRateLimit } from '@/hooks/useRateLimit';

function LoginForm () {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, loading, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Rate limiting: 5 tentatives par 15 minutes
  const { canAttempt, recordAttempt, getRemainingTime } = useRateLimit({
    maxAttempts: 5,
    timeWindow: 15 * 60 * 1000, // 15 minutes
  });

  // Rediriger les utilisateurs déjà connectés
  useEffect(() => {
    if (!loading && user) {
      // L'utilisateur est déjà connecté, rediriger vers dashboard ou page d'origine
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      router.push(redirectUrl);
    }
  }, [user, loading, router, searchParams]);

  // Vérifier les paramètres d'URL pour les erreurs de callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, ne rien afficher (redirection en cours)
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Vérifier le rate limiting
    if (!canAttempt()) {
      const remainingTime = Math.ceil(getRemainingTime() / 60000); // Convertir en minutes
      setError(`Trop de tentatives. Veuillez réessayer dans ${remainingTime} minute(s).`);
      return;
    }

    // Validation côté client
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setError(validation.errors[0] || 'Erreur de validation');
      return;
    }

    // Enregistrer la tentative
    recordAttempt();
    setIsLoggingIn(true);

    let loginSucceeded = false;
    try {
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        loginSucceeded = true;
        // Le useEffect redirige quand user change — ne pas appeler router.push ici
        // pour éviter la double redirection
      } else {
        setError(result.error || 'Erreur lors de la connexion. Veuillez réessayer.');
      }
    } catch {
      setError('Erreur inattendue lors de la connexion. Veuillez réessayer.');
    } finally {
      // Ne pas reset le spinner si la connexion a réussi — laisser le loader
      // visible jusqu'à ce que la redirection se produise
      if (!loginSucceeded) setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-blue-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Connexion
            </h1>

            <p className="text-gray-600">
              Accédez à votre espace d'apprentissage
            </p>
          </div>

          {/* Formulaire de Connexion */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-fade-in-up stagger-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="votre@email.com"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Mot de Passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Votre mot de passe"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div className="flex flex-col space-y-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                  {error.includes('provider is not enabled') && (
                    <div className="ml-8 text-xs text-red-600 bg-red-100 p-2 rounded-lg">
                      <p className="font-semibold mb-1">Solution :</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Allez dans Supabase Dashboard</li>
                        <li>Authentication &gt; Providers</li>
                        <li>Activez le toggle Google</li>
                        <li>Configurez les credentials (Client ID + Secret)</li>
                      </ol>
                      <p className="mt-2 text-xs italic">Voir le guide : ACTIVER_GOOGLE_SUPABASE.md</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bouton de Connexion */}
              <button
                type="submit"
                disabled={isLoggingIn || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="flex items-center justify-center">
                  {isLoggingIn ? (
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-6 h-6 mr-2" />
                  )}
                  {isLoggingIn ? 'Connexion en cours...' : 'Se connecter'}
                </div>
              </button>
            </form>

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            {/* Bouton Google */}
            <button
              type="button"
              onClick={async () => {
                setError(''); // Réinitialiser l'erreur
                const result = await signInWithGoogle();
                if (!result.success && result.error) {
                  setError(result.error);
                }
              }}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continuer avec Google</span>
            </button>

            {/* Liens Utiles */}
            <div className="mt-6 text-center space-y-3">
              <Link
                href="/auth/forgot-password"
                className="block text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Mot de passe oublié ?
              </Link>

              <div className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link
                  href="/auth/register"
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>

          {/* Informations Supplémentaires */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 animate-fade-in-up stagger-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Pourquoi se connecter ?
            </h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Accès à vos cours</h4>
                  <p className="text-sm text-gray-600">Suivez votre progression</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Certificats</h4>
                  <p className="text-sm text-gray-600">Obtenez vos diplômes</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Apprentissage flexible</h4>
                  <p className="text-sm text-gray-600">À votre rythme</p>
                </div>
              </div>
            </div>
          </div>

          {/* Retour à l'Accueil */}
          <div className="text-center animate-fade-in-up stagger-3">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Retour à l'accueil</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage () {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
