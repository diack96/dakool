import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const BENEFITS = [
  { icon: '⚡', title: 'Productivité ×10', desc: 'Obtenez des résultats en secondes, pas en heures', color: '#fbbf24' },
  { icon: '🧠', title: 'Pensée systémique', desc: 'Structurez vos idées comme un ingénieur IA', color: '#a78bfa' },
  { icon: '💼', title: 'Avantage pro', desc: 'La compétence la plus recherchée en 2025', color: '#34d399' },
  { icon: '🔓', title: 'Accès à vie', desc: 'Mises à jour incluses · Nouveaux LLMs couverts', color: '#22d3ee' },
];

const TESTIMONIALS = [
  { name: 'Aminata D.', role: 'Développeuse', text: '"J\'ai économisé 3h/jour grâce aux techniques de ce cours."' },
  { name: 'Ibrahima K.', role: 'Marketeur', text: '"Mon contenu est 5× plus qualitatif depuis la formation."' },
];

function BenefitCard({ icon, title, desc, color, delay }: typeof BENEFITS[0] & { delay: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 100 } });
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      transform: `scale(${Math.max(0, scale)})`,
      opacity,
      flex: 1,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      <div style={{
        width: 60, height: 60,
        borderRadius: 16,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30,
      }}>
        {icon}
      </div>
      <div style={{ fontFamily: 'sans-serif', fontSize: 24, fontWeight: 700, color: 'white' }}>{title}</div>
      <div style={{ fontFamily: 'sans-serif', fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

function TestimonialCard({ name, role, text, delay }: typeof TESTIMONIALS[0] & { delay: number }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const x = interpolate(frame - delay, [0, 20], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      opacity,
      transform: `translateX(${x}px)`,
      flex: 1,
      background: 'rgba(34,211,238,0.06)',
      border: '1px solid rgba(34,211,238,0.2)',
      borderRadius: 18,
      padding: '28px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      <p style={{ margin: 0, fontFamily: 'sans-serif', fontSize: 20, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', lineHeight: 1.6 }}>
        {text}
      </p>
      <div>
        <div style={{ fontFamily: 'sans-serif', fontSize: 18, fontWeight: 700, color: '#22d3ee' }}>{name}</div>
        <div style={{ fontFamily: 'sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>{role}</div>
      </div>
    </div>
  );
}

export function PEBenefits() {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 18], [20, 0], { extrapolateRight: 'clamp' });
  const testOpacity = interpolate(frame, [70, 85], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#050e1a', padding: '60px 90px', flexDirection: 'column', gap: 44 }}>
      {/* Titre */}
      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
        <h2 style={{ margin: 0, fontFamily: 'sans-serif', fontSize: 50, fontWeight: 800, color: 'white' }}>
          Ce que vous allez gagner
        </h2>
      </div>

      {/* Bénéfices */}
      <div style={{ display: 'flex', gap: 24 }}>
        {BENEFITS.map((b, i) => <BenefitCard key={b.title} {...b} delay={i * 10 + 5} />)}
      </div>

      {/* Témoignages */}
      <div style={{ opacity: testOpacity }}>
        <div style={{
          fontFamily: 'monospace',
          fontSize: 14,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          Ce qu'ils disent
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {TESTIMONIALS.map((t, i) => <TestimonialCard key={t.name} {...t} delay={72 + i * 10} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
}
