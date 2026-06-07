'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

interface LazyLoaderProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  placeholder?: ReactNode;
  className?: string;
  onLoad?: () => void;
}

const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  placeholder,
  className = '',
  onLoad,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          if (onLoad) onLoad();
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, isVisible, onLoad]);

  useEffect(() => {
    if (isVisible && !isLoaded) {
      setIsLoading(true);

      // Simuler un délai de chargement pour les composants lourds
      const timer = setTimeout(() => {
        setIsLoaded(true);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible, isLoaded]);

  const defaultPlaceholder = (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {!isVisible ? (
        placeholder || defaultPlaceholder
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default LazyLoader;
