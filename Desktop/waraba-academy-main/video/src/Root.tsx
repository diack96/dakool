import { Composition, Series, registerRoot } from 'remotion';
import { Intro } from './scenes/Intro';
import { Stats } from './scenes/Stats';
import { Features } from './scenes/Features';
import { CTA } from './scenes/CTA';
import { PEHook } from './scenes/pe/Hook';
import { PEProblem } from './scenes/pe/Problem';
import { PECurriculum } from './scenes/pe/Curriculum';
import { PEBenefits } from './scenes/pe/Benefits';
import { PECTA } from './scenes/pe/CTA';

// ─── Pub générale Waraba Academy ───────────────────────────────────────────
const INTRO_DURATION    = 90;   // 3s
const STATS_DURATION    = 120;  // 4s
const FEATURES_DURATION = 150;  // 5s
const CTA_DURATION      = 120;  // 4s
const WARABA_TOTAL = INTRO_DURATION + STATS_DURATION + FEATURES_DURATION + CTA_DURATION;

export function WarabaAd() {
  return (
    <Series>
      <Series.Sequence durationInFrames={INTRO_DURATION}>
        <Intro />
      </Series.Sequence>
      <Series.Sequence durationInFrames={STATS_DURATION}>
        <Stats />
      </Series.Sequence>
      <Series.Sequence durationInFrames={FEATURES_DURATION}>
        <Features />
      </Series.Sequence>
      <Series.Sequence durationInFrames={CTA_DURATION}>
        <CTA />
      </Series.Sequence>
    </Series>
  );
}

// ─── Pub cours Prompt Engineering ──────────────────────────────────────────
const PE_HOOK_DURATION     = 150;  // 5s  — titre + typing
const PE_PROBLEM_DURATION  = 150;  // 5s  — mauvais vs bon prompt
const PE_CURRIC_DURATION   = 150;  // 5s  — programme 4 modules
const PE_BENEFITS_DURATION = 150;  // 5s  — bénéfices + témoignages
const PE_CTA_DURATION      = 120;  // 4s  — appel à l'action
const PE_TOTAL = PE_HOOK_DURATION + PE_PROBLEM_DURATION + PE_CURRIC_DURATION + PE_BENEFITS_DURATION + PE_CTA_DURATION;

export function PromptEngineeringAd() {
  return (
    <Series>
      <Series.Sequence durationInFrames={PE_HOOK_DURATION}>
        <PEHook />
      </Series.Sequence>
      <Series.Sequence durationInFrames={PE_PROBLEM_DURATION}>
        <PEProblem />
      </Series.Sequence>
      <Series.Sequence durationInFrames={PE_CURRIC_DURATION}>
        <PECurriculum />
      </Series.Sequence>
      <Series.Sequence durationInFrames={PE_BENEFITS_DURATION}>
        <PEBenefits />
      </Series.Sequence>
      <Series.Sequence durationInFrames={PE_CTA_DURATION}>
        <PECTA />
      </Series.Sequence>
    </Series>
  );
}

// ─── Root : toutes les compositions ────────────────────────────────────────
export function RemotionRoot() {
  return (
    <>
      <Composition
        id="WarabaAd"
        component={WarabaAd}
        durationInFrames={WARABA_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromptEngineeringAd"
        component={PromptEngineeringAd}
        durationInFrames={PE_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
}

registerRoot(RemotionRoot);
