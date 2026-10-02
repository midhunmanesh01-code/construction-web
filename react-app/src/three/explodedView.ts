/**
 * Exploded architectural view.
 * Separates the house model vertically into its constituent systems
 * for an architectural presentation moment (triggered during the
 * "process" section scroll).
 *
 * Each major system is offset vertically so the user can see the
 * building as a stack of independent layers.
 */
import * as THREE from 'three';
import type { HouseModel } from './modelLoader';

/**
 * Vertical offsets for each system group when fully exploded.
 * Positive = moves up, negative = moves down.
 * The mapping targets the grouping level we want — children move with
 * their parent so we don't need per-child entries.
 */
const EXPLODE_MAP: [string, number][] = [
  ['Landscape', -4.5],
  ['Site', -4.5],
  ['Foundation', -2.2],
  ['Structure', 0],
  ['Architecture.Floors', 0.9],
  ['Architecture.GroundFloor', 0.9],
  ['Architecture.UpperFloor', 1.4],
  ['Interior', 1.8],
  ['Architecture.Walls', 2.4],
  ['Architecture.Partitions', 2.4],
  ['Architecture.Stairs', 2.0],
  ['Architecture.Staircase', 2.0],
  ['Envelope', 3.8],
  ['Facade', 4.8],
  ['Architecture.Balcony', 5.2],
  ['Architecture.Roof', 6.8],
];

interface ExplodableEntry {
  object: THREE.Object3D;
  offset: number;
  baseY: number;
}

export class ExplodedView {
  private entries: ExplodableEntry[] = [];

  constructor(model: HouseModel) {
    const registered = new Set<THREE.Object3D>();

    for (const [path, offset] of EXPLODE_MAP) {
      const obj = model.systems.get(path);
      if (!obj || registered.has(obj)) continue;

      registered.add(obj);
      const orig = model.originals.get(obj);
      this.entries.push({
        object: obj,
        offset,
        baseY: orig ? orig.position.y : obj.position.y,
      });
    }
  }

  /**
   * Update exploded view positions.
   * @param blend 0 = fully assembled, 1 = fully exploded
   */
  update(blend: number) {
    for (const { object, offset, baseY } of this.entries) {
      object.position.y = baseY + offset * blend;
    }
  }
}
