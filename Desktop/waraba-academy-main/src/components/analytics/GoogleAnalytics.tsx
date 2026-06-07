'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Déclaration des types pour Google Analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-2RYY0FN8QW';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      console.warn('Google Analytics ID not configured');
      return;
    }

    // Charger gtag.js
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    // Initialiser gtag
    if (!window.dataLayer) {
      window.dataLayer = [];
    }
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pathname + searchParams.toString(),
    });

    return () => {
      // Cleanup si nécessaire
    };
  }, [pathname, searchParams]);

  // Track page views on route change
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return null;
}

// Helper function pour tracker les événements
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Helper function pour tracker les conversions
export function trackConversion(eventName: string, value?: number, currency = 'XOF') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      value: value,
      currency: currency,
    });
  }
}

// Événements de conversion prédéfinis
export const CONVERSION_EVENTS = {
  SIGNUP: 'sign_up',
  COURSE_ENROLLMENT: 'course_enrollment',
  COURSE_PURCHASE: 'course_purchase',
  COURSE_COMPLETION: 'course_completion',
  GUIDE_DOWNLOAD: 'guide_download',
  CONTACT_FORM: 'contact_form',
} as const;

