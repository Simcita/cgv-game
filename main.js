// main.js
import * as THREE from 'three';
import { Level1Environment } from "./1st level/core/level1Environment.js"
import { PlayerController1 } from "./1st level/entities/playerController1.js"
import { Environment as ClocktowerEnv } from './3rd level/clocktower.js';
import { PlayerController3 } from './3rd level/playerController3.js';
import { Environment } from './js/environment.js';
import { Level2PlayerController } from './2nd level/Level2PlayerController.js';
import { createPauseMenu } from './2nd level/pauseMenu.js';
import { createChildBedroom } from './2nd level/usingmodels.js';
import { addTrain } from './2nd level/train.js';
import { train, createWall } from './2nd level/terrain.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createReflectorMirror } from './2nd level/reflectorMirror.js';
import { createAdventureTimer } from './2nd level/Level2Timer.js';
import { createKey, setupKeyInteraction } from './2nd level/key.js';
import { MKChaser } from './2nd level/mkChaser.js';
import { createLevel2Quizzes } from './2nd level/quiz.js';
import { createPortal } from './2nd level/portal.js';

class Game {
  constructor() {
    this.currentPlayerController = null;
    this.isPaused = false;
    this.pauseMenu = null;
    this.level2Portal = null;
    this.level2BgAudio = null;
    this.level2LoseAudio = null;
    this.adventureTimer = null;
    this.level2QuizCompleted = 0;
    this.level2QuizTotal = 2;
    this.level2Quizzes = null;
    this.mkChaser = null;
    this.level2Blocks = null;
    this.keyInteraction = null;
    this.init();
    this.animate();
  }

  init() {
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Clock for delta time
    this.clock = new THREE.Clock();

    // Current level state
    this.currentEnvironment = null;
    this.currentLevel = null;

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Listen for level load events from portals
    window.addEventListener("loadLevel", (e) => {
      const levelNumber = e.detail.level;
      this.loadLevel(levelNumber);
    });

    // Load Level 1 by default
    this.loadLevel(1);
  }

  async loadLevel(levelNumber) {
    console.log(`Loading Level ${levelNumber}...`);

    // Stop Level 1 background music if leaving Level 1
    if (this.currentLevel === 1 && this.currentEnvironment) {
      try {
        if (this.currentEnvironment.stopBackgroundMusic) {
          this.currentEnvironment.stopBackgroundMusic();
        }
      } catch (_) {}
    }

    // Stop Level 2 background music if leaving Level 2
    if (this.currentLevel === 2 && this.level2BgAudio) {
      try {
        this.level2BgAudio.pause();
        this.level2BgAudio.currentTime = 0;
      } catch (_) {}
    }

    // Clean up current level
    if (this.currentEnvironment) {
      const scene = this.currentEnvironment.getScene();
      if (scene) {
        while (scene.children.length > 0) {
          scene.remove(scene.children[0]);
        }
      }

      // Dispose of any UI elements from previous level
      if (this.currentEnvironment.getCompass) {
        const compass = this.currentEnvironment.getCompass();
        if (compass) compass.dispose();
      }
      if (this.currentEnvironment.getCoordinateDisplay) {
        const coordDisplay = this.currentEnvironment.getCoordinateDisplay();
        if (coordDisplay) coordDisplay.dispose();
      }
      if (this.currentEnvironment.getPauseMenu) {
        const pauseMenu = this.currentEnvironment.getPauseMenu();
        if (pauseMenu) pauseMenu.dispose();
      }
      if (this.currentEnvironment.getEnemySystem) {
        const enemySystem = this.currentEnvironment.getEnemySystem();
        if (enemySystem) enemySystem.dispose();
      }
    }

    // Clean up Level 2 specific resources
    if (this.currentLevel === 2) {
      if (this.adventureTimer) {
        this.adventureTimer.stop();
        this.adventureTimer.hide();
      }
      if (this.level2Quizzes) {
        try {
          this.level2Quizzes.destroy();
        } catch (_) {}
      }
      if (this.mkChaser) {
        try {
          this.mkChaser.dispose();
        } catch (_) {}
      }
      if (this.level2Portal) {
        try {
          this.level2Portal.dispose();
        } catch (_) {}
      }
      this.level2Portal = null;
      this.level2Blocks = null;
      this.keyInteraction = null;
      this.checkPortalInteraction = null;
    }

    // Reset pause state
    this.isPaused = false;
    this.clock.start();

    // Remove old event listeners by recreating player controller
    this.currentPlayerController = null;

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
          console.error(`Level ${levelNumber} not implemented`);
          return;
      }

      this.currentLevel = levelNumber;
      console.log(`Level ${levelNumber} loaded successfully!`);
    } catch (error) {
      console.error(`Error loading level ${levelNumber}:`, error);
    }
  }

  async loadLevel1() {
    // Garden/Green Plane Scene
    this.currentEnvironment = new Level1Environment();
    this.currentPlayerController = new PlayerController1(
      this.currentEnvironment, 
      this.camera, 
      this.renderer
    );

    try {
      await this.currentEnvironment.loadTerrainModel("./models/level_1.glb", 0.02);
      console.log("Level 1 terrain loaded");
    } catch (error) {
      console.warn("Terrain model not found, continuing without terrain:", error);
    }

    // Load background music
    try {
      await this.currentEnvironment.loadBackgroundMusic('../1st level/sounds/nature.wav')
      this.currentEnvironment.playBackgroundMusic()
    } catch (error) {
      console.warn("Background music not found, continuing without music:", error)
    }


    // Load player model
    const gltf = await this.currentEnvironment.loadPlayerModel();
    this.currentPlayerController.setupAnimations(gltf);

    // Reset camera distance
    this.currentPlayerController.cameraDistance = 10;

    console.log("Level 1 (Garden) loaded");
  }

  async loadLevel3() {
    // Clocktower Scene
    this.currentEnvironment = new ClocktowerEnv();
    this.currentPlayerController = new PlayerController3(
      this.currentEnvironment, 
      this.camera, 
      this.renderer
    );

    // Load player model
    const gltf = await this.currentEnvironment.loadPlayerModel();
    this.currentPlayerController.setupAnimations(gltf);

    // Reset camera distance
    this.currentPlayerController.cameraDistance = 10;

    // Load soundtrack for level 3
    if (this.currentEnvironment.loadSoundtrack) {
      try {
        await this.currentEnvironment.loadSoundtrack('./3rd level/public/clocktower_soundtrack.mp3');
        this.currentEnvironment.playSoundtrack();
      } catch (error) {
        console.error('Failed to load soundtrack:', error);
      }
    }

    console.log("Level 3 (Clocktower) loaded");
  }

  async loadLevel2() {
    // Bedroom Scene
    this.currentEnvironment = new Environment();
    this.currentPlayerController = new Level2PlayerController(
      this.currentEnvironment,
      this.camera,
      this.renderer
    );

    // Initialize pause menu for Level 2
    if (!this.pauseMenu) {
      this.pauseMenu = createPauseMenu({
        isEnabled: () => this.currentLevel === 2
      });
      
      this.pauseMenu.onPause(() => {
        this.isPaused = true;
        this.clock.stop();
      });
      
      this.pauseMenu.onResume(() => {
        this.isPaused = false;
        this.clock.start();
        this.clock.getDelta();
      });
    }

    // Level 2 Audio
    try {
      if (!this.level2BgAudio) {
        this.level2BgAudio = new Audio('./2nd level/sounds/epic-adventure-background-music-404457.mp3');
        this.level2BgAudio.loop = true;
        this.level2BgAudio.volume = 0.5;
        if (!this.level2BgAudio._loopHandlerSet) {
          this.level2BgAudio.addEventListener("ended", () => {
            try {
              this.level2BgAudio.currentTime = 0;
              this.level2BgAudio.play().catch(() => {});
            } catch (_) {}
          });
          this.level2BgAudio._loopHandlerSet = true;
        }
      }
      try {
        this.level2BgAudio.currentTime = 0;
      } catch (_) {}
      this.level2BgAudio.play().catch(() => {});

      if (!this.level2LoseAudio) {
        this.level2LoseAudio = new Audio('./2nd level/sounds/You-lose-notification-in-cartoon-or-game-sound-effect.mp3');
        this.level2LoseAudio.loop = false;
        this.level2LoseAudio.volume = 0.8;
      }
    } catch (e) {
      console.warn("Audio init failed:", e);
    }

    // Load player model
    const gltf = await this.currentEnvironment.loadPlayerModel();
    this.currentPlayerController.setupAnimations(gltf);

    // Load the main bedroom
    const { roomGroup, collidables, roomBox } = await createChildBedroom({
      scene: this.currentEnvironment.getScene(),
      THREE: THREE,
      loader: new GLTFLoader(),
      url: "./models/Stewie.glb",
    });

    this.currentEnvironment.addCollidables(collidables);
    this.currentEnvironment.setRoomBounds(roomBox);

    // Position player
    const player = this.currentEnvironment.getPlayer();
    if (player) {
      const roomCenter = new THREE.Vector3();
      roomBox.getCenter(roomCenter);
      player.position.set(
        roomCenter.x - 5,
        roomBox.min.y + 1.0,
        roomCenter.z + 25
      );
    }

    // Load terrain and blocks
    const terrainData = train(
      this.currentEnvironment.getScene(),
      this.camera,
      this.currentEnvironment.getPlayer(),
      this.renderer
    );

    this.level2Blocks = terrainData.blocks;

    if (this.level2Blocks && Array.isArray(this.level2Blocks)) {
      this.level2Blocks.forEach((block) => {
        if (!block.userData) block.userData = {};
        block.userData.isBlock = true;
        block.userData.isMovingToyBlock = true;
        block.userData.collidable = true;
      });

      const currentCollidables = this.currentEnvironment.getCollidables();
      const nonBlockCollidables = currentCollidables.filter(
        (obj) => !obj.userData?.isBlock
      );
      this.currentEnvironment.collidables = nonBlockCollidables;
      this.currentEnvironment.addCollidables(this.level2Blocks);
    }

    if (terrainData.wall) {
      if (!terrainData.wall.userData) terrainData.wall.userData = {};
      terrainData.wall.userData.isWall = true;
      terrainData.wall.userData.collidable = true;
      this.currentEnvironment.addCollidables([terrainData.wall]);
    }

    if (terrainData.update) {
      this.currentEnvironment.updateBlocks = terrainData.update;
    }

    // Set camera distance
    this.currentPlayerController.cameraDistance = Math.min(
      this.currentPlayerController.cameraDistance,
      Math.max(3, roomBox.getSize(new THREE.Vector3()).length() * 0.08)
    );

    // Add train
    try {
      const { trainGroup, collidables: trainCollidables } = await addTrain({
        scene: this.currentEnvironment.getScene(),
        loader: new GLTFLoader(),
        makeCollidable: true,
      });

      if (trainCollidables && trainCollidables.length > 0) {
        this.currentEnvironment.addCollidables(trainCollidables);
      } else {
        const fallbackTrainCollidables = [];
        trainGroup.traverse((child) => {
          if (child.isMesh && child.visible && child.geometry) {
            if (!child.userData) child.userData = {};
            child.userData.isTrain = true;
            child.userData.collidable = true;
            fallbackTrainCollidables.push(child);
          }
        });
        this.currentEnvironment.addCollidables(fallbackTrainCollidables);
      }
    } catch (error) {
      console.warn("Failed to load train:", error);
    }

    // Add reflective mirror
    try {
      createReflectorMirror({
        scene: this.currentEnvironment.getScene(),
        width: 3,
        height: 8,
        position: { x: 20, y: 5, z: 6.2 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        textureWidth: 512,
        textureHeight: 512,
        color: 0xcccccc,
        addFrame: true,
        frameThickness: 0.3,
        frameColor: 0x8b4513,
      });
    } catch (error) {
      console.warn("Failed to create reflector mirror:", error);
    }

    // Initialize Level 2 Quizzes
    try {
      this.level2QuizCompleted = 0;
      this.level2Quizzes = createLevel2Quizzes({
        scene: this.currentEnvironment.getScene(),
        player: this.currentEnvironment.getPlayer(),
        camera: this.camera,
        onAttempt: (quizIndex) => {
          if (this.adventureTimer && this.adventureTimer.setQuizProgress) {
            this.adventureTimer.setQuizProgress(
              quizIndex + 1,
              this.level2QuizTotal
            );
          }
        },
        onComplete: (quizIndex) => {
          this.level2QuizCompleted += 1;
          if (this.level2QuizCompleted >= this.level2QuizTotal) {
            // Spawn portal after completing quizzes
            try {
              this.level2Portal = createPortal({
                scene: this.currentEnvironment.getScene(),
                position: { x: 8, y: 4, z: -8 },
              });
              if (this.level2Portal && this.level2Portal.setRotation) {
                this.level2Portal.setRotation(0, Math.PI / 2, 0);
              }
              if (this.level2Portal && this.level2Portal.collider) {
                this.currentEnvironment.addCollidables([
                  this.level2Portal.collider,
                ]);
              }
              
              // Add portal interaction - check for player near portal
              this.setupPortalInteraction();
              
              console.log("Level 2 portal created. Use E to enter.");
            } catch (e) {
              console.warn("Failed to create portal:", e);
            }
          }
        },
      });

      // Define quiz zones
      this.level2Quizzes.addZone({
        id: "quiz-mirror",
        position: { x: 20, y: 0, z: 6.2 },
        radius: 3.5,
        quizIndex: 0,
      });

      this.level2Quizzes.addZone({
        id: "quiz-train",
        position: { x: 30, y: 0, z: 0 },
        radius: 5.5,
        quizIndex: 1,
      });

      window.LEVEL2_DISABLE_BLOCK_PUSH = true;
    } catch (e) {
      console.warn("Failed to initialize Level 2 quizzes:", e);
    }

    // Add MK enemy chaser
    try {
      this.mkChaser = new MKChaser(
        this.currentEnvironment.getScene(),
        this.currentEnvironment.getPlayer(),
        this.currentEnvironment.getRoomBounds(),
        this.currentEnvironment
      );

      if (this.mkChaser.model) {
        this.mkChaser.model.traverse((child) => {
          if (child.isMesh) {
            if (!child.userData) child.userData = {};
            child.userData.isEnemy = true;
            child.userData.collidable = true;
          }
        });
      }
    } catch (err) {
      console.error("Failed to initialize MK chaser:", err);
    }

    // Create and start timer
    if (!this.adventureTimer) {
      this.adventureTimer = createAdventureTimer();
    }
    this.adventureTimer.reset();
    this.adventureTimer.show();
    if (this.adventureTimer.setCountdown) {
      this.adventureTimer.setCountdown(300); // 5 minutes
    }
    if (this.adventureTimer.onExpire) {
      this.adventureTimer.onExpire(() => this.handleLevel2Timeout());
    }
    this.adventureTimer.start();
    if (this.adventureTimer.setQuizProgress) {
      this.adventureTimer.setQuizProgress(0, this.level2QuizTotal);
    }

    console.log("Level 2 (Bedroom) loaded");
  }

  setupPortalInteraction() {
    // Check for portal collision and trigger level transition
    let portalKeyHandler = null;
    const checkPortal = () => {
      if (!this.level2Portal || !this.level2Portal.group) return;
      if (!this.currentEnvironment || !this.currentEnvironment.getPlayer()) return;
      
      const player = this.currentEnvironment.getPlayer();
      const portalPos = this.level2Portal.group.position;
      const distance = player.position.distanceTo(portalPos);
      
      if (distance < 3) {
        // Show interaction prompt
        let prompt = document.getElementById('level2-portal-prompt');
        if (!prompt) {
          prompt = document.createElement('div');
          prompt.id = 'level2-portal-prompt';
          prompt.textContent = 'Press E to enter portal';
          prompt.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(255,255,255,0.9); padding: 15px 25px; border-radius: 10px;
            font-family: Arial, sans-serif; font-size: 18px; z-index: 2000;
            color: #0066cc; border: 2px solid #66b3ff;
          `;
          document.body.appendChild(prompt);
        }
        
        // Set up key handler only once
        if (!portalKeyHandler) {
          portalKeyHandler = (e) => {
            if (e.key.toLowerCase() === 'e') {
              window.dispatchEvent(new CustomEvent("loadLevel", { detail: { level: 3 } }));
              document.removeEventListener('keydown', portalKeyHandler);
              portalKeyHandler = null;
              const prompt = document.getElementById('level2-portal-prompt');
              if (prompt) prompt.remove();
            }
          };
          document.addEventListener('keydown', portalKeyHandler);
        }
      } else {
        const prompt = document.getElementById('level2-portal-prompt');
        if (prompt) prompt.remove();
        if (portalKeyHandler) {
          document.removeEventListener('keydown', portalKeyHandler);
          portalKeyHandler = null;
        }
      }
    };
    
    // Check portal interaction in animation loop
    this.checkPortalInteraction = checkPortal;
  }

  handleLevel2Timeout() {
    try {
      // Stop background music and play lose SFX
      if (this.level2BgAudio) {
        try {
          this.level2BgAudio.pause();
        } catch (_) {}
      }
      if (this.level2LoseAudio) {
        try {
          this.level2LoseAudio.currentTime = 0;
          this.level2LoseAudio.play().catch(() => {});
        } catch (_) {}
      }

      // Pause game
      this.isPaused = true;
      if (this.pauseMenu) {
        this.pauseMenu.show();
      }

      // Show lose overlay
      const overlay = document.createElement("div");
      overlay.id = "level2-lose-overlay";
      overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.8);
        display: flex; align-items: center; justify-content: center; z-index: 3000;
      `;
      const box = document.createElement("div");
      box.style.cssText = `
        background: white; padding: 24px 32px; border-radius: 12px;
        font-family: Arial, sans-serif; color: #c62828; font-size: 24px;
        text-align: center;
      `;
      box.innerHTML = `
        <h2>You lose! Time ran out.</h2>
        <p>Restarting level...</p>
      `;
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      // Stop and hide timer
      if (this.adventureTimer) {
        this.adventureTimer.stop();
        this.adventureTimer.hide();
      }

      // Reload Level 2 after delay
      setTimeout(() => {
        try {
          document.body.removeChild(overlay);
        } catch (_) {}
        this.isPaused = false;
        if (this.pauseMenu) {
          this.pauseMenu.hide();
        }
        this.loadLevel(2);
      }, 2000);
    } catch (e) {
      console.warn("Failed to handle timeout:", e);
      this.loadLevel(2);
    }
  }

  setupUI() {
    // Removed level jump buttons as requested
    // Controls are displayed in each level's pause menu
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const quizActive = !!window.LEVEL2_QUIZ_ACTIVE;
    const delta = (this.isPaused || quizActive) ? 0 : this.clock.getDelta();

    if (this.currentEnvironment && this.currentPlayerController) {
      // Update Level 2 specific systems
      if (this.currentLevel === 2) {
        // Update blocks
        if (this.currentEnvironment.updateBlocks) {
          this.currentEnvironment.updateBlocks(delta, this.clock.getElapsedTime());
        }

        // Update MK chaser
        if (this.mkChaser) {
          this.mkChaser.update(delta);
          
          // Check for player caught by MK
          const mkPos = this.mkChaser.model?.position;
          const playerPos = this.currentEnvironment.getPlayer()?.position;
          if (mkPos && playerPos) {
            const distance = mkPos.distanceTo(playerPos);
            if (distance < 1.5 && !this.isPaused) {
              // Player caught - pause and restart
              this.isPaused = true;
              if (this.pauseMenu) {
                this.pauseMenu.show();
              }
              
              if (this.level2LoseAudio) {
                try {
                  this.level2LoseAudio.currentTime = 0;
                  this.level2LoseAudio.play().catch(() => {});
                } catch (_) {}
              }

              const overlay = document.createElement("div");
              overlay.id = "level2-lose-overlay";
              overlay.style.cssText = `
                position: fixed; inset: 0; background: rgba(0,0,0,0.8);
                display: flex; align-items: center; justify-content: center; z-index: 3000;
              `;
              const box = document.createElement("div");
              box.style.cssText = `
                background: white; padding: 24px 32px; border-radius: 12px;
                font-family: Arial, sans-serif; color: #c62828; font-size: 24px;
                text-align: center;
              `;
              box.innerHTML = `
                <h2>You were caught!</h2>
                <p>Restarting level...</p>
              `;
              overlay.appendChild(box);
              document.body.appendChild(overlay);

              setTimeout(() => {
                try {
                  document.body.removeChild(overlay);
                } catch (_) {}
                this.isPaused = false;
                if (this.pauseMenu) {
                  this.pauseMenu.hide();
                }
                this.loadLevel(2);
              }, 2000);
            }
          }
        }

        // Update quizzes
        if (this.level2Quizzes && this.level2Quizzes.update) {
          this.level2Quizzes.update(delta);
        }

        // Update portal animation
        if (this.level2Portal && this.level2Portal.update) {
          this.level2Portal.update(delta);
        }

        // Check portal interaction
        if (this.checkPortalInteraction) {
          this.checkPortalInteraction();
        }

        // Update key interaction
        if (this.keyInteraction && this.keyInteraction.update) {
          this.keyInteraction.update();
        }
      }

      // Update environment (only if not paused and no quiz active)
      if (!this.isPaused && !quizActive) {
        this.currentEnvironment.update(delta);
      }

      // Update player controller (uses delta=0 when paused)
      this.currentPlayerController.update(delta, this.clock.getElapsedTime());

      // Render scene (always render, even when paused)
      this.renderer.render(this.currentEnvironment.getScene(), this.camera);
    }
  }
}

// Start the game when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  new Game();
});