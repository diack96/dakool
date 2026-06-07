import Link from 'next/link';
import ReloadButton from './ReloadButton';

export const metadata = {
  title: 'Hors ligne — Waraba Academy',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center">
      <div className="mb-8 text-7xl select-none">📡</div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Vous êtes hors ligne
      </h1>

      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
        Vérifiez votre connexion internet et réessayez.
        Les cours déjà consultés restent accessibles.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <ReloadButton />
        <Link
          href="/"
          className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Accueil
        </Link>
      </div>
    </div>
  );
}
