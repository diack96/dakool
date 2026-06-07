import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';

export function Intro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const taglineOpacity = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: 'clamp' });
  const taglineY = interpolate(frame, [30, 55], [20, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)' }}>
      {/* Pattern de fond */}
      <AbsoluteFill style={{ opacity: 0.07 }}>
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 12 }).map((_, col) => (
            <div
              key={`${row}-${col}`}
              style={{
                position: 'absolute',
                left: col * 160 + 40,
                top: row * 140 + 30,
                width: 80,
                height: 80,
                borderRadius: 16,
                border: '2px solid white',
              }}
            />
          ))
        )}
      </AbsoluteFill>

      {/* Logo */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 32 }}>
        <div style={{ transform: `scale(${logoScale})`, opacity: logoOpacity, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <Img
            src={staticFile('waraba-academy.png')}
            style={{ width: 140, height: 140, borderRadius: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
          />
          <div style={{
            fontFamily: 'sans-serif',
            fontSize: 72,
            fontWeight: 800,
            color: 'white',
            letterSpacing: -2,
            textShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}>
            Waraba Academy
          </div>
        </div>

        <div style={{
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          fontFamily: 'sans-serif',
          fontSize: 32,
          color: 'rgba(255,255,255,0.85)',
          fontWeight: 400,
          letterSpacing: 1,
        }}>
          Apprendre. Évoluer. Réussir.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
