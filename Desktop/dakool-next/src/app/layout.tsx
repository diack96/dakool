import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { themeInitScript } from '@/components/ThemeToggle';

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dakool.com'),
  title: {
    default: 'DAKOOL Site Officiel | Équipements de sport',
    template: '%s | DAKOOL',
  },
  description:
    'Équipementier sportif. Maillots, chaussures, ballons et équipements pour les clubs, les joueurs et les staffs. Livraison internationale.',
  keywords: [
    'équipementier sportif',
    'maillot de football',
    'DAKOOL',
    'chaussures de football',
    'équipement de club',
  ],
  authors: [{ name: 'DAKOOL' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'DAKOOL',
    title: 'DAKOOL Site Officiel | Équipements de sport',
    description: 'Équipementier sportif. Fait pour le terrain.',
    images: [{ url: '/dakool-logo.png', width: 400, height: 191, alt: 'DAKOOL' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DAKOOL Site Officiel | Équipements de sport',
    description: 'Équipementier sportif. Fait pour le terrain.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  /* Le navigateur teinte sa barre selon le thème actif. */
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bebas.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Pose le thème avant peinture : sans ça la page clignoterait en
            clair avant de basculer en sombre. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-bg text-fg">
        {/* Sans JavaScript, les blocs animés au scroll doivent rester visibles. */}
        <noscript>
          <style>{'[data-reveal]{opacity:1!important;transform:none!important}'}</style>
        </noscript>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-inverse focus:px-5 focus:py-3 focus:text-xs focus:font-black focus:uppercase focus:tracking-cta focus:text-on-inverse"
        >
          Aller au contenu
        </a>
        <CartProvider>
          <Navbar />
          <CartSidebar />
          <main id="contenu">{children}</main>
          <Footer />
          <FloatingWhatsApp />
        </CartProvider>
      </body>
    </html>
  );
}
