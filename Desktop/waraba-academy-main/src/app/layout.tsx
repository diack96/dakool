import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/admin/Toast';
import ConditionalHeader from '@/components/layout/ConditionalHeader';
import ConditionalFooter from '@/components/layout/ConditionalFooter';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import PWAInstaller from '@/components/ui/PWAInstaller';
import { defaultMetadata } from '@/lib/seo';
import StructuredDataScript from '@/components/seo/StructuredDataScript';
import GoogleAnalyticsWrapper from '@/components/analytics/GoogleAnalyticsWrapper';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

// Police locale (Geist) — substitut à Plus Jakarta Sans pour les builds
// sans accès réseau. Même CSS variable conservée pour compatibilité.
const plusJakartaSans = localFont({
  src: [
    { path: '../../public/fonts/geist-latin-ext.woff2', weight: '300 800' },
    { path: '../../public/fonts/geist-latin.woff2',     weight: '300 800' },
  ],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning className={plusJakartaSans.variable}>
      <head>
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Waraba Academy" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <StructuredDataScript />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                const isDark = theme === 'dark';
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <GoogleAnalyticsWrapper />
        <SpeedInsights />
        <Analytics />
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <ConditionalHeader />
              <main id="main-content" className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                {children}
              </main>
              <ConditionalFooter />
              <WhatsAppButton />
              <PWAInstaller />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

