const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';

// Organisation éducative
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Waraba Academy',
  alternateName: 'Waraba Academy — Formation Digitale',
  url: siteUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${siteUrl}/waraba-academy-gradient.svg`,
    width: 200,
    height: 60,
  },
  description:
    'Plateforme de formation en ligne dédiée aux apprenants africains. Cours certifiants en Digital, IA, Marketing et Soft Skills.',
  disambiguatingDescription:
    "Waraba Academy est une plateforme e-learning de formation aux compétences numériques (Digital, Intelligence Artificielle, Marketing, Développement Web) destinée aux apprenants d'Afrique francophone. À ne pas confondre avec des académies de beauté ou instituts de cosmétique.",
  foundingDate: '2024',
  founder: {
    '@type': 'Person',
    name: 'Papa Abdou Khader Diack',
    jobTitle: 'Fondateur & CEO',
    sameAs: 'https://linkedin.com/in/papa-abdou-khader-diack',
  },
  areaServed: {
    '@type': 'GeoCircle',
    description: "Afrique de l'Ouest et Afrique francophone",
  },
  sameAs: [
    'https://facebook.com/warabaacademy',
    'https://twitter.com/warabaacademy',
    'https://instagram.com/warabaacademy',
    'https://linkedin.com/company/waraba-academy',
    'https://youtube.com/@warabaacademy',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@waraba-academy.com',
    contactType: 'customer service',
    areaServed: 'AF',
    availableLanguage: 'French',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Formations en ligne',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Course', name: 'Marketing Digital' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Course', name: 'Intelligence Artificielle' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Course', name: 'Développement Web' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Course', name: 'Soft Skills' } },
    ],
  },
};

// WebSite avec SearchAction (active le sitelinks search box dans Google)
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Waraba Academy',
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/courses?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function StructuredDataScript() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
