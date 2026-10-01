/**
 * Shared mutable state between the Three.js scene and React UI.
 * This is intentionally NOT React state — the animation loop runs at 60fps
 * and needs direct access without re-renders.
 */

export interface SceneState {
  // Build progress (0-1) during pin section
  pe: number;
  // Blueprint mode blend
  bp: number;
  // Radius multiplier
  rm: number;
  // Interior mode blend
  inK: number;
  // Y-scale for building group
  gy: number;
  // Active service index
  svc: number;
  // Hover state for projects
  hov: number;
  // Overlay open state
  open: boolean;
  // Mouse position normalized
  mx: number;
  my: number;
  // Smoothed cursor
  cx: number;
  cy: number;
  // Last stage index
  lastIdx: number;
  // Current time from rAF
  time: number;
  // Scroll progress in pin
  p: number;
  // Post-pin scroll progress
  q: number;
  // Whether we're in the pin section
  inPin: boolean;
  // Current stage index
  stageIdx: number;
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
  };
}

// Singleton state shared between Three.js and React
export const sceneState = createInitialState();
