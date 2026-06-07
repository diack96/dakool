import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const MODULES = [
  {
    num: '01',
    title: 'Les fondamentaux',
    lessons: ['Anatomie d\'un prompt', 'Rôle, contexte, format', 'Zero-shot vs Few-shot'],
    color: '#22d3ee',
  },
  {
    num: '02',
    title: 'Techniques avancées',
    lessons: ['Chain-of-thought', 'Tree of Thoughts', 'ReAct prompting'],
    color: '#a78bfa',
  },
  {
    num: '03',
    title: 'Cas pratiques',
    lessons: ['Code & débogage', 'Rédaction & contenu', 'Analyse de données'],
    color: '#34d399',
  },
  {
    num: '04',
    title: 'Outils & API',
    lessons: ['ChatGPT, Claude, Gemini', 'API OpenAI en Python', 'Automatiser avec n8n'],
    color: '#fb923c',
  },
];

function ModuleCard({ num, title, lessons, color, delay }: typeof MODULES[0] & { delay: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 120 } });
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      transform: `scale(${Math.max(0, scale)})`,
      opacity,
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${color}40`,
      borderTop: `3px solid ${color}`,
      borderRadius: 20,
      padding: '32px 28px',
      flex: 1,
    }}>
      {/* Numéro */}
      <div style={{
        fontFamily: 'monospace',
        fontSize: 48,
        fontWeight: 900,
        color: `${color}50`,
        lineHeight: 1,
        marginBottom: 12,
      }}>
        {num}
      </div>

      {/* Titre module */}
      <div style={{
        fontFamily: 'sans-serif',
        fontSize: 26,
        fontWeight: 700,
        color: 'white',
        marginBottom: 20,
      }}>
        {title}
      </div>

      {/* Leçons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lessons.map((lesson) => (
          <div key={lesson} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontFamily: 'sans-serif', fontSize: 18, color: 'rgba(255,255,255,0.65)' }}>
              {lesson}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PECurriculum() {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 18], [24, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#050e1a', padding: '70px 90px', flexDirection: 'column', gap: 48 }}>
      {/* Titre */}
      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
          background: 'rgba(34,211,238,0.1)',
          border: '1px solid rgba(34,211,238,0.3)',
          borderRadius: 12,
          padding: '8px 20px',
          marginBottom: 20,
        }}>
          <span style={{ fontFamily: 'monospace', fontSize: 16, color: '#22d3ee', letterSpacing: 2 }}>
            PROGRAMME DU COURS
          </span>
        </div>
        <h2 style={{
          margin: 0,
          fontFamily: 'sans-serif',
          fontSize: 52,
          fontWeight: 800,
          color: 'white',
        }}>
          4 leçons · 22 minutes · Accès gratuit
        </h2>
      </div>

      {/* Grille des modules */}
      <div style={{ display: 'flex', gap: 24, flex: 1 }}>
        {MODULES.map((mod, i) => (
          <ModuleCard key={mod.num} {...mod} delay={i * 12 + 10} />
        ))}
      </div>
    </AbsoluteFill>
  );
}
