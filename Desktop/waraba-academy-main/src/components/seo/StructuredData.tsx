interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': string;
    telephone?: string;
    contactType: string;
    areaServed: string;
  };
}

interface CourseSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  provider: {
    '@type': string;
    name: string;
    url: string;
  };
  courseCode?: string;
  educationalCredentialAwarded?: string;
  image?: string;
  url?: string;
}

interface BreadcrumbSchema {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
}

interface StructuredDataProps {
  type: 'organization' | 'course' | 'breadcrumb';
  data: OrganizationSchema | CourseSchema | BreadcrumbSchema;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      id={`structured-data-${type}`}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Helpers pour créer les schémas
export function createOrganizationSchema(): OrganizationSchema {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Waraba Academy',
    url: siteUrl,
    logo: `${siteUrl}/waraba-academy-gradient.svg`,
    description: 'Formez-vous aux compétences les plus demandées en 2025. Rejoignez 2K+ apprenants qui transforment leur carrière avec nos formations en Digital, IA et Soft Skills.',
    sameAs: [
      // Ajoutez vos réseaux sociaux ici
      // 'https://twitter.com/warabaacademy',
      // 'https://facebook.com/warabaacademy',
      // 'https://linkedin.com/company/warabaacademy',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      areaServed: 'AF', // Afrique
    },
  };
}

export function createCourseSchema(course: {
  title: string;
  description: string;
  id: string;
  image?: string;
  price?: number;
  slug?: string;
  instructor?: {
    firstName?: string;
    lastName?: string;
  };
  level?: string;
  duration?: number;
  rating?: number;
}): CourseSchema {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';
  const courseUrl = `${siteUrl}/courses/${course.slug || course.id}`;
  
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'Waraba Academy',
      url: siteUrl,
    },
    courseCode: course.id,
    educationalCredentialAwarded: 'Certificate',
    image: course.image || `${siteUrl}/og-image.jpg`,
    url: courseUrl,
  };

  // Ajouter des propriétés optionnelles si disponibles
  if (course.instructor) {
    schema.instructor = {
      '@type': 'Person',
      name: `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() || 'Expert Waraba Academy',
    };
  }

  if (course.level) {
    schema.coursePrerequisites = {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: course.level,
    };
  }

  if (course.duration) {
    schema.timeRequired = `PT${Math.round(course.duration)}M`;
  }

  if (course.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: course.rating.toString(),
      bestRating: '5',
      worstRating: '1',
    };
  }

  if (course.price !== undefined && course.price > 0) {
    schema.offers = {
      '@type': 'Offer',
      price: course.price.toString(),
      priceCurrency: 'XOF',
      availability: 'https://schema.org/InStock',
    };
  }

  return schema;
}

export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

