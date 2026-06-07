// @ts-nocheck
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';

const DOMAINES = [
  { label: 'Digital & Marketing', icon: '💻', color: '#3b82f6', desc: 'Growth, SEO, Social Media, E-commerce' },
  { label: 'Intelligence Artificielle', icon: '🤖', color: '#8b5cf6', desc: 'Prompt Engineering, Data, Automatisation' },
  { label: 'Soft Skills & Leadership', icon: '🌟', color: '#f97316', desc: 'Communication, Management, Entrepreneuriat' },
];

const DomaineCard: React.FC<{ domaine: typeof DOMAINES[0]; delay: number }> = ({ domaine, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 70 }, from: 0.8, to: 1 });
  const opacity = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const translateX = interpolate(frame, [delay, delay + 25], [-40, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        background: 'rgba(255,255,255,0.05)',
        border: `2px solid ${domaine.color}40`,
        borderLeft: `5px solid ${domaine.color}`,
        borderRadius: 20,
        padding: '28px 36px',
        opacity,
        transform: `scale(${scale}) translateX(${translateX}px)`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 16,
          background: `${domaine.color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          flexShrink: 0,
        }}
      >
        {domaine.icon}
      </div>
      <div>
        <div style={{ fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 6 }}>
          {domaine.label}
        </div>
        <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>
          {domaine.desc}
        </div>
      </div>
    </div>
  );
};

export const FormationSlide: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 20], [30, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 100px',
        fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      }}
    >
      {/* Accent décoratif */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      <div
        style={{
          marginBottom: 60,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div style={{ fontSize: 22, color: '#f97316', fontWeight: 600, letterSpacing: 3, marginBottom: 16, textTransform: 'uppercase' }}>
          NOS FORMATIONS
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
          Formez-vous dans les{' '}
          <span style={{ color: '#f97316' }}>domaines qui recrutent</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {DOMAINES.map((domaine, i) => (
          <DomaineCard key={i} domaine={domaine} delay={i * 18} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
