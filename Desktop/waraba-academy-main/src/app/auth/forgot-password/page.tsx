'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation'; // Non utilisé pour l'instant
import Link from 'next/link';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { validateForgotPasswordForm } from '@/lib/validation';

export default function ForgotPasswordPage () {
  // const router = useRouter(); // Non utilisé pour l'instant
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation côté client
    const validation = validateForgotPasswordForm(email);
    if (!validation.isValid) {
      setError(validation.errors[0] || 'Erreur de validation');
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(email.trim());

      if (result.success) {
        setSuccess('Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.');
        setEmail('');
      } else {
        setError(result.error || 'Erreur lors de l\'envoi de l\'email de réinitialisation.');
      }
    } catch (error: any) {
      setError('Erreur inattendue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
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
            <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-10 h-10 text-orange-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mot de passe oublié ?
            </h1>

            <p className="text-gray-600">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {/* Formulaire */}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="votre@email.com"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Succès */}
              {success && (
                <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">{success}</span>
                </div>
              )}

              {/* Bouton d'envoi */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white text-center py-4 px-6 rounded-2xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="flex items-center justify-center">
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Mail className="w-6 h-6 mr-2" />
                  )}
                  {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </div>
              </button>
            </form>

            {/* Liens Utiles */}
            <div className="mt-6 text-center space-y-3">
              <Link
                href="/auth/login"
                className="block text-sm text-orange-600 hover:text-orange-700 hover:underline transition-colors"
              >
                Retour à la connexion
              </Link>

              <div className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link
                  href="/auth/register"
                  className="text-orange-600 hover:text-orange-700 hover:underline font-medium"
                >
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>

          {/* Informations Supplémentaires */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 animate-fade-in-up stagger-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Comment ça marche ?
            </h3>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-600 font-semibold text-xs">1</span>
                </div>
                <p>Entrez votre adresse email associée à votre compte</p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-600 font-semibold text-xs">2</span>
                </div>
                <p>Recevez un email avec un lien de réinitialisation</p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-600 font-semibold text-xs">3</span>
                </div>
                <p>Cliquez sur le lien et créez un nouveau mot de passe</p>
              </div>
            </div>
          </div>

          {/* Retour à l'Accueil */}
          <div className="text-center animate-fade-in-up stagger-3">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l'accueil</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
