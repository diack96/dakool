import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    // SECURITY NOTE: 'unsafe-inline' conservé dans script-src pour la compatibilité
    // avec les scripts d'hydratation injectés par Next.js (App Router).
    // TODO: Implémenter une CSP basée sur des nonces (middleware → nonce header →
    //       layout.tsx) pour pouvoir supprimer définitivement 'unsafe-inline'.
    // Mitigation actuelle : tout contenu HTML utilisateur est sanitisé côté serveur
    // via sanitize-html avant tout rendu SSR (cf. src/lib/utils/sanitize.ts).
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // vercel.live requis en prod (Vercel injecte feedback.js même hors preview)
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
      "font-src 'self' https://fonts.gstatic.com https://vercel.live",
      "img-src 'self' data: blob: https:",
      // wave.com ajouté pour le checkout Wave (connect-src = appels fetch JS vers Wave)
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://api.wave.com https://vercel.live wss://ws-us3.pusher.com",
      // wave.com ajouté pour la redirection/iframe de paiement Wave
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://youtube.com https://wave.com https://*.wave.com https://vercel.live",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join('; ')
  },
];

const nextConfig: NextConfig = {
  // Ne pas utiliser 'standalone' sur Vercel - Vercel gère le build output lui-même
  // 'standalone' est conçu pour le self-hosting (Docker, Node.js)
  // et peut casser le routing des API routes sur Vercel
  trailingSlash: false,

  // PDFKit and sanitize-html use native Node.js modules — must not be bundled by webpack
  serverExternalPackages: ['pdfkit', 'sanitize-html', 'openai'],

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'hwsaarxusvjnmgtxfoou.supabase.co',
        pathname: '/**',
      },
      // Avatars OAuth Google / GitHub / Dicebear / UI-Avatars
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'api.dicebear.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ui-avatars.com', pathname: '/**' },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint retiré
  // eslint: { ignoreDuringBuilds: true },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-underline',
      '@tiptap/extension-link',
      '@tiptap/extension-image',
      '@tiptap/extension-placeholder',
      'react-chartjs-2',
    ],
    scrollRestoration: true,
  },


  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        util: false,
      };
    }
    // Exclure du bundling côté client les packages Node.js uniquement
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push('stripe');
      config.externals.push('sanitize-html');
    }
    // Supprimer les warnings Edge Runtime provenant de @supabase/ssr (problème upstream connu)
    // @supabase/ssr inclut @supabase/supabase-js qui utilise process.version/process.versions
    // mais ces chemins ne sont pas exécutés dans le middleware Edge.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/@supabase\/(supabase-js|realtime-js)/,
        message: /A Node\.js API is used/,
      },
    ];
    return config;
  },

  compiler: {
    // Supprimer log/debug/info/warn en prod, mais conserver console.error
    // pour que les erreurs remontent dans les logs Vercel (monitoring).
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error'] }
      : false,
  },

  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  reactStrictMode: true,

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Turbopack est le défaut en Next.js 16 - config vide requise quand webpack config est présente
  turbopack: {},
};

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(nextConfig);
