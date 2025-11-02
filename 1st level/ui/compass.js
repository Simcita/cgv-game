import * as THREE from "three"

export class Compass {
  constructor(player, targetObject = null) {
    this.player = player
    this.targetObject = targetObject
    this.compassElement = null
    this.needleElement = null
    this.distanceElement = null
    this.init()
  }

  init() {
    // Only create distance display (compass visual removed)
    this.distanceElement = document.createElement("div")
    this.distanceElement.id = "distance-display"
    this.distanceElement.style.cssText = `
      position: fixed;
      top: 80px;
      left: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: #ffd700;
      padding: 10px 15px;
      border-radius: 5px;
      font-family: 'Courier New', monospace;
      font-size: 16px;
      border: 2px solid #ffd700;
      z-index: 1000;
      min-width: 140px;
      text-align: center;
    `
    this.distanceElement.textContent = "No target"

    document.body.appendChild(this.distanceElement)
  }

  setTarget(targetObject) {
    this.targetObject = targetObject
  }

  update() {
    if (!this.player || !this.targetObject || !this.distanceElement) return

    const playerPos = this.player.position
    const targetPos = this.targetObject.position || this.targetObject

    // Calculate distance
    const distance = playerPos.distanceTo(targetPos)

    // Update distance display
    if (distance < 100) {
      this.distanceElement.textContent = `Target: ${distance.toFixed(1)}m`
      this.distanceElement.style.color = distance < 10 ? "#00ff00" : "#ffd700"
      this.distanceElement.style.borderColor = distance < 10 ? "#00ff00" : "#ffd700"
    } else {
      this.distanceElement.textContent = `Target: ${distance.toFixed(0)}m`
      this.distanceElement.style.color = "#ffd700"
      this.distanceElement.style.borderColor = "#ffd700"
    }

    // Add pulsing effect when very close
    if (distance < 5) {
      this.distanceElement.style.boxShadow = `0 0 ${10 + Math.sin(Date.now() * 0.01) * 5}px rgba(0, 255, 0, 0.8)`
    } else {
      this.distanceElement.style.boxShadow = "0 0 10px rgba(255, 215, 0, 0.5)"
    }
  }

  hide() {
    if (this.distanceElement) {
      this.distanceElement.style.display = "none"
    }
  }

  show() {
    if (this.distanceElement) {
      this.distanceElement.style.display = "block"
    }
  }

  dispose() {
    if (this.distanceElement && this.distanceElement.parentNode) {
      this.distanceElement.parentNode.removeChild(this.distanceElement)
    }
  }
}