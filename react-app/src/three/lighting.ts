/**
 * Enhanced PBR lighting setup for the architectural scene.
 * Captures the signature tropical-modern dusk ambiance from the reference board:
 *   - Golden-amber key sunlight
 *   - Deep indigo/sapphire twilight fill
 *   - Warm interior 2700K architectural cove and downlights
 *   - Ground driveway and perimeter landscape accent lights
 *   - Multi-mode lighting (Dusk, Golden Hour, Night, Blueprint)
 */
import * as THREE from 'three';
import type { LightingMode } from './sceneState';

export interface SceneLighting {
  sun: THREE.DirectionalLight;
  rim: THREE.DirectionalLight;
  hemisphere: THREE.HemisphereLight;
  pointLights: THREE.PointLight[];
  landscapeLights: THREE.PointLight[];
  update: (progress: number, mode: LightingMode) => void;
}

export function createLighting(scene: THREE.Scene): SceneLighting {
  // Sky + ground ambient
  const hemisphere = new THREE.HemisphereLight(0xcad4e0, 0x1f1d1a, 0.65);
  scene.add(hemisphere);

  // Key light — warm sun from upper-left (dusk / golden hour angle)
  const sun = new THREE.DirectionalLight(0xffdfb3, 1.8);
  sun.position.set(-22, 24, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -28,
    right: 28,
    top: 28,
    bottom: -28,
    near: 1,
    far: 90,
  });
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  // Rim / fill light — cool indigo/sapphire from behind-right (twilight sky fill)
  const rim = new THREE.DirectionalLight(0x5c7a9e, 0.75);
  rim.position.set(22, 12, -22);
  scene.add(rim);

  // Interior architectural point lights (inside the house volume at ground and upper floors)
  const interiorPointPositions: [number, number, number][] = [
    [-3.5, 2.8, 0.5],  // Ground living double-height
    [0.0, 2.8, 1.2],   // Ground entry foyer
    [3.5, 2.8, -0.5],  // Ground kitchen / dining
    [-3.5, 6.2, 0.5],  // Upper master suite
    [3.5, 6.2, -0.5],  // Upper bedroom / bath
    [0.0, 6.2, 1.0],   // Upper corridor / stairwell
  ];

  const pointLights = interiorPointPositions.map((pos) => {
    const light = new THREE.PointLight(0xffb86c, 0, 16, 2.2);
    light.position.set(...pos);
    scene.add(light);
    return light;
  });

  // Landscape exterior accent lights (driveway and boundary walls)
  const landscapePositions: [number, number, number][] = [
    [-8, 0.4, 10],   // Driveway entrance
    [8, 0.4, 9],     // Carport perimeter
    [-12, 0.4, 4],   // Left boundary wall
    [12, 0.4, 4],    // Right boundary wall
    [0, 0.3, 12],    // Front steps
  ];

  const landscapeLights = landscapePositions.map((pos) => {
    const light = new THREE.PointLight(0xffc280, 0, 8, 2.0);
    light.position.set(...pos);
    scene.add(light);
    return light;
  });

  function update(progress: number, mode: LightingMode = 'dusk') {
    // Stage-based intensity ramp (interior & exterior lights turn on as construction finishes)
    const interiorRamp = Math.max(0, Math.min(1, (progress - 0.72) / 0.12));
    const smoothInterior = interiorRamp * interiorRamp * (3 - 2 * interiorRamp);

    const landscapeRamp = Math.max(0, Math.min(1, (progress - 0.84) / 0.1));
    const smoothLandscape = landscapeRamp * landscapeRamp * (3 - 2 * landscapeRamp);

    switch (mode) {
      case 'dusk':
        // Signature warm hero dusk
        sun.color.setHex(0xffcb8f);
        sun.intensity = 1.3 + progress * 0.5;
        sun.position.set(-22, 22, 18);
        rim.color.setHex(0x5c7a9e);
        rim.intensity = 0.8;
        hemisphere.color.setHex(0x8fa3bf);
        hemisphere.groundColor.setHex(0x28231c);
        hemisphere.intensity = 0.65;
        pointLights.forEach((l) => {
          l.color.setHex(0xffaa55);
          l.intensity = smoothInterior * 1.8;
        });
        landscapeLights.forEach((l) => {
          l.color.setHex(0xffc078);
          l.intensity = smoothLandscape * 1.2;
        });
        break;

      case 'golden':
        // Warm low-angle golden hour sunlight
        sun.color.setHex(0xffaa44);
        sun.intensity = 2.4;
        sun.position.set(-28, 14, 22);
        rim.color.setHex(0x738a9e);
        rim.intensity = 0.5;
        hemisphere.color.setHex(0xf4c28d);
        hemisphere.groundColor.setHex(0x38281a);
        hemisphere.intensity = 0.7;
        pointLights.forEach((l) => {
          l.color.setHex(0xffbb77);
          l.intensity = smoothInterior * 1.2;
        });
        landscapeLights.forEach((l) => {
          l.color.setHex(0xffcc88);
          l.intensity = smoothLandscape * 0.7;
        });
        break;

      case 'night':
        // Dramatic nocturnal architectural lighting
        sun.color.setHex(0x405570);
        sun.intensity = 0.35;
        sun.position.set(-10, 28, 10);
        rim.color.setHex(0x354b68);
        rim.intensity = 0.6;
        hemisphere.color.setHex(0x1a2433);
        hemisphere.groundColor.setHex(0x0a0c10);
        hemisphere.intensity = 0.3;
        pointLights.forEach((l) => {
          l.color.setHex(0xff9933);
          l.intensity = Math.max(1.0, smoothInterior * 2.6);
        });
        landscapeLights.forEach((l) => {
          l.color.setHex(0xffaa44);
          l.intensity = Math.max(0.8, smoothLandscape * 1.8);
        });
        break;

      case 'blueprint':
        // Technical high-contrast lighting for wireframes & drawings
        sun.color.setHex(0xffffff);
        sun.intensity = 1.0;
        sun.position.set(0, 30, 20);
        rim.color.setHex(0x88bbff);
        rim.intensity = 0.6;
        hemisphere.color.setHex(0x304055);
        hemisphere.groundColor.setHex(0x101520);
        hemisphere.intensity = 0.9;
        pointLights.forEach((l) => {
          l.intensity = 0;
        });
        landscapeLights.forEach((l) => {
          l.intensity = 0;
        });
        break;
    }
  }

  return { sun, rim, hemisphere, pointLights, landscapeLights, update };
}
