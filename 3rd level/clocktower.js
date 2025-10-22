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
    this.init();
  }

  init() {
    this.scene.background = new THREE.Color(0x8B7355);
    this.scene.fog = new THREE.Fog(0x8B7355, 80, 200);
    
    // Bright ambient light
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    
    // Strong directional light from clock face
    const clockLight = new THREE.DirectionalLight(0xfff5e1, 1.2);
    clockLight.position.set(0, 30, -45);
    clockLight.castShadow = true;
    this.scene.add(clockLight);
    
    // Bright spotlight on central mechanism
    const mechanismLight = new THREE.SpotLight(0xffd700, 1.5, 60, Math.PI / 5);
    mechanismLight.position.set(0, 40, 0);
    mechanismLight.target.position.set(0, 0, 0);
    this.scene.add(mechanismLight);
    this.scene.add(mechanismLight.target);
    
    // Warm point lights on the corners
    const cornerLight1 = new THREE.PointLight(0xffcc99, 1.2, 50);
    cornerLight1.position.set(-40, 20, -40);
    this.scene.add(cornerLight1);
    
    const cornerLight2 = new THREE.PointLight(0xffcc99, 1.2, 50);
    cornerLight2.position.set(40, 20, -40);
    this.scene.add(cornerLight2);
    
    const cornerLight3 = new THREE.PointLight(0xffcc99, 1.2, 50);
    cornerLight3.position.set(-40, 20, 40);
    this.scene.add(cornerLight3);
    
    const cornerLight4 = new THREE.PointLight(0xffcc99, 1.2, 50);
    cornerLight4.position.set(40, 20, 40);
    this.scene.add(cornerLight4);
    
    // Additional overhead lights
    const overheadLight1 = new THREE.PointLight(0xffffcc, 1, 40);
    overheadLight1.position.set(0, 35, 0);
    this.scene.add(overheadLight1);
    
    const overheadLight2 = new THREE.PointLight(0xffffcc, 0.8, 35);
    overheadLight2.position.set(20, 30, 20);
    this.scene.add(overheadLight2);
    
    const overheadLight3 = new THREE.PointLight(0xffffcc, 0.8, 35);
    overheadLight3.position.set(-20, 30, -20);
    this.scene.add(overheadLight3);
    
    this.createClocktowerWorkshop();
  }

  createClocktowerWorkshop() {
    const wallMat = new THREE.MeshPhongMaterial({ color: 0x3d3d3d, shininess: 10 });
    this.createClocktowerWalls(this.roomSize, 40, 2, wallMat);

    const floorMat = new THREE.MeshPhongMaterial({ color: 0x9B7653, shininess: 15 });
    const floorGeo = new THREE.PlaneGeometry(this.roomSize, this.roomSize);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);
    this.collidables.push(floor);
    this.playerStartPosition = new THREE.Vector3(0, 0, 35);

    this.createGearObstacle();
    this.createRisingPlatforms();
    this.createCentralMechanism();
    this.createHangingChains();
    this.createLargeClockFace();
    this.createMetalBeams();
    this.createInterlinkedGears();
    this.createScatteredNutsAndBolts();
    this.createAdditionalClockMachinery();
  }

  createClocktowerWalls(roomSize, wallHeight, wallThickness, wallMat) {
    // Warm brown brick walls
    const brickMat = new THREE.MeshPhongMaterial({ 
      color: 0x8B6914, 
      shininess: 20
    });
    
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(roomSize, wallHeight, wallThickness), brickMat);
    northWall.position.set(0, wallHeight / 2, -roomSize / 2);
    this.scene.add(northWall); this.collidables.push(northWall);

    const southWall = new THREE.Mesh(new THREE.BoxGeometry(roomSize, wallHeight, wallThickness), brickMat);
    southWall.position.set(0, wallHeight / 2, roomSize / 2);
    this.scene.add(southWall); this.collidables.push(southWall);

    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, roomSize), brickMat);
    eastWall.position.set(roomSize / 2, wallHeight / 2, 0); this.scene.add(eastWall); this.collidables.push(eastWall);

    const westWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, roomSize), brickMat);
    westWall.position.set(-roomSize / 2, wallHeight / 2, 0); this.scene.add(westWall); this.collidables.push(westWall);
    
    // Lighter brown pillars in corners
    const pillarMat = new THREE.MeshPhongMaterial({ color: 0xA0826D, shininess: 25 });
    const corners = [
      [-roomSize/2 + 2, 0, -roomSize/2 + 2],
      [roomSize/2 - 2, 0, -roomSize/2 + 2],
      [-roomSize/2 + 2, 0, roomSize/2 - 2],
      [roomSize/2 - 2, 0, roomSize/2 - 2]
    ];
    
    corners.forEach(pos => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(3, wallHeight, 3), pillarMat);
      pillar.position.set(pos[0], wallHeight / 2, pos[2]);
      this.scene.add(pillar);
      this.collidables.push(pillar);
    });
  }

  createGearObstacle() {
    const mat = new THREE.MeshPhongMaterial({ color: 0xFFD700, shininess: 100 });
    const shape = new THREE.Shape(); const teeth=24, outerR=6, innerR=5;
    for(let i=0;i<teeth;i++){
      const a=i/teeth*Math.PI*2, na=(i+1)/teeth*Math.PI*2;
      const x1=Math.cos(a)*outerR, y1=Math.sin(a)*outerR, x2=Math.cos((a+na)/2)*innerR, y2=Math.sin((a+na)/2)*innerR;
      if(i===0) shape.moveTo(x1,y1); else shape.lineTo(x1,y1); shape.lineTo(x2,y2);
    } shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape,{ depth:1.2, bevelEnabled:false });
    const mesh = new THREE.Mesh(geo, mat); mesh.rotation.y=Math.PI/4; mesh.position.set(0, -2, 0);
    this.scene.add(mesh); this.collidables.push(mesh); this.gear=mesh;
  }

  createRisingPlatforms() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x8B7355, metalness: 0.5, roughness: 0.5 });
    this.platforms = [];
    const positions = [
        new THREE.Vector3(-15, 0.5, -15),
        new THREE.Vector3(15, 0.5, -15),
        new THREE.Vector3(-15, 0.5, 15),
        new THREE.Vector3(15, 0.5, 15)
    ];
    positions.forEach((pos, i) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 8), mat);
        mesh.position.copy(pos);
        this.scene.add(mesh);
        this.collidables.push(mesh);
        this.platforms.push(mesh);
    });
  }

  createCentralMechanism() {
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, metalness: 0.7, roughness: 0.3 });
    
    // Central vertical shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 38, 16), metalMat);
    shaft.position.set(0, 19, 0);
    this.scene.add(shaft);
    
    // Add rotating drum/cylinder in the middle
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 6, 24),
      new THREE.MeshStandardMaterial({ color: 0xA0826D, metalness: 0.4, roughness: 0.6 })
    );
    drum.position.set(0, 10, 0);
    this.scene.add(drum);
    this.rotatingDrum = drum;
    
    // Spinning gears on the shaft at different heights
    this.mechanismGears = [];
    const gearHeights = [8, 16, 24, 32];
    
    gearHeights.forEach((height, index) => {
      const gearMat = new THREE.MeshPhongMaterial({ 
        color: index % 2 === 0 ? 0xDAA520 : 0xB8860B, 
        shininess: 100 
      });
      const shape = new THREE.Shape();
      const teeth = 20, outerR = 3.5 + index * 0.3, innerR = outerR - 0.7;
      
      for(let j = 0; j < teeth; j++) {
        const a = j/teeth * Math.PI * 2, na = (j+1)/teeth * Math.PI * 2;
        const x1 = Math.cos(a) * outerR, y1 = Math.sin(a) * outerR;
        const x2 = Math.cos((a+na)/2) * innerR, y2 = Math.sin((a+na)/2) * innerR;
        if(j === 0) shape.moveTo(x1, y1); else shape.lineTo(x1, y1);
        shape.lineTo(x2, y2);
      }
      shape.closePath();
      
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.8, bevelEnabled: false });
      const gear = new THREE.Mesh(geo, gearMat);
      gear.rotation.x = Math.PI / 2;
      gear.position.set(0, height, 0);
      this.scene.add(gear);
      this.mechanismGears.push(gear);
    });
    
    // Add connecting rods/pistons
    for(let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = Math.cos(angle) * 8;
      const z = Math.sin(angle) * 8;
      
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 15, 8),
        new THREE.MeshStandardMaterial({ color: 0xA0826D, metalness: 0.6 })
      );
      rod.position.set(x, 12, z);
      
      const angleRad = Math.atan2(x, z);
      rod.rotation.z = Math.PI / 2;
      rod.rotation.y = angleRad;
      
      this.scene.add(rod);
    }
    
    // Add some smaller decorative gears on the walls
    this.wallGears = [];
    const wallGearPositions = [
      { pos: [35, 12, 0], rot: [0, Math.PI/2, 0] },
      { pos: [-35, 12, 0], rot: [0, -Math.PI/2, 0] },
      { pos: [0, 12, 35], rot: [0, Math.PI, 0] }
    ];
    
    wallGearPositions.forEach(config => {
      const shape = new THREE.Shape();
      const teeth = 16, outerR = 2.5, innerR = 2;
      
      for(let j = 0; j < teeth; j++) {
        const a = j/teeth * Math.PI * 2, na = (j+1)/teeth * Math.PI * 2;
        const x1 = Math.cos(a) * outerR, y1 = Math.sin(a) * outerR;
        const x2 = Math.cos((a+na)/2) * innerR, y2 = Math.sin((a+na)/2) * innerR;
        if(j === 0) shape.moveTo(x1, y1); else shape.lineTo(x1, y1);
        shape.lineTo(x2, y2);
      }
      shape.closePath();
      
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false });
      const gear = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: 0xCD853F, shininess: 80 }));
      gear.position.set(...config.pos);
      gear.rotation.set(...config.rot);
      this.scene.add(gear);
      this.wallGears.push(gear);
    });
  }

  createHangingChains() {
    const chainMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, metalness: 0.8, roughness: 0.3 });
    this.chains = [];
    
    const positions = [
      new THREE.Vector3(-25, 0, -25),
      new THREE.Vector3(25, 0, -25),
      new THREE.Vector3(-25, 0, 25),
      new THREE.Vector3(25, 0, 25)
    ];
    
    positions.forEach(pos => {
      const chain = new THREE.Group();
      
      // Create chain links
      for(let i = 0; i < 20; i++) {
        const link = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.12, 8, 16), chainMat);
        link.rotation.x = i % 2 === 0 ? 0 : Math.PI / 2;
        link.position.y = 40 - i * 1.8;
        chain.add(link);
      }
      
      // Add weight at the bottom
      const weight = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 3, 16), 
        new THREE.MeshStandardMaterial({ color: 0xA0826D, metalness: 0.7 })
      );
      weight.position.y = 4;
      chain.add(weight);
      
      // Add hook at top
      const hook = new THREE.Mesh(
        new THREE.TorusGeometry(0.6, 0.15, 8, 16, Math.PI),
        chainMat
      );
      hook.rotation.z = Math.PI;
      hook.position.y = 40;
      chain.add(hook);
      
      chain.position.set(pos.x, 0, pos.z);
      this.scene.add(chain);
      this.chains.push(chain);
    });
  }

  createLargeClockFace() {
    const clockGroup = new THREE.Group();
    const radius = 15;
    
    // Clock face background
    const faceShape = new THREE.Shape().absarc(0, 0, radius, 0, Math.PI * 2);
    const faceMat = new THREE.MeshBasicMaterial({ color: 0xfff5dc, side: THREE.DoubleSide });
    const face = new THREE.Mesh(new THREE.ShapeGeometry(faceShape), faceMat);
    clockGroup.add(face);
    
    // Clock frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, metalness: 0.8 });
    const frame = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.8, 16, 32), frameMat);
    clockGroup.add(frame);
    
    // Roman numerals positions (simplified as small boxes)
    const numeralMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    for(let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180;
      const x = Math.cos(angle) * (radius - 2);
      const y = Math.sin(angle) * (radius - 2);
      const numeral = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.1), numeralMat);
      numeral.position.set(x, y, 0.1);
      clockGroup.add(numeral);
    }
    
    // Clock hands
    const hourHandMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const minuteHandMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.5, radius * 0.5, 0.2), hourHandMat);
    this.minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.3, radius * 0.7, 0.2), minuteHandMat);
    this.hourHand.position.set(0, radius * 0.25, 0.2);
    this.minuteHand.position.set(0, radius * 0.35, 0.3);
    clockGroup.add(this.hourHand, this.minuteHand);
    
    clockGroup.position.set(0, 25, -this.roomSize / 2 + 1);
    this.scene.add(clockGroup);
    this.largeClock = clockGroup;
  }

  createMetalBeams() {
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, metalness: 0.6, roughness: 0.4 });
    
    // Main horizontal support beams creating a cross pattern
    const beam1 = new THREE.Mesh(new THREE.BoxGeometry(this.roomSize - 10, 1, 1), beamMat);
    beam1.position.set(0, 25, 0);
    this.scene.add(beam1);
    
    const beam2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, this.roomSize - 10), beamMat);
    beam2.position.set(0, 25, 0);
    this.scene.add(beam2);
    
    // Lower level beams
    const beam3 = new THREE.Mesh(new THREE.BoxGeometry(this.roomSize - 20, 0.8, 0.8), beamMat);
    beam3.position.set(0, 15, 0);
    this.scene.add(beam3);
    
    const beam4 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, this.roomSize - 20), beamMat);
    beam4.position.set(0, 15, 0);
    this.scene.add(beam4);
    
    // Diagonal support beams from corners to center
    const createDiagonalBeam = (x, z) => {
      const length = Math.sqrt(x * x + 20 * 20 + z * z);
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, length), beamMat);
      beam.position.set(x / 2, 10, z / 2);
      
      const angleY = Math.atan2(x, z);
      const angleX = Math.atan2(20, Math.sqrt(x * x + z * z));
      beam.rotation.y = angleY;
      beam.rotation.x = angleX;
      
      this.scene.add(beam);
    };
    
    createDiagonalBeam(30, 30);
    createDiagonalBeam(-30, 30);
    createDiagonalBeam(30, -30);
    createDiagonalBeam(-30, -30);
    
    // Vertical support beams
    const verticalPositions = [
      [20, 0, 20], [-20, 0, 20], [20, 0, -20], [-20, 0, -20]
    ];
    
    verticalPositions.forEach(pos => {
      const vBeam = new THREE.Mesh(new THREE.BoxGeometry(0.8, 30, 0.8), beamMat);
      vBeam.position.set(pos[0], 15, pos[2]);
      this.scene.add(vBeam);
    });
    
    // Add catwalks/platforms around the upper area
    const catwalkMat = new THREE.MeshStandardMaterial({ 
      color: 0xA0826D, 
      metalness: 0.5, 
      roughness: 0.5,
      side: THREE.DoubleSide 
    });
    
    // North catwalk
    const northCatwalk = new THREE.Mesh(
      new THREE.PlaneGeometry(this.roomSize - 20, 3), 
      catwalkMat
    );
    northCatwalk.rotation.x = -Math.PI / 2;
    northCatwalk.position.set(0, 20, -35);
    this.scene.add(northCatwalk);
    
    // South catwalk
    const southCatwalk = new THREE.Mesh(
      new THREE.PlaneGeometry(this.roomSize - 20, 3), 
      catwalkMat
    );
    southCatwalk.rotation.x = -Math.PI / 2;
    southCatwalk.position.set(0, 20, 35);
    this.scene.add(southCatwalk);
  }
    createInterlinkedGears() {
      // Create a system of interlinked gears on different walls
      this.interlinkedGears = [];
      
      // East wall gear system
      const eastGearSystem = new THREE.Group();
      const gearSizes = [
        { radius: 3, teeth: 24, pos: [0, 0, 0], color: 0xDAA520 },
        { radius: 2, teeth: 16, pos: [4.5, 0, 0], color: 0xB8860B },
        { radius: 1.5, teeth: 12, pos: [7, 0, 0], color: 0xCD853F },
        { radius: 2.5, teeth: 20, pos: [0, 4.5, 0], color: 0xDEB887 },
        { radius: 1.8, teeth: 14, pos: [3.5, 6, 0], color: 0xDAA520 }
      ];
      
      gearSizes.forEach(gearData => {
        const shape = new THREE.Shape();
        const teeth = gearData.teeth;
        const outerR = gearData.radius;
        const innerR = outerR * 0.85;
        
        for(let i = 0; i < teeth; i++) {
          const a = i / teeth * Math.PI * 2;
          const na = (i + 1) / teeth * Math.PI * 2;
          const x1 = Math.cos(a) * outerR, y1 = Math.sin(a) * outerR;
          const x2 = Math.cos((a + na) / 2) * innerR, y2 = Math.sin((a + na) / 2) * innerR;
          if(i === 0) shape.moveTo(x1, y1); else shape.lineTo(x1, y1);
          shape.lineTo(x2, y2);
        }
        shape.closePath();
        
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: false });
        const gear = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: gearData.color, shininess: 90 }));
        gear.position.set(gearData.pos[0], gearData.pos[1], gearData.pos[2]);
        gear.userData.radius = gearData.radius;
        gear.userData.rotationSpeed = 1 / gearData.radius;
        eastGearSystem.add(gear);
        this.interlinkedGears.push(gear);
      });
      
      eastGearSystem.position.set(this.roomSize / 2 - 1, 15, 0);
      eastGearSystem.rotation.y = -Math.PI / 2;
      this.scene.add(eastGearSystem);
      
      // West wall gear system
      const westGearSystem = new THREE.Group();
      const westGearSizes = [
        { radius: 2.5, teeth: 20, pos: [0, 0, 0], color: 0xB8860B },
        { radius: 2, teeth: 16, pos: [4, 0, 0], color: 0xDAA520 },
        { radius: 1.5, teeth: 12, pos: [6.5, 0, 0], color: 0xDEB887 },
        { radius: 3, teeth: 24, pos: [1.5, 4, 0], color: 0xCD853F }
      ];
      
      westGearSizes.forEach(gearData => {
        const shape = new THREE.Shape();
        const teeth = gearData.teeth;
        const outerR = gearData.radius;
        const innerR = outerR * 0.85;
        
        for(let i = 0; i < teeth; i++) {
          const a = i / teeth * Math.PI * 2;
          const na = (i + 1) / teeth * Math.PI * 2;
          const x1 = Math.cos(a) * outerR, y1 = Math.sin(a) * outerR;
          const x2 = Math.cos((a + na) / 2) * innerR, y2 = Math.sin((a + na) / 2) * innerR;
          if(i === 0) shape.moveTo(x1, y1); else shape.lineTo(x1, y1);
          shape.lineTo(x2, y2);
        }
        shape.closePath();
        
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: false });
        const gear = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: gearData.color, shininess: 90 }));
        gear.position.set(gearData.pos[0], gearData.pos[1], gearData.pos[2]);
        gear.userData.radius = gearData.radius;
        gear.userData.rotationSpeed = 1 / gearData.radius;
        westGearSystem.add(gear);
        this.interlinkedGears.push(gear);
      });
      
      westGearSystem.position.set(-this.roomSize / 2 + 1, 15, 0);
      westGearSystem.rotation.y = Math.PI / 2;
      this.scene.add(westGearSystem);
      
      // South wall gear system
      const southGearSystem = new THREE.Group();
      const southGearSizes = [
        { radius: 3.5, teeth: 28, pos: [0, 0, 0], color: 0xDAA520 },
        { radius: 2.2, teeth: 18, pos: [5, 0, 0], color: 0xB8860B },
        { radius: 1.8, teeth: 14, pos: [-4.5, 0, 0], color: 0xCD853F },
        { radius: 2.5, teeth: 20, pos: [0, 5, 0], color: 0xDEB887 }
      ];
      
      southGearSizes.forEach(gearData => {
        const shape = new THREE.Shape();
        const teeth = gearData.teeth;
        const outerR = gearData.radius;
        const innerR = outerR * 0.85;
        
        for(let i = 0; i < teeth; i++) {
          const a = i / teeth * Math.PI * 2;
          const na = (i + 1) / teeth * Math.PI * 2;
          const x1 = Math.cos(a) * outerR, y1 = Math.sin(a) * outerR;
          const x2 = Math.cos((a + na) / 2) * innerR, y2 = Math.sin((a + na) / 2) * innerR;
          if(i === 0) shape.moveTo(x1, y1); else shape.lineTo(x1, y1);
          shape.lineTo(x2, y2);
        }
        shape.closePath();
        
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: false });
        const gear = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: gearData.color, shininess: 90 }));
        gear.position.set(gearData.pos[0], gearData.pos[1], gearData.pos[2]);
        gear.userData.radius = gearData.radius;
        gear.userData.rotationSpeed = 1 / gearData.radius;
        southGearSystem.add(gear);
        this.interlinkedGears.push(gear);
      });
      
      southGearSystem.position.set(0, 12, this.roomSize / 2 - 1);
      southGearSystem.rotation.y = Math.PI;
      this.scene.add(southGearSystem);
    }
      createScatteredNutsAndBolts() {
        const nutMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, metalness: 0.8, roughness: 0.3 });
        const boltMat = new THREE.MeshStandardMaterial({ color: 0xA0826D, metalness: 0.7, roughness: 0.4 });
        
        // Create nut geometry (hexagonal)
        const createNut = (size) => {
          const hexShape = new THREE.Shape();
          for(let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if(i === 0) hexShape.moveTo(x, y);
            else hexShape.lineTo(x, y);
          }
          hexShape.closePath();
          
          const holeShape = new THREE.Path();
          for(let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * size * 0.4;
            const y = Math.sin(angle) * size * 0.4;
            if(i === 0) holeShape.moveTo(x, y);
            else holeShape.lineTo(x, y);
          }
          holeShape.closePath();
          hexShape.holes.push(holeShape);
          
          return new THREE.ExtrudeGeometry(hexShape, { depth: size * 0.5, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
        };
        
        // Scatter nuts on the floor
        for(let i = 0; i < 40; i++) {
          const size = 0.15 + Math.random() * 0.25;
          const nut = new THREE.Mesh(createNut(size), nutMat);
          nut.position.set(
            (Math.random() - 0.5) * (this.roomSize - 20),
            0.1,
            (Math.random() - 0.5) * (this.roomSize - 20)
          );
          nut.rotation.x = -Math.PI / 2;
          nut.rotation.z = Math.random() * Math.PI * 2;
          this.scene.add(nut);
        }
        
        // Create bolts
        for(let i = 0; i < 35; i++) {
          const radius = 0.08 + Math.random() * 0.12;
          const length = 0.5 + Math.random() * 1;
          
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 8), boltMat);
          const head = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.8, radius * 1.8, radius * 0.8, 8), boltMat);
          
          const bolt = new THREE.Group();
          shaft.position.y = -length / 2;
          head.position.y = radius * 0.4;
          bolt.add(shaft, head);
          
          bolt.position.set(
            (Math.random() - 0.5) * (this.roomSize - 20),
            0.1,
            (Math.random() - 0.5) * (this.roomSize - 20)
          );
          bolt.rotation.x = Math.PI / 2;
          bolt.rotation.z = Math.random() * Math.PI * 2;
          this.scene.add(bolt);
        }
        
        // Add some nuts and bolts on catwalks
        for(let i = 0; i < 15; i++) {
          const size = 0.12 + Math.random() * 0.2;
          const nut = new THREE.Mesh(createNut(size), nutMat);
          nut.position.set(
            (Math.random() - 0.5) * (this.roomSize - 30),
            20.1,
            -35 + (Math.random() - 0.5) * 3
          );
          nut.rotation.x = -Math.PI / 2;
          nut.rotation.z = Math.random() * Math.PI * 2;
          this.scene.add(nut);
        }
      }
    
      createAdditionalClockMachinery() {
        // Add pulleys
        const pulleyMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, metalness: 0.6, roughness: 0.4 });
        
        const pulleyPositions = [
          { pos: [30, 22, 30], size: 1.5 },
          { pos: [-30, 22, 30], size: 1.2 },
          { pos: [30, 22, -30], size: 1.8 },
          { pos: [-30, 22, -30], size: 1.3 }
        ];
        
        this.pulleys = [];
        pulleyPositions.forEach(data => {
          const pulley = new THREE.Mesh(
            new THREE.TorusGeometry(data.size, 0.3, 16, 32),
            pulleyMat
          );
          pulley.position.set(...data.pos);
          pulley.rotation.x = Math.PI / 2;
          this.scene.add(pulley);
          this.pulleys.push(pulley);
        });
        
        // Add connecting belts/ropes between pulleys
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8 });
        for(let i = 0; i < pulleyPositions.length - 1; i++) {
          const start = new THREE.Vector3(...pulleyPositions[i].pos);
          const end = new THREE.Vector3(...pulleyPositions[i + 1].pos);
          const distance = start.distanceTo(end);
          
          const rope = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, distance, 8),
            ropeMat
          );
          rope.position.copy(start).add(end).multiplyScalar(0.5);
          rope.lookAt(end);
          rope.rotation.x += Math.PI / 2;
          this.scene.add(rope);
        }
        
        // Add pressure gauges
        const gaugePositions = [
          [40, 10, 15],
          [-40, 10, -15],
          [15, 10, 40]
        ];
        
        gaugePositions.forEach(pos => {
          const gauge = new THREE.Group();
          
          // Gauge face
          const face = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32),
            new THREE.MeshBasicMaterial({ color: 0xf5f5dc })
          );
          face.rotation.x = Math.PI / 2;
          gauge.add(face);
          
          // Gauge rim
          const rim = new THREE.Mesh(
            new THREE.TorusGeometry(0.8, 0.1, 16, 32),
            new THREE.MeshStandardMaterial({ color: 0x8B7355, metalness: 0.8 })
          );
          gauge.add(rim);
          
          // Gauge needle
          const needle = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.6, 0.05),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
          );
          needle.position.y = 0.3;
          needle.position.z = 0.15;
          gauge.add(needle);
          
          gauge.position.set(...pos);
          gauge.lookAt(new THREE.Vector3(0, 10, 0));
          this.scene.add(gauge);
        });
        
        // Add pipes
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0xA0826D, metalness: 0.7, roughness: 0.3 });
        
        // Vertical pipes
        for(let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 35;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          const pipe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 25, 16),
            pipeMat
          );
          pipe.position.set(x, 12.5, z);
          this.scene.add(pipe);
        }
      }

  loadPlayerModel() {
    return new Promise((res,rej)=>{
      new GLTFLoader().load('./models/AJ.glb',g=>{
        this.player=g.scene; this.player.scale.set(1,1,1); this.player.position.copy(this.playerStartPosition); this.player.name='player'; this.scene.add(this.player);
        this.mixer=new THREE.AnimationMixer(this.player); this.player.rotation.y=Math.PI; res(g);
      },undefined,err=>rej(err));
    });
  }

  update(delta){
    if(!this.player) return;
    if(this.mixer) this.mixer.update(delta);
    this.updateGearRotation(delta); 
    this.updateGearCollision();
    this.updateClockHands(delta);
    
    // Animate rising platforms with slower, heavier movement
    if(this.platforms) {
      this.platforms.forEach((p, i) => { 
        p.position.y = 0.5 + Math.sin(Date.now() * 0.0005 + i * 1.5) * 4;
      });
    }
    
    // Animate central mechanism gears
    if(this.mechanismGears) {
      this.mechanismGears.forEach((g, i) => { 
        g.rotation.z += delta * (i % 2 === 0 ? 0.8 : -0.8);
      });
    }
    
    // Animate rotating drum
    if(this.rotatingDrum) {
      this.rotatingDrum.rotation.y += delta * 0.5;
    }
    
    // Animate wall gears
    if(this.wallGears) {
      this.wallGears.forEach((g, i) => {
        if(i === 0 || i === 1) {
          g.rotation.y += delta * 0.6 * (i % 2 === 0 ? 1 : -1);
        } else {
          g.rotation.z += delta * 0.6;
        }
      });
    }
    
    // Animate hanging chains with subtle movement
    if(this.chains) {
      this.chains.forEach((c, i) => { 
        c.position.y = Math.sin(Date.now() * 0.0003 + i) * 1.5;
        c.rotation.z = Math.sin(Date.now() * 0.0004 + i * 0.5) * 0.05;
      });
    }
        // Animate interlinked gears
    if(this.interlinkedGears) {
      this.interlinkedGears.forEach((g, i) => {
        g.rotation.z += delta * g.userData.rotationSpeed * (i % 2 === 0 ? 1 : -1);
      });
    }
    
    // Animate pulleys
    if(this.pulleys) {
      this.pulleys.forEach((p, i) => {
        p.rotation.z += delta * 0.8;
      });
    }
  }

  updateGearRotation(delta){ if(this.gear) this.gear.rotation.z+=delta; }

  updateGearCollision(){
    if(!this.player||!this.gear) return;
    const pb=new THREE.Box3().setFromCenterAndSize(this.player.position.clone().add(new THREE.Vector3(0,1,0)), new THREE.Vector3(1,2,1));
    const gb=new THREE.Box3().setFromCenterAndSize(this.gear.position.clone(), new THREE.Vector3(6,1.2,6));
    if(pb.intersectsBox(gb)){ this.player.position.add(new THREE.Vector3().subVectors(this.player.position,this.gear.position).setY(0).normalize().multiplyScalar(2)); this.player.position.y+=0.3; }
  }

  updateClockHands(delta){ 
    if(this.hourHand && this.minuteHand) {
      this.minuteHand.rotation.z -= delta * 2 * Math.PI / 60;
      this.hourHand.rotation.z -= delta * 2 * Math.PI / 720;
    }
  }

  getCollidables(){ return this.collidables; }
  getScene(){ return this.scene; }
  getPlayer(){ return this.player; }
  getMixer(){ return this.mixer; }
  getPlayerStartPosition(){ return this.playerStartPosition||new THREE.Vector3(0,0,10); }
}