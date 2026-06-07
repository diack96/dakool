import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Img,
} from 'remotion';

function TypingText({ text, startFrame, fps, style }: {
  text: string;
  startFrame: number;
  fps: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const charsToShow = Math.floor(
    interpolate(frame - startFrame, [0, text.length * 1.8], [0, text.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const showCursor = frame > startFrame && charsToShow < text.length + 8;

  return (
    <span style={style}>
      {text.slice(0, charsToShow)}
      {showCursor && (
        <span style={{
          display: 'inline-block',
          width: 3,
          height: '1em',
          background: '#22d3ee',
          marginLeft: 4,
          verticalAlign: 'text-bottom',
          opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
        }} />
      )}
    </span>
  );
}

function GridBg() {
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Grille */}
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(34,211,238,0.08)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#grid)" />
      </svg>
      {/* Glow central */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(34,211,238,0.12) 0%, transparent 70%)',
      }} />
    </AbsoluteFill>
  );
}

export function PEHook() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });
  const promptOpacity = interpolate(frame, [18, 35], [0, 1], { extrapolateRight: 'clamp' });
  const subOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: 'clamp' });
  const subY = interpolate(frame, [80, 100], [20, 0], { extrapolateRight: 'clamp' });
  const badgeOpacity = interpolate(frame, [105, 120], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#050e1a' }}>
      <GridBg />

      <AbsoluteFill style={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0,
        padding: '0 120px',
      }}>
        {/* Logo + badge */}
        <div style={{
          opacity: logoScale,
          transform: `scale(${logoScale})`,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 48,
        }}>
          <Img
            src={staticFile('waraba-academy.png')}
            style={{ width: 64, height: 64, borderRadius: 14, opacity: 0.9 }}
          />
          <span style={{
            fontFamily: 'monospace',
            fontSize: 28,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}>
            Waraba Academy
          </span>
        </div>

        {/* Titre principal avec effet typing */}
        <div style={{ opacity: promptOpacity, textAlign: 'center' }}>
          {/* Label "Nouveau cours" */}
          <div style={{
            display: 'inline-block',
            background: 'rgba(34,211,238,0.15)',
            border: '1px solid rgba(34,211,238,0.4)',
            borderRadius: 100,
            padding: '8px 24px',
            marginBottom: 32,
          }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: 18,
              color: '#22d3ee',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}>
              Nouveau cours
            </span>
          </div>

          <div style={{
            fontFamily: 'monospace',
            fontSize: 100,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -3,
          }}>
            <TypingText
              text="Prompt"
              startFrame={35}
              fps={fps}
              style={{ color: '#22d3ee' }}
            />
            <br />
            <TypingText
              text="Engineering"
              startFrame={65}
              fps={fps}
              style={{ color: 'white' }}
            />
          </div>
        </div>

        {/* Sous-titre */}
        <div style={{
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          marginTop: 36,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'sans-serif',
            fontSize: 30,
            color: 'rgba(255,255,255,0.65)',
            letterSpacing: 0.5,
            margin: 0,
          }}>
            Maîtrisez l'art de communiquer avec l'IA pour décupler votre productivité
          </p>
        </div>

        {/* Badge durée / niveau */}
        <div style={{
          opacity: badgeOpacity,
          display: 'flex',
          gap: 20,
          marginTop: 52,
        }}>
          {[
            { icon: '⏱', label: '22 min de contenu' },
            { icon: '📖', label: '4 leçons' },
            { icon: '🎁', label: '100% Gratuit' },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 14,
              padding: '12px 24px',
            }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <span style={{ fontFamily: 'sans-serif', fontSize: 20, color: 'rgba(255,255,255,0.75)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
