'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TrendingUp } from 'lucide-react';

const AIPerformanceTracker: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePerformanceWithAI = async () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-6">
            <TrendingUp className="w-4 h-4 mr-2" />
            Suivi IA Avancé
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Analysez vos
            <span className="text-transparent bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text">
              {' '}performances avec l'IA
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            L'intelligence artificielle analyse vos progrès et vous propose des stratégies d'amélioration personnalisées.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden ring-4 ring-blue-100">
            <Image
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces"
              alt="Analyse IA"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Suivi de Performance IA
          </h3>
          <p className="text-gray-600 mb-6">
            Composant en cours de développement pour l'analyse avancée des performances d'apprentissage.
          </p>
          <button
            onClick={analyzePerformanceWithAI}
            disabled={isAnalyzing}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-lg hover:from-blue-700 hover:to-orange-600 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analyse en cours...' : 'Lancer l\'analyse IA'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default AIPerformanceTracker;
