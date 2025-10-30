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
    this.apple = null;
    this.audioListener = null;
    this.backgroundMusic = null;
    this.gameState = 'playing'; // 'playing', 'won', 'lost'
    this.quizActive = false;
    this.currentQuestion = null;
    this.init();
  }

  init() {
    // Sky blue background
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 30, 80);

    // Lights similar to gardenScene
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d7c6b, 1.0);
    hemiLight.position.set(0, 200, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    // Create terrain
    this.createTerrain();
    
    // Set room bounds
    this.roomBounds = new THREE.Box3(
      new THREE.Vector3(-40, 0, -40),
      new THREE.Vector3(40, 20, 40)
    );
  }

  createTerrain() {
    // Large grass ground plane - matching gardenScene style
    const groundSize = 80;
    const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x3a7d44, // grass green
      roughness: 0.9 
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    ground.name = 'ground';
    this.scene.add(ground);
    this.collidables.push(ground);
  }

  createFrog() {
    // Create a simple frog mesh
    const frogGroup = new THREE.Group();
    
    // Body
    const bodyGeo = new THREE.SphereGeometry(0.4, 16, 16);
    bodyGeo.scale(1, 0.6, 1.3);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x2d5016,
      roughness: 0.8
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    frogGroup.add(body);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.15, 12, 12);
    const eyeMat = new THREE.MeshStandardMaterial({ 
      color: 0xffff00,
      emissive: 0x444400
    });
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.18, 0.2, 0.3);
    leftEye.castShadow = true;
    frogGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.18, 0.2, 0.3);
    rightEye.castShadow = true;
    frogGroup.add(rightEye);

    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.18, 0.2, 0.42);
    frogGroup.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.18, 0.2, 0.42);
    frogGroup.add(rightPupil);

    // Add glow effect around frog (danger indicator)
    const glowGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    frogGroup.add(glow);
    frogGroup.userData.glow = glow;

    return frogGroup;
  }

  spawnFrogs(count = 5) {
    for (let i = 0; i < count; i++) {
      const frog = this.createFrog();
      
      // Random position around the edges
      const angle = (i / count) * Math.PI * 2;
      const distance = 15 + Math.random() * 10;
      
      frog.position.set(
        Math.cos(angle) * distance,
        0.4,
        Math.sin(angle) * distance
      );
      
      frog.userData.speed = 0.8 + Math.random() * 0.4; // Faster frogs!
      frog.userData.hopTimer = Math.random() * 2;
      frog.userData.isHopping = false;
      frog.userData.catchRadius = 1.5; // Distance to catch player
      
      this.scene.add(frog);
      this.frogs.push(frog);
    }
    console.log(`🐸 Spawned ${count} frogs - Don't get caught!`);
  }

  createApple() {
    const appleGroup = new THREE.Group();
    
    // Apple body
    const appleGeo = new THREE.SphereGeometry(0.5, 16, 16);
    appleGeo.scale(1, 1.1, 1);
    const appleMat = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      roughness: 0.4,
      metalness: 0.1,
      emissive: 0x330000
    });
    const appleBody = new THREE.Mesh(appleGeo, appleMat);
    appleBody.castShadow = true;
    appleGroup.add(appleBody);

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.3, 8);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.55;
    stem.rotation.z = 0.2;
    appleGroup.add(stem);

    // Leaf
    const leafGeo = new THREE.CircleGeometry(0.2, 8);
    const leafMat = new THREE.MeshStandardMaterial({ 
      color: 0x2d5016,
      side: THREE.DoubleSide
    });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(0.15, 0.65, 0);
    leaf.rotation.set(0.5, 0, 0.3);
    appleGroup.add(leaf);

    // Glow effect
    const glowGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    appleGroup.add(glow);
    appleGroup.userData.glow = glow;

    // Random position
    const randomX = (Math.random() - 0.5) * 60;
    const randomZ = (Math.random() - 0.5) * 60;
    appleGroup.position.set(randomX, 1, randomZ);
    
    // Floating animation data
    appleGroup.userData.startY = 1;
    appleGroup.userData.floatOffset = Math.random() * Math.PI * 2;
    
    this.scene.add(appleGroup);
    this.apple = appleGroup;
    
    console.log(`🍎 Apple spawned at (${randomX.toFixed(1)}, ${randomZ.toFixed(1)})`);
  }

  updateFrogs(delta) {
    if (!this.player || this.gameState !== 'playing') return;

    const playerPos = this.player.position;

    this.frogs.forEach(frog => {
      const frogPos = frog.position;
      const distance = new THREE.Vector2(
        frogPos.x - playerPos.x,
        frogPos.z - playerPos.z
      ).length();
      
      // Check if frog caught the player
      if (distance < frog.userData.catchRadius) {
        this.onPlayerCaught();
        return;
      }

      // Pulse the glow based on distance
      const glowIntensity = Math.max(0.1, 1 - distance / 20);
      frog.userData.glow.material.opacity = glowIntensity * 0.3;
      
      // Always chase the player!
      const direction = new THREE.Vector3()
        .subVectors(playerPos, frogPos)
        .normalize();
      
      // Hop animation timer
      frog.userData.hopTimer -= delta;
      
      if (frog.userData.hopTimer <= 0) {
        frog.userData.isHopping = true;
        frog.userData.hopTimer = 1.2 + Math.random() * 0.8;
      }
      
      if (frog.userData.isHopping) {
        // Move frog towards player
        const moveSpeed = frog.userData.speed * delta * 3; // Faster movement
        frog.position.x += direction.x * moveSpeed;
        frog.position.z += direction.z * moveSpeed;
        
        // Hopping animation
        const hopPhase = (frog.userData.hopTimer % 0.5) / 0.5;
        frog.position.y = 0.4 + Math.sin(hopPhase * Math.PI) * 0.3;
        
        // Rotate to face player
        frog.rotation.y = Math.atan2(direction.x, direction.z);
        
        if (hopPhase > 0.9) {
          frog.userData.isHopping = false;
        }
      } else {
        frog.position.y = THREE.MathUtils.lerp(frog.position.y, 0.4, delta * 5);
      }
    });
  }

  updateApple(delta) {
    if (!this.apple || !this.player || this.gameState !== 'playing') return;

    // Floating animation
    const time = Date.now() * 0.001;
    this.apple.position.y = this.apple.userData.startY + 
      Math.sin(time * 2 + this.apple.userData.floatOffset) * 0.2;
    
    // Rotation
    this.apple.rotation.y += delta * 0.5;
    
    // Pulse glow
    const glowPulse = 0.15 + Math.sin(time * 3) * 0.1;
    this.apple.userData.glow.material.opacity = glowPulse;

    // Check if player reached the apple
    const distance = this.apple.position.distanceTo(this.player.position);
    if (distance < 2) {
      this.onAppleFound();
    }
  }

  onAppleFound() {
    if (this.quizActive) return;
    
    console.log('🍎 Apple found! Starting quiz...');
    this.quizActive = true;
    
    // Show quiz
    this.showQuiz();
  }

  showQuiz() {
    // Create quiz overlay
    const quizOverlay = document.createElement('div');
    quizOverlay.id = 'quiz-overlay';
    quizOverlay.style.position = 'fixed';
    quizOverlay.style.top = '0';
    quizOverlay.style.left = '0';
    quizOverlay.style.width = '100%';
    quizOverlay.style.height = '100%';
    quizOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    quizOverlay.style.display = 'flex';
    quizOverlay.style.justifyContent = 'center';
    quizOverlay.style.alignItems = 'center';
    quizOverlay.style.zIndex = '1000';

    const quizBox = document.createElement('div');
    quizBox.style.backgroundColor = '#fff';
    quizBox.style.padding = '40px';
    quizBox.style.borderRadius = '15px';
    quizBox.style.maxWidth = '600px';
    quizBox.style.boxShadow = '0 10px 40px rgba(0,0,0,0.5)';

    // Quiz questions pool
    const questions = [
      {
        question: 'What color is a ripe apple?',
        answers: ['Red', 'Blue', 'Purple', 'Green'],
        correct: 0
      },
      {
        question: 'What vitamin is abundant in apples?',
        answers: ['Vitamin D', 'Vitamin C', 'Vitamin B12', 'Vitamin K'],
        correct: 1
      },
      {
        question: 'Which part of the apple should you NOT eat?',
        answers: ['The skin', 'The flesh', 'The seeds', 'The stem'],
        correct: 2
      },
      {
        question: 'Where do apples grow?',
        answers: ['Underground', 'On trees', 'In bushes', 'In water'],
        correct: 1
      },
      {
        question: 'What season are apples typically harvested?',
        answers: ['Spring', 'Summer', 'Fall', 'Winter'],
        correct: 2
      }
    ];

    this.currentQuestion = questions[Math.floor(Math.random() * questions.length)];

    quizBox.innerHTML = `
      <h2 style="color: #2d5016; margin-top: 0; font-size: 28px; text-align: center;">
        🍎 Apple Quiz!
      </h2>
      <p style="font-size: 18px; color: #333; margin: 20px 0; line-height: 1.6;">
        ${this.currentQuestion.question}
      </p>
      <div id="quiz-answers"></div>
    `;

    const answersDiv = quizBox.querySelector('#quiz-answers');
    
    this.currentQuestion.answers.forEach((answer, index) => {
      const button = document.createElement('button');
      button.textContent = answer;
      button.style.display = 'block';
      button.style.width = '100%';
      button.style.margin = '10px 0';
      button.style.padding = '15px';
      button.style.fontSize = '16px';
      button.style.cursor = 'pointer';
      button.style.border = '2px solid #2d5016';
      button.style.borderRadius = '8px';
      button.style.backgroundColor = '#fff';
      button.style.transition = 'all 0.3s';

      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#e8f5e9';
        button.style.transform = 'scale(1.02)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = '#fff';
        button.style.transform = 'scale(1)';
      });

      button.addEventListener('click', () => {
        this.checkAnswer(index, quizOverlay);
      });

      answersDiv.appendChild(button);
    });

    quizOverlay.appendChild(quizBox);
    document.body.appendChild(quizOverlay);
  }

  checkAnswer(selectedIndex, overlay) {
    if (selectedIndex === this.currentQuestion.correct) {
      this.onWin();
    } else {
      // Wrong answer
      overlay.querySelector('div').innerHTML = `
        <h2 style="color: #d32f2f; margin-top: 0; font-size: 28px; text-align: center;">
          ❌ Wrong Answer!
        </h2>
        <p style="font-size: 18px; color: #333; margin: 20px 0; text-align: center;">
          The frogs caught you while you were distracted!
        </p>
        <button id="retry-btn" style="
          display: block;
          width: 100%;
          margin: 20px auto 0;
          padding: 15px;
          fontSize: 18px;
          cursor: pointer;
          border: none;
          borderRadius: 8px;
          backgroundColor: #d32f2f;
          color: white;
          fontWeight: bold;
        ">Try Again</button>
      `;

      document.getElementById('retry-btn').addEventListener('click', () => {
        this.resetGame();
        overlay.remove();
      });
    }
  }

  onWin() {
    this.gameState = 'won';
    console.log('🎉 Player wins!');
    
    // Show win screen
    const overlay = document.getElementById('quiz-overlay');
    overlay.querySelector('div').innerHTML = `
      <h2 style="color: #2d5016; margin-top: 0; font-size: 36px; text-align: center;">
        🎉 YOU WIN! 🎉
      </h2>
      <p style="font-size: 20px; color: #333; margin: 20px 0; text-align: center;">
        Correct! You found the apple and answered correctly!
      </p>
      <button id="play-again-btn" style="
        display: block;
        width: 100%;
        margin: 20px auto 0;
        padding: 15px;
        fontSize: 18px;
        cursor: pointer;
        border: none;
        borderRadius: 8px;
        backgroundColor: #4CAF50;
        color: white;
        fontWeight: bold;
      ">Play Again</button>
    `;

    document.getElementById('play-again-btn').addEventListener('click', () => {
      this.resetGame();
      overlay.remove();
    });

    // Celebration effect
    if (this.apple) {
      const celebrationInterval = setInterval(() => {
        this.apple.scale.setScalar(1 + Math.random() * 0.2);
      }, 100);

      setTimeout(() => clearInterval(celebrationInterval), 2000);
    }
  }

  onPlayerCaught() {
    if (this.gameState !== 'playing') return;
    
    this.gameState = 'lost';
    console.log('💀 Player caught by frog!');
    
    // Show game over screen
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    overlay.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #d32f2f 0%, #f44336 100%);
        padding: 40px;
        borderRadius: 15px;
        maxWidth: 500px;
        boxShadow: 0 10px 40px rgba(0,0,0,0.5);
        color: white;
        textAlign: center;
      ">
        <h2 style="margin-top: 0; font-size: 36px;">
          🐸 CAUGHT! 🐸
        </h2>
        <p style="font-size: 20px; margin: 20px 0;">
          A frog caught you before you could get the apple!
        </p>
        <button id="retry-btn" style="
          display: block;
          width: 100%;
          margin: 20px auto 0;
          padding: 15px;
          fontSize: 18px;
          cursor: pointer;
          border: none;
          borderRadius: 8px;
          backgroundColor: white;
          color: #d32f2f;
          fontWeight: bold;
        ">Try Again</button>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('retry-btn').addEventListener('click', () => {
      this.resetGame();
      overlay.remove();
    });
  }

  resetGame() {
    console.log('🔄 Resetting game...');
    
    // Reset game state
    this.gameState = 'playing';
    this.quizActive = false;
    this.currentQuestion = null;

    // Remove old apple
    if (this.apple) {
      this.scene.remove(this.apple);
      this.apple = null;
    }

    // Remove old frogs
    this.frogs.forEach(frog => {
      this.scene.remove(frog);
    });
    this.frogs = [];

    // Respawn everything
    this.createApple();
    this.spawnFrogs(5);

    // Reset player position
    if (this.player) {
      this.player.position.set(0, 0.5, 0);
    }

    console.log('✅ Game reset complete!');
  }

  setupAudio(camera) {
    this.audioListener = new THREE.AudioListener();
    camera.add(this.audioListener);

    this.backgroundMusic = new THREE.Audio(this.audioListener);

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(
      'https://cdn.pixabay.com/download/audio/2022/03/10/audio_4c8e4c86ae.mp3',
      (buffer) => {
        this.backgroundMusic.setBuffer(buffer);
        this.backgroundMusic.setLoop(true);
        this.backgroundMusic.setVolume(0.3);
        this.backgroundMusic.play();
        console.log('🎵 Background music loaded');
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
    
    if (this.gameState === 'playing') {
      this.updateFrogs(delta);
      this.updateApple(delta);
    }
  }

  dispose() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic = null;
    }
    if (this.audioListener) {
      this.audioListener = null;
    }
  }
}