// @ts-nocheck
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 14, stiffness: 80 }, from: 0.4, to: 1 });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const taglineOpacity = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: 'clamp' });
  const taglineY = interpolate(frame, [30, 55], [20, 0], { extrapolateRight: 'clamp' });

  // Lignes kente animées
  const kenteOpacity = interpolate(frame, [0, 40], [0, 0.12], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 50%, #0f2460 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      }}
    >
      {/* Pattern Kente en fond */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: kenteOpacity }}
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0" y1={i * 56} x2="1920" y2={i * 56}
            stroke="#f97316" strokeWidth="1.5"
          />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 56} y1="0" x2={i * 56} y2="1080"
            stroke="#D4A017" strokeWidth="1"
          />
        ))}
        {Array.from({ length: 12 }).map((_, i) =>
          Array.from({ length: 8 }).map((_, j) => (
            <rect
              key={`r-${i}-${j}`}
              x={i * 56 * 3 + 14} y={j * 56 * 2 + 14}
              width="28" height="28"
              fill="#f97316" fillOpacity="0.4"
            />
          ))
        )}
      </svg>

      {/* Logo + Nom */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        {/* Cercle logo africain */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #D4A017)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 60px rgba(249, 115, 22, 0.5)',
          }}
        >
          {/* Symbole Adinkra "Gye Nyame" stylisé — connaissance */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="30" stroke="white" strokeWidth="3" fill="none" />
            <path d="M40 12 L40 68" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <path d="M14 40 L66 40" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <path d="M20 20 L60 60" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M60 20 L20 60" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="40" cy="40" r="8" fill="white" />
          </svg>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-2px',
              lineHeight: 1,
            }}
          >
            Waraba
            <span style={{ color: '#f97316' }}> Academy</span>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 40,
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255,255,255,0.85)',
            fontWeight: 400,
            letterSpacing: 2,
          }}
        >
          La formation qui transforme l&apos;Afrique
        </div>
        <div
          style={{
            marginTop: 16,
            width: 80,
            height: 3,
            background: 'linear-gradient(90deg, #f97316, #D4A017)',
            borderRadius: 99,
            margin: '16px auto 0',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
