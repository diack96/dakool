'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactPage () {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess('Message envoyé ! Notre équipe vous répondra sous 24-48h ouvrables. Un accusé de réception a été envoyé à votre adresse email.');
        setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
      } else {
        setError(data.error || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } catch {
      setError('Impossible d\'envoyer le message. Vérifiez votre connexion et réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 pt-24">
      {/* Header */}
      <section className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contactez-nous
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Notre équipe est là pour vous accompagner dans votre parcours d'apprentissage
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Formulaire de Contact */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Envoyez-nous un message</h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre prénom"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choisissez un sujet</option>
                  <option value="formation">Demande de formation</option>
                  <option value="support">Support technique</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez votre demande..."
                />
              </div>

              {/* Messages d'erreur et de succès */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">{success}</span>
                </div>
              )}

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Envoyer le message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Informations de Contact */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Nos Coordonnées</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Notre équipe d'experts est disponible pour répondre à toutes vos questions
                et vous accompagner dans votre parcours d'apprentissage.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <a href="mailto:contact@waraba-academy.com" className="text-gray-600 hover:text-blue-600 transition-colors">
                    contact@waraba-academy.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Phone className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Téléphone / WhatsApp</h3>
                  <a href="tel:+221772271093" className="text-gray-600 hover:text-orange-600 transition-colors">
                    +221 77 227 10 93
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Localisation</h3>
                  <p className="text-gray-600">Dakar, Sénégal</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Disponibilité</h3>
                  <p className="text-gray-600">
                    Lundi - Vendredi : 9h00 - 18h00<br />
                    Réponse sous 24-48h ouvrables
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Rapide */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions Fréquentes</h3>
              <div className="space-y-3">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium text-gray-700 cursor-pointer list-none">
                    Comment m'inscrire à un cours ?
                    <span className="transition group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <p className="text-gray-600 mt-2 text-sm">
                    Créez un compte, choisissez votre cours et suivez le processus d'inscription.
                  </p>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center font-medium text-gray-700 cursor-pointer list-none">
                    Les cours sont-ils certifiants ?
                    <span className="transition group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <p className="text-gray-600 mt-2 text-sm">
                    Oui, tous nos cours délivrent des certificats reconnus par l'industrie.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

