'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, Users, Star, Zap } from 'lucide-react';

interface PerformanceNotificationItem {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  icon: React.ReactNode;
  showTime: number; // Temps d'affichage en ms
  priority: 'low' | 'medium' | 'high';
}

const PerformanceNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<PerformanceNotificationItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simuler l'apparition de notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% de chance d'apparition
        addRandomNotification();
      }
    }, 10000); // Toutes les 10 secondes

    return () => clearInterval(interval);
  }, []);

  const addRandomNotification = () => {
    const notificationTypes: PerformanceNotificationItem[] = [
      {
        id: Date.now().toString(),
        type: 'success',
        title: '🎉 Nouveau succès !',
        message: 'Fatoumata vient de terminer son cours React.js',
        icon: <Star className="w-5 h-5" />,
        showTime: 5000,
        priority: 'medium',
      },
      {
        id: Date.now().toString(),
        type: 'info',
        title: '📈 Statistiques en temps réel',
        message: '87% de nos étudiants trouvent un emploi dans les 6 mois',
        icon: <TrendingUp className="w-5 h-5" />,
        showTime: 4000,
        priority: 'low',
      },
      {
        id: Date.now().toString(),
        type: 'success',
        title: '🚀 Badge débloqué !',
        message: 'Kofi a obtenu le badge "Streak de 7 jours"',
        icon: <Zap className="w-5 h-5" />,
        showTime: 6000,
        priority: 'medium',
      },
      {
        id: Date.now().toString(),
        type: 'info',
        title: '👥 Communauté active',
        message: '25 nouveaux étudiants ont rejoint cette semaine',
        icon: <Users className="w-5 h-5" />,
        showTime: 4500,
        priority: 'low',
      },
    ];

    const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    if (!randomNotification) return;
    randomNotification.id = Date.now().toString();

    setNotifications(prev => [...prev, randomNotification]);
    setIsVisible(true);

    // Auto-hide après le temps spécifié
    setTimeout(() => {
      removeNotification(randomNotification.id);
    }, randomNotification.showTime);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setIsVisible(false);
    }
  };

  const getNotificationStyles = (type: string, priority: string) => {
    const baseStyles = 'p-4 rounded-xl shadow-lg border-l-4 transform transition-all duration-300';

    const typeStyles = {
      success: 'bg-green-50 border-green-500 text-green-800',
      info: 'bg-blue-50 border-blue-500 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    };

    const priorityStyles = {
      low: 'opacity-90',
      medium: 'opacity-95',
      high: 'opacity-100',
    };

    return `${baseStyles} ${typeStyles[type as keyof typeof typeStyles]} ${priorityStyles[priority as keyof typeof priorityStyles]}`;
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationStyles(notification.type, notification.priority)} animate-fade-in-up`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {notification.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">
                {notification.title}
              </h4>
              <p className="text-sm">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PerformanceNotification;
