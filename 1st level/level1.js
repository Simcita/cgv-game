// level1/level1.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createTerrain } from './terrain.js';
import { addTrees } from './trees.js';
import { addInsects } from './insects.js';
import { SimpleRipples } from './simpleRipples.js';

export async function createNatureLevel(environment, playerController) {
  const scene = environment.getScene();
  const loader = new GLTFLoader();

  // 🌱 Terrain (grass, ground)
  const { groundMesh } = createTerrain(scene);

  // 🌳 Trees and bushes
  const treeGroup = await addTrees(scene, loader);
  console.log('Trees added:', treeGroup);

  // 🐞 Insects crawling
  const insectsGroup = await addInsects(scene, loader);
  console.log('Insects added:', insectsGroup);

  // Ripple system setup
  const rippleSystem = new SimpleRipples(scene);
  environment.rippleSystem = rippleSystem;
  playerController.setRippleSystem(rippleSystem);

  // Optional lighting setup
  const sunlight = new THREE.DirectionalLight(0xffffff, 2);
  sunlight.position.set(10, 20, 10);
  sunlight.castShadow = true;
  scene.add(sunlight);

  const ambient = new THREE.AmbientLight(0x666666, 1.2);
  scene.add(ambient);

  // Add terrain collidables
  environment.addCollidables([groundMesh, ...treeGroup.children]);

  // Player start position
  const player = environment.getPlayer();
  if (player) player.position.set(0, 0.1, 0);

  return { treeGroup, insectsGroup, groundMesh, rippleSystem };
}