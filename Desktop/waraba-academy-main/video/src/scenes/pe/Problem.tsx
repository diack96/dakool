import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

const BAD_PROMPTS = [
  { prompt: '> "Explique-moi Python"', response: 'Réponse générique de 3 lignes...', bad: true },
  { prompt: '> "Fais un résumé"', response: 'De quoi ? Je ne sais pas...', bad: true },
  { prompt: '> "Aide-moi"', response: '...', bad: true },
];

const GOOD_PROMPT = {
  prompt: '> "Tu es un expert Python senior. Explique les décorateurs\n  à un développeur junior avec un exemple concret\n  et les 3 erreurs les plus communes."',
  response: '✅ Réponse précise, structurée, actionnable.',
  bad: false,
};

function TerminalLine({ text, delay, color = '#94a3b8' }: { text: string; delay: number; color?: string }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div style={{ opacity, fontFamily: 'monospace', fontSize: 22, color, lineHeight: 1.6, whiteSpace: 'pre' }}>
      {text}
    </div>
  );
}

export function PEProblem() {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 20], [24, 0], { extrapolateRight: 'clamp' });

  const vsOpacity = interpolate(frame, [55, 70], [0, 1], { extrapolateRight: 'clamp' });
  const vsScale = interpolate(frame, [55, 70], [0.5, 1], { extrapolateRight: 'clamp' });

  const goodOpacity = interpolate(frame, [72, 90], [0, 1], { extrapolateRight: 'clamp' });
  const goodX = interpolate(frame, [72, 90], [40, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#050e1a', padding: '70px 100px', flexDirection: 'column', gap: 48 }}>
      {/* Titre */}
      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
        <h2 style={{
          margin: 0,
          fontFamily: 'sans-serif',
          fontSize: 48,
          fontWeight: 800,
          color: 'white',
        }}>
          La plupart des gens font ça 👇
        </h2>
      </div>

      {/* Split : mauvais vs bon */}
      <div style={{ display: 'flex', gap: 48, flex: 1, alignItems: 'center' }}>
        {/* Mauvais prompts */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {BAD_PROMPTS.map(({ prompt, response }, i) => (
            <div key={i} style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 16,
              padding: '20px 28px',
            }}>
              <TerminalLine text={prompt} delay={i * 12 + 5} color="#f87171" />
              <TerminalLine text={response} delay={i * 12 + 10} color="rgba(255,255,255,0.35)" />
            </div>
          ))}
        </div>

        {/* VS */}
        <div style={{
          opacity: vsOpacity,
          transform: `scale(${vsScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22d3ee, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'sans-serif', fontSize: 22, fontWeight: 900, color: 'white',
          }}>
            VS
          </div>
        </div>

        {/* Bon prompt */}
        <div style={{
          flex: 1,
          opacity: goodOpacity,
          transform: `translateX(${goodX}px)`,
          background: 'rgba(34,211,238,0.06)',
          border: '1px solid rgba(34,211,238,0.3)',
          borderRadius: 16,
          padding: '28px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <div style={{ fontFamily: 'monospace', fontSize: 21, color: '#22d3ee', lineHeight: 1.7, whiteSpace: 'pre' }}>
            {GOOD_PROMPT.prompt}
          </div>
          <div style={{ fontFamily: 'sans-serif', fontSize: 22, color: '#4ade80', fontWeight: 600 }}>
            {GOOD_PROMPT.response}
          </div>
        </div>
      </div>

      {/* Accroche bas */}
      <div style={{ opacity: interpolate(frame, [100, 115], [0, 1], { extrapolateRight: 'clamp' }) }}>
        <p style={{
          margin: 0,
          fontFamily: 'sans-serif',
          fontSize: 26,
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center',
        }}>
          Un bon prompt = des résultats 10× meilleurs. Ce cours vous apprend comment.
        </p>
      </div>
    </AbsoluteFill>
  );
}
