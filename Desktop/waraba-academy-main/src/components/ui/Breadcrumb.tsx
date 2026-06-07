'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { createBreadcrumbSchema } from '@/components/seo/StructuredData';
import StructuredData from '@/components/seo/StructuredData';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  // Ajouter la page d'accueil au début si elle n'est pas déjà là
  const allItems: BreadcrumbItem[] = items[0]?.href === '/' 
    ? items 
    : [{ name: 'Accueil', href: '/' }, ...items];

  // Créer le schema pour les données structurées
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';
  const schemaItems = allItems.map(item => ({
    name: item.name,
    url: item.href.startsWith('http') ? item.href : `${siteUrl}${item.href}`,
  }));

  return (
    <>
      <StructuredData 
        type="breadcrumb" 
        data={createBreadcrumbSchema(schemaItems)} 
      />
      <nav 
        className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4"
        aria-label="Fil d'Ariane"
      >
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          
          return (
            <span key={item.href} className="flex items-center">
              {index === 0 ? (
                <Link
                  href={item.href}
                  className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label={item.name}
                >
                  <Home className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                  {isLast ? (
                    <span className="font-medium text-gray-900 dark:text-gray-100" aria-current="page">
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  )}
                </>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}

