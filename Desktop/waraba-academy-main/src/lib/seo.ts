import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://waraba-academy.com';
const siteName = 'Waraba Academy';
const defaultTitle = `${siteName} — Formation en ligne Digital, IA & Soft Skills en Afrique`;
const defaultDescription =
  'Plateforme de formation en ligne pour l\'Afrique francophone. 2 000+ apprenants au Sénégal, Côte d\'Ivoire, Mali et UEMOA se forment en Digital, IA et Soft Skills. Certifiants, accessibles, paiement Orange Money & Wave.';

const defaultOgImage = `${siteUrl}/Hero-students.jpg`;

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  keywords: [
    // Mots-clés principaux (longue traîne Afrique)
    'formation en ligne Afrique',
    'cours en ligne Afrique de l\'Ouest',
    'formation digitale Sénégal',
    'e-learning Afrique francophone',
    'formation professionnelle en ligne',
    'formation en ligne Côte d\'Ivoire',
    'formation en ligne Mali',
    'formation en ligne UEMOA',
    'compétences numériques Afrique',
    'employabilité digitale Afrique',
    // Domaines
    'formation intelligence artificielle',
    'cours marketing digital',
    'développement web formation',
    'soft skills formation',
    'entrepreneuriat digital Afrique',
    'freelancing formation Afrique',
    'community management formation',
    // Qualificatifs
    'cours certifiants',
    'certificat professionnel en ligne',
    'formation avec certificat',
    'apprendre en ligne',
    // Paiement local
    'paiement Orange Money cours',
    'formation Wave Sénégal',
    'formation MTN MoMo',
    // Marque
    'Waraba Academy',
    'waraba academy formation',
    'Papa Abdou Khader Diack',
  ],
  authors: [{ name: 'Waraba Academy', url: siteUrl }],
  creator: 'Waraba Academy',
  publisher: 'Waraba Academy',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Waraba Academy — Formation en ligne' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultOgImage],
    creator: '@warabaacademy',
    site: '@warabaacademy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
  category: 'education',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': siteName,
    'theme-color': '#2563eb',
  },
};

export function generateCourseMetadata(course: {
  title: string;
  description?: string | null;
  image?: string | null;
  slug: string;
  instructor?: string;
  price?: number;
  currency?: string;
  level?: string;
}): Metadata {
  const courseUrl = `${siteUrl}/courses/${course.slug}`;
  const courseDescription =
    course.description
      ? course.description.substring(0, 160)
      : `Découvrez la formation "${course.title}" sur ${siteName}. Cours certifiant, accessible depuis toute l'Afrique.`;
  const courseImage = course.image || defaultOgImage;

  return {
    title: course.title,
    description: courseDescription,
    openGraph: {
      type: 'article',
      url: courseUrl,
      title: `${course.title} | ${siteName}`,
      description: courseDescription,
      images: [{ url: courseImage, width: 1200, height: 630, alt: course.title }],
      siteName,
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${course.title} | ${siteName}`,
      description: courseDescription,
      images: [courseImage],
      creator: '@warabaacademy',
    },
    alternates: { canonical: courseUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generatePageMetadata(
  title: string,
  description: string,
  path: string,
  image?: string
): Metadata {
  const pageUrl = `${siteUrl}${path}`;
  const pageImage = image || defaultOgImage;
  // Tronquer la description à 160 caractères max pour les SERPs
  const truncatedDesc = description.length > 160 ? description.substring(0, 157) + '…' : description;

  return {
    title,
    description: truncatedDesc,
    openGraph: {
      type: 'website',
      url: pageUrl,
      title: `${title} | ${siteName}`,
      description: truncatedDesc,
      images: [{ url: pageImage, width: 1200, height: 630, alt: title }],
      siteName,
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteName}`,
      description: truncatedDesc,
      images: [pageImage],
      creator: '@warabaacademy',
    },
    alternates: { canonical: pageUrl },
  };
}
