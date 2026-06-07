'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, X, WifiOff } from 'lucide-react';

interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  hasUpdate: boolean;
  isOnline: boolean;
  isOffline: boolean;
  deferredPrompt: any;
}

const PWAInstaller: React.FC = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    hasUpdate: false,
    isOnline: true,
    isOffline: false,
    deferredPrompt: null,
  });
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    checkInstallationStatus();

    // Sync actual online status after hydration
    setPwaState(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      isOffline: !navigator.onLine,
    }));

    // Enregistrement du service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          // Écouter les mises à jour dès l'enregistrement
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setPwaState((prev) => ({ ...prev, hasUpdate: true }));
                  setShowUpdatePrompt(true);
                }
              });
            }
          });
        })
        .catch(() => {
          // SW non critique — on ignore silencieusement
        });
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const checkInstallationStatus = () => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') return;

    // Vérifier si l'app est installée (PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = isStandalone || (window.navigator as any).standalone;

    setPwaState(prev => ({
      ...prev,
      isInstalled,
    }));
  };

  const handleBeforeInstallPrompt = (event: Event) => {
    event.preventDefault();
    setPwaState(prev => ({
      ...prev,
      isInstallable: true,
      deferredPrompt: event,
    }));
    setShowInstallPrompt(true);
  };

  const handleAppInstalled = () => {
    setPwaState(prev => ({
      ...prev,
      isInstalled: true,
      isInstallable: false,
    }));
    setShowInstallPrompt(false);

    // Notification de succès
    if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
      new Notification('Waraba Academy installée !', {
        body: 'Votre application est maintenant installée sur votre appareil.',
        icon: '/waraba-academy-gradient.svg',
      });
    }
  };

  const handleOnline = () => {
    setPwaState(prev => ({
      ...prev,
      isOnline: true,
      isOffline: false,
    }));
    setShowOfflineNotice(false);
  };

  const handleOffline = () => {
    setPwaState(prev => ({
      ...prev,
      isOnline: false,
      isOffline: true,
    }));
    setShowOfflineNotice(true);
  };

  const handleInstall = async () => {
    if (pwaState.deferredPrompt) {
      pwaState.deferredPrompt.prompt();
      const { outcome } = await pwaState.deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('Utilisateur a accepté l\'installation');
      } else {
        console.log('Utilisateur a refusé l\'installation');
      }

      setPwaState(prev => ({
        ...prev,
        deferredPrompt: null,
      }));
      setShowInstallPrompt(false);
    }
  };

  const handleUpdate = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          // Envoyer un message au service worker pour qu'il se mette à jour
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });

          // Recharger la page après la mise à jour
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
      }
    }
    setShowUpdatePrompt(false);
  };

  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  const dismissUpdatePrompt = () => {
    setShowUpdatePrompt(false);
  };

  const dismissOfflineNotice = () => {
    setShowOfflineNotice(false);
  };

  // Ne rien afficher si l'app est déjà installée et qu'il n'y a pas de mise à jour
  if (!showInstallPrompt && !showUpdatePrompt && !showOfflineNotice) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
      {/* Prompt d'installation PWA */}
      {showInstallPrompt && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 animate-fade-in-up">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Installer Waraba Academy
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Installez l'application sur votre appareil pour un accès rapide et hors ligne.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Installer
                </button>
                <button
                  onClick={dismissInstallPrompt}
                  className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Plus tard
                </button>
              </div>
            </div>
            <button
              onClick={dismissInstallPrompt}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Prompt de mise à jour */}
      {showUpdatePrompt && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 animate-fade-in-up">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <RefreshCw className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Mise à jour disponible
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Une nouvelle version de Waraba Academy est disponible. Mettez à jour pour les dernières fonctionnalités.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleUpdate}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Mettre à jour
                </button>
                <button
                  onClick={dismissUpdatePrompt}
                  className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Plus tard
                </button>
              </div>
            </div>
            <button
              onClick={dismissUpdatePrompt}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Notice hors ligne */}
      {showOfflineNotice && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 animate-fade-in-up">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <WifiOff className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Mode hors ligne
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleRefresh}
                  className="flex-1 py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  Réessayer
                </button>
                <button
                  onClick={dismissOfflineNotice}
                  className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
            <button
              onClick={dismissOfflineNotice}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAInstaller;
