import * as THREE from "three"

export class Level1Hitboxes {
  constructor(scene) {
    this.scene = scene
    this.hitboxes = []
    this.init()
  }

  init() {
    this.addHitbox({
      position: { x: 3, y: 1, z: 0 },
      size: { width: 2, height: 1, depth: 2 },
    })

    // Add more hitboxes here by calling addHitbox()
    // Example:
    // this.addHitbox({
    //   position: { x: 5, y: 1, z: 5 },
    //   size: { width: 3, height: 4, depth: 3 }
    // })

    // Add hitboxes for trees and obstacles
    this.addTreeHitboxes()
    this.addRockHitboxes()
    this.addBuildingHitboxes()
  }

    addTreeHitboxes() {
    // Tree positions - adjust these based on your actual tree positions
    const treePositions = [
      { x: 10, y: 2, z: 8 },
      { x: -12, y: 2, z: 15 },
      { x: 15, y: 2, z: -10 },
      { x: -8, y: 2, z: -12 },
      { x: 20, y: 2, z: 5 },
      { x: -15, y: 2, z: -5 },
      { x: 5, y: 2, z: 18 },
      { x: -18, y: 2, z: 8 }
    ]

    treePositions.forEach(pos => {
      this.addHitbox({
        position: { x: pos.x, y: pos.y, z: pos.z },
        size: { width: 3, height: 4, depth: 3 }
      })
    })
  }

  addRockHitboxes() {
    // Rock/boulder positions
    const rockPositions = [
      { x: 7, y: 1, z: -7 },
      { x: -5, y: 1, z: 10 },
      { x: 12, y: 1, z: 12 },
      { x: -10, y: 1, z: -8 }
    ]

    rockPositions.forEach(pos => {
      this.addHitbox({
        position: { x: pos.x, y: pos.y, z: pos.z },
        size: { width: 2, height: 1.5, depth: 2 }
      })
    })
  }

  addBuildingHitboxes() {
    // Building/structural obstacle positions
    const buildingPositions = [
      { x: 25, y: 3, z: 0, size: { width: 8, height: 6, depth: 8 } },
      { x: -25, y: 3, z: 0, size: { width: 8, height: 6, depth: 8 } },
      { x: 0, y: 2, z: 25, size: { width: 6, height: 4, depth: 6 } },
      { x: 0, y: 2, z: -25, size: { width: 6, height: 4, depth: 6 } }
    ]

    buildingPositions.forEach(building => {
      this.addHitbox({
        position: { x: building.x, y: building.y, z: building.z },
        size: building.size
      })
    })
  }

  addHitbox({ position, size }) {
    // Create the collision box geometry
    const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth)

    // Create wireframe material (edges only)
    const edges = new THREE.EdgesGeometry(geometry)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 })
    const wireframe = new THREE.LineSegments(edges, lineMaterial)

    // Create invisible mesh for collision detection
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
      wireframe: false,
    })
    const mesh = new THREE.Mesh(geometry, material)

    // Position the collision box
    mesh.position.set(position.x, position.y, position.z)
    wireframe.position.set(position.x, position.y, position.z)

    // Add metadata
    mesh.userData.isCollisionBox = true
    mesh.userData.wireframe = wireframe
    mesh.name = "hitbox"

    // Add to scene
    this.scene.add(mesh)
    this.scene.add(wireframe)

    // Store reference
    this.hitboxes.push(mesh)

    return mesh
  }

  removeHitbox(hitbox) {
    const index = this.hitboxes.indexOf(hitbox)
    if (index > -1) {
      this.hitboxes.splice(index, 1)
      this.scene.remove(hitbox)
      if (hitbox.userData.wireframe) {
        this.scene.remove(hitbox.userData.wireframe)
      }
    }
  }

  toggleWireframeVisibility(visible) {
    this.hitboxes.forEach((hitbox) => {
      if (hitbox.userData.wireframe) {
        hitbox.userData.wireframe.visible = visible
      }
    })
  }

  getHitboxes() {
    return this.hitboxes
  }

  clearAll() {
    this.hitboxes.forEach((hitbox) => {
      this.scene.remove(hitbox)
      if (hitbox.userData.wireframe) {
        this.scene.remove(hitbox.userData.wireframe)
      }
    })
    this.hitboxes = []
  }
}
