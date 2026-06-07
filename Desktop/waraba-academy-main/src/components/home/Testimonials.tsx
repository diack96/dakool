'use client';

import { Star, MapPin, TrendingUp, Quote } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

interface Testimonial {
  id: string;
  name: string;
  country: string;
  city: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  course: string;
  beforeSalary?: string;
  afterSalary?: string;
  currency?: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Fatoumata Diallo',
    country: 'Sénégal',
    city: 'Dakar',
    role: 'Développeuse Full-Stack',
    company: 'DigiSenegal SARL',
    content: 'En 6 mois, j\'ai appris le développement web et créé ma propre entreprise. Waraba Academy m\'a donné les outils concrets pour passer à l\'action.',
    rating: 5,
    course: 'Développement Web Full-Stack',
    beforeSalary: '200 000',
    afterSalary: '600 000',
    currency: 'FCFA/mois',
  },
  {
    id: '2',
    name: 'Kofi Mensah',
    country: 'Ghana',
    city: 'Accra',
    role: 'Data Scientist',
    company: 'AfroPay Tech',
    content: 'Les projets pratiques m\'ont donné l\'expérience réelle pour décrocher mon poste. La reconversion en data science que je pensais impossible est devenue réalité.',
    rating: 5,
    course: 'Intelligence Artificielle',
    beforeSalary: '1 500',
    afterSalary: '4 500',
    currency: 'GHS/mois',
  },
  {
    id: '3',
    name: 'Aisha Bello',
    country: 'Nigeria',
    city: 'Lagos',
    role: 'Designer UX/UI Freelance',
    company: 'Indépendante',
    content: 'Mon portfolio me permet maintenant de travailler avec des clients internationaux. Les cours de design UX/UI sont d\'un niveau vraiment professionnel.',
    rating: 5,
    course: 'Design UX/UI Avancé',
    beforeSalary: '180 000',
    afterSalary: '550 000',
    currency: 'NGN/mois',
  },
  {
    id: '4',
    name: 'Moussa Traoré',
    country: 'Mali',
    city: 'Bamako',
    role: 'Fondateur & CEO',
    company: 'MaliTech Solutions',
    content: 'Les formateurs partagent de l\'expérience concrète, pas de la théorie. Ça m\'a donné la confiance pour créer ma propre agence digitale.',
    rating: 5,
    course: 'DevOps et Cloud Computing',
    beforeSalary: '250 000',
    afterSalary: '800 000',
    currency: 'XOF/mois',
  },
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5" role="img" aria-label={`${rating} étoiles sur 5`}>
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-gold-500 fill-current' : 'text-gray-200 dark:text-gray-600'}`}
        aria-hidden="true"
      />
    ))}
  </div>
);

const TestimonialCard: React.FC<{ t: Testimonial; featured?: boolean }> = ({ t, featured }) => (
  <article className={`group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 flex flex-col ${featured ? 'md:col-span-2' : ''}`}>
    {/* Bande supérieure — couleur unie earth */}
    <div className="h-1 w-full bg-earth-500" aria-hidden="true" />

    <div className={`p-6 flex gap-5 flex-1 ${featured ? 'md:p-8' : ''}`}>
      {/* Colonne gauche — avatar + identité */}
      <div className="flex flex-col items-center gap-3 shrink-0 w-20">
        <div className="ring-2 ring-earth-400/40 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 rounded-full">
          <Avatar name={t.name} size={64} className="w-16 h-16" />
        </div>
        <StarRating rating={t.rating} />
      </div>

      {/* Colonne droite — contenu */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {/* Nom + localisation */}
        <div>
          <p className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight">{t.name}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate">{t.role}</p>
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>{t.city}, {t.country}</span>
          </div>
        </div>

        {/* Citation */}
        <blockquote className="relative">
          {/* Guillemet décoratif adinkra */}
          <Quote className="absolute -top-1 -left-1 w-5 h-5 text-earth-400/40 fill-current" aria-hidden="true" />
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pl-4 italic">
            {t.content}
          </p>
        </blockquote>

        {/* Footer — formation + salaire */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/40 truncate max-w-[180px]">
            {t.course}
          </span>

          {t.beforeSalary && t.afterSalary && (
            <div className="flex items-center gap-2 text-xs shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-earth-500 shrink-0" aria-hidden="true" />
              <span className="text-gray-400 line-through">{t.beforeSalary}</span>
              <span className="font-bold text-earth-600 dark:text-earth-400">{t.afterSalary}</span>
              <span className="text-gray-400">{t.currency}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </article>
);

const Testimonials: React.FC = () => {
  return (
    <section
      className="py-12 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors"
      aria-labelledby="testimonials-heading"
    >
      {/* Pattern adinkra discret */}
      <div className="absolute inset-0 pattern-adinkra opacity-[0.04] dark:opacity-[0.07] pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* En-tête */}
        <div className="text-center mb-10 md:mb-14">
          {/* Séparateur adinkra */}
          <div className="flex items-center justify-center gap-3 mb-5" aria-hidden="true">
            <div className="h-px w-12 bg-earth-400/50" />
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-earth-500">
              <path d="M9 1 L17 9 L9 17 L1 9 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <circle cx="9" cy="9" r="2.5" fill="currentColor"/>
            </svg>
            <div className="h-px w-12 bg-earth-400/50" />
          </div>

          <span className="inline-block px-4 py-1.5 bg-earth-100 dark:bg-earth-900/30 text-earth-700 dark:text-earth-300 text-sm font-semibold rounded-full mb-4 border border-earth-200/60 dark:border-earth-700/40">
            Témoignages
          </span>
          <h2
            id="testimonials-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3"
          >
            Ils ont transformé leur carrière
          </h2>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            2 000+ apprenants à travers l'Afrique nous font confiance.
          </p>
        </div>

        {/* Grille de témoignages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
