// Use the ES module build from a CDN
import * as THREE from 'three';
import { Environment } from './3rd level/clocktower.js';
import { PlayerController3 } from './3rd level/playerController3.js';

// Initialize renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Initialize environment and player controller
const environment = new Environment();
const playerController = new PlayerController3(environment, camera, renderer);

// Load player model and setup animations
environment.loadPlayerModel()
  .then((gltf) => {
    playerController.setupAnimations(gltf);
  })
  .catch((error) => {
    console.error('Error loading player model:', error);
  });

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

    const title = document.createElement("h3");
    title.textContent = "Select Level:";
    title.style.color = "white";
    title.style.margin = "0 0 10px 0";
    uiContainer.appendChild(title);

    // Create buttons for each level
    for (let i = 1; i <= 3; i++) {
      const button = document.createElement("button");
      button.textContent = `Level ${i}`;
      button.style.display = "block";
      button.style.margin = "5px 0";
      button.style.padding = "10px 20px";
      button.style.cursor = "pointer";
      button.style.border = "none";
      button.style.borderRadius = "5px";
      button.style.backgroundColor = "#4CAF50";
      button.style.color = "white";
      button.style.fontSize = "14px";

      button.addEventListener("click", async () => {
        try {
          await this.levelManager.loadLevel(i);
        } catch (error) {
          console.error(`Error loading level ${i}:`, error);
        }
      });

      uiContainer.appendChild(button);
    }

    // Add controls info
    const controls = document.createElement("div");
    controls.style.color = "white";
    controls.style.marginTop = "20px";
    controls.style.fontSize = "12px";
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
      environment.update(delta);

      // Update player controller
      if (this.playerController) {
        this.playerController.update(delta);
      }

      // Render scene
      this.renderer.render(environment.getScene(), this.camera);
    }
  }
}

// Start the game when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  new Game();
});
