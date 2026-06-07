import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const STATS = [
  { value: '500+', label: 'Cours disponibles', icon: '📚', color: '#3b82f6' },
  { value: '12k+', label: 'Étudiants actifs', icon: '🎓', color: '#8b5cf6' },
  { value: '98%', label: 'Taux de satisfaction', icon: '⭐', color: '#f59e0b' },
  { value: '24/7', label: 'Accès illimité', icon: '🌍', color: '#10b981' },
];

function StatCard({ value, label, icon, color, delay }: typeof STATS[0] & { delay: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 100 } });
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      transform: `scale(${Math.max(0, scale)})`,
      opacity,
      background: 'white',
      borderRadius: 24,
      padding: '48px 40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      flex: 1,
    }}>
      <div style={{ fontSize: 56 }}>{icon}</div>
      <div style={{ fontFamily: 'sans-serif', fontSize: 56, fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: 'sans-serif', fontSize: 22, color: '#6b7280', textAlign: 'center', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

export function Stats() {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 20], [30, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#f8fafc', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '80px 100px', gap: 60 }}>
      <div style={{
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        fontFamily: 'sans-serif',
        fontSize: 52,
        fontWeight: 800,
        color: '#1e293b',
        textAlign: 'center',
      }}>
        La plateforme de référence
      </div>

      <div style={{ display: 'flex', gap: 32, width: '100%' }}>
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 10} />
        ))}
      </div>
    </AbsoluteFill>
  );
}
