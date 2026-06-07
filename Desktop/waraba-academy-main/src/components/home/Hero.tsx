'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Rocket, Play, CheckCircle2 } from 'lucide-react';
import { SITE_STATS } from '@/lib/constants';

const AVATAR_INITIALS = ['F', 'K', 'A', 'M'];
const AVATAR_COLORS = [
  'from-blue-500 to-blue-700',
  'from-orange-400 to-orange-600',
  'from-teal-400 to-teal-600',
  'from-purple-400 to-purple-600',
];

const ROTATING_WORDS = [
  'Digital',
  'Intelligence Artificielle',
  'Soft Skills',
];

const Hero: React.FC = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative overflow-hidden min-h-[90vh] sm:min-h-[92vh] lg:min-h-[95vh] flex items-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 pt-24"
      aria-label="Section principale - Présentation de Waraba Academy"
      id="hero"
    >
      {/* Skip link pour accessibilité */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold z-50 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
      >
        Aller au contenu principal
      </a>

      {/* Container principal avec layout split-screen */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Colonne gauche - Contenu texte (en premier dans le DOM = premier sur mobile) */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in-up">

            {/* Titre principal */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              <span className="block mb-2">Formez-vous en</span>
              <span
                className="block text-orange-400 transition-all duration-300 min-h-[1.2em]"
                style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)' }}
                aria-live="polite"
                aria-atomic="true"
              >
                {ROTATING_WORDS[wordIndex]}
              </span>
              <span className="block mt-2">et transformez votre carrière</span>
            </h1>

            {/* Sous-titre avec social proof */}
            <p className="text-lg sm:text-xl text-blue-100 max-w-xl leading-relaxed">
              Des formations certifiantes en <strong className="text-orange-300">Digital, IA et Soft Skills</strong> —{' '}
              <strong className="text-white">2 000+ apprenants en Afrique</strong> nous font déjà confiance.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/auth/register"
                className="group inline-flex items-center justify-center px-8 py-4 bg-orange-700 text-white rounded-2xl hover:bg-orange-800 focus:outline-none focus:ring-4 focus:ring-orange-700/50 transition-all duration-300 font-bold text-base sm:text-lg shadow-2xl hover:shadow-orange-700/50 transform hover:-translate-y-1 hover:scale-105"
                aria-label="Commencer gratuitement - Créer un compte"
              >
                <Rocket className="mr-2 w-5 h-5 group-hover:animate-bounce" aria-hidden="true" />
                Commencer gratuitement
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>

              <Link
                href="/courses"
                className="group inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/80 text-white rounded-2xl hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-300 font-semibold text-base sm:text-lg"
                aria-label="Explorer les cours disponibles"
              >
                <Play className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                Explorer les cours
              </Link>
            </div>

            {/* Trust hints — compact, inline */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-blue-100">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-orange-300 shrink-0" />
                Sans carte bancaire
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-orange-300 shrink-0" />
                3 cours offerts · Accès immédiat
              </span>
            </div>
          </div>

          {/* Colonne droite - Image (en second dans le DOM = après le texte sur mobile) */}
          <div className="relative h-[400px] sm:h-[500px] lg:h-[650px] rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up stagger-1 border-4 border-white/30 dark:border-gray-700/30">
            {/* Overlay optimisé pour meilleur contraste */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-transparent to-transparent z-10 dark:from-blue-900/40"></div>
            {/* Image de fond */}
            <div className="absolute inset-0">
              <Image
                src="/hero-students.webp"
                alt="Étudiants de Waraba Academy en apprentissage - Formation en ligne"
                fill
                priority
                className="object-cover"
                quality={80}
                sizes="100vw"
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACQAQCdASoKAAcABUB8JZQAAla5MgAA+kOdCERCLVKkahRhQbNtpUiGtpupzwgA"
              />
            </div>
            {/* Badge flottant sur l'image - Preuve sociale visuelle avec avatars réels */}
            <div className="absolute bottom-6 left-6 right-6 bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-2xl z-20 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Rejoignez la communauté</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{SITE_STATS.students} apprenants en Afrique</p>
                </div>
                <div className="flex -space-x-2">
                  {AVATAR_INITIALS.map((initial, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i]} border-2 border-white dark:border-gray-900 shadow-md flex items-center justify-center`}
                      aria-hidden="true"
                    >
                      <span className="text-xs font-bold text-white">{initial}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern kente en overlay discret */}
      <div className="absolute inset-0 pattern-kente opacity-[0.055] pointer-events-none z-0" aria-hidden="true" />

      {/* Éléments décoratifs optimisés - Plus subtils */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400/10 rounded-full filter blur-3xl opacity-30 animate-blob z-0"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000 z-0"></div>

      {/* Accent géométrique kente — coin bas gauche */}
      <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-64 sm:h-64 opacity-[0.08] pointer-events-none z-0" aria-hidden="true">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120 L60 60 L120 120 Z" stroke="white" strokeWidth="1.5" fill="none"/>
          <path d="M0 90 L30 60 L60 90 L90 60 L120 90" stroke="white" strokeWidth="1" fill="none"/>
          <path d="M0 60 L20 40 L40 60 L60 40 L80 60 L100 40 L120 60" stroke="white" strokeWidth="0.8" fill="none"/>
          <path d="M0 30 L10 20 L20 30 L30 20 L40 30 L50 20 L60 30 L70 20 L80 30 L90 20 L100 30 L110 20 L120 30" stroke="white" strokeWidth="0.6" fill="none"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
