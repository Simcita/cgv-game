// main.js
// Use the ES module build from a CDN
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createChildBedroom } from './2nd level/usingmodels.js'; 
import { Environment } from './js/environment.js';
import { PlayerController } from './js/playerController.js';
import { train } from './2nd level/terrain.js'; //train



// Initialize renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Initialize camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Initialize environment and player controller
const environment = new Environment();
const playerController = new PlayerController(environment, camera, renderer);

// Load player model and setup animations
environment.loadPlayerModel()
  .then((gltf) => {
    playerController.setupAnimations(gltf);
  })
  .catch((error) => {
    console.error('Error loading player model:', error);
  });

// ===========Create terrain from 2nd level================// 
//const { updateTrain } = train(environment.getScene()); //for the funny train

createChildBedroom({
  scene: environment.getScene(),
  THREE: THREE,
  loader: new GLTFLoader(),
  url: './models/stewies_bedroom.glb',
}).then(({ roomGroup, collidables, roomBox }) => {
  console.log('Child bedroom loaded:', roomGroup, collidables, roomBox);

  // Add collidable meshes to environment so player uses them for collisions
  environment.addCollidables(collidables);

  // Expose the room bounding box to environment for clamping player position
  environment.setRoomBounds(roomBox);

  // If player already loaded, set player to room center (slightly above floor)
  const player = environment.getPlayer();
  if (player) {
    const center = roomBox.getCenter(new THREE.Vector3());
    // set player to center horizontally, set Y to room floor + small offset
    player.position.set(center.x, roomBox.min.y + 0.1, center.z);
  }

  // Adjust camera distance so camera starts comfortably inside the room
  playerController.cameraDistance = Math.min(playerController.cameraDistance, Math.max(3, (roomBox.getSize(new THREE.Vector3()).length() * 0.08)));
})
.catch((error) => {
  console.error('Error loading child bedroom:', error);
});
// ====================================================//

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  
  environment.update(delta);
  playerController.update(delta);
  //updateTrain(delta); //aslo for the funny train

  
  renderer.render(environment.getScene(), camera);
  renderer.setAnimationLoop(animate);
}

animate();
