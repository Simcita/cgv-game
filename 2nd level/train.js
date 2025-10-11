// addTrain.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function addTrain({
  scene,
  loader = null,
  url = './models/3_december2020_day_7_train_set.glb',
  position = null,
  scale = 0.03,
  makeCollidable = false,
  onProgress = null
} = {}) {
  if (!scene || typeof scene.add !== 'function') {
    return Promise.reject(
      new Error('addTrain: missing `scene`. Pass a valid THREE.Scene instance.')
    );
  }

  const usedLoader = loader || new GLTFLoader();

  return new Promise((resolve, reject) => {
    usedLoader.load(
      url,
      (gltf) => {
        const train = gltf.scene || (gltf.scenes && gltf.scenes[0]);
        if (!train) {
          reject(new Error('GLTF loaded but contains no scene'));
          return;
        }

        // Group to hold the train (keeps transforms tidy)
        const trainGroup = new THREE.Group();
        trainGroup.name = 'train_group';

        // Scale & orient the train model itself
        train.scale.set(scale, scale, scale);
        train.position.set(30, 0, 0);
        train.updateMatrixWorld(true);

        // Add train to its group
        trainGroup.add(train);

        // Compute bounding box for train in world space (after scale)
        train.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(train);

        // If no explicit position provided, align bottom of train to y = 0 (floor)
        if (!position) {
          trainGroup.position.y = -box.min.y;
        } else {
          trainGroup.position.set(
            position.x || 0,
            position.y || 0,
            position.z || 0
          );
        }

        // Recompute bounding box after moving group
        trainGroup.updateMatrixWorld(true);
        const worldBox = new THREE.Box3().setFromObject(trainGroup);

        // Collect collidable meshes if requested
        const collidables = [];
        trainGroup.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const name = (child.name || '').toLowerCase();
            if (
              makeCollidable ||
              child.userData?.collidable === true ||
              name.includes('collide') ||
              name.includes('collision')
            ) {
              collidables.push(child);
            }
          }
        });

        // Add group to scene
        scene.add(trainGroup);

        resolve({
          trainGroup,
          train,
          collidables,
          box: worldBox,
          gltf
        });
      },
      (xhr) => {
        if (
          xhr &&
          xhr.lengthComputable &&
          typeof onProgress === 'function'
        ) {
          onProgress((xhr.loaded / xhr.total) * 100);
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export default addTrain;
