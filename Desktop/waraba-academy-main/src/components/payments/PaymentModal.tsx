'use client';

import { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/admin/Toast';
import StripePaymentForm from './StripePaymentForm';

interface Course {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  description?: string;
  thumbnail?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onSuccess?: () => void;
}

export default function PaymentModal({ isOpen, onClose, courseId, onSuccess }: PaymentModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);

  // Charger les données du cours
  useEffect(() => {
    if (!isOpen || !courseId) return;

    const fetchCourse = async () => {
      try {
        setIsLoadingCourse(true);
        const response = await fetch(`/api/courses/${courseId}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Cours non trouvé');
        }

        const data = await response.json();
        if (data.success && data.course) {
          setCourse(data.course);
        } else {
          throw new Error(data.error || 'Cours non trouvé');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du cours:', error);
        showError('Erreur lors du chargement du cours', 5000);
      } finally {
        setIsLoadingCourse(false);
      }
    };

    fetchCourse();
  }, [isOpen, courseId, showError]);

  if (!isOpen) return null;

  const handlePaymentSuccess = () => {
    showSuccess('Paiement effectué avec succès !', 3000);
    onClose();

    if (onSuccess) {
      onSuccess();
    } else {
      setTimeout(() => {
        router.push(`/courses/${courseId}/learn`);
      }, 1000);
    }
  };

  const handlePaymentError = (error: string) => {
    showError(error, 5000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fade-in my-8">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-6 h-6" />
        </button>

        {isLoadingCourse ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : !course ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cours non trouvé</h2>
            <p className="text-gray-600 mb-4">Le cours demandé n'existe pas ou a été supprimé.</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : !user ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion requise</h2>
            <p className="text-gray-600 mb-4">Vous devez être connecté pour effectuer un paiement.</p>
            <button
              onClick={() => {
                onClose();
                router.push(`/auth/login?redirect=${encodeURIComponent(`/courses/${courseId}`)}`);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Finalisez votre achat
              </h2>
              <p className="text-gray-600">
                Paiement sécurisé par Stripe
              </p>
            </div>

            {/* Infos du cours */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <BookOpen className="w-10 h-10 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                <p className="text-sm text-gray-500">Accès à vie + Certificat</p>
              </div>
            </div>

            {/* Formulaire Stripe */}
            <StripePaymentForm
              course={course}
              currency="XOF"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />

            {/* Garanties */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Garantie 30 jours</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Accès à vie</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Support inclus</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
