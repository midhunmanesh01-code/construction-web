/**
 * Minimal wireframe placeholder shown when the architectural GLB model
 * has not yet been supplied. Intentionally sparse — this is NOT a
 * replacement house. Just a visual anchor so the canvas isn't empty.
 */
import * as THREE from 'three';

export interface Placeholder {
  group: THREE.Group;
  update: (time: number) => void;
  dispose: () => void;
}

export function createPlaceholder(): Placeholder {
  const group = new THREE.Group();

  const mat = new THREE.LineBasicMaterial({
    color: 0xc9843c,
    transparent: true,
    opacity: 0.3,
  });

  // House-proportioned wireframe outline
  const houseGeo = new THREE.BoxGeometry(16, 8, 12);
  const houseEdges = new THREE.EdgesGeometry(houseGeo);
  const houseWire = new THREE.LineSegments(houseEdges, mat);
  houseWire.position.y = 4;
  group.add(houseWire);

  // Foundation outline
  const foundGeo = new THREE.BoxGeometry(18, 0.3, 14);
  const foundEdges = new THREE.EdgesGeometry(foundGeo);
  const foundMat = mat.clone();
  const foundWire = new THREE.LineSegments(foundEdges, foundMat);
  foundWire.position.y = 0.15;
  group.add(foundWire);

  // Subtle ground grid
  const grid = new THREE.GridHelper(40, 20, 0x333333, 0x222222);
  grid.position.y = -0.01;
  group.add(grid);

  function update(time: number) {
    mat.opacity = 0.2 + Math.sin(time * 0.002) * 0.1;
    houseWire.rotation.y = Math.sin(time * 0.0003) * 0.05;
  }

  function dispose() {
    houseGeo.dispose();
    houseEdges.dispose();
    mat.dispose();
    foundGeo.dispose();
    foundEdges.dispose();
    foundMat.dispose();
  }

  return { group, update, dispose };
}
