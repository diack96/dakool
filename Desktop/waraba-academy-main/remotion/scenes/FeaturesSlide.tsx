// @ts-nocheck
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const FEATURES = [
  {
    icon: '🎓',
    title: 'Certifications reconnues',
    desc: 'Obtenez des certificats valorisés sur le marché africain et international',
    color: '#3b82f6',
  },
  {
    icon: '📱',
    title: 'Accès mobile 100%',
    desc: 'Apprenez depuis votre téléphone, à votre rythme, où que vous soyez',
    color: '#f97316',
  },
  {
    icon: '🌐',
    title: 'Experts africains',
    desc: 'Des formateurs qui comprennent le contexte local et les réalités du terrain',
    color: '#D4A017',
  },
  {
    icon: '💳',
    title: 'Paiement local',
    desc: 'Wave, Orange Money, Free Money — les moyens de paiement que vous utilisez déjà',
    color: '#10b981',
  },
];

const FeatureCard: React.FC<{ feature: typeof FEATURES[0]; delay: number }> = ({ feature, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 70 }, from: 0.85, to: 1 });
  const opacity = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const translateY = interpolate(frame, [delay, delay + 18], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${feature.color}25`,
        borderRadius: 24,
        padding: '36px 32px',
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        flex: 1,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: `${feature.color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 30,
          marginBottom: 20,
          border: `1px solid ${feature.color}30`,
        }}
      >
        {feature.icon}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 12, lineHeight: 1.2 }}>
        {feature.title}
      </div>
      <div style={{ fontSize: 19, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, fontWeight: 400 }}>
        {feature.desc}
      </div>
    </div>
  );
};

export const FeaturesSlide: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 20], [25, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1a0a2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      }}
    >
      {/* Accent coin haut droite */}
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(212,160,23,0.10) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      <div
        style={{
          marginBottom: 56,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div style={{ fontSize: 22, color: '#f97316', fontWeight: 600, letterSpacing: 3, marginBottom: 16, textTransform: 'uppercase' }}>
          POURQUOI WARABA ?
        </div>
        <div style={{ fontSize: 58, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
          Conçu <span style={{ color: '#f97316' }}>pour l&apos;Afrique</span>,{' '}
          <br />par des Africains
        </div>
      </div>

      <div style={{ display: 'flex', gap: 28 }}>
        {FEATURES.map((f, i) => (
          <FeatureCard key={i} feature={f} delay={i * 14} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
