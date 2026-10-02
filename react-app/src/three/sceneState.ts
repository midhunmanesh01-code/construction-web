/**
 * Shared mutable state between the Three.js scene and React UI.
 * This is intentionally NOT React state — the animation loop runs at 60fps
 * and needs direct access without re-renders.
 */

export interface SceneState {
  pe: number;
  bp: number;
  rm: number;
  inK: number;
  gy: number;
  svc: number;
  hov: number;
  open: boolean;
  mx: number;
  my: number;
  cx: number;
  cy: number;
  lastIdx: number;
  time: number;
  p: number;
  q: number;
  inPin: boolean;
  stageIdx: number;
  modelLoaded: boolean;
  explodedBlend: number;
  targetExploded: number;
  lp: number;
}

export function createInitialState(): SceneState {
  return {
    pe: 0,
    bp: 0,
    rm: 1,
    inK: 0,
    gy: 1,
    svc: 0,
    hov: 0,
    open: false,
    mx: 0,
    my: 0,
    cx: 0,
    cy: 0,
    lastIdx: -1,
    time: 0,
    p: 0,
    q: 0,
    inPin: true,
    stageIdx: 0,
    modelLoaded: false,
    explodedBlend: 0,
    targetExploded: 0,
    lp: 0.5,
  };
}

export const sceneState = createInitialState();
