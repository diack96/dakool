import type { Metadata } from 'next';
import { getCourseForMetadata } from '@/lib/course-server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseForMetadata(id);

  return {
    title: course ? `${course.title} — Apprendre` : 'Formation',
    robots: { index: false, follow: false },
  };
}

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
