import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from 'remotion';

function Particle({ x, y, size, opacity, color }: { x: number; y: number; size: number; opacity: number; color: string }) {
  const frame = useCurrentFrame();
  const floatY = Math.sin((frame + x) / 25) * 18;
  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y + floatY,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      opacity,
    }} />
  );
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  x: (i * 137.5) % 1920,
  y: (i * 97.3) % 1080,
  size: 4 + (i % 4) * 3,
  opacity: 0.15 + (i % 5) * 0.06,
  color: i % 2 === 0 ? '#22d3ee' : '#a78bfa',
}));

export function PECTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 70 } });
  const tagOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' });
  const btnOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: 'clamp' });
  const btnY = interpolate(frame, [55, 75], [20, 0], { extrapolateRight: 'clamp' });
  const priceOpacity = interpolate(frame, [75, 90], [0, 1], { extrapolateRight: 'clamp' });

  // Pulse sur le bouton
  const pulse = 1 + Math.sin(frame / 12) * 0.025;

  return (
    <AbsoluteFill style={{ background: '#050e1a' }}>
      {/* Particules */}
      <AbsoluteFill>
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
      </AbsoluteFill>

      {/* Glow */}
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 1000, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, rgba(34,211,238,0.1) 40%, transparent 70%)',
        }} />
      </AbsoluteFill>

      <AbsoluteFill style={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0,
        padding: '0 160px',
      }}>
        {/* Logo */}
        <div style={{ transform: `scale(${scale})`, opacity: scale, marginBottom: 40 }}>
          <Img
            src={staticFile('waraba-academy.png')}
            style={{ width: 80, height: 80, borderRadius: 18 }}
          />
        </div>

        {/* Titre */}
        <div style={{ transform: `scale(${scale})`, textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            margin: 0,
            fontFamily: 'sans-serif',
            fontSize: 80,
            fontWeight: 900,
            color: 'white',
            letterSpacing: -2,
            lineHeight: 1.1,
          }}>
            Devenez un expert
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #22d3ee, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Prompt Engineering
            </span>
          </h1>
        </div>

        {/* Sous-titre */}
        <div style={{ opacity: tagOpacity, textAlign: 'center', marginBottom: 48 }}>
          <p style={{
            margin: 0,
            fontFamily: 'sans-serif',
            fontSize: 26,
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.6,
          }}>
            Rejoignez des milliers d'apprenants qui utilisent déjà l'IA<br />
            comme levier de croissance personnelle et professionnelle.
          </p>
        </div>

        {/* Bouton CTA */}
        <div style={{
          opacity: btnOpacity,
          transform: `translateY(${btnY}px) scale(${pulse})`,
          background: 'linear-gradient(135deg, #22d3ee, #7c3aed)',
          borderRadius: 20,
          padding: '22px 72px',
          cursor: 'pointer',
          boxShadow: '0 0 60px rgba(34,211,238,0.3), 0 16px 48px rgba(0,0,0,0.4)',
          marginBottom: 28,
        }}>
          <span style={{
            fontFamily: 'sans-serif',
            fontSize: 30,
            fontWeight: 800,
            color: 'white',
            letterSpacing: 0.5,
          }}>
            Commencer le cours →
          </span>
        </div>

        {/* URL + gratuit */}
        <div style={{ opacity: priceOpacity, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(52,211,153,0.12)',
            border: '1px solid rgba(52,211,153,0.35)',
            borderRadius: 14,
            padding: '14px 32px',
          }}>
            <span style={{ fontSize: 24 }}>🎁</span>
            <span style={{ fontFamily: 'sans-serif', fontSize: 26, fontWeight: 800, color: '#34d399' }}>
              100% Gratuit — Sans inscription
            </span>
          </div>
          <span style={{
            fontFamily: 'monospace',
            fontSize: 20,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: 1,
          }}>
            waraba-academy.com
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
