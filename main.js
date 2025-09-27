// Use the ES module build from a CDN
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createChildBedroom } from './2nd level/usingmodels.js'; 
import { Environment } from './js/environment.js';
import { PlayerController } from './js/playerController.js';
//import { createChildBedroom } from './2nd level/terrain.js';

// Initialize renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize camera
const camera = new THREE.PerspectiveCamera(
  45, //was 75 but changed it to make it zoom into the scene
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
createChildBedroom({
  scene: environment.getScene(),
  THREE: THREE,
  loader: new GLTFLoader(),
  url: './models/stewies_bedroom.glb',
}).then(({ roomGroup, collidables}) => {
  console.log('Child bedroom loaded:', roomGroup, collidables);
})
.catch((error) => {
  console.error('Error loading child bedroom:', error);
});
// ====================================================//
//shadows of the renderer 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
  //updateTrain(delta);
  
  renderer.render(environment.getScene(), camera);
  renderer.setAnimationLoop(animate);
}

animate();
