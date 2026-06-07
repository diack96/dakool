'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { getPlaceholderImageUrl, isValidImageUrl } from '@/lib/utils/imageUtils';

interface SafeImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string | null | undefined;
  alt: string;
  fallbackText?: string;
}

export default function SafeImage({ src, alt, fallbackText, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    isValidImageUrl(src) ? src! : getPlaceholderImageUrl(fallbackText || alt),
  );

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(getPlaceholderImageUrl(fallbackText || alt))}
      unoptimized={!isValidImageUrl(imgSrc)}
    />
  );
}
