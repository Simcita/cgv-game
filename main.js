// main.js
import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { Level1Environment } from "./1st level/core/level1Environment.js"
import { PlayerController1 } from "./1st level/entities/playerController1.js"
import { Environment as Level2Environment } from "./js/environment.js"
import { PlayerController3 as PlayerController2 } from "./3rd level/playerController3.js"
import { Environment as ClocktowerEnv } from "./3rd level/clocktower.js"
import { PlayerController3 } from "./3rd level/playerController3.js"
import { createChildBedroom } from "./2nd level/usingmodels.js"
import { addMirror } from "./2nd level/mirror.js"
import { addTrain } from "./2nd level/train.js"
import { train, createWall } from "./2nd level/terrain.js"

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

    // Listen for level load events from portal
    window.addEventListener("loadLevel", (e) => {
      const levelNumber = e.detail.level
      this.loadLevel(levelNumber)
    })

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

      // Dispose of any UI elements from previous level
      if (this.currentEnvironment.getCompass) {
        const compass = this.currentEnvironment.getCompass()
        if (compass) compass.dispose()
      }
      if (this.currentEnvironment.getCoordinateDisplay) {
        const coordDisplay = this.currentEnvironment.getCoordinateDisplay()
        if (coordDisplay) coordDisplay.dispose()
      }
      if (this.currentEnvironment.getPauseMenu) {
        const pauseMenu = this.currentEnvironment.getPauseMenu()
        if (pauseMenu) pauseMenu.dispose()
      }
      if (this.currentEnvironment.getEnemySystem) {
        const enemySystem = this.currentEnvironment.getEnemySystem()
        if (enemySystem) enemySystem.dispose()
      }
    }

    // Remove old event listeners by recreating player controller
    this.currentPlayerController = null

    try {
      switch (levelNumber) {
        case 1:
          await this.loadLevel1()
          break
        case 2:
          await this.loadLevel2()
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
  }

  async loadLevel2() {
    // Bedroom Scene
    this.currentEnvironment = new Level2Environment()
    this.currentPlayerController = new PlayerController2(this.currentEnvironment, this.camera, this.renderer)

    // Load player
    const gltf = await this.currentEnvironment.loadPlayerModel()
    this.currentPlayerController.setupAnimations(gltf)

    // Load bedroom
    const { blocks } = train(this.currentEnvironment.getScene())

    // Add blocks as collidables
    const blockCollidables = []
    blocks.traverse((child) => {
      if (child.isMesh && child.visible && child.geometry) {
        blockCollidables.push(child)
      }
    })
    this.currentEnvironment.addCollidables(blockCollidables)

    const { roomGroup, collidables, roomBox } = await createChildBedroom({
      scene: this.currentEnvironment.getScene(),
      THREE: THREE,
      loader: new GLTFLoader(),
      url: "./models/Stewie.glb",
    })

    this.currentEnvironment.addCollidables(collidables)
    this.currentEnvironment.setRoomBounds(roomBox)

    const player = this.currentEnvironment.getPlayer()
    if (player) {
      // Get the room's center and adjust for room position
      const center = roomBox.getCenter(new THREE.Vector3())
      // Place player in the middle of the room, slightly above floor to prevent clipping
      player.position.set(
        center.x, // Center X (left/right)
        roomBox.min.y + 0.5, // Floor level + small offset to prevent clipping
        center.z + 15
      )
    }

    this.currentPlayerController.cameraDistance = Math.min(
      this.currentPlayerController.cameraDistance,
      Math.max(3, roomBox.getSize(new THREE.Vector3()).length() * 0.08)
    )

    // Add train
    const { trainGroup } = await addTrain({
      scene: this.currentEnvironment.getScene(),
      loader: new GLTFLoader(),
      makeCollidable: true,
    })

    // Instead of adding the whole group, add individual mesh collidables
    const trainCollidables = []
    trainGroup.traverse((child) => {
      // Only add meshes that are visible and have actual geometry
      if (child.isMesh && child.visible && child.geometry) {
        trainCollidables.push(child)
      }
    })
    this.currentEnvironment.addCollidables(trainCollidables)

    // Add mirror
    const { mirrorGroup } = await addMirror({
      scene: this.currentEnvironment.getScene(),
      loader: new GLTFLoader(),
      url: "./models/mirror_a.glb",
    })

    // Add individual mirror mesh collidables
    const mirrorCollidables = []
    mirrorGroup.traverse((child) => {
      // Only add meshes that are visible and have actual geometry
      if (child.isMesh && child.visible && child.geometry) {
        mirrorCollidables.push(child)
      }
    })
    this.currentEnvironment.addCollidables(mirrorCollidables)

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
    )
    this.currentEnvironment.getScene().add(wallNearMirror)
    this.currentEnvironment.addCollidables([wallNearMirror])

    console.log("Level 2 (Bedroom) loaded")
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
      { num: 2, name: "Bedroom" },
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
      Space - Jump<br>
      E - Enter Portal (Level 1)<br>
      ESC - Pause (Level 1)
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