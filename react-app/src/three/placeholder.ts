/**
 * Architectural Holographic Wireframe Schematic for the M&M Signature Residence.
 * Renders an exact architectural schematic of the Kerala tropical-modern house
 * (cantilevered slabs, double-height volume, vertical louvers, floating stair,
 * entrance canopy, foundation grid, and dimension callouts) when the GLB is absent.
 *
 * Supports both progressive 10-stage construction reveal AND 3D exploded disassembly!
 */
import * as THREE from 'three';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smoothstep = (x: number) => x * x * (3 - 2 * x);

export interface Placeholder {
  group: THREE.Group;
  update: (time: number, progress?: number, explodedBlend?: number) => void;
  dispose: () => void;
}

export function createPlaceholder(): Placeholder {
  const group = new THREE.Group();
  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  // Layer groups for independent construction reveal and exploded animation
  const siteGroup = new THREE.Group();
  const foundGroup = new THREE.Group();
  const columnGroup = new THREE.Group();
  const slabGroup = new THREE.Group();
  const wallGroup = new THREE.Group();
  const roofGroup = new THREE.Group();
  const glassGroup = new THREE.Group();
  const louverGroup = new THREE.Group();
  const detailGroup = new THREE.Group();

  group.add(siteGroup, foundGroup, columnGroup, slabGroup, wallGroup, roofGroup, glassGroup, louverGroup, detailGroup);

  // Architectural line materials
  const amberMat = new THREE.LineBasicMaterial({
    color: 0xdf9b52,
    transparent: true,
    opacity: 0.85,
  });
  disposables.push(amberMat);

  const whiteMat = new THREE.LineBasicMaterial({
    color: 0xeae6df,
    transparent: true,
    opacity: 0.55,
  });
  disposables.push(whiteMat);

  const gridMat = new THREE.LineBasicMaterial({
    color: 0x5a554e,
    transparent: true,
    opacity: 0.3,
  });
  disposables.push(gridMat);

  const dimMat = new THREE.LineDashedMaterial({
    color: 0x8a929e,
    transparent: true,
    opacity: 0.45,
    dashSize: 0.4,
    gapSize: 0.2,
  });
  disposables.push(dimMat);

  // Helper to add box edges to a specific target group
  function addBoxEdges(
    target: THREE.Group,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.LineBasicMaterial,
  ): THREE.LineSegments {
    const geo = new THREE.BoxGeometry(w, h, d);
    const edges = new THREE.EdgesGeometry(geo);
    disposables.push(geo, edges);
    const lines = new THREE.LineSegments(edges, mat);
    lines.position.set(x, y + h / 2, z);
    target.add(lines);
    return lines;
  }

  // --- 01. Site Grid ---
  const siteGrid = new THREE.GridHelper(36, 18, 0xdf9b52, 0x333338);
  siteGrid.position.y = 0.0;
  siteGroup.add(siteGrid);
  disposables.push(siteGrid.geometry, siteGrid.material as THREE.Material);

  // Driveway paver outline
  addBoxEdges(siteGroup, 7, 0.05, 12, -6, 0.01, 8, gridMat);

  // --- 02. Foundation Plinth ---
  addBoxEdges(foundGroup, 18, 0.4, 14, 0, 0, 0, amberMat);

  // --- 03. Structural Column Matrix (12 columns) ---
  const colPositions: [number, number][] = [
    [-7.5, -5.5], [-7.5, 0], [-7.5, 5.5],
    [-2.5, -5.5], [-2.5, 0], [-2.5, 5.5],
    [2.5, -5.5],  [2.5, 0],  [2.5, 5.5],
    [7.5, -5.5],  [7.5, 0],  [7.5, 5.5],
  ];

  colPositions.forEach(([cx, cz]) => {
    addBoxEdges(columnGroup, 0.4, 7.2, 0.4, cx, 0.4, cz, whiteMat);
  });

  // --- 04. Floor Slabs (Cantilevered geometry) ---
  // Ground floor base slab
  addBoxEdges(slabGroup, 17, 0.25, 13, 0, 0.4, 0, whiteMat);
  // First floor slab with deep forward cantilever
  addBoxEdges(slabGroup, 19, 0.35, 14.5, 0.5, 3.6, 0.8, amberMat);
  // Entrance carport canopy
  addBoxEdges(slabGroup, 8, 0.3, 7, 6.5, 3.4, 4.5, whiteMat);

  // --- 05. Double-Height Living Room & Internal Partitions ---
  addBoxEdges(wallGroup, 8.5, 6.8, 6.5, -4.2, 0.65, 2.0, whiteMat);

  // Floating staircase inside atrium
  const stairPoints: THREE.Vector3[] = [];
  for (let s = 0; s <= 14; s++) {
    const sx = -2.5 + (s / 14) * 3.5;
    const sy = 0.65 + (s / 14) * 3.0;
    const sz = 0.5 - (s / 14) * 2.0;
    stairPoints.push(new THREE.Vector3(sx, sy, sz));
    stairPoints.push(new THREE.Vector3(sx + 0.9, sy, sz));
  }
  const stairGeo = new THREE.BufferGeometry().setFromPoints(stairPoints);
  const stairLines = new THREE.LineSegments(stairGeo, amberMat);
  wallGroup.add(stairLines);
  disposables.push(stairGeo);

  // --- 06. Floating Roof Cantilever Slab ---
  addBoxEdges(roofGroup, 21, 0.4, 15.5, 0.8, 7.2, 1.0, amberMat);

  // --- 07. Glass Curtain & Window Mullions ---
  for (let i = -7.5; i <= -0.5; i += 1.4) {
    addBoxEdges(glassGroup, 0.08, 6.6, 0.08, i, 0.65, 5.25, gridMat);
  }

  // --- 08. Vertical Teak Wood Fin Louver Array (Facade) ---
  for (let x = -3.2; x <= -0.2; x += 0.35) {
    addBoxEdges(louverGroup, 0.06, 3.2, 0.3, x, 3.95, 5.4, amberMat);
  }
  for (let x = 4.2; x <= 7.8; x += 0.4) {
    addBoxEdges(louverGroup, 0.06, 3.2, 0.3, x, 3.95, 5.4, amberMat);
  }

  // --- 09. Terrace Parapets & Dimension Callouts ---
  addBoxEdges(detailGroup, 9.5, 0.9, 0.15, -4.2, 3.95, 5.6, whiteMat);
  addBoxEdges(detailGroup, 0.15, 0.9, 6.5, -8.95, 3.95, 2.35, whiteMat);
  addBoxEdges(detailGroup, 7.5, 0.9, 0.15, 4.5, 3.95, 5.6, whiteMat);

  const dimPoints: THREE.Vector3[] = [
    new THREE.Vector3(-10.5, 0.2, 8.5),
    new THREE.Vector3(10.5, 0.2, 8.5),
    new THREE.Vector3(-10.5, 0, 8.5),
    new THREE.Vector3(-10.5, 7.6, 8.5),
  ];
  const dimGeo = new THREE.BufferGeometry().setFromPoints(dimPoints);
  const dimLines = new THREE.LineSegments(dimGeo, dimMat);
  dimLines.computeLineDistances();
  detailGroup.add(dimLines);
  disposables.push(dimGeo);

  function update(time: number, progress = 1.0, explodedBlend = 0.0) {
    // Holographic pulse
    const pulse = 0.7 + Math.sin(time * 0.0018) * 0.15;
    amberMat.opacity = pulse;
    whiteMat.opacity = 0.4 + Math.sin(time * 0.0012 + 1) * 0.1;

    // --- Progressive 10-stage physical construction reveal ---
    const tSite = smoothstep(clamp((progress - 0.0) / 0.1));
    const tFound = smoothstep(clamp((progress - 0.1) / 0.1));
    const tCols = smoothstep(clamp((progress - 0.2) / 0.15));
    const tSlabs = smoothstep(clamp((progress - 0.35) / 0.15));
    const tWalls = smoothstep(clamp((progress - 0.5) / 0.1));
    const tRoof = smoothstep(clamp((progress - 0.6) / 0.1));
    const tGlass = smoothstep(clamp((progress - 0.7) / 0.08));
    const tLouvers = smoothstep(clamp((progress - 0.78) / 0.08));
    const tDetails = smoothstep(clamp((progress - 0.86) / 0.08));

    siteGroup.visible = tSite > 0.01;
    foundGroup.visible = tFound > 0.01;
    foundGroup.position.y = -2 * (1 - tFound);

    columnGroup.visible = tCols > 0.01;
    columnGroup.position.y = -4 * (1 - tCols);

    slabGroup.visible = tSlabs > 0.01;
    slabGroup.position.y = 2 * (1 - tSlabs);

    wallGroup.visible = tWalls > 0.01;
    wallGroup.position.y = -3 * (1 - tWalls);

    roofGroup.visible = tRoof > 0.01;
    roofGroup.position.y = 3 * (1 - tRoof);

    glassGroup.visible = tGlass > 0.01;
    louverGroup.visible = tLouvers > 0.01;
    detailGroup.visible = tDetails > 0.01;

    // --- Exploded axonometric layer separation ---
    if (explodedBlend > 0.001) {
      roofGroup.position.y += 6.5 * explodedBlend;
      louverGroup.position.y += 4.5 * explodedBlend;
      glassGroup.position.y += 3.2 * explodedBlend;
      wallGroup.position.y += 1.8 * explodedBlend;
      slabGroup.position.y += 0.8 * explodedBlend;
      foundGroup.position.y -= 2.0 * explodedBlend;
      siteGroup.position.y -= 3.5 * explodedBlend;
    }
  }

  function dispose() {
    disposables.forEach((d) => d.dispose());
  }

  return { group, update, dispose };
}
