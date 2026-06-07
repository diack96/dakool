'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Général
  {
    question: 'Qu\'est-ce que Waraba Academy ?',
    answer: 'Waraba Academy est une plateforme de formation en ligne spécialisée dans les compétences numériques. Nous proposons des cours en marketing digital, développement web, IA, entrepreneuriat et plus encore.',
    category: 'general',
  },
  {
    question: 'Comment m\'inscrire à un cours ?',
    answer: 'Pour vous inscrire à un cours, créez d\'abord un compte gratuitement, puis parcourez notre catalogue de cours. Cliquez sur "Acheter maintenant" pour le cours qui vous intéresse et suivez le processus de paiement.',
    category: 'general',
  },
  {
    question: 'Les cours sont-ils accessibles à vie ?',
    answer: 'Oui, une fois inscrit à un cours, vous y avez accès à vie. Vous pouvez le suivre à votre rythme et y revenir autant de fois que vous le souhaitez.',
    category: 'general',
  },
  {
    question: 'Y a-t-il une application mobile ?',
    answer: 'Notre plateforme est optimisée pour mobile et peut être installée comme une application (PWA) sur votre smartphone Android ou iOS directement depuis votre navigateur, sans passer par un app store.',
    category: 'general',
  },

  // Paiement
  {
    question: 'Quels sont les moyens de paiement acceptés ?',
    answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard), Orange Money, Wave et les virements bancaires. Tous les paiements sont sécurisés.',
    category: 'paiement',
  },
  {
    question: 'Puis-je obtenir un remboursement ?',
    answer: 'Oui, nous offrons une garantie de remboursement de 30 jours. Si vous n\'êtes pas satisfait de votre cours, contactez notre support pour un remboursement complet.',
    category: 'paiement',
  },
  {
    question: 'Les prix sont-ils en FCFA ?',
    answer: 'Oui, tous nos prix sont affichés en FCFA (Franc CFA). Les paiements sont traités en FCFA pour les utilisateurs d\'Afrique de l\'Ouest.',
    category: 'paiement',
  },
  {
    question: 'Puis-je payer en plusieurs fois ?',
    answer: 'Pour certains cours, nous proposons des facilités de paiement. Contactez notre support pour en savoir plus sur les options disponibles selon votre situation.',
    category: 'paiement',
  },

  // Certificats
  {
    question: 'Les certificats sont-ils reconnus ?',
    answer: 'Oui, nos certificats sont reconnus par les entreprises partenaires et les institutions. Ils attestent de vos compétences et peuvent être ajoutés à votre CV ou profil LinkedIn.',
    category: 'certificats',
  },
  {
    question: 'Comment obtenir mon certificat ?',
    answer: 'Votre certificat est automatiquement généré et disponible pour téléchargement une fois que vous avez terminé 100% du cours et réussi l\'évaluation finale.',
    category: 'certificats',
  },
  {
    question: 'Puis-je partager mon certificat sur LinkedIn ?',
    answer: 'Oui, chaque certificat dispose d\'un bouton de partage LinkedIn. Vous pouvez aussi utiliser l\'URL de vérification unique pour que les recruteurs puissent authentifier votre certificat.',
    category: 'certificats',
  },

  // Technique
  {
    question: 'Que faire si j\'ai des problèmes techniques ?',
    answer: 'Notre équipe support est disponible du lundi au vendredi de 9h à 18h. Contactez-nous via le formulaire de contact ou par email à contact@waraba-academy.com.',
    category: 'technique',
  },
  {
    question: 'Puis-je suivre les cours sur mobile ?',
    answer: 'Oui, notre plateforme est entièrement responsive et optimisée pour mobile. Vous pouvez suivre vos cours sur smartphone, tablette ou ordinateur.',
    category: 'technique',
  },
  {
    question: 'Les vidéos fonctionnent-elles sans connexion rapide ?',
    answer: 'Nos vidéos s\'adaptent automatiquement à votre débit. Votre progression est aussi sauvegardée localement si la connexion est instable, puis synchronisée dès que vous êtes de nouveau en ligne.',
    category: 'technique',
  },

  // Cours
  {
    question: 'Quel est le niveau requis pour suivre les cours ?',
    answer: 'Nos cours sont adaptés à tous les niveaux, du débutant à l\'avancé. Chaque cours indique clairement le niveau requis dans sa description.',
    category: 'cours',
  },
  {
    question: 'Combien de temps faut-il pour terminer un cours ?',
    answer: 'La durée varie selon le cours et votre rythme d\'apprentissage. En moyenne, nos cours nécessitent 20-40 heures réparties sur 4-8 semaines.',
    category: 'cours',
  },
  {
    question: 'Y a-t-il des exercices pratiques ?',
    answer: 'Oui, tous nos cours incluent des exercices pratiques, des projets concrets et des évaluations (quiz) pour valider vos acquis.',
    category: 'cours',
  },
  {
    question: 'Puis-je télécharger les supports de cours ?',
    answer: 'Certains cours proposent des documents téléchargeables (PDF, fiches récapitulatives). Vous pouvez y accéder depuis la page de la leçon concernée.',
    category: 'cours',
  },
];

const categories = [
  { id: 'all', name: 'Tout voir', icon: '🔍' },
  { id: 'general', name: 'Général', icon: '❓' },
  { id: 'paiement', name: 'Paiement', icon: '💳' },
  { id: 'certificats', name: 'Certificats', icon: '🎓' },
  { id: 'technique', name: 'Support Technique', icon: '🔧' },
  { id: 'cours', name: 'Cours', icon: '📚' },
];

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">{part}</mark> : part,
  );
}

export default function FAQPage () {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQ = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return faqData.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!q) return matchesCategory;
      const matchesSearch = item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleItem = (question: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      next.has(question) ? next.delete(question) : next.add(question);
      return next;
    });
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // When searching across all categories, switch to "all"
    if (value.trim() && activeCategory !== 'all') {
      setActiveCategory('all');
    }
    // Auto-open matching items when searching
    if (value.trim()) {
      const q = value.trim().toLowerCase();
      const matching = faqData
        .filter(item => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q))
        .map(item => item.question);
      setOpenItems(new Set(matching));
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setOpenItems(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Questions Fréquentes
            </h1>
            <p className="text-lg md:text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions sur Waraba Academy
            </p>

            {/* Search bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Rechercher une question..."
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-base"
                aria-label="Rechercher dans la FAQ"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Catégories */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
              }`}
            >
              <span aria-hidden="true">{category.icon}</span>
              <span>{category.name}</span>
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                activeCategory === category.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {faqData.filter(item => category.id === 'all' || item.category === category.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Résultats recherche */}
        {searchQuery && (
          <p className="text-sm text-gray-500 mb-4 text-center">
            {filteredFAQ.length} résultat{filteredFAQ.length !== 1 ? 's' : ''} pour &ldquo;{searchQuery}&rdquo;
          </p>
        )}

        {/* FAQ Items */}
        {filteredFAQ.length > 0 ? (
          <div className="space-y-3">
            {filteredFAQ.map((item) => {
              const isOpen = openItems.has(item.question);
              return (
                <div
                  key={item.question}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
                >
                  <button
                    onClick={() => toggleItem(item.question)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <h3 className="font-semibold text-gray-900 leading-snug">
                      {highlight(item.question, searchQuery)}
                    </h3>
                    {isOpen
                      ? <ChevronUp className="flex-shrink-0 w-5 h-5 text-blue-600" />
                      : <ChevronDown className="flex-shrink-0 w-5 h-5 text-gray-400" />
                    }
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed pt-4">
                        {highlight(item.answer, searchQuery)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-5xl mb-4">🤔</p>
            <p className="text-gray-600 text-lg font-medium mb-2">Aucune question trouvée</p>
            <p className="text-gray-400 text-sm mb-6">Essayez d&apos;autres mots-clés ou parcourez toutes les catégories</p>
            <button
              onClick={clearSearch}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Effacer la recherche
            </button>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Vous ne trouvez pas votre réponse ?
          </h3>
          <p className="text-gray-600 mb-6">
            Notre équipe est disponible du lundi au vendredi, de 8h à 18h (GMT).
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Contacter le support
            </Link>
            <a
              href="mailto:contact@waraba-academy.com"
              className="inline-flex items-center justify-center gap-2 border border-blue-200 text-blue-700 bg-white px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors font-medium"
            >
              contact@waraba-academy.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
