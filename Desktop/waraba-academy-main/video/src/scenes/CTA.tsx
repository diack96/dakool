import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';

export function CTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const contentScale = spring({ frame, fps, config: { damping: 14, stiffness: 70 } });
  const btnOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: 'clamp' });
  const btnY = interpolate(frame, [40, 60], [24, 0], { extrapolateRight: 'clamp' });

  // Pulse effect on the button
  const pulse = interpolate(
    Math.sin((frame / 4) * Math.PI),
    [-1, 1],
    [0.97, 1.03]
  );

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #1e40af 100%)' }}>
      {/* Cercles décoratifs */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -200, right: -150 }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -100, left: -100 }} />

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
        <div style={{ transform: `scale(${contentScale})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <Img
            src={staticFile('waraba-academy.png')}
            style={{ width: 100, height: 100, borderRadius: 20, boxShadow: '0 16px 48px rgba(0,0,0,0.3)' }}
          />

          <div style={{
            fontFamily: 'sans-serif',
            fontSize: 68,
            fontWeight: 900,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: -2,
            textShadow: '0 4px 24px rgba(0,0,0,0.2)',
          }}>
            Commencez aujourd'hui
          </div>

          <div style={{
            fontFamily: 'sans-serif',
            fontSize: 28,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.5,
          }}>
            Rejoignez des milliers d'apprenants qui transforment leur carrière avec Waraba Academy
          </div>
        </div>

        {/* Bouton CTA */}
        <div style={{
          opacity: btnOpacity,
          transform: `translateY(${btnY}px) scale(${pulse})`,
          background: 'white',
          borderRadius: 20,
          padding: '24px 64px',
          fontFamily: 'sans-serif',
          fontSize: 32,
          fontWeight: 800,
          color: '#7c3aed',
          boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
          letterSpacing: 0.5,
        }}>
          waraba-academy.com
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
