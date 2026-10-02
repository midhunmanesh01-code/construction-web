/**
 * Shared mutable state between the Three.js scene and React UI.
 * Direct property mutation at 60fps without triggering React re-renders.
 */

export type ViewMode =
  | 'scroll'
  | 'front'
  | 'frontLeft'
  | 'frontRight'
  | 'rear'
  | 'left'
  | 'right'
  | 'top'
  | 'living'
  | 'kitchen'
  | 'bedroom'
  | 'bathroom'
  | 'terrace'
  | 'roofdeck'
  | 'exploded';

export type LightingMode = 'dusk' | 'golden' | 'night' | 'blueprint';

export interface SceneState {
  // Build progress (0-1) during pin section
  pe: number;
  // Target build progress (when scrubbing or auto-moving)
  targetPe: number;
  // Blueprint mode blend (0=normal, 1=blueprint wireframe)
  bp: number;
  // Radius multiplier for camera distance
  rm: number;
  // Interior mode blend (0=exterior, 1=interior walk)
  inK: number;
  // Active service index
  svc: number;
  // Hover state for interactive cards
  hov: number;
  // Overlay open state
  open: boolean;
  // Mouse position normalized (-0.5 to 0.5)
  mx: number;
  my: number;
  // Smoothed cursor coordinates
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
  // Current stage index (0-9)
  stageIdx: number;
  // Whether the GLB model has loaded successfully
  modelLoaded: boolean;
  // Exploded view blend (0 = assembled, 1 = fully exploded)
  explodedBlend: number;
  // Target exploded blend
  targetExploded: number;
  // Local progress within the current visible section
  lp: number;
  // Active viewpoint / camera mode
  viewMode: ViewMode;
  // Active architectural space inspection
  activeSpace: string | null;
  // Active viewpoint angle
  activeAngle: string;
  // Active lighting mood
  lightingMode: LightingMode;
  // Whether user is manually scrubbing the timeline
  isScrubbing: boolean;
}

export function createInitialState(): SceneState {
  return {
    pe: 0,
    targetPe: 0,
    bp: 0,
    rm: 1,
    inK: 0,
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
    viewMode: 'scroll',
    activeSpace: null,
    activeAngle: 'frontLeft',
    lightingMode: 'dusk',
    isScrubbing: false,
  };
}

// Singleton state shared between Three.js and React
export const sceneState = createInitialState();
