'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface AdvancedFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  priceRange: [number, number];
  durationRange: [number, number];
  sortBy: 'popular' | 'newest' | 'rating' | 'price';
  onPriceRangeChange: (range: [number, number]) => void;
  onDurationRangeChange: (range: [number, number]) => void;
  onSortChange: (sort: 'popular' | 'newest' | 'rating' | 'price') => void;
}

const MIN_PRICE = 0;
const MAX_PRICE = 100000;
const MIN_DURATION = 0; // minutes
const MAX_DURATION = 1000; // minutes (environ 16h)

const SORT_OPTIONS = [
  { value: 'popular', label: 'Popularité' },
  { value: 'newest', label: 'Nouveautés' },
  { value: 'rating', label: 'Note' },
  { value: 'price', label: 'Prix' },
] as const;

export default function AdvancedFiltersPanel({
  isOpen,
  onClose,
  priceRange,
  durationRange,
  sortBy,
  onPriceRangeChange,
  onDurationRangeChange,
  onSortChange,
}: AdvancedFiltersPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fermer avec Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Empêcher le scroll du body quand le panneau est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const focusableElements = panelRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
  };

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40 lg:bg-black/30 transition-opacity"
        aria-hidden="true"
      />

      {/* Panel - Bottom Sheet (Mobile) / Side Panel (Desktop) */}
      <div
        ref={panelRef}
        className="fixed z-50 bg-white shadow-2xl lg:right-0 lg:top-0 lg:h-full lg:w-96 lg:rounded-l-2xl bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl flex flex-col animate-slide-in-up lg:animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-labelledby="advanced-filters-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="advanced-filters-title" className="text-xl font-bold text-gray-900">
            Filtres avancés
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Fermer les filtres avancés"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Prix */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Prix
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={1000}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const newMin = Number(e.target.value);
                    if (newMin <= priceRange[1]) {
                      onPriceRangeChange([newMin, priceRange[1]]);
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  aria-label="Prix minimum"
                />
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={1000}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const newMax = Number(e.target.value);
                    if (newMax >= priceRange[0]) {
                      onPriceRangeChange([priceRange[0], newMax]);
                    }
                  }}
                  className="absolute top-0 w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-blue-500"
                  aria-label="Prix maximum"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={1000}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const newMin = Number(e.target.value);
                    if (newMin >= MIN_PRICE && newMin <= priceRange[1]) {
                      onPriceRangeChange([newMin, priceRange[1]]);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Min"
                  aria-label="Prix minimum"
                />
                <input
                  type="number"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={1000}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const newMax = Number(e.target.value);
                    if (newMax >= priceRange[0] && newMax <= MAX_PRICE) {
                      onPriceRangeChange([priceRange[0], newMax]);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Max"
                  aria-label="Prix maximum"
                />
              </div>
            </div>
          </div>

          {/* Durée */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Durée
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{formatDuration(durationRange[0])}</span>
                <span>{formatDuration(durationRange[1])}</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={MIN_DURATION}
                  max={MAX_DURATION}
                  step={15}
                  value={durationRange[0]}
                  onChange={(e) => {
                    const newMin = Number(e.target.value);
                    if (newMin <= durationRange[1]) {
                      onDurationRangeChange([newMin, durationRange[1]]);
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  aria-label="Durée minimum"
                />
                <input
                  type="range"
                  min={MIN_DURATION}
                  max={MAX_DURATION}
                  step={15}
                  value={durationRange[1]}
                  onChange={(e) => {
                    const newMax = Number(e.target.value);
                    if (newMax >= durationRange[0]) {
                      onDurationRangeChange([durationRange[0], newMax]);
                    }
                  }}
                  className="absolute top-0 w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-blue-500"
                  aria-label="Durée maximum"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={MIN_DURATION}
                  max={MAX_DURATION}
                  step={15}
                  value={durationRange[0]}
                  onChange={(e) => {
                    const newMin = Number(e.target.value);
                    if (newMin >= MIN_DURATION && newMin <= durationRange[1]) {
                      onDurationRangeChange([newMin, durationRange[1]]);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Min (min)"
                  aria-label="Durée minimum en minutes"
                />
                <input
                  type="number"
                  min={MIN_DURATION}
                  max={MAX_DURATION}
                  step={15}
                  value={durationRange[1]}
                  onChange={(e) => {
                    const newMax = Number(e.target.value);
                    if (newMax >= durationRange[0] && newMax <= MAX_DURATION) {
                      onDurationRangeChange([durationRange[0], newMax]);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Max (min)"
                  aria-label="Durée maximum en minutes"
                />
              </div>
            </div>
          </div>

          {/* Trier par */}
          <div>
            <label htmlFor="sort-select" className="block text-sm font-semibold text-gray-900 mb-4">
              Trier par
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as typeof sortBy)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              aria-label="Trier les cours par"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Appliquer les filtres
          </button>
        </div>
      </div>
    </>
  );
}

