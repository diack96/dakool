'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, Award, TrendingUp, Globe } from 'lucide-react';

interface StatConfig {
  icon: React.ElementType;
  numericValue: number;
  suffix: string;
  label: string;
  subLabel?: string;
  colorClass: string;
  bgClass: string;
}

const STATS_DISPLAY: StatConfig[] = [
  {
    icon: Users,
    numericValue: 2,
    suffix: 'K+',
    label: 'Apprenants',
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    icon: Award,
    numericValue: 20,
    suffix: '+',
    label: 'Cours',
    colorClass: 'text-orange-600 dark:text-orange-400',
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
  },
  {
    icon: TrendingUp,
    numericValue: 95,
    suffix: '%',
    label: 'Satisfaction',
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    icon: Globe,
    numericValue: 7,
    suffix: '',
    label: 'Pays africains',
    subLabel: 'Sénégal · Mali · Côte d\'Ivoire · Guinée · Burkina Faso · Cameroun · Togo',
    colorClass: 'text-orange-600 dark:text-orange-400',
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
  },
] as const;

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

const StatCard: React.FC<{ stat: StatConfig; index: number }> = ({ stat }) => {
  const { count, ref } = useCountUp(stat.numericValue);

  return (
    <div
      ref={ref}
      className="group text-center p-4 md:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-earth-300 dark:hover:border-earth-700 transform hover:-translate-y-1 border-t-2 border-t-earth-400/60"
    >
      <div className={`w-12 h-12 ${stat.bgClass} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
        <stat.icon className={`w-6 h-6 ${stat.colorClass}`} aria-hidden="true" />
      </div>
      <div className={`text-2xl md:text-3xl font-bold ${stat.colorClass} mb-1`} aria-live="polite">
        {count}{stat.suffix}
      </div>
      <div className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
        {stat.label}
      </div>
      {stat.subLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          {stat.subLabel}
        </p>
      )}
    </div>
  );
};

const StatsSection: React.FC = () => {
  return (
    <section
      className="py-12 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900 transition-colors relative overflow-hidden"
      aria-labelledby="stats-heading"
    >
      {/* Pattern adinkra très discret sur fond clair */}
      <div className="absolute inset-0 pattern-adinkra opacity-[0.04] dark:opacity-[0.07] pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Séparateur décoratif ocre */}
        <div className="flex items-center justify-center gap-3 mb-6" aria-hidden="true">
          <div className="h-px w-12 bg-earth-500/50" />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-earth-500">
            <path d="M8 1 L15 8 L8 15 L1 8 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="8" cy="8" r="2" fill="currentColor"/>
          </svg>
          <div className="h-px w-12 bg-earth-500/50" />
        </div>
        <h2
          id="stats-heading"
          className="text-center text-xl md:text-2xl font-semibold text-gray-500 dark:text-gray-400 mb-8 tracking-wide uppercase text-sm"
        >
          Waraba Academy en chiffres
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {STATS_DISPLAY.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
