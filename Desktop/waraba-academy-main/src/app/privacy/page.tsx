import type { Metadata } from 'next';
import { Shield, Eye, Lock, Database, Users, Globe, Bell, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Découvrez comment Waraba Academy collecte, utilise et protège vos données personnelles. Votre vie privée est notre priorité.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

export default function PrivacyPage () {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Politique de confidentialité</h1>
          <p className="text-xl text-gray-600">
            Dernière mise à jour : Juin 2024
          </p>
        </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">

          {/* Section 1 : Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-3" />
              1. Notre engagement envers votre vie privée
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Chez Waraba Academy, nous respectons profondément votre vie privée et nous nous engageons à protéger
              vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons
              vos informations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              En utilisant notre plateforme, vous acceptez les pratiques décrites dans cette politique de confidentialité.
            </p>
          </section>

          {/* Section 2 : Informations collectées */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Database className="w-6 h-6 text-green-600 mr-3" />
              2. Informations que nous collectons
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations que vous nous fournissez :</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Informations d'identification (nom, prénom, email)</li>
                  <li>Informations de compte (nom d'utilisateur, mot de passe)</li>
                  <li>Informations de profil (photo, bio, compétences)</li>
                  <li>Informations de paiement (carte bancaire, adresse de facturation)</li>
                  <li>Communications avec notre équipe support</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations collectées automatiquement :</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Données de navigation (pages visitées, temps passé)</li>
                  <li>Informations techniques (adresse IP, type de navigateur, appareil)</li>
                  <li>Données d'utilisation (cours suivis, progrès, évaluations)</li>
                  <li>Cookies et technologies similaires</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 : Utilisation des informations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Eye className="w-6 h-6 text-orange-600 mr-3" />
              3. Comment nous utilisons vos informations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Services principaux :</h4>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• Créer et gérer votre compte utilisateur</li>
                  <li>• Fournir nos services de formation</li>
                  <li>• Traiter vos paiements et inscriptions</li>
                  <li>• Suivre votre progression dans les cours</li>
                  <li>• Générer vos certificats de formation</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Amélioration des services :</h4>
                <ul className="text-green-800 space-y-1 text-sm">
                  <li>• Analyser l'utilisation de la plateforme</li>
                  <li>• Améliorer nos cours et fonctionnalités</li>
                  <li>• Personnaliser votre expérience</li>
                  <li>• Développer de nouveaux services</li>
                  <li>• Assurer la sécurité de la plateforme</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 : Partage des informations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-6 h-6 text-purple-600 mr-3" />
              4. Partage de vos informations
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers.
              Nous pouvons partager vos informations uniquement dans les cas suivants :
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Situations de partage autorisées :</h4>
              <ul className="text-purple-800 space-y-1 text-sm">
                <li>• <strong>Avec votre consentement :</strong> Si vous nous donnez explicitement votre permission</li>
                <li>• <strong>Prestataires de services :</strong> Pour traiter les paiements et l'hébergement</li>
                <li>• <strong>Obligations légales :</strong> Si requis par la loi ou une procédure judiciaire</li>
                <li>• <strong>Protection de la sécurité :</strong> Pour prévenir la fraude ou les abus</li>
                <li>• <strong>Partenaires de formation :</strong> Pour délivrer des certifications reconnues</li>
              </ul>
            </div>
          </section>

          {/* Section 5 : Sécurité des données */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Lock className="w-6 h-6 text-green-600 mr-3" />
              5. Sécurité de vos données
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Nous mettons en place des mesures de sécurité techniques et organisationnelles appropriées
              pour protéger vos informations personnelles contre l'accès non autorisé, la modification,
              la divulgation ou la destruction.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Mesures de sécurité :</h4>
                <ul className="text-green-800 space-y-1 text-sm">
                  <li>• Chiffrement SSL/TLS pour toutes les communications</li>
                  <li>• Mots de passe hachés et sécurisés</li>
                  <li>• Accès restreint aux données personnelles</li>
                  <li>• Surveillance continue de la sécurité</li>
                  <li>• Sauvegardes régulières et sécurisées</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Votre rôle :</h4>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• Choisir un mot de passe fort et unique</li>
                  <li>• Ne pas partager vos identifiants</li>
                  <li>• Se déconnecter après chaque session</li>
                  <li>• Signaler toute activité suspecte</li>
                  <li>• Maintenir votre logiciel à jour</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6 : Cookies et technologies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Bell className="w-6 h-6 text-orange-600 mr-3" />
              6. Cookies et technologies similaires
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Nous utilisons des cookies et des technologies similaires pour améliorer votre expérience,
              analyser l'utilisation de notre plateforme et personnaliser le contenu.
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">Types de cookies utilisés :</h4>
              <ul className="text-orange-800 space-y-1 text-sm">
                <li>• <strong>Cookies essentiels :</strong> Nécessaires au fonctionnement de la plateforme</li>
                <li>• <strong>Cookies de performance :</strong> Pour analyser l'utilisation et améliorer nos services</li>
                <li>• <strong>Cookies de fonctionnalité :</strong> Pour mémoriser vos préférences</li>
                <li>• <strong>Cookies de ciblage :</strong> Pour personnaliser le contenu et les publicités</li>
              </ul>
            </div>

            <p className="text-gray-700 mt-4 leading-relaxed">
              Vous pouvez contrôler l'utilisation des cookies via les paramètres de votre navigateur.
              Notez que la désactivation de certains cookies peut affecter le fonctionnement de la plateforme.
            </p>
          </section>

          {/* Section 7 : Vos droits */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              7. Vos droits et choix
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Conformément aux réglementations sur la protection des données, vous disposez de plusieurs droits :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Vos droits :</h4>
                <ul className="text-green-800 space-y-1 text-sm">
                  <li>• <strong>Accès :</strong> Consulter vos données personnelles</li>
                  <li>• <strong>Rectification :</strong> Corriger des informations inexactes</li>
                  <li>• <strong>Effacement :</strong> Demander la suppression de vos données</li>
                  <li>• <strong>Portabilité :</strong> Récupérer vos données dans un format structuré</li>
                  <li>• <strong>Opposition :</strong> Vous opposer au traitement de vos données</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Comment exercer vos droits :</h4>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• Contactez-nous par email à privacy@waraba-academy.com</li>
                  <li>• Utilisez les paramètres de votre compte</li>
                  <li>• Répondez à nos emails de marketing</li>
                  <li>• Configurez vos préférences de cookies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 8 : Conservation des données */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Database className="w-6 h-6 text-gray-600 mr-3" />
              8. Conservation de vos données
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Nous conservons vos informations personnelles aussi longtemps que nécessaire pour fournir nos services
              et respecter nos obligations légales.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Durées de conservation :</h4>
              <ul className="text-gray-800 space-y-1 text-sm">
                <li>• <strong>Données de compte :</strong> Tant que votre compte est actif + 3 ans</li>
                <li>• <strong>Données de paiement :</strong> 7 ans (obligation fiscale)</li>
                <li>• <strong>Données d'utilisation :</strong> 2 ans après la dernière activité</li>
                <li>• <strong>Communications :</strong> 3 ans après la dernière interaction</li>
                <li>• <strong>Cookies :</strong> Selon la durée définie dans votre navigateur</li>
              </ul>
            </div>
          </section>

          {/* Section 9 : Transferts internationaux */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Globe className="w-6 h-6 text-blue-600 mr-3" />
              9. Transferts internationaux de données
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Vos données peuvent être transférées et traitées dans des pays autres que votre pays de résidence.
              Nous nous assurons que ces transferts respectent les réglementations applicables.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Nos serveurs sont principalement situés en Europe et en Afrique de l'Ouest,
              et nous utilisons des prestataires de services qui respectent les standards internationaux de protection des données.
            </p>
          </section>

          {/* Section 10 : Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="w-6 h-6 text-orange-600 mr-3" />
              10. Modifications de cette politique
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Nous pouvons mettre à jour cette politique de confidentialité de temps à autre pour refléter
              les changements dans nos pratiques ou pour d'autres raisons opérationnelles, légales ou réglementaires.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Nous vous informerons de toute modification importante par email ou via une notification sur notre plateforme.
              Votre utilisation continue de nos services après ces modifications constitue votre acceptation de la nouvelle politique.
            </p>
          </section>

          {/* Section 11 : Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              11. Nous contacter
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Si vous avez des questions concernant cette politique de confidentialité ou nos pratiques de protection des données,
              n'hésitez pas à nous contacter :
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 mb-2">
                <strong>Délégué à la protection des données :</strong>
              </p>
              <p className="text-blue-800">
                <strong>Email :</strong> <a href="mailto:privacy@waraba-academy.com" className="text-blue-600 hover:underline">privacy@waraba-academy.com</a>
              </p>
              <p className="text-blue-800">
                <strong>Contact général :</strong> <a href="mailto:contact@waraba-academy.com" className="text-blue-600 hover:underline">contact@waraba-academy.com</a>
              </p>
              <p className="text-blue-800">
                <strong>Téléphone :</strong> +221 77 227 10 93
              </p>
              <p className="text-blue-800">
                <strong>Adresse :</strong> Dakar, Sénégal
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Cette politique de confidentialité est effective à partir du 1er juin 2024.
          </p>
        </div>
      </div>
    </div>
  );
}
