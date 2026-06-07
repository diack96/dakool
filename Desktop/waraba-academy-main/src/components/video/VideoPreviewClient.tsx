'use client';

import { Player } from '@remotion/player';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { AdVideo } = require('../../../remotion/AdVideo') as { AdVideo: React.ComponentType<Record<string, never>> };

export default function VideoPreviewClient() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Waraba Academy <span className="text-orange-500">— Vidéo Publicitaire</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Aperçu interactif • 30 secondes • 1920×1080
        </p>
      </div>

      {/* Player */}
      <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/40 border border-white/10">
        <Player
          component={AdVideo}
          durationInFrames={900}
          fps={30}
          compositionWidth={1920}
          compositionHeight={1080}
          style={{ width: '100%', aspectRatio: '16/9' }}
          controls
          loop
          autoPlay={false}
          showVolumeControls={false}
          clickToPlay
          doubleClickToFullscreen
        />
      </div>

      {/* Métadonnées */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl">
        {[
          { label: 'Durée', value: '30 secondes' },
          { label: 'Résolution', value: '1920 × 1080' },
          { label: 'Fréquence', value: '30 fps' },
          { label: 'Scènes', value: '6 séquences' },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
          >
            <div className="text-white font-bold text-lg">{item.value}</div>
            <div className="text-gray-500 text-sm mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Export hint */}
      <div className="mt-8 bg-orange-900/20 border border-orange-500/30 rounded-xl p-5 w-full max-w-5xl">
        <p className="text-orange-300 font-semibold mb-2">
          Pour exporter la vidéo en MP4 :
        </p>
        <code className="text-orange-200 text-sm font-mono bg-black/30 px-3 py-2 rounded-lg block">
          npm run video:render
        </code>
        <p className="text-gray-500 text-sm mt-2">
          Le fichier sera généré dans{' '}
          <code className="text-gray-400">out/waraba-ad.mp4</code>
        </p>
      </div>
    </div>
  );
}
