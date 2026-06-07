import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const FEATURES = [
  { icon: '🎯', title: 'Parcours personnalisés', desc: 'Des formations adaptées à votre niveau et vos objectifs' },
  { icon: '📱', title: 'Appli mobile & PWA', desc: 'Apprenez partout, même sans connexion internet' },
  { icon: '🏆', title: 'Certificats reconnus', desc: 'Valorisez vos compétences avec des certificats officiels' },
  { icon: '👥', title: 'Communauté active', desc: 'Progressez entouré d\'experts et d\'apprenants motivés' },
  { icon: '⚡', title: 'Quiz interactifs', desc: 'Testez vos connaissances après chaque module' },
  { icon: '💳', title: 'Paiement sécurisé', desc: 'Stripe intégré, coupons de réduction disponibles' },
];

function FeatureRow({ icon, title, desc, delay }: typeof FEATURES[0] & { delay: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const x = interpolate(frame - delay, [0, 20], [-60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ transform: `translateX(${x}px)`, opacity, display: 'flex', alignItems: 'center', gap: 24 }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, #ede9fe, #dbeafe)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, flexShrink: 0,
        boxShadow: '0 4px 16px rgba(139,92,246,0.15)',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: 'sans-serif', fontSize: 26, fontWeight: 700, color: '#1e293b' }}>{title}</div>
        <div style={{ fontFamily: 'sans-serif', fontSize: 20, color: '#64748b', marginTop: 4 }}>{desc}</div>
      </div>
    </div>
  );
}

export function Features() {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const titleX = interpolate(frame, [0, 18], [-40, 0], { extrapolateRight: 'clamp' });

  const leftFeatures = FEATURES.slice(0, 3);
  const rightFeatures = FEATURES.slice(3);

  return (
    <AbsoluteFill style={{ background: 'white', flexDirection: 'column', justifyContent: 'center', padding: '60px 100px', gap: 48 }}>
      <div style={{
        opacity: titleOpacity,
        transform: `translateX(${titleX}px)`,
        fontFamily: 'sans-serif',
        fontSize: 52,
        fontWeight: 800,
        color: '#1e293b',
      }}>
        Tout ce dont vous avez besoin
      </div>

      <div style={{ display: 'flex', gap: 80 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>
          {leftFeatures.map((f, i) => <FeatureRow key={f.title} {...f} delay={i * 8 + 5} />)}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>
          {rightFeatures.map((f, i) => <FeatureRow key={f.title} {...f} delay={i * 8 + 25} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
}
