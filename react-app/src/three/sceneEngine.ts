/**
 * Three.js scene engine — migrated from the original index.html.
 * This is imperative WebGL code, NOT React-ified.
 * It attaches to a canvas element and runs its own animation loop.
 */
import * as THREE from 'three';
import { sceneState } from './sceneState';

// --- Utilities ---
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// --- Types ---
interface BuildPart {
  o: THREE.Group;
  t0: number;
  t1: number;
  mode: string;
  mat?: THREE.MeshStandardMaterial;
  bo?: number;
}

export interface SceneEngine {
  dispose: () => void;
  resize: () => void;
  getCamera: () => THREE.PerspectiveCamera;
  getGroup: () => THREE.Group;
  getAnnotationPositions: () => THREE.Vector3[];
}

// --- Noise texture generator ---
function noise(base: number, amp: number, rep: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d')!;
  const id = x.createImageData(256, 256);
  for (let i = 0; i < id.data.length; i += 4) {
    id.data[i] = id.data[i + 1] = id.data[i + 2] = base + (Math.random() - 0.5) * amp;
    id.data[i + 3] = 255;
  }
  x.putImageData(id, 0, 0);
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

  // --- Materials ---
  const cn = noise(190, 60, 3);
  const M = (
    c: number,
    r = 0.9,
    m = 0,
    o: Partial<THREE.MeshStandardMaterialParameters> = {}
  ) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...o });

  const conc = M(0xa09c93, 0.92, 0, { map: cn });
  const conc2 = M(0x8a867e, 0.9, 0, { map: cn });
  const steel = M(0x6a6d72, 0.4, 0.7);
  const stone = M(0x6f6a62, 0.8);
  const white = M(0xe6e1d6, 0.7);
  const wood = M(0x8a5a33, 0.6);
  const fab = M(0x4d4a46, 0.95);
  const green = M(0x4a5b3e, 0.95);
  const gold = M(0xc9843c, 0.5, 0.4);
  const glass = M(0x9fc4d0, 0.05, 0.1, { transparent: true, opacity: 0.28 });

  // --- Ground ---
  (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d')!;
    const g = x.createRadialGradient(128, 128, 20, 128, 128, 128);
    g.addColorStop(0, '#fff');
    g.addColorStop(0.55, '#fff');
    g.addColorStop(1, '#000');
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(80, 64),
      M(0x34343a, 1, 0, {
        map: noise(150, 50, 40),
        alphaMap: new THREE.CanvasTexture(c),
        transparent: true,
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.01;
    mesh.receiveShadow = true;
    S.add(mesh);
  })();

  // --- Lights ---
  S.add(new THREE.HemisphereLight(0xcfd6e0, 0x2a2622, 0.55));

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
  S.add(sun);

  const rim = new THREE.DirectionalLight(0x7090b8, 0.6);
  rim.position.set(20, 10, -22);
  S.add(rim);

  const pls = (
    [[-3, 2.6, 0], [0, 2.6, 1], [3, 2.6, 0], [-3, 6, 0], [3, 6, 0]] as [number, number, number][]
  ).map((p) => {
    const l = new THREE.PointLight(0xffc27a, 0, 13, 2);
    l.position.set(...p);
    S.add(l);
    return l;
  });

  // --- Building parts ---
  const G = new THREE.Group();
  S.add(G);
  const parts: BuildPart[] = [];
  const mats = new Set<THREE.MeshStandardMaterial>();

  const LM = new THREE.LineBasicMaterial({
    color: 0xe9d3a8,
    transparent: true,
    opacity: 0,
  });

  function reg(o: THREE.Group, t0: number, t1: number, mode: string): THREE.Group {
    const p: BuildPart = { o, t0, t1, mode };
    o.traverse((m) => {
      if ((m as THREE.Mesh).isMesh) {
        const mesh = m as THREE.Mesh;
        mesh.castShadow = mesh.receiveShadow = true;
        mesh.add(
          new THREE.LineSegments(
            new THREE.EdgesGeometry(mesh.geometry, 25),
            LM
          )
        );
        if (mode === 'fade') {
          p.mat = mesh.material as THREE.MeshStandardMaterial;
          p.bo = p.mat.opacity;
          p.mat.transparent = true;
        } else {
          mats.add(mesh.material as THREE.MeshStandardMaterial);
        }
      }
    });
    G.add(o);
    parts.push(p);
    return o;
  }

  function B(
    w: number, h: number, d: number,
    mat: THREE.MeshStandardMaterial,
    x: number, y: number, z: number,
    t0: number, t1: number,
    mode = 'y'
  ): THREE.Group {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      mode === 'fade' ? mat.clone() : mat
    );
    const o = new THREE.Group();
    o.add(mesh);

    if (mode === 'y' || mode === 'out') {
      o.position.set(x, y - h / 2, z);
      mesh.position.y = h / 2;
    } else if (mode === 'x') {
      o.position.set(x - w / 2, y, z);
      mesh.position.x = w / 2;
    } else if (mode === 'z') {
      o.position.set(x, y, z - d / 2);
      mesh.position.z = d / 2;
    } else {
      o.position.set(x, y, z);
    }

    return reg(o, t0, t1, mode);
  }

  const xs = [-6.5, -2.2, 2.2, 6.5];
  const zs = [-4.4, 4.4];

  // --- Site clutter + crane ---
  B(1.6, 0.7, 3, stone, 11, 0.35, 3, 0, 0.9, 'out');
  B(1.2, 0.5, 2, conc2, 12.8, 0.25, 5.5, 0, 0.85, 'out');
  B(9, 0.3, 0.5, steel, 9, 0.4, -3, 0, 0.8, 'out');
  B(9, 0.3, 0.5, steel, 9, 0.7, -3.2, 0, 0.8, 'out');

  let craneJib: THREE.Group;
  {
    const c = new THREE.Group();
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.7, 20, 0.7), gold);
    mast.position.y = 10;
    c.add(mast);
    const j = new THREE.Group();
    j.position.y = 20.3;
    const a = new THREE.Mesh(new THREE.BoxGeometry(18, 0.5, 0.6), gold);
    a.position.x = 5;
    const cw = new THREE.Mesh(new THREE.BoxGeometry(3, 1.4, 1.2), stone);
    cw.position.x = -6;
    j.add(a, cw);
    c.add(j);
    c.position.set(-13, 0, -9);
    craneJib = j;
    reg(c, 0.9, 0.97, 'out');
  }

  // --- Foundation ---
  for (let i = 0; i < 8; i++) B(0.06, 0.06, 9, steel, -6.3 + i * 1.8, 0.3, 0, 0.12, 0.19, 'z');
  for (let j = 0; j < 6; j++) B(14, 0.06, 0.06, steel, 0, 0.34, -4 + j * 1.6, 0.13, 0.2, 'x');
  B(16, 0.15, 11, stone, 0, 0.075, 0, 0.15, 0.22, 'y');
  B(15, 0.5, 10, conc, 0, 0.25, 0, 0.21, 0.3, 'y');

  // --- Structure ---
  xs.forEach((x, i) =>
    zs.forEach((z, k) =>
      B(0.5, 6.55, 0.5, conc2, x, 3.775, z, 0.3 + i * 0.02 + k * 0.01, 0.4 + i * 0.01)
    )
  );
  [3.3, 6.85].forEach((y, l) => {
    zs.forEach((z) =>
      B(13.6, 0.3, 0.4, steel, 0, y, z, 0.38 + l * 0.04, 0.46 + l * 0.04, 'x')
    );
    xs.forEach((x) =>
      B(0.3, 0.3, 8.8, steel, x, y, 0, 0.41 + l * 0.04, 0.5 + l * 0.04, 'z')
    );
  });
  B(14.4, 0.3, 9.2, conc, 0, 3.6, 0, 0.43, 0.5);
  B(16.6, 0.3, 11.4, white, 0, 7.15, 0, 0.55, 0.63);

  // --- Envelope ---
  B(14.4, 6.5, 0.3, conc, 0, 3.75, -4.6, 0.46, 0.56);
  B(0.3, 6.5, 9, conc, -6.9, 3.75, 0, 0.48, 0.57);
  B(0.3, 6.5, 3.6, stone, 6.9, 3.75, -2.7, 0.5, 0.58);
  B(13.6, 6, 0.1, glass, 0, 3.75, 4.5, 0.52, 0.62, 'fade');
  B(0.1, 6, 5, glass, 6.9, 3.75, 2.2, 0.54, 0.62, 'fade');

  for (let i = 0; i < 7; i++)
    B(0.1, 6.2, 0.14, steel, -6.6 + i * 2.2, 3.75, 4.58, 0.5 + i * 0.006, 0.58);
  B(5.5, 2.6, 0.3, stone, -3.8, 5.6, 4.7, 0.5, 0.58);

  for (let k = 0; k < 9; k++)
    B(0.08, 2.6, 0.3, wood, 0.8 + k * 0.55, 5.6, 4.7, 0.54 + k * 0.004, 0.6);
  B(1.4, 2.6, 0.14, wood, 0, 1.9, 4.65, 0.58, 0.64, 'fade');

  // --- Interior ---
  B(13.6, 0.06, 8.8, wood, 0, 0.53, 0, 0.6, 0.66, 'fade');
  B(3, 0.45, 1.1, fab, -3, 0.8, 0, 0.64, 0.7);
  B(3, 0.5, 0.3, fab, -3, 1.3, -0.5, 0.65, 0.71);
  B(1.6, 0.35, 0.9, wood, -3, 0.9, 1.5, 0.67, 0.72);
  B(3, 1, 1, stone, 3, 1.05, 0.8, 0.68, 0.74);
  B(3, 1, 0.6, wood, 3, 1.05, -3.6, 0.7, 0.75);

  for (let i = 0; i < 10; i++)
    B(1.2, 0.3, 0.4, wood, 5.2, 0.7 + i * 0.32, -3.2 + i * 0.4, 0.66 + i * 0.005, 0.72 + i * 0.005);

  B(2.2, 0.5, 3, fab, -4, 4.1, -1.5, 0.72, 0.78);
  B(1.4, 0.9, 0.3, wood, -4, 4.4, -3.2, 0.73, 0.78);

  // --- Interior lights ---
  (
    [[-3, 2.6, 0], [0, 2.6, 1], [3, 2.6, 0], [-3, 6, 0], [3, 6, 0]] as [number, number, number][]
  ).forEach((p, i) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 12),
      M(0xffd9a0, 0.3, 0, { emissive: 0xffb865, emissiveIntensity: 2 })
    );
    const o = new THREE.Group();
    o.add(mesh);
    o.position.set(...p);
    reg(o, 0.74 + i * 0.012, 0.8 + i * 0.012, 'fade');
  });

  // --- Landscape ---
  {
    const l = new THREE.Mesh(
      new THREE.CircleGeometry(19, 48),
      M(0x3a4a33, 1, 0, { transparent: true })
    );
    l.rotation.x = -Math.PI / 2;
    l.position.y = 0.03;
    const o = new THREE.Group();
    o.add(l);
    reg(o, 0.78, 0.9, 'fade');
  }

  (
    [[-11, 7], [11, 8], [-12, -3], [13, -6], [-9, -10], [9, -11], [-5, 13], [6, 14]] as [number, number][]
  ).forEach(([x, z], i) => {
    const t = new THREE.Group();
    const a = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 2.2, 6), wood);
    const b = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 8), green);
    a.position.y = 1.1;
    b.position.y = 3.4;
    t.add(a, b);
    t.position.set(x, 0, z);
    reg(t, 0.82 + i * 0.012, 0.9 + i * 0.012, 'pop');
  });

  B(4.5, 0.9, 0.8, green, -4.5, 0.45, 6.4, 0.86, 0.92);
  B(4.5, 0.9, 0.8, green, 4.5, 0.45, 6.4, 0.87, 0.93);
  B(2, 0.06, 7, stone, 0, 0.04, 7.5, 0.84, 0.92, 'z');

  G.updateMatrixWorld(true);

  // --- Dust particles ---
  const N = 500;
  const dp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    dp[i * 3] = (Math.random() - 0.5) * 60;
    dp[i * 3 + 1] = Math.random() * 16;
    dp[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  S.add(
    new THREE.Points(
      dg,
      new THREE.PointsMaterial({
        size: 0.09,
        color: 0xffe0b0,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      })
    )
  );

  // --- Camera paths ---
  const V = (a: [number, number, number][]) => a.map((v) => new THREE.Vector3(...v));

  const cp = new THREE.CatmullRomCurve3(
    V([[-17, 1.2, 15], [-10, 1.6, 11], [-4, 3, 13], [9, 3.5, 11], [7, 3, 9], [3, 2.3, 7.5], [0, 2.1, 3.6], [-9, 4, 15], [-18, 8, 22]])
  );
  const ct = new THREE.CatmullRomCurve3(
    V([[0, 1.5, 0], [0, 0.5, 0], [0, 3, 0], [0, 3.5, 0], [0, 3.5, 0], [0, 3, -1], [0, 2.2, -3], [0, 3, 0], [0, 3, 0]])
  );

  const th0 = Math.atan2(22, -18);
  const r0 = Math.hypot(18, 22);

  // --- Annotation world positions ---
  const ap = [
    new THREE.Vector3(7, 7.4, 4.6),
    new THREE.Vector3(-7, 3.5, -4.6),
    new THREE.Vector3(0, 7.4, 5.5),
    new THREE.Vector3(3, 1.5, 0.8),
    new THREE.Vector3(-7, 0.2, 5),
  ];

  // --- Temp vectors ---
  const tmp = new THREE.Vector3();
  const tp = new THREE.Vector3();
  const tt = new THREE.Vector3();

  // --- Animation loop ---
  let animId: number;
  let disposed = false;

  function frame(t: number) {
    if (disposed) return;
    animId = requestAnimationFrame(frame);

    const st = sceneState;
    st.time = t;

    // Parts animation
    mats.forEach((m) => {
      m.transparent = st.bp > 0.01;
      m.opacity = 1 - 0.9 * st.bp;
    });
    LM.opacity = st.bp * 0.9;

    for (const o of parts) {
      const k = ease(clamp((st.pe - o.t0) / (o.t1 - o.t0)));
      const a = o.o;
      const md = o.mode;

      if (md === 'out') {
        const j = 1 - k;
        a.visible = j > 0.01;
        a.scale.y = Math.max(j, 0.001);
      } else {
        a.visible = k > 0.002;
        if (md === 'y') a.scale.y = Math.max(k, 0.001);
        else if (md === 'x') a.scale.x = Math.max(k, 0.001);
        else if (md === 'z') a.scale.z = Math.max(k, 0.001);
        else if (md === 'pop') a.scale.setScalar(Math.max(k, 0.001));
        else if (o.mat && o.bo !== undefined) {
          o.mat.opacity = o.bo * k * (1 - 0.85 * st.bp);
        }
      }
    }

    // Crane rotation
    craneJib.rotation.y = t * 2e-4;

    // Lights
    const li = ease(clamp((st.pe - 0.72) / 0.12));
    pls.forEach((l) => (l.intensity = li * 1.4));
    sun.intensity = lerp(1.2, 1.8, st.pe);

    // Building group scale
    G.scale.y = st.gy;
    G.scale.x = st.gy < 1 ? 1.15 : 1;

    // Camera
    st.cx += (st.mx - st.cx) * 0.05;
    st.cy += (st.my - st.cy) * 0.05;

    if (st.q < 0.001) {
      cp.getPoint(clamp(st.pe), tp);
      ct.getPoint(clamp(st.pe), tt);
    } else {
      const th = th0 - st.q * Math.PI * 1.4;
      const r = (r0 + st.q * 14) * st.rm;
      tp.set(
        Math.cos(th) * r,
        (8 + st.q * 4) * lerp(1, 0.55, clamp(2 - st.rm * 1.4)),
        Math.sin(th) * r
      );
      tt.set(0, 3.2, 0);
    }

    if (st.inK > 0.002) {
      // lp is computed in the UI frame callback
      const lp = (st as any)._lp ?? 0.5;
      tmp.set(-4 + 8 * lp, 2.1, 3.4);
      tp.lerp(tmp, st.inK);
      tmp.set((-4 + 8 * lp) * 0.6, 2.3, -4);
      tt.lerp(tmp, st.inK);
    }

    cam.position.copy(tp);
    cam.position.x += st.cx * 0.9;
    cam.position.y -= st.cy * 0.5;
    cam.lookAt(tt);

    // Dust
    const a = dg.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < N; i++) {
      a.array[i * 3 + 1] += 0.004;
      a.array[i * 3] += Math.sin(t * 3e-4 + i) * 0.002;
      if (a.array[i * 3 + 1] > 16) a.array[i * 3 + 1] = 0;
    }
    a.needsUpdate = true;

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
