import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { Level1Hitboxes } from "./level1Hitboxes.js"

export class Level1Environment {
  constructor() {
    this.scene = new THREE.Scene()
    this.collidables = []
    this.player = null
    this.mixer = null
    this.hitboxSystem = null
    this.init()
  }

  init() {
    // Sky blue background
    this.scene.background = new THREE.Color(0x87ceeb)

    // Lights
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

  addCollisionBox(position, size) {
    // Create invisible box geometry
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0, // Invisible by default
      wireframe: false,
    })
    const box = new THREE.Mesh(geometry, material)
    box.position.set(position.x, position.y, position.z)
    box.name = "collisionBox"
    box.userData.isCollisionBox = true

    this.scene.add(box)
    this.collisionBoxes.push(box)
    this.collidables.push(box)

    return box
  }

  toggleCollisionBoxVisibility(visible = true) {
    this.collisionBoxes.forEach((box) => {
      box.material.opacity = visible ? 0.3 : 0
      box.material.wireframe = visible
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

          // Animation mixer
          this.mixer = new THREE.AnimationMixer(this.player)
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

  getCollisionBoxes() {
    return this.collisionBoxes
  }

  getHitboxSystem() {
    return this.hitboxSystem
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta)
    }
  }
}
