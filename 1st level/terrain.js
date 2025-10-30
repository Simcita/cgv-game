// 1st level/terrain.js
import * as THREE from 'three';

export function createTerrain(scene) {
  const geometry = new THREE.PlaneGeometry(50, 50);
  const material = new THREE.MeshStandardMaterial({
    color: 0x228b22, // forest green
  });
  const groundMesh = new THREE.Mesh(geometry, material);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  return { groundMesh };
}
