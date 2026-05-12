import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Waraba Digital — Votre Partenaire Numérique en Afrique de l'Ouest",
  description:
    "Waraba Digital accompagne les entreprises et institutions dans leur transformation numérique : développement web & mobile, design UX/UI, e-learning, marketing digital et consulting stratégique.",
  keywords: [
    "développement web Afrique",
    "agence digitale Sénégal",
    "transformation numérique",
    "e-learning",
    "marketing digital Dakar",
    "Waraba Digital",
  ],
  authors: [{ name: "Waraba Digital" }],
  creator: "Waraba Digital",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://waraba-digital.com"
  ),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    title: "Waraba Digital — Votre Partenaire Numérique en Afrique de l'Ouest",
    description:
      "Agence digitale spécialisée dans le développement web, e-learning et la transformation numérique en Afrique de l'Ouest.",
    siteName: "Waraba Digital",
  },
  twitter: {
    card: "summary_large_image",
    title: "Waraba Digital",
    description:
      "Votre partenaire numérique pour la transformation digitale en Afrique de l'Ouest.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-main text-text-main font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
