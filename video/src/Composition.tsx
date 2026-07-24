import React from "react";
import { Composition, staticFile, AbsoluteFill, Sequence } from "remotion";
import { Audio } from "@remotion/media";
import {
  TransitionSeries,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Background } from "./Background";
import { SceneTitle } from "./scenes/SceneTitle";
import { SceneHowItWorks } from "./scenes/SceneHowItWorks";
import { SceneTech } from "./scenes/SceneTech";
import { SceneCTA } from "./scenes/SceneCTA";
import { VOICEOVER_SCENES } from "./voiceover-config";

const FPS = 30;
const SCENE_PADDING = 20;
const TRANSITION_DURATION = 15;

function computeTimings() {
  const sceneDurations = VOICEOVER_SCENES.map(
    (s) => Math.ceil(s.durationSeconds * FPS) + SCENE_PADDING,
  );

  const transitionsCount = sceneDurations.length - 1;

  const sceneStartFrames: number[] = [];
  let currentFrame = 0;
  for (let i = 0; i < sceneDurations.length; i++) {
    sceneStartFrames.push(currentFrame);
    currentFrame += sceneDurations[i] - (i < transitionsCount ? TRANSITION_DURATION : 0);
  }

  const totalFrames =
    sceneDurations.reduce((a, b) => a + b, 0) -
    transitionsCount * TRANSITION_DURATION;

  return { sceneDurations, sceneStartFrames, totalFrames };
}

const { sceneDurations, sceneStartFrames } = computeTimings();

const AudioLayer: React.FC = () => (
  <>
    {VOICEOVER_SCENES.map((scene, i) => (
      <Sequence
        key={scene.id}
        from={sceneStartFrames[i]}
        durationInFrames={sceneDurations[i]}
        layout="none"
      >
        <Audio src={staticFile(`voiceover/mapa-promo/${scene.id}.mp3`)} />
      </Sequence>
    ))}
  </>
);

const Scenes: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={sceneDurations[0]}>
      <Background />
      <SceneTitle />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
    />
    <TransitionSeries.Sequence durationInFrames={sceneDurations[1]}>
      <Background />
      <SceneHowItWorks />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
    />
    <TransitionSeries.Sequence durationInFrames={sceneDurations[2]}>
      <Background />
      <SceneTech />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
    />
    <TransitionSeries.Sequence durationInFrames={sceneDurations[3]}>
      <Background />
      <SceneHowItWorks />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
    />
    <TransitionSeries.Sequence durationInFrames={sceneDurations[4]}>
      <Background />
      <SceneCTA />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);

const MapaPromoInner: React.FC = () => (
  <AbsoluteFill>
    <Scenes />
    <AudioLayer />
  </AbsoluteFill>
);

export const MapaPromo: React.FC = () => {
  return (
    <Composition
      id="MapaPromo"
      component={MapaPromoInner}
      durationInFrames={Math.ceil(
        VOICEOVER_SCENES.reduce(
          (sum, s) => sum + s.durationSeconds * FPS + SCENE_PADDING,
          0,
        ) -
          (VOICEOVER_SCENES.length - 1) * TRANSITION_DURATION,
      )}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  );
};
