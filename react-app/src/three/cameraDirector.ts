/**
 * Cinematic camera director for the construction scroll experience.
 * 10-shot choreographed path during pin section, smooth orbit for post-pin.
 * Mouse parallax and interior mode blending are handled here.
 */
import * as THREE from 'three';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class CameraDirector {
  private cam: THREE.PerspectiveCamera;
  private posPath: THREE.CatmullRomCurve3;
  private tgtPath: THREE.CatmullRomCurve3;
  private orbitAngle0: number;
  private orbitRadius0: number;

  // Reusable temp vectors (avoid per-frame allocation)
  private tp = new THREE.Vector3();
  private tt = new THREE.Vector3();
  private tmp = new THREE.Vector3();

  constructor(camera: THREE.PerspectiveCamera) {
    this.cam = camera;

    // 10-shot camera position path (CatmullRom gives smooth interpolation)
    this.posPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-20, 12, 25), //  01 — wide establishing shot
      new THREE.Vector3(-12, 2.5, 16), // 02 — low foundation approach
      new THREE.Vector3(-8, 5, 12), //    03 — rising alongside columns
      new THREE.Vector3(-3, 3.5, 8), //   04 — through the structural frame
      new THREE.Vector3(9, 5.5, 11), //   05 — three-quarter exterior orbit
      new THREE.Vector3(6, 3.5, 8.5), //  06 — close facade approach
      new THREE.Vector3(2, 2.8, 6.5), //  07 — approaching glass
      new THREE.Vector3(-1, 2.2, 3.5), // 08 — interior reveal
      new THREE.Vector3(-10, 7, 15), //   09 — pulling back
      new THREE.Vector3(-18, 8, 22), //   10 — final cinematic wide
    ]);

    // 10-shot camera target path
    this.tgtPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), //      01 — site center
      new THREE.Vector3(0, 0.5, 0), //    02 — foundation
      new THREE.Vector3(0, 3.5, 0), //    03 — structure mid
      new THREE.Vector3(0, 3, -1), //     04 — interior structure
      new THREE.Vector3(0, 3.5, 0), //    05 — building center
      new THREE.Vector3(0, 4, 3), //      06 — facade detail
      new THREE.Vector3(0, 2.5, 0), //    07 — through glass
      new THREE.Vector3(1, 2.5, -1), //   08 — living room
      new THREE.Vector3(0, 3, 0), //      09 — full building
      new THREE.Vector3(0, 3.5, 0), //    10 — complete house
    ]);

    // Post-pin orbit starts from the same angle as the final camera shot
    this.orbitAngle0 = Math.atan2(22, -18);
    this.orbitRadius0 = Math.hypot(18, 22);
  }

  /**
   * Update camera position/target for the current frame.
   *
   * @param pinProgress    Smoothed build progress during pin section (0–1)
   * @param postPinProgress Post-pin scroll progress (0–1, 0 while in pin)
   * @param radiusMultiplier Orbit radius factor from section data-rm
   * @param interiorBlend  Interior camera blend (0=normal, 1=interior walk)
   * @param smoothMouseX   Smoothed normalised mouse X (-0.5…0.5)
   * @param smoothMouseY   Smoothed normalised mouse Y (-0.5…0.5)
   * @param sectionLP      Local progress within the current section (for interior look direction)
   */
  update(
    pinProgress: number,
    postPinProgress: number,
    radiusMultiplier: number,
    interiorBlend: number,
    smoothMouseX: number,
    smoothMouseY: number,
    sectionLP: number,
  ) {
    const { tp, tt, tmp, cam } = this;

    if (postPinProgress < 0.001) {
      // --- Pin section: follow cinematographic path ---
      this.posPath.getPoint(clamp(pinProgress), tp);
      this.tgtPath.getPoint(clamp(pinProgress), tt);
    } else {
      // --- Post-pin: orbit around the completed house ---
      const th = this.orbitAngle0 - postPinProgress * Math.PI * 1.4;
      const r =
        (this.orbitRadius0 + postPinProgress * 14) * radiusMultiplier;
      tp.set(
        Math.cos(th) * r,
        (8 + postPinProgress * 4) *
          lerp(1, 0.55, clamp(2 - radiusMultiplier * 1.4)),
        Math.sin(th) * r,
      );
      tt.set(0, 3.2, 0);
    }

    // Interior mode — blend camera toward interior walkthrough position
    if (interiorBlend > 0.002) {
      tmp.set(-4 + 8 * sectionLP, 2.1, 3.4);
      tp.lerp(tmp, interiorBlend);
      tmp.set((-4 + 8 * sectionLP) * 0.6, 2.3, -4);
      tt.lerp(tmp, interiorBlend);
    }

    // Apply mouse parallax
    cam.position.copy(tp);
    cam.position.x += smoothMouseX * 0.9;
    cam.position.y -= smoothMouseY * 0.5;
    cam.lookAt(tt);
  }
}
