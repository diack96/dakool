
import Link from 'next/link';
import { Rocket, MessageCircle, Zap } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/221772271093?text=' + encodeURIComponent('Bonjour, je souhaite en savoir plus sur vos formations.');

const FinalCTA: React.FC = () => {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
      {/* Bande ocre supérieure */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-earth-500 via-gold-500 to-earth-600" aria-hidden="true" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/90 via-blue-700/90 to-blue-800/90"></div>
        {/* Pattern kente overlay */}
        <div className="absolute inset-0 pattern-kente opacity-[0.06]" aria-hidden="true" />
        <div className="absolute top-10 right-10 sm:top-20 sm:right-20 w-40 h-40 sm:w-72 sm:h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-10 sm:bottom-20 sm:left-20 w-40 h-40 sm:w-72 sm:h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        {/* Badge urgence */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/90 rounded-full mb-6 animate-fade-in-up">
          <Zap className="w-4 h-4 text-white" aria-hidden="true" />
          <span className="text-sm font-bold text-white">Inscriptions ouvertes · Accès immédiat</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 animate-fade-in-up">
          Prêt à transformer votre carrière ?
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 sm:mb-12 leading-relaxed animate-fade-in-up stagger-1 px-2">
          Rejoignez <strong>2 000+ apprenants</strong> qui ont déjà changé leur vie
          grâce à nos formations de qualité
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up stagger-2">
          <Link
            href="/auth/register"
            className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl sm:rounded-2xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Rocket className="mr-3 w-6 h-6 group-hover:animate-bounce" />
            Commencer maintenant
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/30 text-white rounded-xl sm:rounded-2xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-300 font-semibold text-base sm:text-lg backdrop-blur-sm transform hover:-translate-y-1"
            aria-label="Parler à un expert via WhatsApp"
          >
            <MessageCircle className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
            Parler à un expert
          </a>
        </div>
        <p className="mt-6 text-sm text-white/60 animate-fade-in-up stagger-2">
          Gratuit · Sans engagement · Annulation à tout moment
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;
