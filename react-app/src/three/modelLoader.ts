/**
 * GLB model loader for the M&M signature house.
 * Loads /models/mm-signature-house.glb and maps its named groups
 * to the construction animation system.
 *
 * Supports Draco-compressed models automatically.
 * Returns null when the model is not available (placeholder will be shown).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

/** All expected named groups in the GLB model hierarchy */
export const GROUP_PATHS = [
  'Site',
  'Foundation',
  'Foundation.Footings',
  'Foundation.FoundationSlab',
  'Foundation.GroundStructure',
  'Structure',
  'Structure.Columns',
  'Structure.Beams',
  'Structure.Slabs',
  'Architecture',
  'Architecture.Walls',
  'Architecture.Partitions',
  'Architecture.Floors',
  'Architecture.Stairs',
  'Architecture.Balcony',
  'Architecture.Roof',
  'Envelope',
  'Envelope.Windows',
  'Envelope.Glass',
  'Envelope.Doors',
  'Envelope.Frames',
  'Facade',
  'Facade.Concrete',
  'Facade.Stone',
  'Facade.WoodFins',
  'Facade.Screens',
  'Interior',
  'Interior.Furniture',
  'Interior.Kitchen',
  'Interior.LivingRoom',
  'Interior.Bedroom',
  'Interior.Lighting',
  'Landscape',
  'Landscape.Trees',
  'Landscape.Plants',
  'Landscape.Garden',
  'Landscape.Driveway',
  'Landscape.ExteriorLighting',
] as const;

export type GroupPath = (typeof GROUP_PATHS)[number];

/** Stores original transform for reset / animation base */
export interface OriginalTransform {
  position: THREE.Vector3;
  scale: THREE.Vector3;
}

/** The loaded house model with mapped architectural systems */
export interface HouseModel {
  root: THREE.Group;
  systems: Map<string, THREE.Object3D>;
  originals: Map<THREE.Object3D, OriginalTransform>;
  meshes: THREE.Mesh[];
}

/**
 * Attempt to load the signature house GLB model.
 * Returns null if the model is not available (404, network error, etc.).
 */
export async function loadHouseModel(): Promise<HouseModel | null> {
  const loader = new GLTFLoader();

  // Enable Draco decoding (uses Google CDN for decoder WASM)
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
  loader.setDRACOLoader(dracoLoader);

  try {
    const gltf = await loader.loadAsync('/models/mm-signature-house.glb');
    const root = new THREE.Group();
    root.add(gltf.scene);

    const systems = new Map<string, THREE.Object3D>();
    const originals = new Map<THREE.Object3D, OriginalTransform>();
    const meshes: THREE.Mesh[] = [];

    // --- Map named groups by walking the hierarchy ---

    /** Find object by dot-separated path (e.g. "Foundation.Footings") */
    function findByPath(path: string): THREE.Object3D | null {
      const parts = path.split('.');
      let current: THREE.Object3D = gltf.scene;
      for (const part of parts) {
        const child = current.children.find((c) => c.name === part);
        if (!child) return null;
        current = child;
      }
      return current;
    }

    /** Fallback: find by leaf name anywhere in the tree */
    function findByName(name: string): THREE.Object3D | null {
      let found: THREE.Object3D | null = null;
      gltf.scene.traverse((obj) => {
        if (obj.name === name && !found) found = obj;
      });
      return found;
    }

    for (const path of GROUP_PATHS) {
      let obj = findByPath(path);
      if (!obj) {
        const leaf = path.split('.').pop()!;
        obj = findByName(leaf);
      }
      if (obj) {
        systems.set(path, obj);
      }
    }

    // --- Store original transforms and collect meshes ---
    gltf.scene.traverse((obj) => {
      originals.set(obj, {
        position: obj.position.clone(),
        scale: obj.scale.clone(),
      });

      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        meshes.push(mesh);

        // Store original opacity for every material
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        mats.forEach((m) => {
          if (m.userData.originalOpacity == null) {
            m.userData.originalOpacity =
              (m as THREE.MeshStandardMaterial).opacity ?? 1;
          }
        });
      }
    });

    console.log(
      `[M&M] House model loaded: ${systems.size}/${GROUP_PATHS.length} groups mapped, ${meshes.length} meshes.`,
    );

    return { root, systems, originals, meshes };
  } catch {
    console.info(
      '[M&M] House model not found at /models/mm-signature-house.glb — showing placeholder.',
    );
    return null;
  }
}
