'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Shield, User, Mail, Lock } from 'lucide-react';

export default function RegisterForm () {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'instructor',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signUp: register } = useAuth();

  // Fonctions de validation du mot de passe
  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getStrengthColor = (strength: number): string => {
    switch (strength) {
    case 1: return 'bg-red-500';
    case 2: return 'bg-orange-500';
    case 3: return 'bg-yellow-500';
    case 4: return 'bg-green-500';
    default: return 'bg-gray-200';
    }
  };

  const getStrengthTextColor = (password: string): string => {
    const strength = getPasswordStrength(password);
    switch (strength) {
    case 1: return 'text-red-600';
    case 2: return 'text-orange-600';
    case 3: return 'text-yellow-600';
    case 4: return 'text-green-600';
    default: return 'text-gray-500';
    }
  };

  const getPasswordStrengthText = (password: string): string => {
    const strength = getPasswordStrength(password);
    switch (strength) {
    case 1: return 'Très faible';
    case 2: return 'Faible';
    case 3: return 'Moyen';
    case 4: return 'Fort';
    default: return 'Entrez un mot de passe';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Effacer les messages quand l'utilisateur tape
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    // Validation des noms
    if (formData.firstName.trim().length < 2) {
      setError('Le prénom doit contenir au moins 2 caractères');
      return false;
    }

    if (formData.lastName.trim().length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      return false;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }

    // Validation des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    // Validation de la complexité du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Tentative d\'inscription...', formData);

      const result = await register(
        formData.email.trim().toLowerCase(),
        formData.password,
        {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
        }
      );

      console.log('Résultat d\'inscription:', result);

      if (result.success) {
        setSuccess('Inscription réussie ! Redirection...');
        // La redirection est gérée par le hook useAuth
      } else {
        setError(result.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      setError('Erreur d\'inscription au serveur. Vérifiez votre connexion internet.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Créer votre compte
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez WARABA ACADEMY et commencez votre formation
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Messages d'erreur et de succès */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Erreur d'inscription</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-700">
                  <p className="font-medium">Succès !</p>
                  <p>{success}</p>
                </div>
              </div>
            )}

            {/* Noms */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Prénom
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="Votre prénom"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Nom
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="Votre nom"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                placeholder="votre@email.com"
                disabled={isLoading}
              />
            </div>

            {/* Rôle */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Rôle
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              >
                <option value="student">Étudiant</option>
                <option value="instructor">Instructeur</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Le rôle d'administrateur est attribué manuellement par l'équipe
              </p>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="Minimum 8 caractères"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Barre de force du mot de passe */}
              <div className="mt-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((level) => {
                    const strength = getPasswordStrength(formData.password);
                    return (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          level <= strength ? getStrengthColor(strength) : 'bg-gray-200'
                        }`}
                      />
                    );
                  })}
                </div>
                <p className={`text-xs mt-1 ${getStrengthTextColor(formData.password)}`}>
                  {getPasswordStrengthText(formData.password)}
                </p>
              </div>
            </div>

            {/* Confirmation du mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="Confirmez votre mot de passe"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Conditions d'utilisation */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                disabled={isLoading}
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                J'accepte les{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                  conditions d'utilisation
                </a>{' '}
                et la{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                  politique de confidentialité
                </a>
              </label>
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Création en cours...
                </span>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          {/* Lien vers la connexion */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <a
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
