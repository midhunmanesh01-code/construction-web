/**
 * Architectural Holographic Wireframe Schematic for the M&M Signature Residence.
 * Renders an exact architectural schematic of the Kerala tropical-modern house
 * (cantilevered slabs, double-height volume, vertical louvers, floating stair,
 * entrance canopy, carport, foundation grid, terrace trees, and dimension callouts) when the GLB is absent.
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
  const interiorGroup = new THREE.Group();
  const landscapeGroup = new THREE.Group();
  const detailGroup = new THREE.Group();

  group.add(
    siteGroup,
    foundGroup,
    columnGroup,
    slabGroup,
    wallGroup,
    roofGroup,
    glassGroup,
    louverGroup,
    interiorGroup,
    landscapeGroup,
    detailGroup,
  );

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
    opacity: 0.6,
  });
  disposables.push(whiteMat);

  const gridMat = new THREE.LineBasicMaterial({
    color: 0x5a554e,
    transparent: true,
    opacity: 0.35,
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

  const woodMat = new THREE.LineBasicMaterial({
    color: 0xb87b44,
    transparent: true,
    opacity: 0.75,
  });
  disposables.push(woodMat);

  const plantMat = new THREE.LineBasicMaterial({
    color: 0x52885a,
    transparent: true,
    opacity: 0.65,
  });
  disposables.push(plantMat);

  // Helper to add box edges to a specific target group
  function addBoxEdges(
    target: THREE.Group,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material,
  ): THREE.LineSegments {
    const geo = new THREE.BoxGeometry(w, h, d);
    const edges = new THREE.EdgesGeometry(geo);
    disposables.push(geo, edges);
    const lines = new THREE.LineSegments(edges, mat);
    lines.position.set(x, y + h / 2, z);
    target.add(lines);
    return lines;
  }

  // --- 01. SITE PREPARATION ---
  // Large architectural site grid & survey boundary
  const siteGrid = new THREE.GridHelper(38, 19, 0xdf9b52, 0x333338);
  siteGrid.position.y = 0.0;
  siteGroup.add(siteGrid);
  disposables.push(siteGrid.geometry, siteGrid.material as THREE.Material);

  // Driveway paver outline on the right & entrance
  addBoxEdges(siteGroup, 8.5, 0.05, 14, 5.5, 0.01, 8.5, gridMat);
  // Boundary retaining wall outline
  addBoxEdges(siteGroup, 34, 0.8, 0.25, 0, 0.01, -12, gridMat);
  addBoxEdges(siteGroup, 0.25, 0.8, 24, -17, 0.01, 0, gridMat);
  addBoxEdges(siteGroup, 0.25, 0.8, 24, 17, 0.01, 0, gridMat);

  // --- 02. FOUNDATION ---
  // Subterranean footings (6 reinforced footing blocks)
  const footingPositions: [number, number][] = [
    [-7.5, -5.5], [-7.5, 0], [-7.5, 5.5],
    [-2.5, -5.5], [-2.5, 0], [-2.5, 5.5],
    [2.5, -5.5],  [2.5, 0],  [2.5, 5.5],
    [7.5, -5.5],  [7.5, 0],  [7.5, 5.5],
  ];
  footingPositions.forEach(([fx, fz]) => {
    addBoxEdges(foundGroup, 1.4, 0.5, 1.4, fx, -0.5, fz, gridMat);
  });
  // Grade tie beam matrix
  addBoxEdges(foundGroup, 18, 0.35, 0.4, 0, -0.15, -5.5, gridMat);
  addBoxEdges(foundGroup, 18, 0.35, 0.4, 0, -0.15, 0, gridMat);
  addBoxEdges(foundGroup, 18, 0.35, 0.4, 0, -0.15, 5.5, gridMat);
  // Main raised plinth slab
  addBoxEdges(foundGroup, 18.5, 0.45, 14.5, 0, 0, 0, amberMat);
  // Stepped entrance plinth (3 tiers of illuminated steps)
  addBoxEdges(foundGroup, 7.5, 0.15, 1.2, -1.5, 0.3, 7.8, amberMat);
  addBoxEdges(foundGroup, 8.5, 0.15, 1.2, -1.5, 0.15, 8.8, amberMat);
  addBoxEdges(foundGroup, 9.5, 0.15, 1.2, -1.5, 0.0, 9.8, amberMat);

  // --- 03. COLUMNS & BEAMS (Primary RCC structural frame) ---
  colPositions: footingPositions.forEach(([cx, cz]) => {
    // Slender vertical column
    addBoxEdges(columnGroup, 0.4, 7.2, 0.4, cx, 0.45, cz, whiteMat);
  });
  // Monolithic primary transfer beams at first-floor level (Y = 3.65)
  addBoxEdges(columnGroup, 18, 0.45, 0.4, 0, 3.65, -5.5, whiteMat);
  addBoxEdges(columnGroup, 18, 0.45, 0.4, 0, 3.65, 0, whiteMat);
  addBoxEdges(columnGroup, 18, 0.45, 0.4, 0, 3.65, 5.5, whiteMat);
  addBoxEdges(columnGroup, 0.4, 0.45, 14, -7.5, 3.65, 0, whiteMat);
  addBoxEdges(columnGroup, 0.4, 0.45, 14, -2.5, 3.65, 0, whiteMat);
  addBoxEdges(columnGroup, 0.4, 0.45, 14, 2.5, 3.65, 0, whiteMat);
  addBoxEdges(columnGroup, 0.4, 0.45, 14, 7.5, 3.65, 0, whiteMat);

  // --- 04. FLOOR SLABS ---
  // Ground floor base slab
  addBoxEdges(slabGroup, 17.5, 0.25, 13.5, 0, 0.45, 0, whiteMat);
  // First floor structural slab with deep forward cantilever
  addBoxEdges(slabGroup, 19.5, 0.35, 15.0, 0.5, 3.65, 0.8, amberMat);
  // Cantilevered Carport Canopy on right
  addBoxEdges(slabGroup, 8.5, 0.3, 7.5, 6.8, 3.45, 4.5, whiteMat);
  // Portico feature column & stone ashlar pylon
  addBoxEdges(slabGroup, 0.6, 3.45, 0.6, 10.5, 0.0, 7.8, whiteMat);
  // Architectural signage wall on right (M&M CONSTRUCTIONS illuminated wall)
  addBoxEdges(slabGroup, 3.6, 1.8, 0.4, 11.5, 0.0, 8.5, amberMat);

  // --- 05. WALLS & PARTITIONS (Internal spatial envelope) ---
  // Double-height living room perimeter shear wall
  addBoxEdges(wallGroup, 8.5, 6.8, 6.5, -4.5, 0.7, 2.0, whiteMat);
  // Kitchen & dining partition core
  addBoxEdges(wallGroup, 7.5, 3.2, 5.5, 4.5, 0.7, -2.0, whiteMat);
  // Upper master suite volume
  addBoxEdges(wallGroup, 7.5, 3.2, 6.0, -4.5, 4.0, 2.0, whiteMat);
  // Upper bathroom / dressing core
  addBoxEdges(wallGroup, 6.5, 3.2, 5.0, 4.0, 4.0, -2.0, whiteMat);

  // Sculptural floating staircase inside double-height atrium
  const stairPoints: THREE.Vector3[] = [];
  for (let s = 0; s <= 14; s++) {
    const sx = -2.5 + (s / 14) * 3.5;
    const sy = 0.7 + (s / 14) * 3.1;
    const sz = 0.5 - (s / 14) * 2.0;
    stairPoints.push(new THREE.Vector3(sx, sy, sz));
    stairPoints.push(new THREE.Vector3(sx + 0.9, sy, sz));
  }
  const stairGeo = new THREE.BufferGeometry().setFromPoints(stairPoints);
  const stairLines = new THREE.LineSegments(stairGeo, amberMat);
  wallGroup.add(stairLines);
  disposables.push(stairGeo);

  // --- 06. ROOF & FACADE ---
  // Floating roof cantilever slab with open skylight pergola cutout
  addBoxEdges(roofGroup, 21.5, 0.4, 16.0, 0.8, 7.25, 1.0, amberMat);
  // Upper terrace roof pergola ribs (skylight cutout)
  for (let rx = 1.0; rx <= 6.0; rx += 1.0) {
    addBoxEdges(roofGroup, 0.08, 0.35, 4.5, rx, 7.25, 2.5, whiteMat);
  }
  // Basalt feature stone pylons
  addBoxEdges(roofGroup, 1.2, 7.2, 0.8, -8.6, 0.45, 5.5, amberMat);
  addBoxEdges(roofGroup, 1.0, 4.0, 0.8, 5.8, 0.45, 6.0, amberMat);

  // --- 07. WINDOWS & DOORS (Glass envelope) ---
  // Ground floor double-height glass curtain wall mullions
  for (let i = -8.0; i <= -0.5; i += 1.3) {
    addBoxEdges(glassGroup, 0.08, 6.5, 0.08, i, 0.7, 5.25, gridMat);
  }
  // Upper floor terrace glass sliding doors
  for (let i = -4.0; i <= 3.0; i += 1.4) {
    addBoxEdges(glassGroup, 0.08, 3.2, 0.08, i, 4.0, 5.4, gridMat);
  }
  // Glass balcony balustrade railings
  addBoxEdges(glassGroup, 9.5, 0.95, 0.05, -4.2, 4.0, 5.85, whiteMat);
  addBoxEdges(glassGroup, 0.05, 0.95, 6.5, -8.95, 4.0, 2.6, whiteMat);
  addBoxEdges(glassGroup, 7.5, 0.95, 0.05, 4.5, 4.0, 5.85, whiteMat);

  // --- 08. VERTICAL TEAK LOUVERS (Brise-Soleil) ---
  // Upper master suite timber fins
  for (let x = -3.8; x <= -0.4; x += 0.32) {
    addBoxEdges(louverGroup, 0.06, 3.2, 0.35, x, 4.0, 5.65, woodMat);
  }
  // Ground entrance timber fins
  for (let x = -3.8; x <= -1.8; x += 0.32) {
    addBoxEdges(louverGroup, 0.06, 3.2, 0.35, x, 0.7, 5.45, woodMat);
  }
  // Upper east facade fins
  for (let x = 4.2; x <= 7.8; x += 0.38) {
    addBoxEdges(louverGroup, 0.06, 3.2, 0.35, x, 4.0, 5.65, woodMat);
  }

  // --- 09. INTERIOR & FURNITURE ---
  // Living room sectional sofa wireframe
  addBoxEdges(interiorGroup, 3.5, 0.7, 2.0, -4.5, 0.7, 2.5, amberMat);
  // Kitchen waterfall island
  addBoxEdges(interiorGroup, 3.2, 0.9, 1.2, 4.2, 0.7, -1.0, amberMat);
  // Dining table & chairs
  addBoxEdges(interiorGroup, 2.4, 0.75, 1.4, 4.2, 0.7, 2.0, amberMat);
  // Master bed & fluted headboard
  addBoxEdges(interiorGroup, 2.2, 1.1, 2.4, -4.5, 4.0, 1.8, amberMat);

  // --- 10. LANDSCAPING & TROPICAL VEGETATION ---
  // Specimen royal palm tree schematics
  function addPalmSchematic(target: THREE.Group, px: number, pz: number, height: number) {
    const trunkPoints = [
      new THREE.Vector3(px, 0, pz),
      new THREE.Vector3(px + 0.2, height * 0.5, pz + 0.1),
      new THREE.Vector3(px + 0.1, height, pz - 0.1),
    ];
    const trunkGeo = new THREE.BufferGeometry().setFromPoints(trunkPoints);
    const trunk = new THREE.Line(trunkGeo, woodMat);
    target.add(trunk);
    disposables.push(trunkGeo);

    // Fronds (6 radial leaves)
    for (let f = 0; f < 6; f++) {
      const angle = (f / 6) * Math.PI * 2;
      const frondPoints = [
        new THREE.Vector3(px + 0.1, height, pz - 0.1),
        new THREE.Vector3(
          px + Math.cos(angle) * 1.8,
          height + 0.6,
          pz + Math.sin(angle) * 1.8,
        ),
        new THREE.Vector3(
          px + Math.cos(angle) * 2.8,
          height - 0.3,
          pz + Math.sin(angle) * 2.8,
        ),
      ];
      const frondGeo = new THREE.BufferGeometry().setFromPoints(frondPoints);
      const frond = new THREE.Line(frondGeo, plantMat);
      target.add(frond);
      disposables.push(frondGeo);
    }
  }

  addPalmSchematic(landscapeGroup, -12, 6, 8.5);
  addPalmSchematic(landscapeGroup, -14, -4, 9.2);
  addPalmSchematic(landscapeGroup, 13, 8, 7.8);
  addPalmSchematic(landscapeGroup, 14, -2, 8.8);
  // Upper terrace tree (growing through skylight cutout)
  addPalmSchematic(landscapeGroup, 3.5, 2.5, 6.5);

  // Front garden planter shrubs & bollard lights
  addBoxEdges(landscapeGroup, 6.0, 0.4, 1.2, -6.5, 0.0, 7.5, plantMat);
  addBoxEdges(landscapeGroup, 5.0, 0.4, 1.2, 6.5, 0.0, 7.5, plantMat);

  // --- Dimension Callouts & Technical Annotation Lines ---
  const dimPoints: THREE.Vector3[] = [
    // Base width dimension
    new THREE.Vector3(-10.5, 0.2, 9.5),
    new THREE.Vector3(10.5, 0.2, 9.5),
    new THREE.Vector3(-10.5, 0, 9.5),
    new THREE.Vector3(-10.5, 0.5, 9.5),
    new THREE.Vector3(10.5, 0, 9.5),
    new THREE.Vector3(10.5, 0.5, 9.5),

    // Height dimension
    new THREE.Vector3(-11.5, 0, 0),
    new THREE.Vector3(-11.5, 7.6, 0),
    new THREE.Vector3(-11.8, 0, 0),
    new THREE.Vector3(-11.2, 0, 0),
    new THREE.Vector3(-11.8, 7.6, 0),
    new THREE.Vector3(-11.2, 7.6, 0),
  ];
  const dimGeo = new THREE.BufferGeometry().setFromPoints(dimPoints);
  const dimLines = new THREE.LineSegments(dimGeo, dimMat);
  dimLines.computeLineDistances();
  detailGroup.add(dimLines);
  disposables.push(dimGeo);

  function update(time: number, progress = 1.0, explodedBlend = 0.0) {
    // Holographic architectural pulse
    const pulse = 0.75 + Math.sin(time * 0.0018) * 0.12;
    amberMat.opacity = pulse;
    whiteMat.opacity = 0.45 + Math.sin(time * 0.0012 + 1) * 0.1;
    woodMat.opacity = 0.65 + Math.sin(time * 0.0015) * 0.1;

    // --- Progressive 10-stage physical construction reveal ---
    const tSite = smoothstep(clamp((progress - 0.0) / 0.1));
    const tFound = smoothstep(clamp((progress - 0.1) / 0.1));
    const tCols = smoothstep(clamp((progress - 0.2) / 0.15));
    const tSlabs = smoothstep(clamp((progress - 0.35) / 0.15));
    const tWalls = smoothstep(clamp((progress - 0.5) / 0.1));
    const tRoof = smoothstep(clamp((progress - 0.6) / 0.1));
    const tGlass = smoothstep(clamp((progress - 0.7) / 0.08));
    const tLouvers = smoothstep(clamp((progress - 0.78) / 0.08));
    const tInterior = smoothstep(clamp((progress - 0.82) / 0.08));
    const tLandscape = smoothstep(clamp((progress - 0.88) / 0.08));

    siteGroup.visible = tSite > 0.01;
    foundGroup.visible = tFound > 0.01;
    foundGroup.position.y = -2.5 * (1 - tFound);

    columnGroup.visible = tCols > 0.01;
    columnGroup.position.y = -5.0 * (1 - tCols);

    slabGroup.visible = tSlabs > 0.01;
    slabGroup.position.y = 2.5 * (1 - tSlabs);

    wallGroup.visible = tWalls > 0.01;
    wallGroup.position.y = -3.5 * (1 - tWalls);

    roofGroup.visible = tRoof > 0.01;
    roofGroup.position.y = 3.5 * (1 - tRoof);

    glassGroup.visible = tGlass > 0.01;
    louverGroup.visible = tLouvers > 0.01;
    interiorGroup.visible = tInterior > 0.01;
    landscapeGroup.visible = tLandscape > 0.01;
    detailGroup.visible = progress > 0.15;

    // --- Exploded axonometric layer separation ---
    if (explodedBlend > 0.001) {
      roofGroup.position.y += 6.8 * explodedBlend;
      louverGroup.position.y += 4.8 * explodedBlend;
      glassGroup.position.y += 3.8 * explodedBlend;
      wallGroup.position.y += 2.4 * explodedBlend;
      interiorGroup.position.y += 1.8 * explodedBlend;
      slabGroup.position.y += 0.9 * explodedBlend;
      foundGroup.position.y -= 2.2 * explodedBlend;
      siteGroup.position.y -= 4.5 * explodedBlend;
      landscapeGroup.position.y -= 4.5 * explodedBlend;
    }
  }

  function dispose() {
    disposables.forEach((d) => d.dispose());
  }

  return { group, update, dispose };
}

