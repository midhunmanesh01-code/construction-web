/**
 * Architectural Holographic Wireframe Schematic for the M&M Signature Residence.
 * Renders an exact architectural schematic of the Kerala tropical-modern house
 * (cantilevered slabs, double-height volume, vertical louvers, floating stair,
 * entrance canopy, foundation grid, and dimension callouts) when the GLB is absent.
 */
import * as THREE from 'three';

export interface Placeholder {
  group: THREE.Group;
  update: (time: number, progress?: number) => void;
  dispose: () => void;
}

export function createPlaceholder(): Placeholder {
  const group = new THREE.Group();
  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  // Architectural line materials
  const amberMat = new THREE.LineBasicMaterial({
    color: 0xdf9b52,
    transparent: true,
    opacity: 0.75,
  });
  disposables.push(amberMat);

  const whiteMat = new THREE.LineBasicMaterial({
    color: 0xeae6df,
    transparent: true,
    opacity: 0.45,
  });
  disposables.push(whiteMat);

  const gridMat = new THREE.LineBasicMaterial({
    color: 0x5a554e,
    transparent: true,
    opacity: 0.25,
  });
  disposables.push(gridMat);

  const dimMat = new THREE.LineDashedMaterial({
    color: 0x8a929e,
    transparent: true,
    opacity: 0.35,
    dashSize: 0.4,
    gapSize: 0.2,
  });
  disposables.push(dimMat);

  // Helper to add box edges
  function addBoxEdges(
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
    group.add(lines);
    return lines;
  }

  // --- 01. Site & Foundation Grid ---
  const siteGrid = new THREE.GridHelper(36, 18, 0xdf9b52, 0x333338);
  siteGrid.position.y = 0.0;
  group.add(siteGrid);
  disposables.push(siteGrid.geometry, siteGrid.material as THREE.Material);

  // Foundation Plinth (18m x 14m x 0.4m)
  addBoxEdges(18, 0.4, 14, 0, 0, 0, amberMat);

  // Driveway paver outline (left side)
  addBoxEdges(7, 0.05, 12, -6, 0.01, 8, gridMat);

  // --- 02. Structural Column Matrix ---
  const colPositions: [number, number][] = [
    [-7.5, -5.5], [-7.5, 0], [-7.5, 5.5],
    [-2.5, -5.5], [-2.5, 0], [-2.5, 5.5],
    [2.5, -5.5],  [2.5, 0],  [2.5, 5.5],
    [7.5, -5.5],  [7.5, 0],  [7.5, 5.5],
  ];

  colPositions.forEach(([cx, cz]) => {
    // 2-storey column (7.2m height)
    addBoxEdges(0.4, 7.2, 0.4, cx, 0.4, cz, whiteMat);
  });

  // --- 03. Floor Slabs (Cantilevered geometry) ---
  // Ground floor base slab
  addBoxEdges(17, 0.25, 13, 0, 0.4, 0, whiteMat);

  // First floor slab with deep forward cantilever over entrance (-3m forward)
  addBoxEdges(19, 0.35, 14.5, 0.5, 3.6, 0.8, amberMat);

  // Upper roof floating cantilever slab with deep overhang
  addBoxEdges(21, 0.4, 15.5, 0.8, 7.2, 1.0, amberMat);

  // Entrance carport canopy (right side, lower cantilever)
  addBoxEdges(8, 0.3, 7, 6.5, 3.4, 4.5, whiteMat);

  // --- 04. Double-Height Living Room & Glass Curtain Mullions ---
  // Double-height volume boundary (left side)
  addBoxEdges(8.5, 6.8, 6.5, -4.2, 0.65, 2.0, whiteMat);

  // Vertical window mullions across the double-height facade
  for (let i = -7.5; i <= -0.5; i += 1.4) {
    addBoxEdges(0.08, 6.6, 0.08, i, 0.65, 5.25, gridMat);
  }

  // --- 05. Vertical Teak Wood Fin Louver Array (Facade feature) ---
  for (let x = -3.2; x <= -0.2; x += 0.35) {
    addBoxEdges(0.06, 3.2, 0.3, x, 3.95, 5.4, amberMat);
  }

  // Upper right terrace louver screen
  for (let x = 4.2; x <= 7.8; x += 0.4) {
    addBoxEdges(0.06, 3.2, 0.3, x, 3.95, 5.4, amberMat);
  }

  // --- 06. Floating Staircase Inside Double-Height Void ---
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
  group.add(stairLines);
  disposables.push(stairGeo);

  // --- 07. Terrace Parapets & Planter Box Profiles ---
  addBoxEdges(9.5, 0.9, 0.15, -4.2, 3.95, 5.6, whiteMat);
  addBoxEdges(0.15, 0.9, 6.5, -8.95, 3.95, 2.35, whiteMat);
  addBoxEdges(7.5, 0.9, 0.15, 4.5, 3.95, 5.6, whiteMat);

  // --- 08. Architectural Dimension Lines & Datum Markers ---
  const dimPoints: THREE.Vector3[] = [
    // Width dimension line (front)
    new THREE.Vector3(-10.5, 0.2, 8.5),
    new THREE.Vector3(10.5, 0.2, 8.5),
    // Height dimension line (corner)
    new THREE.Vector3(-10.5, 0, 8.5),
    new THREE.Vector3(-10.5, 7.6, 8.5),
  ];
  const dimGeo = new THREE.BufferGeometry().setFromPoints(dimPoints);
  const dimLines = new THREE.LineSegments(dimGeo, dimMat);
  dimLines.computeLineDistances();
  group.add(dimLines);
  disposables.push(dimGeo);

  function update(time: number, _progress = 1.0) {
    // Elegant ambient holographic pulse
    const pulse = 0.65 + Math.sin(time * 0.0018) * 0.15;
    amberMat.opacity = pulse;
    whiteMat.opacity = 0.35 + Math.sin(time * 0.0012 + 1) * 0.1;
  }

  function dispose() {
    disposables.forEach((d) => d.dispose());
  }

  return { group, update, dispose };
}
