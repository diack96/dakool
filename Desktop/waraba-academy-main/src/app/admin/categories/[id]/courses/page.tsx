'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Redirige vers la liste des cours filtrée par catégorie
export default function CategoryCoursesPage () {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    router.replace(`/admin/courses?category=${id}`);
  }, [id, router]);

  return null;
}
