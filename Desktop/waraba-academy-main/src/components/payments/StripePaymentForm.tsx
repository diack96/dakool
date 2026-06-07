'use client';

import { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, CreditCard, Lock } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface Course {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  description?: string;
  thumbnail?: string;
}

interface StripePaymentFormProps {
  course: Course;
  currency?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function CheckoutForm({ course, currency, onError }: Omit<StripePaymentFormProps, 'onSuccess'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/courses/${course.id}/learn`,
        },
      });

      // If we reach here, there was an error (successful payments redirect)
      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          onError(error.message || 'Erreur de validation de la carte');
        } else {
          onError('Une erreur inattendue est survenue');
        }
      }
    } catch {
      onError('Erreur lors du traitement du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total à payer</span>
          <span className="text-2xl font-bold text-gray-900">
            {course.price === 0 ? 'Gratuit' : `${course.price.toLocaleString()} ${currency}`}
          </span>
        </div>
      </div>

      <PaymentElement />

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Payer {course.price.toLocaleString()} {currency}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Lock className="w-3 h-3" />
        <span>Paiement sécurisé par Stripe</span>
      </div>
    </form>
  );
}

export default function StripePaymentForm({
  course,
  currency = 'XOF',
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initiated, setInitiated] = useState(false);

  const initiatePayment = useCallback(async () => {
    if (course.price === 0) {
      onSuccess();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          courseId: course.id,
          currency: currency.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }

      if (!data.clientSecret) {
        throw new Error('Configuration de paiement incomplète');
      }

      setClientSecret(data.clientSecret);
      setInitiated(true);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erreur de paiement');
    } finally {
      setIsLoading(false);
    }
  }, [course.id, course.price, currency, onSuccess, onError]);

  // Show initiation button before payment intent is created
  if (!initiated || !clientSecret) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total à payer</span>
            <span className="text-2xl font-bold text-gray-900">
              {course.price === 0 ? 'Gratuit' : `${course.price.toLocaleString()} ${currency}`}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={initiatePayment}
          disabled={isLoading}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Préparation du paiement...
            </>
          ) : course.price === 0 ? (
            <>
              <CreditCard className="w-5 h-5" />
              S&apos;inscrire gratuitement
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Payer {course.price.toLocaleString()} {currency}
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>Paiement sécurisé par Stripe</span>
        </div>
      </div>
    );
  }

  // Render Stripe Elements with the clientSecret
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb',
            borderRadius: '8px',
          },
        },
      }}
    >
      <CheckoutForm
        course={course}
        currency={currency}
        onError={onError}
      />
    </Elements>
  );
}
