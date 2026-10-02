/**
 * Construction animation controller.
 * Manages the 10-stage scroll-driven construction sequence.
 * Each architectural system from the GLB model is revealed with
 * physics-inspired animation as the user scrolls.
 *
 * Animation modes:
 *   riseY     — element rises from below final position (columns, walls)
 *   slideX    — element slides horizontally into place (beams)
 *   slideZ    — element slides along Z axis
 *   grow      — uniform scale 0 → 1 (trees, plants)
 *   cascadeY  — staggered rise per child element (staircase steps)
 *   fadeIn    — opacity 0 → 1 (glass, transparent elements)
 *   settle    — drops from above with slight overshoot then settles
 */
import * as THREE from 'three';
import type { HouseModel } from './modelLoader';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smoothstep = (x: number) => x * x * (3 - 2 * x);

export type AnimationMode =
  | 'riseY'
  | 'slideX'
  | 'slideZ'
  | 'grow'
  | 'cascadeY'
  | 'fadeIn'
  | 'settle';

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/** A resolved entry — an object that will be animated */
interface ResolvedEntry {
  object: THREE.Object3D;
  originalPos: THREE.Vector3;
  originalScale: THREE.Vector3;
  start: number;
  end: number;
  animation: AnimationMode;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
}

/** Entry definition — before resolution against the model */
interface EntryDef {
  path: string;
  start: number;
  end: number;
  animation: AnimationMode;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
}

interface StageDef {
  name: string;
  label: string;
  start: number;
  end: number;
  entries: EntryDef[];
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Public stage info for UI labels */
export interface StageInfo {
  name: string;
  label: string;
  start: number;
  end: number;
}

// ---------------------------------------------------------------------------
// Stage definitions — the 10-stage construction timeline
// ---------------------------------------------------------------------------

const STAGE_DEFINITIONS: StageDef[] = [
  {
    name: 'SITE',
    label: 'SITE PREPARATION',
    start: 0.0,
    end: 0.1,
    entries: [
      { path: 'Site', start: 0.0, end: 0.1, animation: 'fadeIn', offsetX: 0, offsetY: 0, offsetZ: 0 },
    ],
  },
  {
    name: 'FOUNDATION',
    label: 'FOUNDATION',
    start: 0.1,
    end: 0.2,
    entries: [
      { path: 'Foundation', start: 0.1, end: 0.2, animation: 'riseY', offsetX: 0, offsetY: -2, offsetZ: 0 },
      { path: 'Foundation.Footings', start: 0.1, end: 0.15, animation: 'riseY', offsetX: 0, offsetY: -2, offsetZ: 0 },
      { path: 'Foundation.FoundationSlab', start: 0.12, end: 0.17, animation: 'riseY', offsetX: 0, offsetY: -1.5, offsetZ: 0 },
      { path: 'Foundation.GroundStructure', start: 0.14, end: 0.2, animation: 'riseY', offsetX: 0, offsetY: -1, offsetZ: 0 },
    ],
  },
  {
    name: 'STRUCTURE',
    label: 'STRUCTURAL FRAME',
    start: 0.2,
    end: 0.35,
    entries: [
      { path: 'Structure', start: 0.2, end: 0.35, animation: 'riseY', offsetX: 0, offsetY: -6, offsetZ: 0 },
      { path: 'Structure.Columns', start: 0.2, end: 0.28, animation: 'riseY', offsetX: 0, offsetY: -6, offsetZ: 0 },
      { path: 'Structure.Beams', start: 0.25, end: 0.32, animation: 'slideX', offsetX: -8, offsetY: 0, offsetZ: 0 },
      { path: 'Structure.Slabs', start: 0.28, end: 0.35, animation: 'settle', offsetX: 0, offsetY: 2, offsetZ: 0 },
    ],
  },
  {
    name: 'FLOORS_WALLS',
    label: 'FLOORS & WALLS',
    start: 0.35,
    end: 0.5,
    entries: [
      { path: 'Architecture.Floors', start: 0.35, end: 0.42, animation: 'settle', offsetX: 0, offsetY: 1.5, offsetZ: 0 },
      { path: 'Architecture.Walls', start: 0.38, end: 0.46, animation: 'riseY', offsetX: 0, offsetY: -4, offsetZ: 0 },
      { path: 'Architecture.Partitions', start: 0.4, end: 0.47, animation: 'riseY', offsetX: 0, offsetY: -3, offsetZ: 0 },
      { path: 'Architecture.Stairs', start: 0.42, end: 0.5, animation: 'cascadeY', offsetX: 0, offsetY: -1, offsetZ: 0 },
    ],
  },
  {
    name: 'ROOF',
    label: 'ROOF & TERRACES',
    start: 0.5,
    end: 0.6,
    entries: [
      { path: 'Architecture.Roof', start: 0.5, end: 0.58, animation: 'settle', offsetX: 0, offsetY: 3, offsetZ: 0 },
      { path: 'Architecture.Balcony', start: 0.53, end: 0.6, animation: 'slideZ', offsetX: 0, offsetY: 0, offsetZ: 4 },
    ],
  },
  {
    name: 'ENVELOPE',
    label: 'ENVELOPE',
    start: 0.6,
    end: 0.7,
    entries: [
      { path: 'Envelope', start: 0.6, end: 0.7, animation: 'fadeIn', offsetX: 0, offsetY: 0, offsetZ: 0 },
      { path: 'Envelope.Frames', start: 0.6, end: 0.65, animation: 'settle', offsetX: 0, offsetY: 0.5, offsetZ: 0 },
      { path: 'Envelope.Windows', start: 0.62, end: 0.67, animation: 'settle', offsetX: 0, offsetY: 0.3, offsetZ: 0 },
      { path: 'Envelope.Glass', start: 0.64, end: 0.7, animation: 'fadeIn', offsetX: 0, offsetY: 0, offsetZ: 0 },
      { path: 'Envelope.Doors', start: 0.63, end: 0.68, animation: 'riseY', offsetX: 0, offsetY: -2, offsetZ: 0 },
    ],
  },
  {
    name: 'FACADE',
    label: 'FACADE',
    start: 0.7,
    end: 0.78,
    entries: [
      { path: 'Facade', start: 0.7, end: 0.78, animation: 'fadeIn', offsetX: 0, offsetY: 0, offsetZ: 0 },
      { path: 'Facade.Concrete', start: 0.7, end: 0.75, animation: 'fadeIn', offsetX: 0, offsetY: 0, offsetZ: 0 },
      { path: 'Facade.Stone', start: 0.71, end: 0.76, animation: 'slideZ', offsetX: 0, offsetY: 0, offsetZ: 2 },
      { path: 'Facade.WoodFins', start: 0.72, end: 0.78, animation: 'cascadeY', offsetX: 0, offsetY: -3, offsetZ: 0 },
      { path: 'Facade.Screens', start: 0.73, end: 0.78, animation: 'fadeIn', offsetX: 0, offsetY: 0, offsetZ: 0 },
    ],
  },
  {
    name: 'INTERIOR',
    label: 'INTERIOR',
    start: 0.78,
    end: 0.86,
    entries: [
      { path: 'Interior', start: 0.78, end: 0.86, animation: 'fadeIn', offsetX: 0, offsetY: 0, offsetZ: 0 },
      { path: 'Interior.Furniture', start: 0.78, end: 0.83, animation: 'grow', offsetX: 0, offsetY: 0, offsetZ: 0 },
      { path: 'Interior.Kitchen', start: 0.79, end: 0.84, animation: 'grow', offsetX: 0, offsetY: 0, offsetZ: 0 },
      { path: 'Interior.LivingRoom', start: 0.8, end: 0.85, animation: 'grow', offsetX: 0, offsetY: 0, offsetZ: 0 },
      { path: 'Interior.Bedroom', start: 0.8, end: 0.85, animation: 'grow', offsetX: 0, offsetY: 0, offsetZ: 0 },
      { path: 'Interior.Lighting', start: 0.82, end: 0.86, animation: 'fadeIn', offsetX: 0, offsetY: 0, offsetZ: 0 },
    ],
  },
  {
    name: 'LANDSCAPE',
    label: 'LANDSCAPE',
    start: 0.86,
    end: 0.94,
    entries: [
      { path: 'Landscape', start: 0.86, end: 0.94, animation: 'grow', offsetX: 0, offsetY: 0, offsetZ: 0 },
      { path: 'Landscape.Driveway', start: 0.86, end: 0.9, animation: 'fadeIn', offsetX: 0, offsetY: 0, offsetZ: 0 },
      { path: 'Landscape.Trees', start: 0.87, end: 0.92, animation: 'grow', offsetX: 0, offsetY: 0, offsetZ: 0 },
      { path: 'Landscape.Plants', start: 0.88, end: 0.93, animation: 'grow', offsetX: 0, offsetY: 0, offsetZ: 0 },
      { path: 'Landscape.Garden', start: 0.89, end: 0.93, animation: 'fadeIn', offsetX: 0, offsetY: 0, offsetZ: 0 },
      { path: 'Landscape.ExteriorLighting', start: 0.9, end: 0.94, animation: 'fadeIn', offsetX: 0, offsetY: 0, offsetZ: 0 },
    ],
  },
  {
    name: 'COMPLETE',
    label: 'COMPLETE',
    start: 0.94,
    end: 1.0,
    entries: [], // everything already revealed
  },
];

/** Public stage info for UI */
export const CONSTRUCTION_STAGES: StageInfo[] = STAGE_DEFINITIONS.map(
  (s) => ({ name: s.name, label: s.label, start: s.start, end: s.end }),
);

// ---------------------------------------------------------------------------
// Animator class
// ---------------------------------------------------------------------------

export class ConstructionAnimator {
  private entries: ResolvedEntry[] = [];
  private model: HouseModel;
  private allRevealed = false;

  constructor(model: HouseModel) {
    this.model = model;
    this.resolve();
    this.initHide();
  }

  // -----------------------------------------------------------------------
  // Resolve entry definitions against the loaded model
  // -----------------------------------------------------------------------

  private resolve() {
    // Discover which paths actually exist in the loaded model
    const found = new Set<string>();
    for (const stage of STAGE_DEFINITIONS) {
      for (const entry of stage.entries) {
        if (this.model.systems.has(entry.path)) {
          found.add(entry.path);
        }
      }
    }

    // Build resolved list, skipping parents whose children are individually handled
    for (const stage of STAGE_DEFINITIONS) {
      for (const entry of stage.entries) {
        if (!found.has(entry.path)) continue;

        const hasAnimatedChildren = [...found].some(
          (p) => p !== entry.path && p.startsWith(entry.path + '.'),
        );
        if (hasAnimatedChildren) continue;

        const obj = this.model.systems.get(entry.path)!;
        const orig = this.model.originals.get(obj);

        this.entries.push({
          object: obj,
          originalPos: orig?.position.clone() ?? obj.position.clone(),
          originalScale: orig?.scale.clone() ?? obj.scale.clone(),
          start: entry.start,
          end: entry.end,
          animation: entry.animation,
          offsetX: entry.offsetX,
          offsetY: entry.offsetY,
          offsetZ: entry.offsetZ,
        });
      }
    }
  }

  // -----------------------------------------------------------------------
  // Initial hide — place everything at its start-of-animation state
  // -----------------------------------------------------------------------

  private initHide() {
    // First, hide ALL meshes in the model (even unmanaged ones)
    this.model.root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.visible = false;
      }
    });

    // Position managed entries at their animation start offsets
    for (const e of this.entries) {
      if (e.animation === 'grow') {
        e.object.scale.set(0.001, 0.001, 0.001);
      }
      if (
        e.animation === 'riseY' ||
        e.animation === 'slideX' ||
        e.animation === 'slideZ' ||
        e.animation === 'settle'
      ) {
        e.object.position.set(
          e.originalPos.x + e.offsetX,
          e.originalPos.y + e.offsetY,
          e.originalPos.z + e.offsetZ,
        );
      }
    }
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private setMeshVisibility(obj: THREE.Object3D, visible: boolean) {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) child.visible = visible;
    });
  }

  private setMeshOpacity(obj: THREE.Object3D, alpha: number) {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        for (const m of mats) {
          if (m instanceof THREE.MeshStandardMaterial) {
            const origA = (m.userData.originalOpacity as number) ?? 1;
            m.transparent = true;
            m.opacity = origA * alpha;
          }
        }
      }
    });
  }

  // -----------------------------------------------------------------------
  // Per-frame update — call with current scroll progress (0–1)
  // -----------------------------------------------------------------------

  update(progress: number) {
    // Re-hide if user scrolls back from completed state
    if (progress < 0.99 && this.allRevealed) {
      this.model.root.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) obj.visible = false;
      });
      this.allRevealed = false;
    }

    // Animate each managed entry
    for (const e of this.entries) {
      const raw = clamp((progress - e.start) / (e.end - e.start));
      const t = smoothstep(raw);

      switch (e.animation) {
        case 'riseY': {
          this.setMeshVisibility(e.object, t > 0.001);
          e.object.position.set(
            e.originalPos.x,
            e.originalPos.y + e.offsetY * (1 - t),
            e.originalPos.z,
          );
          e.object.scale.copy(e.originalScale);
          break;
        }
        case 'slideX': {
          this.setMeshVisibility(e.object, t > 0.001);
          e.object.position.set(
            e.originalPos.x + e.offsetX * (1 - t),
            e.originalPos.y,
            e.originalPos.z,
          );
          e.object.scale.copy(e.originalScale);
          break;
        }
        case 'slideZ': {
          this.setMeshVisibility(e.object, t > 0.001);
          e.object.position.set(
            e.originalPos.x,
            e.originalPos.y,
            e.originalPos.z + e.offsetZ * (1 - t),
          );
          e.object.scale.copy(e.originalScale);
          break;
        }
        case 'grow': {
          this.setMeshVisibility(e.object, t > 0.001);
          const s = Math.max(t, 0.001);
          e.object.scale.set(
            e.originalScale.x * s,
            e.originalScale.y * s,
            e.originalScale.z * s,
          );
          e.object.position.copy(e.originalPos);
          break;
        }
        case 'cascadeY': {
          e.object.position.copy(e.originalPos);
          e.object.scale.copy(e.originalScale);
          const children = e.object.children;
          const count = children.length || 1;
          const stagger = 0.05;
          for (let i = 0; i < children.length; i++) {
            const childRaw = clamp(
              (raw - i * stagger) / Math.max(0.01, 1 - count * stagger),
            );
            const ct = smoothstep(childRaw);
            const origChild = this.model.originals.get(children[i]);
            if (origChild) {
              children[i].position.y =
                origChild.position.y + e.offsetY * (1 - ct);
            }
            this.setMeshVisibility(children[i], ct > 0.001);
          }
          break;
        }
        case 'fadeIn': {
          this.setMeshVisibility(e.object, t > 0.001);
          this.setMeshOpacity(e.object, t);
          e.object.position.copy(e.originalPos);
          e.object.scale.copy(e.originalScale);
          break;
        }
        case 'settle': {
          this.setMeshVisibility(e.object, t > 0.001);
          // Approaches from offset, overshoots ~3 %, then settles
          let settleT: number;
          if (raw < 0.8) {
            settleT = smoothstep(raw / 0.8);
          } else {
            const tail = (raw - 0.8) / 0.2;
            settleT = 1.0 + Math.sin(tail * Math.PI) * 0.03;
          }
          const inv = 1 - Math.min(settleT, 1.03);
          e.object.position.set(
            e.originalPos.x + e.offsetX * inv,
            e.originalPos.y + e.offsetY * inv,
            e.originalPos.z + e.offsetZ * inv,
          );
          e.object.scale.copy(e.originalScale);
          break;
        }
      }
    }

    // Final reveal — make every mesh visible once construction completes
    if (progress >= 0.995 && !this.allRevealed) {
      this.model.root.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          obj.visible = true;
          const mesh = obj as THREE.Mesh;
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          for (const m of mats) {
            if (
              m instanceof THREE.MeshStandardMaterial &&
              m.userData?.originalOpacity != null
            ) {
              m.opacity = m.userData.originalOpacity as number;
              m.transparent = (m.userData.originalOpacity as number) < 1;
            }
          }
        }
      });
      this.allRevealed = true;
    }
  }

  /** Get current stage index for a given progress value */
  getStageIndex(progress: number): number {
    let idx = 0;
    for (let i = 0; i < CONSTRUCTION_STAGES.length; i++) {
      if (progress >= CONSTRUCTION_STAGES[i].start) idx = i;
    }
    return idx;
  }
}
