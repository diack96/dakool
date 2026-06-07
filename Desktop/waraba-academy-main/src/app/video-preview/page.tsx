'use client';

import dynamic from 'next/dynamic';

// Remotion Player est côté client uniquement
const VideoPreviewClient = dynamic(() => import('@/components/video/VideoPreviewClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-xl font-semibold">Chargement de la vidéo...</p>
      </div>
    </div>
  ),
});

export default function VideoPreviewPage() {
  return <VideoPreviewClient />;
}
