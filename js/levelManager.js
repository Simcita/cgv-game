// js/levelManager.js
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GrasslandScene } from "../1st level/grasslandScene.js";
import { Environment } from "./environment.js";
import { Environment as ClocktowerEnv } from "../3rd level/clocktower.js";
import { createChildBedroom } from "../2nd level/usingmodels.js";
import { addMirror } from "../2nd level/mirror.js";
import { addTrain } from "../2nd level/train.js";
import { train, createWall } from "../2nd level/terrain.js";

export class LevelManager {
  constructor(renderer, camera, playerController) {
    this.renderer = renderer;
    this.camera = camera;
    this.playerController = playerController;
    this.currentLevel = null;
    this.currentEnvironment = null;
    this.levels = {
      1: "Grassland (Level 1)",
      2: "Bedroom (Level 2)",
      3: "Clocktower (Level 3)",
    };
  }

  async loadLevel(levelNumber) {
    console.log(`🎮 Loading level ${levelNumber}...`);

    // Clean up current level
    if (this.currentEnvironment) {
      console.log('🧹 Cleaning up previous level...');
      
      // Dispose audio if it exists
      if (this.currentEnvironment.dispose) {
        this.currentEnvironment.dispose();
      }
      
      const scene = this.currentEnvironment.getScene();
      if (scene) {
        // Remove all objects from scene
        while (scene.children.length > 0) {
          const child = scene.children[0];
          scene.remove(child);
          
          // Dispose geometries and materials
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      }
    }

    // Create new environment based on level
    try {
      switch (levelNumber) {
        case 1:
          await this.loadLevel1();
          break;
        case 2:
          await this.loadLevel2();
          break;
        case 3:
          await this.loadLevel3();
          break;
        default:
          console.error("❌ Invalid level number");
          return;
      }

      this.currentLevel = levelNumber;
      console.log(`✅ Level ${levelNumber} loaded successfully`);
    } catch (error) {
      console.error(`❌ Error loading level ${levelNumber}:`, error);
    }
  }

  async loadLevel1() {
    console.log('🌾 Initializing Grassland Scene...');
    
    // Create grassland environment
    this.currentEnvironment = new GrasslandScene();
    this.playerController.environment = this.currentEnvironment;

    console.log('👤 Loading player model...');
    
    // Load player
    const gltf = await this.currentEnvironment.loadPlayerModel();
    this.playerController.setupAnimations(gltf);

    console.log('🎵 Setting up audio...');
    
    // Setup audio with camera
    this.currentEnvironment.setupAudio(this.camera);

    console.log('🐸 Spawning frogs...');
    
    // Spawn frogs that will follow the player
    this.currentEnvironment.spawnFrogs(6);

    // Reset camera for outdoor scene
    this.playerController.cameraDistance = 12;
    
    // Make sure player is positioned correctly
    const player = this.currentEnvironment.getPlayer();
    if (player) {
      player.position.set(0, 0.5, 0);
      console.log('✅ Player positioned at:', player.position);
    }

    console.log("✅ Level 1 (Grassland) loaded - Move around and the frogs will follow you!");
    console.log("📊 Collidables:", this.currentEnvironment.getCollidables().length);
    console.log("🐸 Frogs:", this.currentEnvironment.frogs.length);
  }

  async loadLevel2() {
    console.log('🏠 Initializing Bedroom Scene...');
    
    // Bedroom Scene
    this.currentEnvironment = new Environment();
    this.playerController.environment = this.currentEnvironment;

    // Load player
    const gltf = await this.currentEnvironment.loadPlayerModel();
    this.playerController.setupAnimations(gltf);

    // Load bedroom
    const { blocks } = train(this.currentEnvironment.getScene());

    // Add blocks as collidables
    const blockCollidables = [];
    blocks.traverse((child) => {
      if (child.isMesh && child.visible && child.geometry) {
        blockCollidables.push(child);
      }
    });
    this.currentEnvironment.addCollidables(blockCollidables);

    const { roomGroup, collidables, roomBox } = await createChildBedroom({
      scene: this.currentEnvironment.getScene(),
      THREE: THREE,
      loader: new GLTFLoader(),
      url: "./models/Stewie.glb",
    });

    this.currentEnvironment.addCollidables(collidables);
    this.currentEnvironment.setRoomBounds(roomBox);

    const player = this.currentEnvironment.getPlayer();
    if (player) {
      const center = roomBox.getCenter(new THREE.Vector3());
      player.position.set(
        center.x,
        roomBox.min.y + 0.5,
        center.z + 15
      );
    }

    this.playerController.cameraDistance = Math.min(
      this.playerController.cameraDistance,
      Math.max(3, roomBox.getSize(new THREE.Vector3()).length() * 0.08)
    );

    // Add train
    const { trainGroup } = await addTrain({
      scene: this.currentEnvironment.getScene(),
      loader: new GLTFLoader(),
      makeCollidable: true,
    });

    const trainCollidables = [];
    trainGroup.traverse((child) => {
      if (child.isMesh && child.visible && child.geometry) {
        trainCollidables.push(child);
      }
    });
    this.currentEnvironment.addCollidables(trainCollidables);

    // Add mirror
    const { mirrorGroup } = await addMirror({
      scene: this.currentEnvironment.getScene(),
      loader: new GLTFLoader(),
      url: "./models/mirror_a.glb",
    });

    const mirrorCollidables = [];
    mirrorGroup.traverse((child) => {
      if (child.isMesh && child.visible && child.geometry) {
        mirrorCollidables.push(child);
      }
    });
    this.currentEnvironment.addCollidables(mirrorCollidables);

    // Add fourth wall
    const wallNearMirror = createWall(
      32,
      35,
      0.2,
      20,
      1.5,
      6.5,
      null,
      "2nd level/Textures/20251015_2213_Blue Solar System Texture_simple_compose_01k7mr2ssafgj912vz5pqzw3kd.png"
    );
    this.currentEnvironment.getScene().add(wallNearMirror);
    this.currentEnvironment.addCollidables([wallNearMirror]);

    console.log("✅ Level 2 (Bedroom) loaded");
  }

  async loadLevel3() {
    console.log('🏰 Initializing Clocktower Scene...');
    
    // Clocktower Scene
    this.currentEnvironment = new ClocktowerEnv();
    this.playerController.environment = this.currentEnvironment;

    // Load player
    const gltf = await this.currentEnvironment.loadPlayerModel();
    this.playerController.setupAnimations(gltf);

    // Reset camera
    this.playerController.cameraDistance = 10;

    console.log("✅ Level 3 (Clocktower) loaded");
  }

  getCurrentEnvironment() {
    return this.currentEnvironment;
  }

  getCurrentLevel() {
    return this.currentLevel;
  }
}