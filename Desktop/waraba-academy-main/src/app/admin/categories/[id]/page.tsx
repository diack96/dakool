'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Redirige vers la page d'édition — la vue détail et l'édition sont la même page
export default function CategoryDetailPage () {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    router.replace(`/admin/categories/${id}/edit`);
  }, [id, router]);

  return null;
}
