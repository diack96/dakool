import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

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
  metadataBase: new URL('https://dakool.sn'),
  title: {
    default: "DAKOOL — L'Équipementier du Lion",
    template: '%s — DAKOOL',
  },
  description:
    "La première marque d'équipements sportifs 100% sénégalaise. Maillots, chaussures, ballons et équipements pour les clubs et les joueurs. Né à Dakar, fait pour le terrain.",
  keywords: [
    'équipementier sportif Sénégal',
    'maillot football Sénégal',
    'DAKOOL',
    'équipement sportif Dakar',
    'sponsoring football sénégalais',
  ],
  authors: [{ name: 'DAKOOL' }],
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    siteName: 'DAKOOL',
    title: "DAKOOL — L'Équipementier du Lion",
    description:
      "La première marque d'équipements sportifs 100% sénégalaise. Né à Dakar, fait pour le terrain.",
    images: [{ url: '/dakool-logo.png', width: 400, height: 191, alt: 'DAKOOL' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "DAKOOL — L'Équipementier du Lion",
    description: "La première marque d'équipements sportifs 100% sénégalaise.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bebas.variable} ${inter.variable}`}>
      <body className="bg-ink text-white">
        {/* Sans JavaScript, les blocs animés au scroll doivent rester visibles. */}
        <noscript>
          <style>{'[data-reveal]{opacity:1!important;transform:none!important}'}</style>
        </noscript>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:px-5 focus:py-3 focus:text-xs focus:font-black focus:uppercase focus:tracking-cta focus:text-black"
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
