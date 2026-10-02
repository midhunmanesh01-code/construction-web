/**
 * Enhanced PBR lighting setup for the architectural scene.
 * Provides key (sun), fill (hemisphere), rim, and interior point lights.
 * Light intensity ramps up as construction progresses.
 */
import * as THREE from 'three';

export interface SceneLighting {
  sun: THREE.DirectionalLight;
  rim: THREE.DirectionalLight;
  hemisphere: THREE.HemisphereLight;
  pointLights: THREE.PointLight[];
  update: (progress: number) => void;
}

export function createLighting(scene: THREE.Scene): SceneLighting {
  // Sky + ground ambient
  const hemisphere = new THREE.HemisphereLight(0xcfd6e0, 0x2a2622, 0.55);
  scene.add(hemisphere);

  // Key light — warm sun from upper-left
  const sun = new THREE.DirectionalLight(0xffe0b0, 1.7);
  sun.position.set(-22, 26, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -26,
    right: 26,
    top: 26,
    bottom: -26,
    near: 1,
    far: 80,
  });
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  // Rim / fill light — cool from behind-right
  const rim = new THREE.DirectionalLight(0x7090b8, 0.6);
  rim.position.set(20, 10, -22);
  scene.add(rim);

  // Interior architectural point lights (positioned inside the house volume)
  const pointPositions: [number, number, number][] = [
    [-3, 2.6, 0],
    [0, 2.6, 1],
    [3, 2.6, 0],
    [-3, 6, 0],
    [3, 6, 0],
  ];
  const pointLights = pointPositions.map((p) => {
    const l = new THREE.PointLight(0xffc27a, 0, 13, 2);
    l.position.set(...p);
    scene.add(l);
    return l;
  });

  function update(progress: number) {
    // Sun brightens as building progresses
    sun.intensity = 1.2 + progress * 0.6;

    // Interior lights activate at ~78% (interior stage)
    const t = Math.max(0, Math.min(1, (progress - 0.75) / 0.1));
    const li = t * t * (3 - 2 * t); // smoothstep easing
    pointLights.forEach((l) => {
      l.intensity = li * 1.4;
    });
  }

  return { sun, rim, hemisphere, pointLights, update };
}
