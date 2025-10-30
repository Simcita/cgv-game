// Use the ES module build from a CDN
import * as THREE from 'three';
import { Environment } from './3rd level/clocktower.js';
import { PlayerController3 } from './3rd level/playerController3.js';

class Game {
  constructor() {
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

    // Initialize clock
    this.clock = new THREE.Clock();

    // Initialize environment and player controller
    this.environment = new Environment();
    this.playerController = new PlayerController3(this.environment, this.camera, this.renderer);

    // Load player model and setup animations
    this.environment
      .loadPlayerModel()
      .then((gltf) => {
        this.playerController.setupAnimations(gltf);
      })
      .catch((error) => {
        console.error('Error loading player model:', error);
      });

    // Placeholder level manager (replace with your real one)
    this.levelManager = {
      async loadLevel(levelNumber) {
        console.log(`Loading Level ${levelNumber}...`);
        // TODO: integrate with your real level loading system
      },
      getCurrentEnvironment: () => this.environment,
    };

    // Setup UI
    this.initUI();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Start animation loop
    this.animate();
  }

  initUI() {
    const uiContainer = document.createElement('div');
    uiContainer.style.position = 'absolute';
    uiContainer.style.top = '20px';
    uiContainer.style.left = '20px';
    uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    uiContainer.style.padding = '10px';
    uiContainer.style.borderRadius = '8px';
    uiContainer.style.zIndex = '10';
    uiContainer.style.color = 'white';
    uiContainer.style.fontFamily = 'sans-serif';

    const title = document.createElement('h3');
    title.textContent = 'Select Level:';
    title.style.margin = '0 0 10px 0';
    uiContainer.appendChild(title);

    // Create buttons for each level
    for (let i = 1; i <= 3; i++) {
      const button = document.createElement('button');
      button.textContent = `Level ${i}`;
      button.style.display = 'block';
      button.style.margin = '5px 0';
      button.style.padding = '10px 20px';
      button.style.cursor = 'pointer';
      button.style.border = 'none';
      button.style.borderRadius = '5px';
      button.style.backgroundColor = '#4CAF50';
      button.style.color = 'white';
      button.style.fontSize = '14px';

      button.addEventListener('click', async () => {
        try {
          await this.levelManager.loadLevel(i);
        } catch (error) {
          console.error(`Error loading level ${i}:`, error);
        }
      });

      uiContainer.appendChild(button);
    }

    // Add controls info
    const controls = document.createElement('div');
    controls.style.marginTop = '20px';
    controls.style.fontSize = '12px';
    controls.innerHTML = `
      <strong>Controls:</strong><br>
      WASD - Move<br>
      Mouse Drag - Rotate Camera<br>
      Mouse Wheel - Zoom<br>
      Space - Jump
    `;
    uiContainer.appendChild(controls);

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
      environment.update?.(delta);

      // Update player controller
      this.playerController?.update?.(delta);

      // Render scene
      this.renderer.render(environment.getScene(), this.camera);
    }
  }
}

// Start the game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
