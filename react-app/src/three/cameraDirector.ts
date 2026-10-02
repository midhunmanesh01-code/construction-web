/**
 * Cinematic camera director for the M&M architectural visualization experience.
 * Supports:
 *   1. 10-shot choreographed sequence during scroll-driven construction pin
 *   2. Multi-angle architectural viewpoint presets (Front, Front-Left, Front-Right, Rear, Left, Right, Top)
 *   3. Interior space exploration fly-ins (Living, Kitchen, Master Suite, Bath, Terrace, Roof Plan)
 *   4. Exploded Axonometric View perspective
 *   5. Smooth damping and mouse parallax
 */
import * as THREE from 'three';
import type { ViewMode } from './sceneState';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class CameraDirector {
  private cam: THREE.PerspectiveCamera;
  private posPath: THREE.CatmullRomCurve3;
  private tgtPath: THREE.CatmullRomCurve3;
  private orbitAngle0: number;
  private orbitRadius0: number;

  // Current interpolated camera transform
  private currentPos = new THREE.Vector3(-18, 7.5, 20);
  private currentTgt = new THREE.Vector3(0, 3.2, 0);

  // Reusable vectors
  private tp = new THREE.Vector3();
  private tt = new THREE.Vector3();
  private tmp = new THREE.Vector3();

  // Preset viewpoint camera targets and positions
  private viewPresets: Record<string, { pos: THREE.Vector3; tgt: THREE.Vector3; fov: number }> = {
    front: {
      pos: new THREE.Vector3(0, 4.0, 24),
      tgt: new THREE.Vector3(0, 3.5, 0),
      fov: 38,
    },
    frontLeft: {
      pos: new THREE.Vector3(-18, 7.5, 20),
      tgt: new THREE.Vector3(0, 3.2, 0),
      fov: 42,
    },
    frontRight: {
      pos: new THREE.Vector3(19, 7.0, 18),
      tgt: new THREE.Vector3(1, 3.2, 0),
      fov: 40,
    },
    rear: {
      pos: new THREE.Vector3(0, 5.0, -24),
      tgt: new THREE.Vector3(0, 3.2, 0),
      fov: 40,
    },
    left: {
      pos: new THREE.Vector3(-24, 5.5, 0),
      tgt: new THREE.Vector3(0, 3.5, 0),
      fov: 38,
    },
    right: {
      pos: new THREE.Vector3(24, 5.5, 0),
      tgt: new THREE.Vector3(0, 3.5, 0),
      fov: 38,
    },
    top: {
      pos: new THREE.Vector3(0, 34, 4),
      tgt: new THREE.Vector3(0, 0, 0),
      fov: 32,
    },
    living: {
      pos: new THREE.Vector3(-2.8, 2.4, 4.5),
      tgt: new THREE.Vector3(1.2, 2.8, -1.5),
      fov: 52,
    },
    kitchen: {
      pos: new THREE.Vector3(4.5, 2.2, 2.8),
      tgt: new THREE.Vector3(-0.5, 2.0, -1.0),
      fov: 50,
    },
    bedroom: {
      pos: new THREE.Vector3(-3.8, 5.8, 2.5),
      tgt: new THREE.Vector3(0.5, 5.6, -1.8),
      fov: 50,
    },
    bathroom: {
      pos: new THREE.Vector3(3.2, 5.6, -1.2),
      tgt: new THREE.Vector3(0.0, 5.4, 1.2),
      fov: 50,
    },
    terrace: {
      pos: new THREE.Vector3(-4.5, 6.2, 5.8),
      tgt: new THREE.Vector3(1.0, 5.2, 0.5),
      fov: 48,
    },
    roofdeck: {
      pos: new THREE.Vector3(0, 26, 8),
      tgt: new THREE.Vector3(0, 4, 0),
      fov: 38,
    },
    exploded: {
      pos: new THREE.Vector3(-22, 14, 24),
      tgt: new THREE.Vector3(0, 4.0, 0),
      fov: 42,
    },
  };

  constructor(camera: THREE.PerspectiveCamera) {
    this.cam = camera;

    // 10-shot camera position path (CatmullRom for smooth architectural sequence)
    this.posPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-14.0, 4.5, 20.5), // 01 — Wide establishing exterior view (matching master reference)
      new THREE.Vector3(-10.0, 2.2, 16.0), // 02 — Low foundation approach
      new THREE.Vector3(-7.5, 4.0, 13.5),  // 03 — Rising alongside RCC columns
      new THREE.Vector3(-4.0, 3.6, 9.5),   // 04 — Passing through structural frame
      new THREE.Vector3(9.5, 5.0, 13.5),   // 05 — Exterior architectural sweep over carport
      new THREE.Vector3(6.5, 6.8, 12.0),   // 06 — Approaching upper terrace & pergola
      new THREE.Vector3(-5.5, 3.0, 8.5),   // 07 — Moving along glass envelope & teak louvers
      new THREE.Vector3(-2.2, 2.6, 4.8),   // 08 — Revealing double-height living & stair
      new THREE.Vector3(-10.5, 6.0, 17.5), // 09 — Pulling back as landscaping blooms
      new THREE.Vector3(-14.0, 4.5, 20.5), // 10 — Final hero architectural dusk perspective
    ]);

    // 10-shot camera target path
    this.tgtPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.5, 3.2, 0.0),    // 01 — Building composition center
      new THREE.Vector3(-1.0, 1.2, 0.0),   // 02 — Foundation plinth
      new THREE.Vector3(-1.5, 3.5, 0.0),   // 03 — Structure midpoint
      new THREE.Vector3(0.0, 3.0, 0.0),    // 04 — Interior frame
      new THREE.Vector3(2.5, 3.4, 0.0),    // 05 — Building center
      new THREE.Vector3(4.0, 5.2, 0.0),    // 06 — Pergola & terrace detail
      new THREE.Vector3(-3.0, 2.8, 0.0),   // 07 — Glass curtain
      new THREE.Vector3(0.5, 2.8, -1.0),   // 08 — Double-height atrium
      new THREE.Vector3(0.0, 3.2, 0.0),    // 09 — Complete residence
      new THREE.Vector3(0.5, 3.2, 0.0),    // 10 — Final composition
    ]);

    this.orbitAngle0 = Math.atan2(20.5, -14.0);
    this.orbitRadius0 = Math.hypot(14.0, 20.5);
  }

  /**
   * Update camera position/target for the current frame.
   */
  update(
    pinProgress: number,
    postPinProgress: number,
    radiusMultiplier: number,
    interiorBlend: number,
    smoothMouseX: number,
    smoothMouseY: number,
    sectionLP: number,
    viewMode: ViewMode = 'scroll',
    activeSpace: string | null = null,
  ) {
    const { tp, tt, tmp, cam } = this;

    // Check if a specific preset mode is active
    const targetPresetKey =
      activeSpace && this.viewPresets[activeSpace]
        ? activeSpace
        : viewMode !== 'scroll' && this.viewPresets[viewMode]
        ? viewMode
        : null;

    if (targetPresetKey && this.viewPresets[targetPresetKey]) {
      const preset = this.viewPresets[targetPresetKey];
      tp.copy(preset.pos);
      tt.copy(preset.tgt);
      cam.fov = lerp(cam.fov, preset.fov, 0.05);
      cam.updateProjectionMatrix();
    } else if (postPinProgress < 0.001) {
      // --- Pin section: follow 10-shot cinematographic path ---
      this.posPath.getPoint(clamp(pinProgress), tp);
      this.tgtPath.getPoint(clamp(pinProgress), tt);
      cam.fov = lerp(cam.fov, innerWidth < innerHeight ? 56 : 40, 0.05);
      cam.updateProjectionMatrix();
    } else {
      // --- Post-pin: smooth orbit around the completed house ---
      const th = this.orbitAngle0 - postPinProgress * Math.PI * 1.4;
      const r = (this.orbitRadius0 + postPinProgress * 12) * radiusMultiplier;
      tp.set(
        Math.cos(th) * r,
        (7.5 + postPinProgress * 3.5) * lerp(1, 0.55, clamp(2 - radiusMultiplier * 1.4)),
        Math.sin(th) * r,
      );
      tt.set(0, 3.2, 0);
    }

    // Interior walkthrough mode blend
    if (interiorBlend > 0.002) {
      tmp.set(-4 + 8 * sectionLP, 2.2, 3.6);
      tp.lerp(tmp, interiorBlend);
      tmp.set((-4 + 8 * sectionLP) * 0.6, 2.4, -3.8);
      tt.lerp(tmp, interiorBlend);
    }

    // Smooth exponential damping toward target transform
    this.currentPos.lerp(tp, 0.08);
    this.currentTgt.lerp(tt, 0.08);

    // Apply mouse parallax
    cam.position.copy(this.currentPos);
    cam.position.x += smoothMouseX * 0.8;
    cam.position.y -= smoothMouseY * 0.45;
    cam.lookAt(this.currentTgt);
  }
}
