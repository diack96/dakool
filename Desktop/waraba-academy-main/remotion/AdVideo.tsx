// @ts-nocheck
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from 'remotion';
import { Intro } from './scenes/Intro';
import { FormationSlide } from './scenes/FormationSlide';
import { StatsSlide } from './scenes/StatsSlide';
import { FeaturesSlide } from './scenes/FeaturesSlide';
import { TestimonialSlide } from './scenes/TestimonialSlide';
import { CTASlide } from './scenes/CTASlide';

// 30 fps · 30 secondes = 900 frames
// Durée de chaque scène :
//   Intro          : 0   → 90   (3s)
//   Formation      : 80  → 245  (5.5s + 2.7s overlap)
//   Stats          : 235 → 415  (6s)
//   Features       : 405 → 585  (6s)
//   Testimonials   : 575 → 745  (5.7s)
//   CTA            : 735 → 900  (5.5s)

const TRANSITION_FRAMES = 15;

const FadeTransition: React.FC<{ startAt: number; endAt: number }> = ({ startAt, endAt }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [startAt, startAt + TRANSITION_FRAMES, endAt - TRANSITION_FRAMES, endAt],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#0a0f1e',
        opacity,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    />
  );
};

export const AdVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Scène 1 — Intro / Logo */}
      <Sequence from={0} durationInFrames={105}>
        <Intro />
      </Sequence>

      {/* Transition fade */}
      <FadeTransition startAt={88} endAt={108} />

      {/* Scène 2 — Formations */}
      <Sequence from={100} durationInFrames={175}>
        <FormationSlide />
      </Sequence>

      <FadeTransition startAt={263} endAt={283} />

      {/* Scène 3 — Stats */}
      <Sequence from={275} durationInFrames={175}>
        <StatsSlide />
      </Sequence>

      <FadeTransition startAt={438} endAt={458} />

      {/* Scène 4 — Features */}
      <Sequence from={450} durationInFrames={165}>
        <FeaturesSlide />
      </Sequence>

      <FadeTransition startAt={603} endAt={623} />

      {/* Scène 5 — Témoignages */}
      <Sequence from={615} durationInFrames={165}>
        <TestimonialSlide />
      </Sequence>

      <FadeTransition startAt={768} endAt={788} />

      {/* Scène 6 — CTA final */}
      <Sequence from={780} durationInFrames={120}>
        <CTASlide />
      </Sequence>
    </AbsoluteFill>
  );
};
