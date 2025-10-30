// 1st level/insects.js
export async function addInsects(scene, loader) {
  const insectUrls = [
    './models/graphosoma_lineatum.glb',
    './models/insectsbeetles-pack13.glb'
  ];

  const group = new THREE.Group();

  for (let i = 0; i < 6; i++) {
    const url = insectUrls[i % insectUrls.length];
    const gltf = await loader.loadAsync(url);
    const insect = gltf.scene;
    insect.scale.set(0.05, 0.05, 0.05);
    insect.position.set(Math.random() * 8 - 4, 0.05, Math.random() * 8 - 4);
    group.add(insect);
  }

  scene.add(group);

  // Optional: Add a simple crawl animation
  function animateInsects(delta) {
    group.children.forEach((insect) => {
      insect.position.x += Math.sin(Date.now() * 0.001) * 0.001;
      insect.rotation.y += delta * 0.5;
    });
  }

  return { group, animateInsects };
}
