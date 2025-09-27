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

        // Create group with the same THREE instance (important!)
        const roomGroup = new THREE.Group();
        room.name = 'child_bedroom';
        room.scale.set(1.5, 1.5, 1.5);
        room.position.set(0, 0, 0);
        room.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(room);
        const height = box.getSize(new THREE.Vector3()).y;
        room.position.y = (height / 2) - 0.8;  // place bottom at y=0

        const collidables = [];
        room.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const name = (child.name || '').toLowerCase();
            if (child.userData?.collidable === true || name.includes('collide') || name.includes('collision')) {
              collidables.push(child);
            }
          }
        });

        roomGroup.add(room);

        // only add to scene if provided
        if (scene && typeof scene.add === 'function') {
          scene.add(roomGroup);
        }

        resolve({ roomGroup, room, collidables, gltf });
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
