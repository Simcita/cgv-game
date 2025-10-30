// main.js
import * as THREE from 'three';
import { LevelManager } from './js/levelManager.js';
import { PlayerController3 } from './3rd level/playerController3.js';

class Game {
  constructor() {
    console.log('🎮 Initializing game...');
    
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Initialize clock
    this.clock = new THREE.Clock();

    // Create a temporary empty environment for player controller
    const tempEnvironment = {
      getScene: () => new THREE.Scene(),
      getCollidables: () => [],
      getRoomBounds: () => null,
    };

    // Initialize player controller with temp environment
    this.playerController = new PlayerController3(tempEnvironment, this.camera, this.renderer);

    // Initialize level manager
    this.levelManager = new LevelManager(this.renderer, this.camera, this.playerController);

    // Setup UI
    this.initUI();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Auto-load Level 1 on start
    this.loadInitialLevel();

    // Start animation loop
    this.animate();
  }

  async loadInitialLevel() {
    try {
      console.log('🚀 Loading initial level...');
      await this.levelManager.loadLevel(1);
      console.log('✅ Initial level loaded successfully');
    } catch (error) {
      console.error('❌ Error loading initial level:', error);
    }
  }

  initUI() {
    const uiContainer = document.createElement('div');
    uiContainer.style.position = 'absolute';
    uiContainer.style.top = '20px';
    uiContainer.style.left = '20px';
    uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    uiContainer.style.padding = '15px';
    uiContainer.style.borderRadius = '10px';
    uiContainer.style.zIndex = '10';
    uiContainer.style.color = 'white';
    uiContainer.style.fontFamily = 'Arial, sans-serif';
    uiContainer.style.minWidth = '200px';

    const title = document.createElement('h3');
    title.textContent = '🎮 Level Select';
    title.style.margin = '0 0 15px 0';
    title.style.fontSize = '18px';
    title.style.borderBottom = '2px solid rgba(255,255,255,0.3)';
    title.style.paddingBottom = '10px';
    uiContainer.appendChild(title);

    // Current level indicator
    const levelIndicator = document.createElement('div');
    levelIndicator.id = 'level-indicator';
    levelIndicator.style.marginBottom = '15px';
    levelIndicator.style.padding = '8px';
    levelIndicator.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';
    levelIndicator.style.borderRadius = '5px';
    levelIndicator.style.fontSize = '14px';
    levelIndicator.textContent = 'Current: Level 1';
    uiContainer.appendChild(levelIndicator);

    // Create buttons for each level
    const levelInfo = {
      1: { name: '🌾 Grassland', color: '#4CAF50' },
      2: { name: '🏠 Bedroom', color: '#2196F3' },
      3: { name: '🏰 Clocktower', color: '#9C27B0' }
    };

    for (let i = 1; i <= 3; i++) {
      const button = document.createElement('button');
      button.textContent = `${levelInfo[i].name}`;
      button.style.display = 'block';
      button.style.width = '100%';
      button.style.margin = '8px 0';
      button.style.padding = '12px 20px';
      button.style.cursor = 'pointer';
      button.style.border = 'none';
      button.style.borderRadius = '5px';
      button.style.backgroundColor = levelInfo[i].color;
      button.style.color = 'white';
      button.style.fontSize = '14px';
      button.style.fontWeight = 'bold';
      button.style.transition = 'all 0.3s';
      button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      });

      button.addEventListener('click', async () => {
        button.disabled = true;
        button.style.opacity = '0.5';
        button.textContent = 'Loading...';
        
        try {
          await this.levelManager.loadLevel(i);
          levelIndicator.textContent = `Current: ${levelInfo[i].name}`;
          levelIndicator.style.backgroundColor = `${levelInfo[i].color}40`;
        } catch (error) {
          console.error(`Error loading level ${i}:`, error);
          alert(`Error loading level ${i}. Check console for details.`);
        } finally {
          button.disabled = false;
          button.style.opacity = '1';
          button.textContent = levelInfo[i].name;
        }
      });

      uiContainer.appendChild(button);
    }

    // Add controls info
    const controls = document.createElement('div');
    controls.style.marginTop = '20px';
    controls.style.fontSize = '12px';
    controls.style.lineHeight = '1.6';
    controls.style.borderTop = '1px solid rgba(255,255,255,0.2)';
    controls.style.paddingTop = '15px';
    controls.innerHTML = `
      <strong style="font-size: 14px;">⌨️ Controls:</strong><br>
      <span style="color: #FFD700;">WASD</span> - Move<br>
      <span style="color: #FFD700;">Mouse Drag</span> - Rotate Camera<br>
      <span style="color: #FFD700;">Mouse Wheel</span> - Zoom<br>
      <span style="color: #FFD700;">Space</span> - Jump
    `;
    uiContainer.appendChild(controls);

    // Add level info
    const levelInfo1 = document.createElement('div');
    levelInfo1.style.marginTop = '15px';
    levelInfo1.style.fontSize = '11px';
    levelInfo1.style.lineHeight = '1.4';
    levelInfo1.style.padding = '10px';
    levelInfo1.style.backgroundColor = 'rgba(255,255,255,0.1)';
    levelInfo1.style.borderRadius = '5px';
    levelInfo1.innerHTML = `
      <strong>🐸 Level 1 Features:</strong><br>
      • Frogs follow you!<br>
      • Collide with rocks<br>
      • Peaceful music
    `;
    uiContainer.appendChild(levelInfo1);

    document.body.appendChild(uiContainer);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const environment = this.levelManager.getCurrentEnvironment();

    if (environment) {
      // Update environment
      if (environment.update) {
        environment.update(delta);
      }

      // Update player controller
      if (this.playerController && this.playerController.update) {
        this.playerController.update(delta);
      }

      // Render scene
      const scene = environment.getScene();
      if (scene) {
        this.renderer.render(scene, this.camera);
      }
    }
  }
}

// Start the game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  console.log('🌟 Starting game...');
  new Game();
});