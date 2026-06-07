'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(() => import('react-player') as any, {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <Loader2 className="w-12 h-12 text-white animate-spin" />
    </div>
  ),
}) as any;

interface VideoPlayerProps {
  url: string;
  title?: string;
  onProgress?: (progress: { played: number; playedSeconds: number }) => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  startTime?: number;
  className?: string;
}

const PLAYBACK_SPEED_KEY = 'waraba-playback-speed';

function getStoredPlaybackSpeed(): number {
  if (typeof window === 'undefined') return 1;
  const stored = localStorage.getItem(PLAYBACK_SPEED_KEY);
  if (stored) {
    const parsed = parseFloat(stored);
    if ([0.5, 0.75, 1, 1.25, 1.5, 2].includes(parsed)) return parsed;
  }
  return 1;
}

export default function VideoPlayer({
  url,
  title,
  onProgress,
  onEnded,
  onPlay,
  onPause,
  startTime = 0,
  className = '',
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted playback speed
  useEffect(() => {
    setPlaybackRate(getStoredPlaybackSpeed());
  }, []);

  // Seek to startTime when url changes
  useEffect(() => {
    if (startTime > 0 && playerRef.current) {
      playerRef.current.seekTo(startTime, 'seconds');
    }
  }, [startTime, url]);

  // Reset error on url change
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [url]);

  // Auto-hide controls
  const hideControls = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    if (playing) hideControls();
    else setShowControls(true);
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [playing, hideControls]);

  const handlePlay = useCallback(() => {
    setPlaying(true);
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setPlaying(false);
    onPause?.();
  }, [onPause]);

  const handleProgress = useCallback((state: { played: number; playedSeconds: number; loaded: number }) => {
    if (!seeking) {
      setPlayed(state.played);
      setBuffered(state.loaded);
      onProgress?.({ played: state.played, playedSeconds: state.playedSeconds });
    }
  }, [seeking, onProgress]);

  const handleSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
    setSeeking(true);
  }, []);

  const handleSeekMouseUp = useCallback(() => {
    // Utilise le state `played` directement — fonctionne pour Mouse ET Touch
    // (le cast MouseEvent → as any sur onTouchEnd n'est plus nécessaire)
    setSeeking(false);
    playerRef.current?.seekTo(played);
  }, [played]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => setMuted(m => !m), []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  const skipBackward = useCallback(() => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(0, currentTime - 10), 'seconds');
    }
  }, []);

  const skipForward = useCallback(() => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.min(duration, currentTime + 10), 'seconds');
    }
  }, [duration]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setRetryKey(k => k + 1);
  }, []);

  const changePlaybackRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    localStorage.setItem(PLAYBACK_SPEED_KEY, String(rate));
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    hideControls();
  }, [hideControls]);

  const handleTouchStart = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 5000);
  }, [playing]);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    onEnded?.();
  }, [onEnded]);

  const handleReady = useCallback(() => setIsLoading(false), []);
  const handleError = useCallback(() => { setIsLoading(false); setHasError(true); }, []);
  const handleBuffer = useCallback(() => setIsLoading(true), []);
  const handleBufferEnd = useCallback(() => setIsLoading(false), []);

  const handleMouseLeave = useCallback(() => {
    if (playing) hideControls();
  }, [playing, hideControls]);

  // Error state
  if (hasError) {
    return (
      <div
        ref={containerRef}
        className={`relative bg-black w-full ${className}`}
        style={{ paddingTop: '56.25%', minHeight: '200px' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">Impossible de lire la vidéo</p>
            <p className="text-white/50 text-sm mb-4">
              Vérifiez votre connexion internet ou réessayez plus tard.
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black w-full ${className}`}
      style={{ paddingTop: '56.25%', minHeight: '200px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      <div className="absolute top-0 left-0 w-full h-full">
        <ReactPlayer
          key={retryKey}
          ref={(ref: any) => { playerRef.current = ref; }}
          url={url}
          playing={playing}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          width="100%"
          height="100%"
          controls={false}
          progressInterval={500}
          onPlay={handlePlay}
          onPause={handlePause}
          onProgress={handleProgress}
          onDuration={setDuration}
          onEnded={handleEnded}
          onReady={handleReady}
          onError={handleError}
          onBuffer={handleBuffer}
          onBufferEnd={handleBufferEnd}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
              },
            },
            youtube: {
              playerVars: {
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                disablekb: 1,
                iv_load_policy: 3,
                fs: 0,
                origin: typeof window !== 'undefined' ? window.location.origin : '',
              },
            },
          }}
        />

        {/* Overlay transparent — bloque clic droit sur l'iframe YouTube */}
        <div
          className="absolute inset-0 z-[5]"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        )}

        {/* Custom controls */}
        {showControls && !isLoading && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20">
            {title && (
              <div className="absolute top-4 left-4 right-4">
                <h3 className="text-white text-lg font-semibold">{title}</h3>
              </div>
            )}

            {/* Center controls */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={skipBackward}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  title="Reculer de 10s"
                >
                  <SkipBack className="w-6 h-6" />
                </button>
                <button
                  onClick={playing ? handlePause : handlePlay}
                  className="p-4 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  {playing ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
                <button
                  onClick={skipForward}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  title="Avancer de 10s"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
              {/* Progress bar with buffer */}
              <div className="w-full relative">
                {/* Buffer bar */}
                <div className="absolute top-0 left-0 w-full h-2 rounded-lg overflow-hidden pointer-events-none">
                  <div
                    className="h-full bg-white/20 transition-all"
                    style={{ width: `${buffered * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step="any"
                  value={played}
                  onChange={handleSeekChange}
                  onMouseUp={handleSeekMouseUp}
                  onTouchEnd={handleSeekMouseUp}
                  className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-blue-600 relative z-10"
                />
                <div className="flex items-center justify-between text-white text-xs mt-1">
                  <span>{formatTime(played * duration)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Secondary controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={playing ? handlePause : handlePlay}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step="any"
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <select
                    value={playbackRate}
                    onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                    className="bg-white/20 text-white rounded px-2 py-1 text-sm border-none outline-none"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-blue-400 transition-colors"
                    title="Plein ecran"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
