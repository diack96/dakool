import { Metadata } from 'next';
import LearningPathDetailClient from './_Client';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://waraba-academy.com';
    const res = await fetch(`${baseUrl}/api/learning-paths/${slug}`, { cache: 'no-store' });
    if (!res.ok) return { title: 'Parcours | Waraba Academy' };
    const data = await res.json();
    return {
      title: `${data.path?.title} | Waraba Academy`,
      description: data.path?.short_description || data.path?.description || '',
    };
  } catch {
    return { title: 'Parcours | Waraba Academy' };
  }
}

export default async function LearningPathDetailPage({ params }: Props) {
  const { slug } = await params;
  return <LearningPathDetailClient slug={slug} />;
}
