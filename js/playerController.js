// playercontroller.js
import * as THREE from 'three';

export class PlayerController {
  constructor(environment, camera, renderer) {
    this.environment = environment;
    this.camera = camera;
    this.renderer = renderer;

    this.actions = {};
    this.baseActionName = 'idle';
    this.lastBaseActionName = null;
    this.overlayPlaying = null;

    this.onGround = true;
    this.velocityY = 0;
    this.keys = {};
    this.cameraAngleX = 0;
    this.cameraAngleY = 0.5;

    this.cameraDistance = 6; // third-person default
    this.firstPerson = false; // toggle mode
    this.pointerLocked = false;

    this.jumpCooldown = false;
    this.lastSpaceTime = 0;
    this.DOUBLE_TAP_MS = 300;

    this.PLAYER_HALF_WIDTH = 0.5;
    this.PLAYER_HEIGHT = 2.0;

    this.mixer = null; // will be set when animations are initialized

    this.init();
  }

  init() {
    this.setupInputHandlers();
    this.enablePointerLock();
  }

  enablePointerLock() {
    const canvas = this.renderer.domElement;

    canvas.addEventListener('click', () => {
      // request pointer lock on click (user gesture)
      if (canvas.requestPointerLock) canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === canvas;
    });

    // optional: handle pointer lock errors
    document.addEventListener('pointerlockerror', () => {
      this.pointerLocked = false;
    });
  }

  setupAnimations(gltf) {
    // store mixer for later use
    this.mixer = this.environment.getMixer();

    gltf.animations.forEach((clip) => {
      const name = clip.name.toLowerCase();
      const action = this.mixer.clipAction(clip);
      this.actions[name] = action;

      // keep looping for idle / running, play-once for overlays
      if (name === 'idle' || name === 'running') {
        action.setLoop(THREE.LoopRepeat);
      } else {
        action.setLoop(THREE.LoopOnce, 0);
        action.clampWhenFinished = true;
      }

      action.enabled = true;
      action.setEffectiveWeight(0);
      action.play();
    });

    // Ensure we start on idle
    this.playBaseAction('idle');

    // Listen to finished events for overlay actions
    if (this.mixer) {
      this.mixer.addEventListener('finished', (e) => {
        const finishedName = this.getActionNameFromAction(e.action);
        if (!finishedName) return;

        if (finishedName === 'landing' || finishedName === 'jumping') {
          this.overlayPlaying = null;
          // revert to an appropriate base action
          this.playBaseAction(this.determineBaseAction());
        }
      });
    }
  }

  getActionNameFromAction(action) {
    for (const n in this.actions) {
      if (this.actions[n] === action) return n;
    }
    return null;
  }

  playBaseAction(name) {
    if (!this.actions[name]) return;
    // If already the active base action, nothing to do
    if (this.baseActionName === name) {
      this.actions[name].setEffectiveWeight(1.0);
      return;
    }

    this.lastBaseActionName = this.baseActionName;
    this.baseActionName = name;

    // Fade out the previous base action if present and fade in the new one
    if (this.lastBaseActionName && this.actions[this.lastBaseActionName]) {
      const prev = this.actions[this.lastBaseActionName];
      prev.fadeOut(0.25);
    }

    const curr = this.actions[name];
    curr.reset();
    curr.setEffectiveTimeScale(1);
    curr.setEffectiveWeight(1.0);
    curr.fadeIn(0.25);
    curr.play();
  }

  playOverlayAction(name, { fadeIn = 0.12, fadeOut = 0.12, stopAfter = null } = {}) {
    if (!this.actions[name]) return;

    // fade out currently playing overlay if different
    if (this.overlayPlaying && this.overlayPlaying !== name && this.actions[this.overlayPlaying]) {
      this.actions[this.overlayPlaying].fadeOut(fadeOut);
    }

    this.overlayPlaying = name;
    const a = this.actions[name];
    a.reset();
    a.setLoop(THREE.LoopOnce, 0);
    a.clampWhenFinished = true;
    a.enabled = true;
    // ensure weight/timeScale
    a.setEffectiveWeight(1.0);
    a.setEffectiveTimeScale(1.0);
    a.fadeIn(fadeIn);
    a.play();

    if (stopAfter) {
      setTimeout(() => {
        // only stop if still the same overlay (prevents race conditions)
        if (this.overlayPlaying === name) {
          if (a) a.fadeOut(fadeOut);
          this.overlayPlaying = null;
          this.playBaseAction(this.determineBaseAction());
        }
      }, stopAfter * 1000);
    }
  }

  determineBaseAction() {
    if (!this.onGround) return 'jumping';
    // could decide running / idle elsewhere; keep current base action
    return this.baseActionName || 'idle';
  }

  setupInputHandlers() {
    document.addEventListener('keydown', (e) => {
      if (e.code) this.keys[e.code] = true;

      if (e.code === 'Space') {
        this.handleSpacePress();
        e.preventDefault();
      }

      if (e.code === 'KeyC') {
        this.firstPerson = !this.firstPerson;
        this.cameraDistance = this.firstPerson ? 0.1 : 6;

        const player = this.environment.getPlayer();
        if (player) {
          player.visible = !this.firstPerson; // hide mesh in first-person
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.code) this.keys[e.code] = false;
    });

    // free-look mouse movement (only when pointer locked)
    document.addEventListener('mousemove', (e) => {
      if (this.pointerLocked) {
        const dx = e.movementX || 0;
        const dy = e.movementY || 0;
        this.cameraAngleX -= dx * 0.0025;
        this.cameraAngleY -= dy * 0.0025;
        this.cameraAngleY = Math.max(0.1, Math.min(Math.PI / 2 - 0.01, this.cameraAngleY));
      }
    });

    document.addEventListener('wheel', (e) => {
      if (!this.firstPerson) {
        this.cameraDistance += e.deltaY * 0.01;
        this.cameraDistance = Math.max(3, Math.min(20, this.cameraDistance));
      }
    });
  }

  handleSpacePress() {
    this.triggerJump();
  }

  triggerJump() {
    const player = this.environment.getPlayer();
    if (!player || !this.onGround || this.jumpCooldown) return;

    const collidables = this.environment.getCollidables();
    const playerTopY = player.position.y + this.PLAYER_HEIGHT;
    const CEILING_BUFFER = this.PLAYER_HEIGHT / 2;

    for (const obj of collidables) {
      const box = new THREE.Box3().setFromObject(obj);
      const intersectsX =
        player.position.x + this.PLAYER_HALF_WIDTH > box.min.x &&
        player.position.x - this.PLAYER_HALF_WIDTH < box.max.x;
      const intersectsZ =
        player.position.z + this.PLAYER_HALF_WIDTH > box.min.z &&
        player.position.z - this.PLAYER_HALF_WIDTH < box.max.z;

      const objectBottom = box.min.y;
      if (
        intersectsX &&
        intersectsZ &&
        objectBottom < playerTopY + CEILING_BUFFER &&
        objectBottom > player.position.y
      ) {
        // there is not enough headroom to jump
        return;
      }
    }

    this.velocityY = 8;
    this.onGround = false;
    this.playOverlayAction('jumping', { fadeIn: 0.08, fadeOut: 0.12, stopAfter: 1.0 });

    this.jumpCooldown = true;
    setTimeout(() => (this.jumpCooldown = false), 200);
  }

  update(delta) {
    // advance mixer if present
    if (this.mixer) this.mixer.update(delta);
    this.updatePlayer(delta);
    this.updateCamera();
  }

  updatePlayer(delta) {
    const player = this.environment.getPlayer();
    if (!player) return;

    const speed = 5;
    const move = new THREE.Vector3();

    if (this.keys['KeyW']) move.z -= 1;
    if (this.keys['KeyS']) move.z += 1;
    if (this.keys['KeyA']) move.x -= 1;
    if (this.keys['KeyD']) move.x += 1;

    const isMoving = move.lengthSq() > 0;
    let movement = new THREE.Vector3();

    if (isMoving) {
      move.normalize();

      // Calculate forward and right vectors based on camera orientation
      const forward = new THREE.Vector3(
        Math.sin(this.cameraAngleX),
        0,
        Math.cos(this.cameraAngleX)
      );
      const right = new THREE.Vector3(forward.z, 0, -forward.x);

      // Different movement handling for first-person vs third-person
      if (this.firstPerson) {
        movement.addScaledVector(forward, -move.z);
        movement.addScaledVector(right, -move.x);
      } else {
        movement.addScaledVector(forward, move.z);
        movement.addScaledVector(right, move.x);
      }

      // apply speed and delta
      movement.setY(0);
      movement.normalize().multiplyScalar(speed * delta);

      // Lateral collision resolution (AABB, axis-separated)
      const collidables = this.environment.getCollidables();

      const playerBoxAt = (pos) => new THREE.Box3(
        new THREE.Vector3(
          pos.x - this.PLAYER_HALF_WIDTH,
          pos.y,
          pos.z - this.PLAYER_HALF_WIDTH
        ),
        new THREE.Vector3(
          pos.x + this.PLAYER_HALF_WIDTH,
          pos.y + this.PLAYER_HEIGHT,
          pos.z + this.PLAYER_HALF_WIDTH
        )
      );

      // Try X move
      if (movement.x !== 0) {
        const testPosX = new THREE.Vector3(player.position.x + movement.x, player.position.y, player.position.z);
        const testBoxX = playerBoxAt(testPosX);
        let hitX = false;
        for (const obj of collidables) {
          const box = new THREE.Box3().setFromObject(obj);
          if (testBoxX.intersectsBox(box)) { hitX = true; break; }
        }
        if (!hitX) {
          player.position.x += movement.x;
        }
      }

      // Try Z move
      if (movement.z !== 0) {
        const testPosZ = new THREE.Vector3(player.position.x, player.position.y, player.position.z + movement.z);
        const testBoxZ = playerBoxAt(testPosZ);
        let hitZ = false;
        for (const obj of collidables) {
          const box = new THREE.Box3().setFromObject(obj);
          if (testBoxZ.intersectsBox(box)) { hitZ = true; break; }
        }
        if (!hitZ) {
          player.position.z += movement.z;
        }
      }
    }

    // Ground detection: only consider surfaces below feet
    const collidables = this.environment.getCollidables();
    const PAD = 0.5;
    let groundY = -Infinity;
    const feetY = player.position.y; // bottom of capsule
    for (const obj of collidables) {
      const box = new THREE.Box3().setFromObject(obj);
      const withinXZ =
        player.position.x > box.min.x - PAD &&
        player.position.x < box.max.x + PAD &&
        player.position.z > box.min.z - PAD &&
        player.position.z < box.max.z + PAD;
      if (!withinXZ) continue;
      // Only treat as ground if the top of the object is at or below feet
      if (box.max.y <= feetY + 0.001) {
        groundY = Math.max(groundY, box.max.y);
      }
    }
    if (groundY === -Infinity) groundY = 0;

    // Room bounds collision
    const roomBox = this.environment.getRoomBounds();
    if (roomBox) {
      const margin = this.PLAYER_HALF_WIDTH + 0.05;
      player.position.x = Math.max(roomBox.min.x + margin, Math.min(roomBox.max.x - margin, player.position.x));
      player.position.z = Math.max(roomBox.min.z + margin, Math.min(roomBox.max.z - margin, player.position.z));
    }

    // Remove step-up snapping: we want to bump into objects, not climb them

    // Apply gravity
    this.velocityY -= 20 * delta;
    player.position.y += this.velocityY * delta;

    // Ground collision
    if (player.position.y <= groundY + 0.001) {
      if (!this.onGround) {
        this.playOverlayAction('landing', { fadeIn: 0.06, fadeOut: 0.12, stopAfter: 0.5 });
      }
      player.position.y = groundY;
      this.velocityY = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // Update animations
    if (this.onGround) {
      if (isMoving) this.playBaseAction('running');
      else this.playBaseAction('idle');
    }

    // Update player rotation to face movement direction (use actual movement vector)
    if (isMoving && movement.lengthSq() > 0) {
      const dir = new THREE.Vector3(movement.x, 0, movement.z).normalize();
      // atan2 expects (x,z) to compute rotation around Y
      player.rotation.y = Math.atan2(dir.x, dir.z);
    }
  }

  updateCamera() {
    const player = this.environment.getPlayer();
    if (!player) return;

    if (this.firstPerson) {
      const eyeHeight = 1.6;

      // Calculate forward direction
      const forward = new THREE.Vector3(
        Math.sin(this.cameraAngleX),
        0,
        Math.cos(this.cameraAngleX)
      );

      // Position camera at eye level
      const eyePos = new THREE.Vector3(
        player.position.x,
        player.position.y + eyeHeight,
        player.position.z
      );

      // Look slightly forward from camera position
      const lookAt = new THREE.Vector3(
        player.position.x + forward.x,
        player.position.y + eyeHeight,
        player.position.z + forward.z
      );

      this.camera.position.copy(eyePos);
      this.camera.lookAt(lookAt);
    } else {
      // Third-person orbit camera
      const offsetX = Math.sin(this.cameraAngleX) * this.cameraDistance * Math.cos(this.cameraAngleY);
      const offsetY = Math.sin(this.cameraAngleY) * this.cameraDistance;
      const offsetZ = Math.cos(this.cameraAngleX) * this.cameraDistance * Math.cos(this.cameraAngleY);

      this.camera.position.set(
        player.position.x + offsetX,
        player.position.y + offsetY + 2,
        player.position.z + offsetZ
      );
      this.camera.lookAt(player.position.x, player.position.y + 1.5, player.position.z);
    }
  }
}