// environment.js
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Environment {
  constructor() {
    this.scene = new THREE.Scene();
    this.collidables = [];
    this.player = null;
    this.mixer = null;
    this.roomBounds = null; // THREE.Box3
    this.init();
  }

  init() {
    // Scene background color
    this.scene.background = new THREE.Color(0xaec6cf);

    // Lights (reduced ambient for Level 2 to increase shadow intensity)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    hemiLight.position.set(0, 200, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    
    // Configure shadow camera for better quality
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.radius = 4;
    
    this.scene.add(dirLight);

    // NOTE: removed the brown ground mesh here so the room's floor (from GLB)
    // is used instead. If you want a global ground, re-add it or ensure
    // your model includes an internal floor.
    // this.createObstacles();
  }

  addCollidables(collidables = []) {
    // Accept array of THREE.Object3D (meshes)
    for (const c of collidables) {
      if (c && !this.collidables.includes(c)) this.collidables.push(c);
    }
  }

  setRoomBounds(box3) {
    if (box3 && box3.isBox3) this.roomBounds = box3.clone();
  }

  getRoomBounds() {
    return this.roomBounds;
  }

  loadPlayerModel() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        "./models/AJ.glb",
        (gltf) => {
          this.player = gltf.scene;
          this.player.scale.set(1, 1, 1);
          // We'll set the player position later (after room loads) if needed.
          this.player.position.set(0, 0, 0);
          this.player.name = "player";
          
          // Enable shadows on player model
          this.player.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          this.scene.add(this.player);

          // Animation mixer
          this.mixer = new THREE.AnimationMixer(this.player);
          resolve(gltf);
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  }

  getCollidables() {
    return this.collidables;
  }

  getScene() {
    return this.scene;
  }

  getPlayer() {
    return this.player;
  }

  getMixer() {
    return this.mixer;
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
}
