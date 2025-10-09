// usingmodels.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function createChildBedroom({
  scene,
  THREE,
  loader,
  url = './models/stewies_bedroom.glb',
  onProgress
} = {}) {
  return new Promise((resolve, reject) => {
    if (!THREE) {
      reject(new Error('createChildBedroom: missing THREE instance. Pass `THREE` from your main app.'));
      return;
    }
    if (!loader) {
      reject(new Error('createChildBedroom: missing GLTFLoader instance. Pass `loader` from your main app.'));
      return;
    }

    loader.load(
      url,
      (gltf) => {
        const room = gltf.scene || (gltf.scenes && gltf.scenes[0]);
        if (!room) {
          reject(new Error('GLTF loaded but contains no scene'));
          return;
        }

        // Create group with the same THREE instance
        const roomGroup = new THREE.Group();
        room.name = 'child_bedroom';
        room.scale.set(5.5, 5.5, 5.5);
        room.position.set(0, -3, 0);
        room.updateMatrixWorld(true);

        // Compute bounding box after scale/position
        let box = new THREE.Box3().setFromObject(room);
        const height = box.getSize(new THREE.Vector3()).y;

        // Place bottom of the room at y = 0
        room.position.y = (height / 2) - 0.8;
        room.updateMatrixWorld(true);

        // Recompute bounding box now that we've shifted the room vertically
        const roomBox = new THREE.Box3().setFromObject(room);

        const collidables = [];

        // ✅ Explicitly mark Object_6, Object_10, and Object_13 as collidable
        const wallNames = ['object_6', 'object_10', 'object_13'];

        room.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const name = (child.name || '').toLowerCase();

            // Add to collidables if:
            // - userData says it's collidable
            // - its name includes collision keywords
            // - its name is one of the known wall names
            if (
              child.userData?.collidable === true ||
              name.includes('collide') ||
              name.includes('collision') ||
              wallNames.includes(name)
            ) {
              collidables.push(child);
              // Optional: visually debug collidables by tinting them slightly
              // child.material = child.material.clone();
              // child.material.color.set(0xff0000);
            }
          }
        });

        roomGroup.add(room);

        if (scene && typeof scene.add === 'function') {
          scene.add(roomGroup);
        }

        resolve({ roomGroup, room, collidables, roomBox, gltf });
      },
      (xhr) => {
        if (xhr && xhr.lengthComputable && typeof onProgress === 'function') {
          onProgress((xhr.loaded / xhr.total) * 100);
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export default createChildBedroom;
