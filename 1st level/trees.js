// 1st level/trees.js
export async function addTrees(scene, loader) {
  const treeUrls = ['./models/maple_tree.glb'];
  const group = new THREE.Group();

  for (let i = 0; i < 5; i++) {
    const url = treeUrls[i % treeUrls.length];
    const gltf = await loader.loadAsync(url);
    const tree = gltf.scene;
    tree.position.set(Math.random() * 10 - 5, 0, Math.random() * 10 - 5);
    tree.scale.set(2, 2, 2);
    tree.traverse((child) => (child.castShadow = child.receiveShadow = true));
    group.add(tree);
  }

  scene.add(group);
  return group;
}
