import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Environment {
  constructor() {
    this.scene = new THREE.Scene();
    this.collidables = [];
    this.player = null;
    this.mixer = null;
    this.playerStartPosition = new THREE.Vector3(0, 0, 10);
    this.roomSize = 100;
    this.extendedRoomSize = this.roomSize + 100;

    this.init();
  }

  init() {
    // Scene setup
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 150, 300);

    // Basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Create workshop
    this.createClocktowerWorkshop();
  }

  createClocktowerWorkshop() {
    const roomSize = 100;
    const extendedRoomSize = roomSize + 100;
    const wallHeight = 25;
    const wallThickness = 1;

    const floorMat = new THREE.MeshPhongMaterial({ color: 0x808080, shininess: 10 });
    const wallMat = new THREE.MeshPhongMaterial({ color: 0x4B2E1F, shininess: 10 });

    // Floor
    const floorGeo = new THREE.PlaneGeometry(roomSize, extendedRoomSize);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.collidables.push(floor);
    this.playerStartPosition = new THREE.Vector3(0, 0, roomSize / 2 - 4);
    
    // Walls
    this.createWallsWithArchway(roomSize, extendedRoomSize, wallHeight, wallThickness, wallMat);

    this.addAnimatedClockFaces();

    // Pathway + Gear Obstacle
    this.createPathway();
    this.createGearObstacle();
    this.createDecorations();
  }

  createWallsWithArchway(roomSize, extendedRoomSize, wallHeight, wallThickness, wallMat) {
    // North wall
    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(roomSize, wallHeight, wallThickness),
      wallMat
    );
    northWall.position.set(0, wallHeight / 2, -extendedRoomSize / 2);
    northWall.receiveShadow = true;
    this.scene.add(northWall);
    this.collidables.push(northWall);

    // South wall arch (simplified collision)
    const archWidth = 4;
    const archHeight = 8;

    const invisibleGate = new THREE.Mesh(
      new THREE.BoxGeometry(archWidth, archHeight, 1),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    );
    invisibleGate.position.set(0, archHeight / 2, extendedRoomSize / 2 - 0.5);
    invisibleGate.visible = false;
    this.scene.add(invisibleGate);
    this.collidables.push(invisibleGate);

    // East wall
    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, extendedRoomSize),
      wallMat
    );
    eastWall.position.set(roomSize / 2, wallHeight / 2, 0);
    eastWall.receiveShadow = true;
    this.scene.add(eastWall);
    this.collidables.push(eastWall);

    // West wall
    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, extendedRoomSize),
      wallMat
    );
    westWall.position.set(-roomSize / 2, wallHeight / 2, 0);
    westWall.receiveShadow = true;
    this.scene.add(westWall);
    this.collidables.push(westWall);
  }

  createPathway() {
    const pathwayMat = new THREE.MeshPhongMaterial({ color: 0x654321, shininess: 4 });
    const pathWidth = 10;
    const pathHeight = 0.05;
    const sideWallThickness = 0.3; // thin invisible wall
    const sideWallHeight = 2; // player-height walls

    const pathSegments = [
      { start: [0, pathHeight, 120], end: [0, pathHeight, 110] },
      { start: [0, pathHeight, 110], end: [0, pathHeight, 100] },
      { start: [0, pathHeight, 100], end: [0, pathHeight, 48] },
      { start: [0, pathHeight, 48], end: [0, pathHeight, 42] },
      { start: [0, pathHeight, 42], end: [-5, pathHeight, 35] },
      { start: [-5, pathHeight, 35], end: [-15, pathHeight, 25] },
      { start: [-15, pathHeight, 25], end: [-25, pathHeight, 15] },
      { start: [-25, pathHeight, 15], end: [-35, pathHeight, 5] },
      { start: [-35, pathHeight, 5], end: [-40, pathHeight, -10] },
      { start: [-40, pathHeight, -10], end: [-25, pathHeight, -25] },
      { start: [-25, pathHeight, -25], end: [-10, pathHeight, -40] },
      { start: [-10, pathHeight, -40], end: [10, pathHeight, -55] },
      { start: [10, pathHeight, -55], end: [25, pathHeight, -70] },
      { start: [25, pathHeight, -70], end: [15, pathHeight, -85] },
      { start: [15, pathHeight, -85], end: [0, pathHeight, -95] },
    ];

    pathSegments.forEach((segment) => {
      const start = new THREE.Vector3(...segment.start);
      const end = new THREE.Vector3(...segment.end);
      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();
      const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

      const segmentGeo = new THREE.BoxGeometry(pathWidth, pathHeight * 2, length);
      const segmentMesh = new THREE.Mesh(segmentGeo, pathwayMat);
      segmentMesh.position.copy(midpoint);
      segmentMesh.rotation.y = Math.atan2(direction.x, direction.z);
      segmentMesh.receiveShadow = true;
      this.scene.add(segmentMesh);
      
      const invisibleMat = new THREE.MeshBasicMaterial({ visible: false});

      // Calculate perpendicular offset (90 degrees to path direction)
      const angle = Math.atan2(direction.x, direction.z);
      const perpX = Math.cos(angle); // perpendicular X
      const perpZ = -Math.sin(angle); // perpendicular Z
      
      // Left wall
      const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(sideWallThickness, sideWallHeight, length),
        invisibleMat
      );
      leftWall.position.copy(midpoint);
      leftWall.position.x -= perpX * (pathWidth / 2 + sideWallThickness / 2);
      leftWall.position.z -= perpZ * (pathWidth / 2 + sideWallThickness / 2);
      leftWall.rotation.y = angle;
      this.scene.add(leftWall);
      this.collidables.push(leftWall);

      // Right wall
      const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(sideWallThickness, sideWallHeight, length),
        invisibleMat
      );
      rightWall.position.copy(midpoint);
      rightWall.position.x += perpX * (pathWidth / 2 + sideWallThickness / 2);
      rightWall.position.z += perpZ * (pathWidth / 2 + sideWallThickness / 2);
      rightWall.rotation.y = angle;
      this.scene.add(rightWall);
      this.collidables.push(rightWall);
    });
  }

  createGearObstacle() {
    const goldMat = new THREE.MeshPhongMaterial({
      color: 0xFFD700,
      shininess: 100,
      side: THREE.DoubleSide,
      clippingPlanes: [ new THREE.Plane(new THREE.Vector3(0, -1, 0), 0) ]
    });

    // Gear parameters
    const teeth = 24;
    const outerRadius = 4;
    const innerRadius = 3;
    const toothDepth = 0.8; // thinner gear (jumpable)

    const gearShape = new THREE.Shape();
    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const nextAngle = ((i + 1) / teeth) * Math.PI * 2;

      const x1 = Math.cos(angle) * outerRadius;
      const y1 = Math.sin(angle) * outerRadius;
      const x2 = Math.cos((angle + nextAngle) / 2) * innerRadius;
      const y2 = Math.sin((angle + nextAngle) / 2) * innerRadius;

      if (i === 0) {
        gearShape.moveTo(x1, y1);
      } else {
        gearShape.lineTo(x1, y1);
      }
      gearShape.lineTo(x2, y2);
    }
    gearShape.closePath();

    const extrudeSettings = { depth: toothDepth, bevelEnabled: false };
    const gearGeometry = new THREE.ExtrudeGeometry(gearShape, extrudeSettings);

    const gear = new THREE.Mesh(gearGeometry, goldMat);

    // Orientation
    gear.rotation.x = 0;
    gear.rotation.y = (Math.PI / 2) - Math.PI / 4;

    // Position
    const pathY = 0.05;
    gear.position.set(-20.5, pathY - 1.5, 20);

    // Add
    this.scene.add(gear);

    // 🔑 Save reference for animation
    this.gear = gear;
  }

  createDecorations() {
    // 1️⃣ Lightbulbs along walls
    const bulbMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffaa, 
      emissive: 0xffff88, 
      emissiveIntensity: 2 
    });
    const bulbGeo = new THREE.SphereGeometry(0.5, 16, 16);

    // North and South walls
    for (let i = -40; i <= 40; i += 20) {
      const northBulb = new THREE.Mesh(bulbGeo, bulbMat);
      northBulb.position.set(i, 10, -this.extendedRoomSize/2 + 0.5);
      this.scene.add(northBulb);

      const southBulb = new THREE.Mesh(bulbGeo, bulbMat);
      southBulb.position.set(i, 10, this.extendedRoomSize/2 - 0.5);
      this.scene.add(southBulb);
    }

    // East and West walls
    for (let i = -40; i <= 40; i += 20) {
      const eastBulb = new THREE.Mesh(bulbGeo, bulbMat);
      eastBulb.position.set(this.roomSize/2 - 0.5, 10, i);
      this.scene.add(eastBulb);

      const westBulb = new THREE.Mesh(bulbGeo, bulbMat);
      westBulb.position.set(-this.roomSize/2 + 0.5, 10, i);
      this.scene.add(westBulb);
    }

    // 2️⃣ Clock faces
    const clockTexture = new THREE.TextureLoader().load('./textures/clockface.png'); // use your clock face image
    const clockMat = new THREE.MeshBasicMaterial({ map: clockTexture, transparent: true });
    const clockGeo = new THREE.PlaneGeometry(6, 6);

    // Place two clocks
    const northClock = new THREE.Mesh(clockGeo, clockMat);
    northClock.position.set(-30, 12, -this.extendedRoomSize/2 + 0.6);
    northClock.rotation.y = 0;
    this.scene.add(northClock);

    const eastClock = new THREE.Mesh(clockGeo, clockMat);
    eastClock.position.set(this.roomSize/2 - 0.6, 12, 30);
    eastClock.rotation.y = -Math.PI / 2;
    this.scene.add(eastClock);

    // 3️⃣ Scatter nuts & bolts on grey floor
    const nutMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.4 });
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.9, roughness: 0.3 });

    for (let i = 0; i < 20; i++) {
      const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12), nutMat);
      nut.rotation.x = Math.random() * Math.PI;
      nut.position.set((Math.random() - 0.5) * this.roomSize * 0.8, 0.1, (Math.random() - 0.5) * this.extendedRoomSize * 0.8);
      this.scene.add(nut);

      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 12), boltMat);
      bolt.rotation.x = Math.random() * Math.PI;
      bolt.position.set((Math.random() - 0.5) * this.roomSize * 0.8, 0.1, (Math.random() - 0.5) * this.extendedRoomSize * 0.8);
      this.scene.add(bolt);
    }
  }

  addAnimatedClockFaces() {
    const clockRadius = 3;
    const wallOffset = 0.6; // slightly in front of wall
    const clockHeight = 8; // Y position

    // Helper to create clock mesh with hands
    const createClock = () => {
      const clock = new THREE.Group();

      // Clock face
      const faceShape = new THREE.Shape();
      faceShape.absarc(0, 0, clockRadius, 0, Math.PI * 2, false);
      const faceGeo = new THREE.ShapeGeometry(faceShape);
      const faceMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const faceMesh = new THREE.Mesh(faceGeo, faceMat);
      clock.add(faceMesh);

      // Hour markers
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * (clockRadius - 0.3);
        const y = Math.sin(angle) * (clockRadius - 0.3);
        const markerGeo = new THREE.CircleGeometry(0.1, 8);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.position.set(x, y, 0.01);
        clock.add(marker);
      }

      // Hands
      const hourHandGeo = new THREE.BoxGeometry(0.2, clockRadius * 0.5, 0.05);
      const hourHandMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const hourHand = new THREE.Mesh(hourHandGeo, hourHandMat);
      hourHand.position.set(0, clockRadius * 0.25, 0.05);
      clock.add(hourHand);

      const minuteHandGeo = new THREE.BoxGeometry(0.1, clockRadius * 0.8, 0.05);
      const minuteHandMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const minuteHand = new THREE.Mesh(minuteHandGeo, minuteHandMat);
      minuteHand.position.set(0, clockRadius * 0.4, 0.05);
      clock.add(minuteHand);

      // Save hands for animation
      clock.userData = { hourHand, minuteHand };

      return clock;
    };

    // Create clocks on walls
    this.clocks = []; // store clocks for animation

    const northClock = createClock();
    northClock.position.set(-30, clockHeight, -this.extendedRoomSize / 2 + wallOffset);
    northClock.scale.set(1.5, 1.5, 1.5);
    this.scene.add(northClock);
    this.clocks.push(northClock);

    const southClock = createClock();
    southClock.position.set(30, clockHeight, this.extendedRoomSize / 2 - wallOffset);
    southClock.rotation.y = Math.PI;
    this.scene.add(southClock);
    this.clocks.push(southClock);

    const eastClock = createClock();
    eastClock.position.set(this.roomSize / 2 - wallOffset, clockHeight, 0);
    eastClock.rotation.y = -Math.PI / 2;
    this.scene.add(eastClock);
    this.clocks.push(eastClock);

    const westClock = createClock();
    westClock.position.set(-this.roomSize / 2 + wallOffset, clockHeight, 0);
    westClock.rotation.y = Math.PI / 2;
    this.scene.add(westClock);
    this.clocks.push(westClock);
  }

  loadPlayerModel() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        './models/AJ.glb',
        (gltf) => {
          this.player = gltf.scene;
          this.player.scale.set(1, 1, 1);
          this.player.position.copy(this.playerStartPosition);
          this.player.name = 'player';
          this.scene.add(this.player);
          this.mixer = new THREE.AnimationMixer(this.player);
          resolve(gltf);
          this.player.rotation.y = Math.PI;
        },
        undefined,
        (error) => reject(error)
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

  getPlayerStartPosition() {
    return this.playerStartPosition || new THREE.Vector3(0, 0, 10);
  }

  update(delta) {
    if (!this.player) return;

    this.prevPlayerPos = this.player.position.clone();
    // Player movement code here

    this.updateGearCollision();
    this.updateGearRotation(delta);
    if (this.mixer) this.mixer.update(delta);

    // Animate clocks
    this.updateClockHands(delta);
  }

  updateClockHands(delta) {
    if (!this.clocks) return;

    this.clocks.forEach(clock => {
      const { hourHand, minuteHand } = clock.userData;

      // Rotate minute hand 360° in 60 seconds
      minuteHand.rotation.z -= delta * (Math.PI * 2 / 60);

      // Rotate hour hand 360° in 12 minutes (or slower for realism)
      hourHand.rotation.z -= delta * (Math.PI * 2 / 720);
    });
  }

  updateGearRotation(delta) {
    if (this.gear) {
      this.gear.rotation.z += delta; // Spin speed
    }
  }

  updateGearCollision() {
    if (!this.player || !this.gear || !this.prevPlayerPos) return;

    // Player bounding box
    const playerBox = new THREE.Box3().setFromObject(this.player);

    // Gear bounding box (slightly expanded for solid collision)
    const gearBox = new THREE.Box3().setFromObject(this.gear);
    gearBox.expandByScalar(0.5);

    if (playerBox.intersectsBox(gearBox)) {
      const gearTop = this.gear.position.y + 0.8; // gear height
      const playerBottom = this.player.position.y;

      // Block only if player is below gear height
      if (playerBottom < gearTop) {
        // Block forward/backward movement
        this.player.position.x = this.prevPlayerPos.x;
        this.player.position.y = this.prevPlayerPos.y;
        this.player.position.z = this.prevPlayerPos.z;
      }
    }
  }
}