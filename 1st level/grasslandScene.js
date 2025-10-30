// 1st level/grasslandScene.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class GrasslandScene {
  constructor() {
    this.scene = new THREE.Scene();
    this.collidables = [];
    this.player = null;
    this.mixer = null;
    this.roomBounds = null;
    this.models = [];
    this.frogs = [];
    this.audioListener = null;
    this.backgroundMusic = null;
    this.init();
  }

  init() {
    // Atmospheric sky with fog
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

    // Lighting setup for grassland
    const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x3a7d44, 1.2);
    hemiLight.position.set(0, 200, 0);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffacd, 1.5);
    sunLight.position.set(30, 40, 20);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    this.scene.add(sunLight);

    // Ambient light for softer shadows
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);

    // Create grassland terrain
    this.createGrassland();
    
    // Add rocks with collision
    this.createRocks();

    // Set room bounds for large outdoor area
    this.roomBounds = new THREE.Box3(
      new THREE.Vector3(-50, 0, -50),
      new THREE.Vector3(50, 20, 50)
    );
  }

  createGrassland() {
    // Main grass plane - MADE BIGGER
    const grassSize = 150; // Increased from 100 to 150
    const grassGeo = new THREE.PlaneGeometry(grassSize, grassSize, 640, 640);
    
    // Add some height variation for natural look
    const positions = grassGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const height = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.3;
      positions.setY(i, height);
    }
    grassGeo.computeVertexNormals();

    const grassMat = new THREE.MeshStandardMaterial({ 
      color: 0x5a9a3a,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = 0;
    grass.receiveShadow = true;
    grass.name = 'grassland';
    this.scene.add(grass);
    this.collidables.push(grass);

    // Add grass patches using instanced mesh
    this.createGrassPatches();
  }

  createGrassPatches() {
    // Create tall grass patches for visual interest
    const grassBladeGeo = new THREE.ConeGeometry(0.08, 1.2, 4); // Bigger blades
    const grassBladeMat = new THREE.MeshStandardMaterial({ 
      color: 0x4a8a2a,
      side: THREE.DoubleSide,
      roughness: 1.0
    });

    const patchGroup = new THREE.Group();
    
    // MANY MORE GRASS PATCHES - increased from 200 to 800
    for (let i = 0; i < 800; i++) {
      const blade = new THREE.Mesh(grassBladeGeo, grassBladeMat);
      // Spread over larger area to match bigger grassland
      blade.position.set(
        Math.random() * 140 - 70, // Increased range from 80 to 140
        0.6, // Slightly higher base position
        Math.random() * 140 - 70  // Increased range from 80 to 140
      );
      blade.rotation.z = (Math.random() - 0.5) * 0.3; // More rotation variation
      blade.scale.y = 1.0 + Math.random() * 0.6; // Taller grass
      blade.scale.x = 0.8 + Math.random() * 0.4; // Width variation
      blade.scale.z = 0.8 + Math.random() * 0.4; // Depth variation
      blade.castShadow = true;
      patchGroup.add(blade);
    }
    
    this.scene.add(patchGroup);

    // ADDITIONAL: Create some clumps of grass for more variety
    this.createGrassClumps();
  }

  createGrassClumps() {
    // Create dense grass clumps for more realistic vegetation
    const clumpGroup = new THREE.Group();
    const clumpGeo = new THREE.ConeGeometry(0.15, 0.8, 5);
    const clumpMat = new THREE.MeshStandardMaterial({ 
      color: 0x3a7a2a, // Slightly darker green for variety
      side: THREE.DoubleSide,
      roughness: 1.0
    });

    // Add 200 dense grass clumps
    for (let i = 0; i < 200; i++) {
      const clump = new THREE.Mesh(clumpGeo, clumpMat);
      clump.position.set(
        Math.random() * 130 - 65,
        0.4,
        Math.random() * 130 - 65
      );
      clump.rotation.y = Math.random() * Math.PI;
      clump.scale.multiplyScalar(0.8 + Math.random() * 0.6);
      clump.castShadow = true;
      clumpGroup.add(clump);
    }
    
    this.scene.add(clumpGroup);
  }

  createRocks() {
    // Create various sized rocks with collision
    const rockGeometries = [
      new THREE.DodecahedronGeometry(1, 0),
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.TetrahedronGeometry(1, 0)
    ];

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.9,
      metalness: 0.1
    });

    const positions = [
      { x: -15, z: -10, scale: 1.5 },
      { x: 20, z: -15, scale: 1.2 },
      { x: -25, z: 15, scale: 1.8 },
      { x: 10, z: 20, scale: 1.0 },
      { x: 30, z: 5, scale: 1.3 },
      { x: -5, z: -25, scale: 1.1 },
      { x: -30, z: -20, scale: 1.6 },
      { x: 15, z: -30, scale: 1.4 },
      { x: 25, z: 25, scale: 1.2 },
      { x: -20, z: 30, scale: 1.7 }
    ];

    positions.forEach(pos => {
      const geo = rockGeometries[Math.floor(Math.random() * rockGeometries.length)];
      const rock = new THREE.Mesh(geo, rockMat.clone());
      
      rock.position.set(pos.x, pos.scale * 0.5, pos.z);
      rock.scale.setScalar(pos.scale);
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      rock.castShadow = true;
      rock.receiveShadow = true;
      rock.name = 'rock';
      
      this.scene.add(rock);
      this.collidables.push(rock);
    });
  }

  createFrog() {
    // Create a simple frog mesh
    const frogGroup = new THREE.Group();
    
    // Body
    const bodyGeo = new THREE.SphereGeometry(0.3, 16, 16);
    bodyGeo.scale(1, 0.7, 1.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a7c4a });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    frogGroup.add(body);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.15, 0.15, 0.25);
    frogGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.15, 0.15, 0.25);
    frogGroup.add(rightEye);

    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.15, 0.15, 0.35);
    frogGroup.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.15, 0.15, 0.35);
    frogGroup.add(rightPupil);

    return frogGroup;
  }

  spawnFrogs(count = 5) {
    for (let i = 0; i < count; i++) {
      const frog = this.createFrog();
      
      // Random position around the player spawn
      const angle = (i / count) * Math.PI * 2;
      const distance = 10 + Math.random() * 15;
      
      frog.position.set(
        Math.cos(angle) * distance,
        0.3,
        Math.sin(angle) * distance
      );
      
      frog.userData.speed = 0.5 + Math.random() * 0.5;
      frog.userData.hopTimer = Math.random() * 3;
      frog.userData.isHopping = false;
      
      this.scene.add(frog);
      this.frogs.push(frog);
    }
  }

  updateFrogs(delta) {
    if (!this.player) return;

    const playerPos = this.player.position;

    this.frogs.forEach(frog => {
      const frogPos = frog.position;
      const distance = frogPos.distanceTo(playerPos);
      
      // Only follow if player is within range but not too close
      if (distance > 2 && distance < 30) {
        // Calculate direction to player
        const direction = new THREE.Vector3()
          .subVectors(playerPos, frogPos)
          .normalize();
        
        // Hop animation timer
        frog.userData.hopTimer -= delta;
        
        if (frog.userData.hopTimer <= 0) {
          frog.userData.isHopping = true;
          frog.userData.hopTimer = 1.5 + Math.random(); // Random hop interval
        }
        
        if (frog.userData.isHopping) {
          // Move frog towards player
          const moveSpeed = frog.userData.speed * delta;
          frog.position.x += direction.x * moveSpeed;
          frog.position.z += direction.z * moveSpeed;
          
          // Hopping animation
          const hopPhase = (frog.userData.hopTimer % 0.5) / 0.5;
          frog.position.y = 0.3 + Math.sin(hopPhase * Math.PI) * 0.2;
          
          // Rotate to face player
          frog.rotation.y = Math.atan2(direction.x, direction.z);
          
          // Stop hopping after a bit
          if (hopPhase > 0.9) {
            frog.userData.isHopping = false;
          }
        } else {
          // Settle to ground when not hopping
          frog.position.y = THREE.MathUtils.lerp(frog.position.y, 0.3, delta * 5);
        }
      }
    });
  }

  setupAudio(camera) {
    // Create audio listener and attach to camera
    this.audioListener = new THREE.AudioListener();
    camera.add(this.audioListener);

    // Create background music
    this.backgroundMusic = new THREE.Audio(this.audioListener);

    // Load ambient nature/grassland music
    const audioLoader = new THREE.AudioLoader();
    
    // Using a peaceful nature ambience
    // You can replace this URL with your own music file
    audioLoader.load(
      'https://cdn.pixabay.com/download/audio/2022/03/10/audio_4c8e4c86ae.mp3',
      (buffer) => {
        this.backgroundMusic.setBuffer(buffer);
        this.backgroundMusic.setLoop(true);
        this.backgroundMusic.setVolume(0.3);
        this.backgroundMusic.play();
        console.log('🎵 Background music loaded and playing');
      },
      undefined,
      (error) => {
        console.warn('Could not load background music:', error);
      }
    );
  }

  async loadPlayerModel() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        './models/AJ.glb',
        (gltf) => {
          this.player = gltf.scene;
          this.player.scale.set(1, 1, 1);
          this.player.position.set(0, 0.5, 0);
          this.player.name = 'player';
          this.scene.add(this.player);

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

  addCollidables(collidables = []) {
    for (const c of collidables) {
      if (c && !this.collidables.includes(c)) {
        this.collidables.push(c);
      }
    }
  }

  setRoomBounds(box3) {
    if (box3 && box3.isBox3) this.roomBounds = box3.clone();
  }

  getRoomBounds() {
    return this.roomBounds;
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
    
    // Update frogs to follow player
    this.updateFrogs(delta);
  }

  dispose() {
    // Clean up audio
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic = null;
    }
    if (this.audioListener) {
      this.audioListener = null;
    }
  }
}