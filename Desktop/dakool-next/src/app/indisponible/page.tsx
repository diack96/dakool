import type { Metadata } from 'next';
import SiteLocked from '@/components/SiteLocked';

export const metadata: Metadata = {
  title: 'Site indisponible',
  description: 'Ce site est momentanément hors ligne.',
  robots: { index: false, follow: false },
};

export default function Indisponible() {
  return <SiteLocked />;
}
