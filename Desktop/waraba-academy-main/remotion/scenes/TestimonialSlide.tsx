// @ts-nocheck
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const TESTIMONIALS = [
  {
    name: 'Fatou Diallo',
    role: 'Développeuse web · Dakar',
    flag: '🇸🇳',
    text: 'Grâce à Waraba Academy, j\'ai décroché mon premier emploi en tech en 3 mois. La formation est vraiment adaptée à notre réalité.',
    avatar: 'FD',
    color: '#3b82f6',
  },
  {
    name: 'Kofi Mensah',
    role: 'Digital Marketer · Abidjan',
    flag: '🇨🇮',
    text: 'Les cours sont en français, avec des exemples locaux. J\'ai augmenté mon chiffre d\'affaires de 40% après la formation marketing.',
    avatar: 'KM',
    color: '#f97316',
  },
  {
    name: 'Aminata Traoré',
    role: 'Entrepreneuse · Bamako',
    flag: '🇲🇱',
    text: 'Le certificat Waraba Academy est reconnu par mes clients. Ça m\'a donné la crédibilité dont j\'avais besoin pour lancer mon agence.',
    avatar: 'AT',
    color: '#D4A017',
  },
];

const TestimonialCard: React.FC<{ t: typeof TESTIMONIALS[0]; delay: number }> = ({ t, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 70 }, from: 0.9, to: 1 });
  const opacity = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const translateY = interpolate(frame, [delay, delay + 20], [25, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${t.color}30`,
        borderRadius: 24,
        padding: '36px',
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Quote */}
      <div style={{ fontSize: 52, color: t.color, lineHeight: 0.5, fontWeight: 800, opacity: 0.5 }}>
        &ldquo;
      </div>
      <div style={{ fontSize: 21, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontWeight: 400, fontStyle: 'italic', flex: 1 }}>
        {t.text}
      </div>
      {/* Auteur */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${t.color}, ${t.color}aa)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
          }}
        >
          {t.avatar}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>
            {t.name} {t.flag}
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>{t.role}</div>
        </div>
      </div>
    </div>
  );
};

export const TestimonialSlide: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 20], [25, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0d1f3c 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      }}
    >
      <div
        style={{
          marginBottom: 52,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 22, color: '#D4A017', fontWeight: 600, letterSpacing: 3, marginBottom: 16, textTransform: 'uppercase' }}>
          ILS NOUS FONT CONFIANCE
        </div>
        <div style={{ fontSize: 58, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
          Des milliers d&apos;<span style={{ color: '#D4A017' }}>histoires de réussite</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 28 }}>
        {TESTIMONIALS.map((t, i) => (
          <TestimonialCard key={i} t={t} delay={i * 15} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
