/**
 * Three.js scene engine — the core render loop for M&M Constructions.
 *
 * Responsibilities:
 *   1. WebGL Renderer, Scene, Camera, Atmospheric Fog, Ground Plane, Dust Particles
 *   2. Load the signature house GLB via modelLoader
 *   3. Drive 10-stage physical construction sequence, exploded view, multi-angle camera, multi-mode lighting
 *   4. Technical blueprint / wireframe overlay with edge geometries
 *   5. Architectural wireframe schematic placeholder when GLB is absent
 *
 * Zero procedural boxes/crane. Fully modular and GLB-ready.
 */
import * as THREE from 'three';
import { sceneState, type ViewMode, type LightingMode } from './sceneState';
import { createLighting } from './lighting';
import { createPlaceholder, type Placeholder } from './placeholder';
import { loadHouseModel, type HouseModel } from './modelLoader';
import { ConstructionAnimator } from './constructionAnimator';
import { CameraDirector } from './cameraDirector';
import { ExplodedView } from './explodedView';

export interface SceneEngine {
  dispose: () => void;
  resize: () => void;
  getCamera: () => THREE.PerspectiveCamera;
  getGroup: () => THREE.Group;
  getAnnotationPositions: () => THREE.Vector3[];
  setViewMode: (mode: ViewMode) => void;
  setLightingMode: (mode: LightingMode) => void;
  inspectSpace: (spaceId: string | null) => void;
  setExplodedBlend: (val: number) => void;
}

// Noise texture generator for the ground plane
function noiseTexture(
  base: number,
  amp: number,
  rep: number,
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const id = ctx.createImageData(256, 256);
  for (let i = 0; i < id.data.length; i += 4) {
    id.data[i] = id.data[i + 1] = id.data[i + 2] =
      base + (Math.random() - 0.5) * amp;
    id.data[i + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep, rep);
  return t;
}

export function createScene(canvas: HTMLCanvasElement): SceneEngine {
  // --- Renderer ---
  const R = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  R.shadowMap.enabled = true;
  R.shadowMap.type = THREE.PCFSoftShadowMap;
  R.outputColorSpace = THREE.SRGBColorSpace;
  R.toneMapping = THREE.ACESFilmicToneMapping;
  R.toneMappingExposure = 1.2;

  // --- Scene ---
  const S = new THREE.Scene();
  S.fog = new THREE.Fog(0x101114, 32, 100);

  // --- Camera ---
  const cam = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 250);

  // --- Lighting ---
  const lighting = createLighting(S);

  // --- Architectural Ground Plane ---
  (() => {
    const alphaCanvas = document.createElement('canvas');
    alphaCanvas.width = alphaCanvas.height = 512;
    const ctx = alphaCanvas.getContext('2d')!;
    const g = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.5, 'rgba(255,255,255,0.85)');
    g.addColorStop(0.85, 'rgba(255,255,255,0.25)');
    g.addColorStop(1, '#000000');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);

    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(90, 64),
      new THREE.MeshStandardMaterial({
        color: 0x1f2024,
        roughness: 0.95,
        metalness: 0.1,
        map: noiseTexture(140, 45, 50),
        alphaMap: new THREE.CanvasTexture(alphaCanvas),
        transparent: true,
      }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.01;
    mesh.receiveShadow = true;
    S.add(mesh);
  })();

  // --- Building Root Container ---
  const G = new THREE.Group();
  S.add(G);

  // --- Camera Director ---
  const cameraDirector = new CameraDirector(cam);

  // --- Placeholder (Architectural holographic wireframe) ---
  let placeholder: Placeholder | null = createPlaceholder();
  G.add(placeholder.group);

  // --- Model state ---
  let houseModel: HouseModel | null = null;
  let animator: ConstructionAnimator | null = null;
  let explodedViewCtrl: ExplodedView | null = null;
  let edgeMaterial: THREE.LineBasicMaterial | null = null;
  const materialEntries: {
    mat: THREE.MeshStandardMaterial;
    origOpacity: number;
  }[] = [];

  // --- 3D Annotation Anchors (Key architectural systems) ---
  const annotationPositions = [
    new THREE.Vector3(0, 0.4, 7.5),     // 01. FOUNDATION & PLINTH
    new THREE.Vector3(-7.5, 3.8, 5.5),  // 02. STRUCTURAL COLUMNS & CANTILEVER
    new THREE.Vector3(-2.0, 7.4, 5.8),  // 03. FLOATING ROOF SLAB & LOUVERS
    new THREE.Vector3(0.0, 2.6, 2.0),   // 04. DOUBLE-HEIGHT LIVING ATRIUM
    new THREE.Vector3(8.0, 0.5, 8.5),   // 05. TROPICAL LANDSCAPE & DRIVEWAY
  ];

  // --- Load GLB model ---
  loadHouseModel().then((model) => {
    if (!model) return;

    houseModel = model;

    // Remove placeholder when real GLB is loaded
    if (placeholder) {
      G.remove(placeholder.group);
      placeholder.dispose();
      placeholder = null;
    }

    // Add real architectural model to scene
    G.add(model.root);

    // Create animation controllers
    animator = new ConstructionAnimator(model);
    explodedViewCtrl = new ExplodedView(model);

    // Sync construction state to current progress
    animator.update(sceneState.pe);

    // Collect materials for blueprint mode
    model.meshes.forEach((mesh) => {
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      mats.forEach((m) => {
        if (m instanceof THREE.MeshStandardMaterial) {
          materialEntries.push({
            mat: m,
            origOpacity:
              (m.userData.originalOpacity as number | undefined) ?? m.opacity,
          });
        }
      });
    });

    // Add architectural edge lines for blueprint mode
    edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xe5caa0,
      transparent: true,
      opacity: 0,
    });
    const edgeMat = edgeMaterial;
    model.meshes.forEach((mesh) => {
      try {
        const edges = new THREE.EdgesGeometry(mesh.geometry, 28);
        mesh.add(new THREE.LineSegments(edges, edgeMat));
      } catch {
        // Skip geometries that don't support edge generation
      }
    });

    sceneState.modelLoaded = true;
    G.updateMatrixWorld(true);
  });

  // --- Atmospheric Ambient Dust / Stardust Particles ---
  const DUST_COUNT = 600;
  const dp = new Float32Array(DUST_COUNT * 3);
  for (let i = 0; i < DUST_COUNT; i++) {
    dp[i * 3] = (Math.random() - 0.5) * 70;
    dp[i * 3 + 1] = Math.random() * 20;
    dp[i * 3 + 2] = (Math.random() - 0.5) * 70;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dustPoints = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      size: 0.1,
      color: 0xffdca8,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    }),
  );
  S.add(dustPoints);

  // --- Animation loop ---
  let animId: number;
  let disposed = false;

  function frame(t: number) {
    if (disposed) return;
    animId = requestAnimationFrame(frame);

    const st = sceneState;
    st.time = t;

    // ----- Lighting update -----
    lighting.update(st.pe, st.lightingMode);

    // ----- Construction animation -----
    if (animator) {
      animator.update(st.pe);
    }

    // ----- Exploded view update -----
    if (explodedViewCtrl) {
      st.explodedBlend += (st.targetExploded - st.explodedBlend) * 0.05;
      explodedViewCtrl.update(st.explodedBlend);
    }

    // ----- Blueprint mode -----
    if (houseModel && st.pe >= 0.98) {
      const bpBlend = st.lightingMode === 'blueprint' ? 1.0 : st.bp;
      materialEntries.forEach(({ mat, origOpacity }) => {
        if (bpBlend > 0.01) {
          mat.transparent = true;
          mat.opacity = origOpacity * (1 - 0.88 * bpBlend);
        } else {
          mat.opacity = origOpacity;
          mat.transparent = origOpacity < 1;
        }
      });
      if (edgeMaterial) {
        edgeMaterial.opacity = bpBlend * 0.95;
      }
    }

    // ----- Placeholder animation (progressive reveal + exploded view) -----
    if (placeholder) {
      placeholder.update(t, st.pe, st.targetExploded);
    }

    // ----- Camera director update -----
    st.cx += (st.mx - st.cx) * 0.05;
    st.cy += (st.my - st.cy) * 0.05;

    cameraDirector.update(
      st.pe,
      st.q,
      st.rm,
      st.inK,
      st.cx,
      st.cy,
      st.lp,
      st.viewMode,
      st.activeSpace,
    );

    // ----- Dust particles animation -----
    const posAttr = dustGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < DUST_COUNT; i++) {
      posAttr.array[i * 3 + 1] += 0.005;
      posAttr.array[i * 3] += Math.sin(t * 0.00025 + i) * 0.002;
      if (posAttr.array[i * 3 + 1] > 20) posAttr.array[i * 3 + 1] = 0;
    }
    posAttr.needsUpdate = true;

    // ----- Render frame -----
    R.render(S, cam);
  }

  // --- Resize handler ---
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    R.setSize(w, h, false);
    cam.aspect = w / h;
    cam.fov = w < h ? 58 : 40;
    cam.updateProjectionMatrix();
  }

  resize();
  window.addEventListener('resize', resize);
  animId = requestAnimationFrame(frame);

  return {
    dispose() {
      disposed = true;
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
      R.dispose();
    },
    resize,
    getCamera: () => cam,
    getGroup: () => G,
    getAnnotationPositions: () => annotationPositions,
    setViewMode(mode: ViewMode) {
      sceneState.viewMode = mode;
      sceneState.activeSpace = null;
    },
    setLightingMode(mode: LightingMode) {
      sceneState.lightingMode = mode;
    },
    inspectSpace(spaceId: string | null) {
      sceneState.activeSpace = spaceId;
      if (spaceId) {
        sceneState.viewMode = spaceId as ViewMode;
      } else {
        sceneState.viewMode = 'scroll';
      }
    },
    setExplodedBlend(val: number) {
      sceneState.targetExploded = val;
    },
  };
}
