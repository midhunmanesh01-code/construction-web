/**
 * Three.js scene engine — the core render loop for M&M Constructions.
 *
 * Responsibilities:
 *   1. Renderer, scene, camera, fog, ground plane, dust particles
 *   2. Load the signature house GLB via modelLoader
 *   3. Drive construction animation, exploded view, camera, lighting
 *   4. Blueprint/wireframe overlay for post-pin sections
 *   5. Placeholder when GLB is not available
 *
 * This is imperative WebGL code, NOT React-ified.
 * It attaches to a canvas element and runs its own animation loop.
 */
import * as THREE from 'three';
import { sceneState } from './sceneState';
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
}

// --- Noise texture generator (for ground plane) ---
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
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  R.setPixelRatio(Math.min(devicePixelRatio, 2));
  R.shadowMap.enabled = true;
  R.shadowMap.type = THREE.PCFSoftShadowMap;
  R.outputColorSpace = THREE.SRGBColorSpace;
  R.toneMapping = THREE.ACESFilmicToneMapping;
  R.toneMappingExposure = 1.15;

  // --- Scene ---
  const S = new THREE.Scene();
  S.fog = new THREE.Fog(0x161616, 35, 95);

  // --- Camera ---
  const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 200);

  // --- Lighting ---
  const lighting = createLighting(S);

  // --- Ground plane (always visible, independent of model) ---
  (() => {
    const alphaCanvas = document.createElement('canvas');
    alphaCanvas.width = alphaCanvas.height = 256;
    const ctx = alphaCanvas.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
    g.addColorStop(0, '#fff');
    g.addColorStop(0.55, '#fff');
    g.addColorStop(1, '#000');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);

    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(80, 64),
      new THREE.MeshStandardMaterial({
        color: 0x34343a,
        roughness: 1,
        map: noiseTexture(150, 50, 40),
        alphaMap: new THREE.CanvasTexture(alphaCanvas),
        transparent: true,
      }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.01;
    mesh.receiveShadow = true;
    S.add(mesh);
  })();

  // --- Building group container ---
  const G = new THREE.Group();
  S.add(G);

  // --- Camera Director ---
  const cameraDirector = new CameraDirector(cam);

  // --- Placeholder (visible until model loads) ---
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

  // --- Annotation positions (defaults for a two-storey house) ---
  const ap = [
    new THREE.Vector3(0, 0.5, 6), //   FOUNDATION
    new THREE.Vector3(0, 4, 6), //      STRUCTURE
    new THREE.Vector3(7, 4.5, 0), //    ENVELOPE
    new THREE.Vector3(0, 2.5, 0), //    INTERIOR
    new THREE.Vector3(-6, 1, 8), //     LANDSCAPE
  ];

  // --- Load GLB model ---
  loadHouseModel().then((model) => {
    if (!model) return;

    houseModel = model;

    // Remove placeholder
    if (placeholder) {
      G.remove(placeholder.group);
      placeholder.dispose();
      placeholder = null;
    }

    // Add model to scene
    G.add(model.root);

    // Create animation systems
    animator = new ConstructionAnimator(model);
    explodedViewCtrl = new ExplodedView(model);

    // Sync construction state to current scroll progress
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

    // Add edge wireframes for blueprint mode
    edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xe9d3a8,
      transparent: true,
      opacity: 0,
    });
    const edgeMat = edgeMaterial;
    model.meshes.forEach((mesh) => {
      try {
        const edges = new THREE.EdgesGeometry(mesh.geometry, 30);
        mesh.add(new THREE.LineSegments(edges, edgeMat));
      } catch {
        // Skip meshes whose geometry can't generate edges
      }
    });

    sceneState.modelLoaded = true;
    G.updateMatrixWorld(true);
  });

  // --- Dust particles ---
  const DUST_COUNT = 500;
  const dp = new Float32Array(DUST_COUNT * 3);
  for (let i = 0; i < DUST_COUNT; i++) {
    dp[i * 3] = (Math.random() - 0.5) * 60;
    dp[i * 3 + 1] = Math.random() * 16;
    dp[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  S.add(
    new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        size: 0.09,
        color: 0xffe0b0,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      }),
    ),
  );

  // --- Animation loop ---
  let animId: number;
  let disposed = false;

  function frame(t: number) {
    if (disposed) return;
    animId = requestAnimationFrame(frame);

    const st = sceneState;
    st.time = t;

    // ----- Lighting -----
    lighting.update(st.pe);

    // ----- Construction animation -----
    if (animator) {
      animator.update(st.pe);
    }

    // ----- Exploded view -----
    if (explodedViewCtrl) {
      st.explodedBlend += (st.targetExploded - st.explodedBlend) * 0.04;
      explodedViewCtrl.update(st.explodedBlend);
    }

    // ----- Blueprint mode (only when construction is complete) -----
    if (houseModel && st.pe >= 0.99) {
      const bpBlend = st.bp;
      materialEntries.forEach(({ mat, origOpacity }) => {
        if (bpBlend > 0.01) {
          mat.transparent = true;
          mat.opacity = origOpacity * (1 - 0.85 * bpBlend);
        } else {
          mat.opacity = origOpacity;
          mat.transparent = origOpacity < 1;
        }
      });
      if (edgeMaterial) {
        edgeMaterial.opacity = bpBlend * 0.9;
      }
    }

    // ----- Placeholder animation -----
    if (placeholder) {
      placeholder.update(t);
    }

    // ----- Camera -----
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
    );

    // ----- Dust particles -----
    const posAttr = dustGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < DUST_COUNT; i++) {
      posAttr.array[i * 3 + 1] += 0.004;
      posAttr.array[i * 3] += Math.sin(t * 3e-4 + i) * 0.002;
      if (posAttr.array[i * 3 + 1] > 16) posAttr.array[i * 3 + 1] = 0;
    }
    posAttr.needsUpdate = true;

    // ----- Render -----
    R.render(S, cam);
  }

  // --- Resize ---
  function resize() {
    R.setSize(innerWidth, innerHeight, false);
    cam.aspect = innerWidth / innerHeight;
    cam.fov = innerWidth < innerHeight ? 60 : 42;
    cam.updateProjectionMatrix();
  }

  resize();
  animId = requestAnimationFrame(frame);

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(animId);
      R.dispose();
    },
    resize,
    getCamera: () => cam,
    getGroup: () => G,
    getAnnotationPositions: () => ap,
  };
}
