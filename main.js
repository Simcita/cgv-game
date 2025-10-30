// main.js
import * as THREE from "three"
import { Level1Environment } from "./1st level/level1Environment.js"
import { PlayerController1 } from "./1st level/playerController1.js"
import { Environment as ClocktowerEnv } from "./3rd level/clocktower.js"
import { PlayerController3 } from "./3rd level/playerController3.js"

class Game {
  constructor() {
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.renderer.domElement)

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    // Initialize clock
    this.clock = new THREE.Clock()

    // Current level state
    this.currentEnvironment = null
    this.currentPlayerController = null
    this.currentLevel = null

    // Setup UI
    this.initUI()

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize())

    // Load Level 1 by default
    this.loadLevel(1)

    // Start animation loop
    this.animate()
  }

  async loadLevel(levelNumber) {
    console.log(`Loading Level ${levelNumber}...`)

    // Clean up current level
    if (this.currentEnvironment) {
      const scene = this.currentEnvironment.getScene()
      if (scene) {
        while (scene.children.length > 0) {
          scene.remove(scene.children[0])
        }
      }
    }

    // Remove old event listeners by recreating player controller
    this.currentPlayerController = null

    try {
      switch (levelNumber) {
        case 1:
          await this.loadLevel1()
          break
        case 3:
          await this.loadLevel3()
          break
        default:
          console.error(`Level ${levelNumber} not implemented yet`)
          return
      }

      this.currentLevel = levelNumber
      console.log(`Level ${levelNumber} loaded successfully!`)
    } catch (error) {
      console.error(`Error loading level ${levelNumber}:`, error)
    }
  }

  async loadLevel1() {
    this.currentEnvironment = new Level1Environment()
    this.currentPlayerController = new PlayerController1(this.currentEnvironment, this.camera, this.renderer)

    try {
      await this.currentEnvironment.loadTerrainModel("./models/level_1.glb", 0.02)
      console.log("Level 1 terrain loaded")
    } catch (error) {
      console.warn("Terrain model not found, continuing without terrain:", error)
    }

    // Load player model
    const gltf = await this.currentEnvironment.loadPlayerModel()
    this.currentPlayerController.setupAnimations(gltf)

    // Reset camera distance
    this.currentPlayerController.cameraDistance = 10

    // this.currentEnvironment.addCollisionBox(
    //   { x: 5, y: 1, z: 0 },  // position
    //   { x: 2, y: 2, z: 2 }   // size
    // )
    // this.currentEnvironment.addCollisionBox(
    //   { x: -5, y: 1, z: 5 },
    //   { x: 3, y: 2, z: 3 }
    // )

    // this.currentEnvironment.toggleCollisionBoxVisibility(true)
  }

  async loadLevel3() {
    this.currentEnvironment = new ClocktowerEnv()
    this.currentPlayerController = new PlayerController3(this.currentEnvironment, this.camera, this.renderer)

    // Load player model
    const gltf = await this.currentEnvironment.loadPlayerModel()
    this.currentPlayerController.setupAnimations(gltf)

    // Reset camera distance
    this.currentPlayerController.cameraDistance = 10
  }

  initUI() {
    const uiContainer = document.createElement("div")
    uiContainer.style.position = "absolute"
    uiContainer.style.top = "20px"
    uiContainer.style.left = "20px"
    uiContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
    uiContainer.style.padding = "10px"
    uiContainer.style.borderRadius = "8px"
    uiContainer.style.zIndex = "10"
    uiContainer.style.color = "white"
    uiContainer.style.fontFamily = "sans-serif"

    const title = document.createElement("h3")
    title.textContent = "Select Level:"
    title.style.margin = "0 0 10px 0"
    uiContainer.appendChild(title)

    const levels = [
      { num: 1, name: "Green Plane" },
      { num: 3, name: "Clock Tower" },
    ]

    levels.forEach(({ num, name }) => {
      const button = document.createElement("button")
      button.textContent = `Level ${num}: ${name}`
      button.style.display = "block"
      button.style.margin = "5px 0"
      button.style.padding = "10px 20px"
      button.style.cursor = "pointer"
      button.style.border = "none"
      button.style.borderRadius = "5px"
      button.style.backgroundColor = "#4CAF50"
      button.style.color = "white"
      button.style.fontSize = "14px"

      button.addEventListener("click", () => {
        this.loadLevel(num)
      })

      uiContainer.appendChild(button)
    })

    // Add controls info
    const controls = document.createElement("div")
    controls.style.marginTop = "20px"
    controls.style.fontSize = "12px"
    controls.innerHTML = `
      <strong>Controls:</strong><br>
      WASD - Move<br>
      Mouse Drag - Rotate Camera<br>
      Mouse Wheel - Zoom<br>
      Space - Jump
    `
    uiContainer.appendChild(controls)

    document.body.appendChild(uiContainer)
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate() {
    requestAnimationFrame(() => this.animate())

    const delta = this.clock.getDelta()

    if (this.currentEnvironment && this.currentPlayerController) {
      // Update environment
      this.currentEnvironment.update(delta)

      // Update player controller
      this.currentPlayerController.update(delta)

      // Render scene
      this.renderer.render(this.currentEnvironment.getScene(), this.camera)
    }
  }
}

// Start the game when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  new Game()
})
