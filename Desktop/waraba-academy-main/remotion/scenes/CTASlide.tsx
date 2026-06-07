// @ts-nocheck
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const CTASlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 14, stiffness: 70 }, from: 0.6, to: 1 });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  const titleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [15, 35], [30, 0], { extrapolateRight: 'clamp' });

  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' });
  const subtitleY = interpolate(frame, [30, 50], [20, 0], { extrapolateRight: 'clamp' });

  const btnOpacity = interpolate(frame, [45, 65], [0, 1], { extrapolateRight: 'clamp' });
  const btnScale = spring({ frame: frame - 45, fps, config: { damping: 12, stiffness: 80 }, from: 0.8, to: 1 });

  const urlOpacity = interpolate(frame, [65, 80], [0, 1], { extrapolateRight: 'clamp' });

  // Pulsation du bouton
  const pulse = Math.sin(frame * 0.12) * 0.015 + 1;

  // Particules décoratives
  const particlesOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 50%, #0f2460 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
        textAlign: 'center',
        padding: '60px 100px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Pattern Kente subtil */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 56} x2="1920" y2={i * 56} stroke="#f97316" strokeWidth="1.5" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 56} y1="0" x2={i * 56} y2="1080" stroke="#D4A017" strokeWidth="1" />
        ))}
      </svg>

      {/* Blobs lumineux */}
      <div style={{
        position: 'absolute', top: '10%', left: '5%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)',
        borderRadius: '50%',
        opacity: particlesOpacity,
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%',
        width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(212,160,23,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        opacity: particlesOpacity,
      }} />

      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 48,
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #D4A017)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(249,115,22,0.4)',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="30" stroke="white" strokeWidth="3" fill="none" />
            <path d="M40 12 L40 68" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <path d="M14 40 L66 40" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <path d="M20 20 L60 60" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M60 20 L20 60" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="40" cy="40" r="8" fill="white" />
          </svg>
        </div>
        <span style={{ fontSize: 44, fontWeight: 800, color: 'white' }}>
          Waraba<span style={{ color: '#f97316' }}> Academy</span>
        </span>
      </div>

      {/* Titre principal CTA */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 28,
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
          Votre avenir commence
          <br />
          <span style={{ color: '#f97316' }}>aujourd&apos;hui</span>
        </div>
      </div>

      {/* Sous-titre */}
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          marginBottom: 56,
        }}
      >
        <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.75)', fontWeight: 400, lineHeight: 1.5 }}>
          3 cours offerts · Sans carte bancaire · Accès immédiat
        </div>
      </div>

      {/* Bouton CTA */}
      <div
        style={{
          opacity: btnOpacity,
          transform: `scale(${btnScale * pulse})`,
          marginBottom: 48,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #ea580c, #f97316)',
            color: 'white',
            padding: '24px 64px',
            borderRadius: 999,
            fontSize: 32,
            fontWeight: 800,
            boxShadow: '0 0 60px rgba(249,115,22,0.5), 0 20px 40px rgba(0,0,0,0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          🚀 Commencer gratuitement
        </div>
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlOpacity,
          fontSize: 26,
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: 2,
          fontWeight: 500,
        }}
      >
        waraba-academy.com
      </div>
    </AbsoluteFill>
  );
};
