// level1/simpleRipples.js
import * as THREE from "three";

export class SimpleRipples {
  constructor(scene) {
    this.scene = scene;

    // A plane that represents the water surface
    const geometry = new THREE.PlaneGeometry(200, 200, 256, 256);
    geometry.rotateX(-Math.PI / 2);

    // Shader material for ripples
    this.uniforms = {
      uTime: { value: 0 },
      uRippleCenters: { value: [] },
      uRippleCount: { value: 0 },
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uRippleCenters[20];
        uniform int uRippleCount;
        varying vec2 vUv;
        varying float vHeight;

        void main() {
          vUv = uv;
          vec2 worldPos = uv * 200.0 - 100.0;
          float height = 0.0;

          // Ripple logic: sine waves that decay over time
          for (int i = 0; i < 20; i++) {
            if (i >= uRippleCount) break;
            vec2 center = uRippleCenters[i].xz;
            float dist = length(worldPos - center);
            float t = uTime - uRippleCenters[i].y;
            if (t > 0.0 && t < 5.0) {
              height += 0.15 * sin(10.0 * dist - 5.0 * t) * exp(-dist * 0.3) * exp(-t * 0.5);
            }
          }

          vHeight = height;
          vec3 pos = position;
          pos.y += height;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        varying float vHeight;

        void main() {
          // Swamp water colors - murky green/brown
          vec3 deepColor = vec3(0.1, 0.2, 0.15);
          vec3 shallowColor = vec3(0.2, 0.35, 0.25);
          vec3 highlightColor = vec3(0.3, 0.5, 0.4);
          
          vec3 color = mix(deepColor, shallowColor, 0.5 + 0.5 * vHeight);
          color = mix(color, highlightColor, smoothstep(0.0, 0.1, vHeight));
          
          gl_FragColor = vec4(color, 0.85);
        }
      `,
      transparent: true,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.y = 0.05; // Slightly above ground
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);

    // Store ripple data (max 20 at once)
    this.ripples = [];
    
    console.log("✅ Ripple plane added to scene:", this.mesh);
  }

  // Called when player moves
  handlePlayerMovement(x, z, walking) {
    if (!walking) return;
    
    // Add a ripple at the player's feet
    this.ripples.push(new THREE.Vector3(x, this.uniforms.uTime.value, z));

    // Limit ripple array size
    if (this.ripples.length > 20) this.ripples.shift();

    // Update shader uniforms
    this.uniforms.uRippleCount.value = this.ripples.length;
    for (let i = 0; i < this.ripples.length; i++) {
      this.uniforms.uRippleCenters.value[i] = this.ripples[i];
    }
  }

  update(delta) {
    this.uniforms.uTime.value += delta;
  }
}