// @ts-nocheck
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const STATS = [
  { value: 2000, suffix: '+', label: 'Apprenants', sub: 'en Afrique', color: '#3b82f6', icon: '👥' },
  { value: 20, suffix: '+', label: 'Cours', sub: 'certifiants', color: '#f97316', icon: '📚' },
  { value: 95, suffix: '%', label: 'Satisfaction', sub: 'apprenants', color: '#D4A017', icon: '⭐' },
  { value: 7, suffix: '', label: 'Pays africains', sub: 'couverts', color: '#10b981', icon: '🌍' },
];

const StatCard: React.FC<{ stat: typeof STATS[0]; delay: number }> = ({ stat, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardScale = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 80 }, from: 0.6, to: 1 });
  const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Compteur animé
  const countProgress = interpolate(frame, [delay + 5, delay + 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Ease-out cubic
  const eased = 1 - Math.pow(1 - countProgress, 3);
  const displayValue = Math.round(eased * stat.value);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${stat.color}30`,
        borderTop: `4px solid ${stat.color}`,
        borderRadius: 24,
        padding: '44px 32px',
        textAlign: 'center',
        opacity: cardOpacity,
        transform: `scale(${cardScale})`,
        backdropFilter: 'blur(10px)',
        flex: 1,
      }}
    >
      <div style={{ fontSize: 44, marginBottom: 16 }}>{stat.icon}</div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: stat.color,
          lineHeight: 1,
          marginBottom: 8,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {displayValue.toLocaleString('fr-FR')}{stat.suffix}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 4 }}>
        {stat.label}
      </div>
      <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
        {stat.sub}
      </div>
    </div>
  );
};

export const StatsSlide: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 20], [25, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      }}
    >
      {/* Blob décoratif */}
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      <div
        style={{
          textAlign: 'center',
          marginBottom: 64,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div style={{ fontSize: 22, color: '#D4A017', fontWeight: 600, letterSpacing: 3, marginBottom: 16, textTransform: 'uppercase' }}>
          NOS CHIFFRES
        </div>
        <div style={{ fontSize: 60, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
          La confiance de toute l&apos;<span style={{ color: '#D4A017' }}>Afrique</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 32 }}>
        {STATS.map((stat, i) => (
          <StatCard key={i} stat={stat} delay={i * 12} />
        ))}
      </div>

      {/* Pays */}
      <div
        style={{
          textAlign: 'center',
          marginTop: 48,
          fontSize: 20,
          color: 'rgba(255,255,255,0.45)',
          opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        🇸🇳 Sénégal · 🇲🇱 Mali · 🇨🇮 Côte d&apos;Ivoire · 🇬🇳 Guinée · 🇧🇫 Burkina Faso · 🇨🇲 Cameroun · 🇹🇬 Togo
      </div>
    </AbsoluteFill>
  );
};
