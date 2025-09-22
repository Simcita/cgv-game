// Use the ES module build from a CDN
import * as THREE from 'three';
import { Environment } from './js/environment.js';
import { PlayerController } from './js/playerController.js';

// Initialize renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize camera
const camera = new THREE.PerspectiveCamera(
  75,
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
  
  renderer.render(environment.getScene(), camera);
  renderer.setAnimationLoop(animate);
}

animate();