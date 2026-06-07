import type { Metadata } from 'next';
import { Shield, Users, BookOpen, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Lisez les conditions générales d'utilisation de Waraba Academy. Droits, obligations et règles de la plateforme de formation en ligne.",
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

export default function TermsPage () {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Conditions d'utilisation</h1>
          <p className="text-xl text-gray-600">
            Dernière mise à jour : Juin 2024
          </p>
        </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">

          {/* Section 1 : Acceptation */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              1. Acceptation des conditions
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              En accédant et en utilisant Waraba Academy, vous acceptez d'être lié par ces conditions d'utilisation.
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Ces conditions s'appliquent à tous les utilisateurs, visiteurs et clients de Waraba Academy.
            </p>
          </section>

          {/* Section 2 : Description du service */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
              2. Description du service
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Waraba Academy est une plateforme d'apprentissage en ligne qui propose :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Des cours en ligne dans divers domaines (développement, design, marketing, etc.)</li>
              <li>Des ressources éducatives et du matériel de formation</li>
              <li>Un système de certification et d'évaluation</li>
              <li>Une communauté d'apprenants et d'instructeurs</li>
              <li>Un support technique et pédagogique</li>
            </ul>
          </section>

          {/* Section 3 : Inscription et compte */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-6 h-6 text-orange-600 mr-3" />
              3. Inscription et compte utilisateur
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Pour utiliser nos services, vous devez créer un compte en fournissant des informations exactes et à jour.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Vos responsabilités :</h4>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Maintenir la confidentialité de vos identifiants de connexion</li>
                <li>• Signaler immédiatement toute utilisation non autorisée de votre compte</li>
                <li>• Vous assurer que vous avez l'âge légal pour utiliser nos services</li>
                <li>• Ne pas partager votre compte avec d'autres personnes</li>
              </ul>
            </div>
          </section>

          {/* Section 4 : Utilisation acceptable */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="w-6 h-6 text-green-600 mr-3" />
              4. Utilisation acceptable
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Vous vous engagez à utiliser Waraba Academy uniquement à des fins légales et conformes à ces conditions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">✅ Utilisations autorisées :</h4>
                <ul className="text-green-800 space-y-1 text-sm">
                  <li>• Suivre des cours pour votre développement personnel</li>
                  <li>• Participer aux discussions de la communauté</li>
                  <li>• Télécharger du matériel éducatif autorisé</li>
                  <li>• Contacter notre support pour obtenir de l'aide</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">❌ Utilisations interdites :</h4>
                <ul className="text-red-800 space-y-1 text-sm">
                  <li>• Copier ou redistribuer le contenu des cours</li>
                  <li>• Utiliser des bots ou des scripts automatisés</li>
                  <li>• Harceler ou intimider d'autres utilisateurs</li>
                  <li>• Tenter de pirater ou de compromettre la plateforme</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 : Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="w-6 h-6 text-purple-600 mr-3" />
              5. Propriété intellectuelle
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Tous les contenus de Waraba Academy, y compris les cours, vidéos, textes, images et logiciels,
              sont protégés par les droits d'auteur et autres lois sur la propriété intellectuelle.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 text-sm">
                <strong>Important :</strong> Vous n'êtes autorisé à utiliser ce contenu que pour votre apprentissage personnel.
                Toute reproduction, distribution ou modification sans autorisation écrite est strictement interdite.
              </p>
            </div>
          </section>

          {/* Section 6 : Paiements et remboursements */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
              6. Paiements et politique de remboursement
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Nos prix sont affichés en FCFA et incluent toutes les taxes applicables.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Politique de remboursement :</h4>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Remboursement à 100% sous 30 jours si vous n'êtes pas satisfait</li>
                <li>• Contactez notre support pour initier le processus</li>
                <li>• Le remboursement sera traité dans les 5-10 jours ouvrables</li>
                <li>• Les cours gratuits ne sont pas éligibles au remboursement</li>
              </ul>
            </div>
          </section>

          {/* Section 7 : Limitation de responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
              7. Limitation de responsabilité
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Waraba Academy s'efforce de fournir des services de qualité, mais nous ne pouvons garantir :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>L'exactitude absolue de tout le contenu éducatif</li>
              <li>La disponibilité continue de la plateforme sans interruption</li>
              <li>L'obtention de résultats spécifiques dans votre carrière</li>
              <li>La compatibilité avec tous les appareils et navigateurs</li>
            </ul>
          </section>

          {/* Section 8 : Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="w-6 h-6 text-gray-600 mr-3" />
              8. Modifications des conditions
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Nous nous réservons le droit de modifier ces conditions à tout moment.
              Les modifications prendront effet immédiatement après leur publication sur la plateforme.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Il est de votre responsabilité de consulter régulièrement ces conditions pour rester informé des changements.
            </p>
          </section>

          {/* Section 9 : Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              9. Contact et support
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Pour toute question concernant ces conditions d'utilisation, contactez-nous :
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-800">
                <strong>Email :</strong> <a href="mailto:legal@waraba-academy.com" className="text-blue-600 hover:underline">legal@waraba-academy.com</a>
              </p>
              <p className="text-gray-800">
                <strong>Contact :</strong> <a href="mailto:contact@waraba-academy.com" className="text-blue-600 hover:underline">contact@waraba-academy.com</a>
              </p>
              <p className="text-gray-800">
                <strong>Téléphone :</strong> +221 77 227 10 93
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            En utilisant Waraba Academy, vous confirmez avoir lu, compris et accepté ces conditions d'utilisation.
          </p>
        </div>
      </div>
    </div>
  );
}
