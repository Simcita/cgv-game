import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Environment {
  constructor() {
    this.scene = new THREE.Scene();
    this.collidables = [];
    this.player = null;
    this.mixer = null;
    this.init();
  }

  init() {
    // Scene
    this.scene.background = new THREE.Color(0xaec6cf);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemiLight.position.set(0, 200, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7.5);
    this.scene.add(dirLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0xDEB887, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.name = 'ground';
    this.scene.add(ground);

    //this.createObstacles();
  }

  /*createObstacles() {
    // Jump platforms
    for (let i = 0; i < 3; i++) {
      const boxGeo = new THREE.BoxGeometry(3, 1, 3);
      const boxMat = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(i * 6 - 6, 0.5, -10);
      box.receiveShadow = true;
      box.castShadow = true;
      box.name = `platform_${i}`;
      this.scene.add(box);
      this.collidables.push(box);
    }

    // A taller climb wall (mark as climbable)
    const wallGeo = new THREE.BoxGeometry(4, 6, 1);
    const wallMat = new THREE.MeshPhongMaterial({ color: 0x4444aa });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 3, -20);
    wall.name = 'climb_wall';
    wall.userData.climbable = true;
    this.scene.add(wall);
    this.collidables.push(wall);

    // A reference cube to jump over
    const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
    const cubeMat = new THREE.MeshPhongMaterial({ color: 0xaa3333 });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(-5, 1, -5);
    cube.name = 'red_cube';
    this.scene.add(cube);
    this.collidables.push(cube);
  }
*/

  loadPlayerModel() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        './models/AJ.glb',
        (gltf) => {
          this.player = gltf.scene;
          this.player.scale.set(1, 1, 1);
          this.player.position.set(0, 0, 0);
          this.player.name = 'player';
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