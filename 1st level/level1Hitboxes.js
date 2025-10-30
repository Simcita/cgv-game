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
