'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createBrowserSupabaseClient } from '@/lib/supabase-helpers';

export default function AdminLoginPage () {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const { signIn, refreshSession } = useAuth();

  // Vérifier les paramètres d'erreur dans l'URL (seulement si l'utilisateur vient d'une redirection)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    
    // Ne pas afficher l'erreur automatiquement si l'utilisateur vient juste d'arriver
    // Attendre qu'il essaie de se connecter
    if (errorParam) {
      // Nettoyer l'URL pour éviter que l'erreur persiste au rafraîchissement
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Afficher un message plus encourageant
      if (errorParam === 'unauthorized') {
        setError('Veuillez vous connecter avec votre compte administrateur. Si le problème persiste, exécutez: npm run fix:admin:now');
      } else if (errorParam === 'no_profile') {
        setError('Votre profil n\'a pas été trouvé. Exécutez: npm run fix:admin:now pour corriger cela.');
      } else if (errorParam === 'middleware_error') {
        setError('Erreur lors de la vérification. Veuillez réessayer de vous connecter.');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setDebugInfo([]);

    try {
      const addDebug = (msg: string) => {
        setDebugInfo(prev => [...prev, msg]);
        console.log(msg);
      };

      // ÉTAPE 1: Authentification
      addDebug('1️⃣ Authentification...');
      const authResult = await signIn(email, password);

      if (!authResult.success) {
        setError(authResult.error || 'Email ou mot de passe incorrect');
        setIsLoading(false);
        return;
      }

      addDebug('✅ Authentifié');

      // ÉTAPE 2: Attendre que la session soit établie
      await new Promise(resolve => setTimeout(resolve, 1000));

      // ÉTAPE 3: Récupérer l'utilisateur et le profil
      addDebug('2️⃣ Vérification du rôle admin...');
      const supabase = createBrowserSupabaseClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user?.id) {
        setError('Erreur lors de la récupération de l\'utilisateur. Réessayez.');
        setIsLoading(false);
        return;
      }

      // Vérifier le rôle admin via l'API serveur (contourne RLS)
      addDebug('Appel API check-admin...');
      const checkResponse = await fetch('/api/auth/check-admin', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (!checkResponse.ok) {
        if (checkResponse.status === 429) {
          setError('Trop de tentatives de connexion. Réessayez dans 15 minutes.');
        } else if (checkResponse.status === 401) {
          setError('Session non établie. Réessayez dans quelques secondes.');
        } else {
          setError(`Erreur serveur (${checkResponse.status}). Vérifiez la configuration ou contactez le support.`);
        }
        setIsLoading(false);
        return;
      }

      const checkData = await checkResponse.json();
      addDebug(`✅ Réponse API: role=${checkData.role}, isAdmin=${checkData.isAdmin}`);

      if (!checkData.isAdmin) {
        setError(`Accès refusé. Votre rôle est "${checkData.role}". Contactez un administrateur.`);
        setIsLoading(false);
        await supabase.auth.signOut();
        return;
      }

      addDebug('✅ Rôle admin confirmé');

      // ÉTAPE 4: Rafraîchir le contexte
      if (refreshSession) {
        try {
          await refreshSession();
          addDebug('✅ Contexte rafraîchi');
        } catch (err) {
          // Non bloquant
        }
      }

      // ÉTAPE 5: Redirection
      addDebug('3️⃣ Redirection...');
      // Redirection directe
      window.location.href = '/admin';

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Réessayez.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Icon Section */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl blur-lg opacity-50"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Connexion <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">Administrateur</span>
          </h2>
          <p className="text-gray-600 text-sm">
            Accédez à l'interface d'administration de Waraba Academy
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl border border-gray-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-fade-in">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-red-800 font-semibold mb-2">{error}</p>
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800">
                            <strong>💡 Solution rapide :</strong> Exécutez <code className="bg-yellow-100 px-1 rounded">npm run fix:admin:now</code> dans le terminal, puis réessayez.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          // Nettoyer aussi l'URL
                          window.history.replaceState({}, '', window.location.pathname);
                        }}
                        className="ml-2 flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                        title="Fermer"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Debug info (visible seulement en développement) */}
            {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 text-xs">
                <p className="font-semibold text-blue-800 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Debug:
                </p>
                <ul className="space-y-1 text-blue-700 max-h-40 overflow-y-auto">
                  {debugInfo.map((info, idx) => (
                    <li key={idx} className="font-mono text-xs">{info}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                  placeholder="admin@exemple.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Se connecter
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
