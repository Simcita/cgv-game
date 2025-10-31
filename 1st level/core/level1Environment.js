import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { Level1Hitboxes } from "../collision/level1Hitboxes.js"
import { Level1Enemies } from "../entities/level1Enemies.js"
import { CoordinateDisplay } from "../ui/coordinateDisplay.js"
import { PauseMenu } from "../ui/pauseMenu.js"

export class Level1Environment {
  constructor() {
    this.scene = new THREE.Scene()
    this.collidables = []
    this.player = null
    this.mixer = null
    this.hitboxSystem = null
    this.enemySystem = null
    this.coordinateDisplay = null
    this.pauseMenu = null
    this.init()
  }

  init() {
    this.scene.background = new THREE.Color(0x87ceeb)

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2)
    hemiLight.position.set(0, 200, 0)
    this.scene.add(hemiLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(5, 10, 7.5)
    dirLight.castShadow = true
    this.scene.add(dirLight)

    this.hitboxSystem = new Level1Hitboxes(this.scene)
    this.collidables.push(...this.hitboxSystem.getHitboxes())
  }

  loadTerrainModel(path, scale = 1) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader()
      loader.load(
        path,
        (gltf) => {
          const terrain = gltf.scene
          terrain.position.set(0, 0, 0)
          terrain.scale.set(scale, scale, scale)
          terrain.name = "terrain"

          terrain.traverse((child) => {
            if (child.isMesh) {
              child.receiveShadow = true
              child.castShadow = true
            }
          })

          this.scene.add(terrain)
          console.log("Terrain model loaded successfully")
          resolve(terrain)
        },
        undefined,
        (error) => {
          console.error("Error loading terrain:", error)
          reject(error)
        },
      )
    })
  }

  addCollidables(collidables = []) {
    for (const c of collidables) {
      if (c && !this.collidables.includes(c)) this.collidables.push(c)
    }
  }

  loadPlayerModel() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader()
      loader.load(
        "./models/AJ.glb",
        (gltf) => {
          this.player = gltf.scene
          this.player.scale.set(1, 1, 1)
          this.player.position.set(0, 0, 0)
          this.player.name = "player"
          this.scene.add(this.player)

          this.mixer = new THREE.AnimationMixer(this.player)

          this.coordinateDisplay = new CoordinateDisplay(this.player)

          this.enemySystem = new Level1Enemies(this.scene, this.player, this.collidables)
          this.enemySystem.createBook()
          this.enemySystem.spawnFrogs(4)
          this.enemySystem.spawnCrocodiles(3)

          this.pauseMenu = new PauseMenu(this.enemySystem)

          resolve(gltf)
        },
        undefined,
        (error) => {
          reject(error)
        },
      )
    })
  }

  getCollidables() {
    return this.collidables
  }

  getScene() {
    return this.scene
  }

  getPlayer() {
    return this.player
  }

  getMixer() {
    return this.mixer
  }

  getHitboxSystem() {
    return this.hitboxSystem
  }

  getEnemySystem() {
    return this.enemySystem
  }

  getCoordinateDisplay() {
    return this.coordinateDisplay
  }

  getPauseMenu() {
    return this.pauseMenu
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta)
    }

    if (this.coordinateDisplay) {
      this.coordinateDisplay.update()
    }

    if (this.enemySystem) {
      this.enemySystem.update(delta)
    }
  }
}
