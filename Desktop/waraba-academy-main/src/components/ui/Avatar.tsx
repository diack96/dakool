'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  variant?: 'initials' | 'dicebear' | 'ui-avatars';
  imageUrl?: string; // URL d'image personnalisée (prioritaire)
}

/**
 * Composant Avatar optimisé
 * - Par défaut: initiales CSS (pas d'appel réseau)
 * - Option dicebear/ui-avatars pour avatars générés
 * - Support d'image personnalisée via imageUrl
 */
export default function Avatar({
  name,
  size = 112,
  className = '',
  backgroundColor,
  textColor = '#ffffff',
  variant = 'initials', // Initiales par défaut (plus performant)
  imageUrl,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Extraire les initiales
  const initials = useMemo(() => {
    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      const firstWord = words[0];
      const lastWord = words[words.length - 1];
      if (firstWord && lastWord) {
        const firstInitial = firstWord[0] || '';
        const lastInitial = lastWord[0] || '';
        return (firstInitial + lastInitial).toUpperCase();
      }
    }
    if (words.length > 0 && words[0]) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, [name]);

  // Générer une couleur de fond cohérente basée sur le nom
  const bgColor = useMemo((): string => {
    if (backgroundColor) return backgroundColor;

    const colors: string[] = [
      '#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B',
      '#8B7355', '#6B4423', '#7B3F00', '#9C661F', '#704214',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length] || '#8B4513';
  }, [name, backgroundColor]);

  // Générer l'URL de l'avatar selon la variante
  const avatarUrl = useMemo(() => {
    // Priorité à l'image personnalisée
    if (imageUrl && !imageError) {
      return imageUrl;
    }

    if (variant === 'dicebear') {
      const seed = encodeURIComponent(name);
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`;
    }
    if (variant === 'ui-avatars') {
      const initialsParam = initials.replace(' ', '+');
      const bgColorParam = bgColor.replace('#', '');
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(initialsParam)}&size=${size}&background=${bgColorParam}&color=${textColor.replace('#', '')}&bold=true`;
    }
    return null;
  }, [name, variant, initials, bgColor, textColor, size, imageUrl, imageError]);

  // Affichage initiales CSS (par défaut, plus performant)
  if ((variant === 'initials' && !imageUrl) || !avatarUrl || imageError) {
    return (
      <div
        className={`rounded-full flex items-center justify-center font-bold select-none ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: bgColor,
          color: textColor,
          fontSize: size * 0.4,
        }}
        aria-label={`Avatar de ${name}`}
      >
        {initials}
      </div>
    );
  }

  // Affichage image (personnalisée ou générée)
  return (
    <div
      className={`rounded-full overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
      }}
      aria-label={`Avatar de ${name}`}
    >
      <Image
        src={avatarUrl}
        alt={`Avatar de ${name}`}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        // Les avatars générés (SVG/petites images) n'ont pas besoin d'optimisation Next.js
        // Les images personnalisées bénéficient de l'optimisation
        unoptimized={variant === 'dicebear' || variant === 'ui-avatars'}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
}
