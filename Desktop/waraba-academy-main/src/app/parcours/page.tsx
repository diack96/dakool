import { Metadata } from 'next';
import LearningPathsClient from './_Client';

export const metadata: Metadata = {
  title: 'Parcours d\'apprentissage | Waraba Academy',
  description: 'Suivez un parcours structuré pour atteindre vos objectifs avec Waraba Academy.',
};

export default function LearningPathsPage() {
  return <LearningPathsClient />;
}
