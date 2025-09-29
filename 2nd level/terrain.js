import * as THREE from 'three';

export function train(Scene) {
    const roomGroup = new THREE.Group();
    roomGroup.name = 'ChildBedroom';

    // --- CONFIG ---
    const roomWidth = 10;   // x
    const roomDepth = 12;   // z
    const roomHeight = 3;   // y

    // --- FLOOR (wood) ---
    const floorGeo = new THREE.PlaneGeometry(roomWidth, roomDepth, 1, 1);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xDEB887, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotateX(-Math.PI / 2);
    floor.receiveShadow = true;
    floor.name = 'Floor';
    roomGroup.add(floor);

    // --- WALLS (simple planes) ---
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xEAEAEA, side: THREE.DoubleSide });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), wallMat);
    backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
    roomGroup.add(backWall);

    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), wallMat);
    frontWall.rotation.y = Math.PI;
    frontWall.position.set(0, roomHeight / 2, roomDepth / 2);
    roomGroup.add(frontWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    roomGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
    roomGroup.add(rightWall);

    // --- WINDOW on back wall (simple) ---
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x88CFFF, opacity: 0.6, transparent: true });
    const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.2), windowMat);
    windowMesh.position.set(0, 1.6, -roomDepth / 2 + 0.01); // slightly in front of wall
    roomGroup.add(windowMesh);

    // --- BED ---
    const bedGroup = new THREE.Group();
    const bedWidth = 3.0;
    const bedDepth = 1.6;
    bedGroup.position.set(0, 0, -roomDepth/2 + 1.2); // positioned by the window, centered under it

    // frame
    const frameGeo = new THREE.BoxGeometry(bedWidth, 0.35, bedDepth);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x6B3E26, roughness: 0.9 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 0.175;
    frame.castShadow = true;
    frame.receiveShadow = true;
    bedGroup.add(frame);

    // mattress
    const matGeo = new THREE.BoxGeometry(bedWidth - 0.2, 0.35, bedDepth - 0.2);
    const matMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.7 });
    const mattress = new THREE.Mesh(matGeo, matMat);
    mattress.position.y = 0.45;
    mattress.castShadow = true;
    bedGroup.add(mattress);

    // blanket (slightly colored)
    const blanketGeo = new THREE.BoxGeometry(bedWidth - 0.25, 0.05, bedDepth - 0.3);
    const blanketMat = new THREE.MeshStandardMaterial({ color: 0xFF6F91 });
    const blanket = new THREE.Mesh(blanketGeo, blanketMat);
    blanket.position.y = 0.58;
    blanket.position.z = -0.15;
    blanket.castShadow = true;
    bedGroup.add(blanket);

    // pillow
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.45), new THREE.MeshStandardMaterial({ color: 0xFFF1C9 }));
    pillow.position.set(-0.7, 0.6, 0.28);
    pillow.castShadow = true;
    bedGroup.add(pillow);

    bedGroup.rotation.y = Math.PI/2;

    roomGroup.add(bedGroup);

    // --- RUG (circular) ---
    const rugGeo = new THREE.CircleGeometry(1.2, 32);
    const rugMat = new THREE.MeshStandardMaterial({ color: 0xFFDAB9 });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.rotateX(-Math.PI / 2);
    rug.position.set(0, 0.01, -1.2);
    rug.receiveShadow = true;
    roomGroup.add(rug);

    // --- NIGHTSTAND + lamp ---
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x8B5A2B }));
    stand.position.set(bedGroup.position.x + (bedWidth / 2) + 0.35, 0.2, bedGroup.position.z - 0.1); // to the right of the bed
    stand.castShadow = true;
    roomGroup.add(stand);

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 12), new THREE.MeshStandardMaterial({ color: 0x444444 }));
    lampBase.position.set(stand.position.x, 0.5, stand.position.z);
    lampBase.castShadow = true;
    roomGroup.add(lampBase);

    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 12), new THREE.MeshStandardMaterial({ color: 0xFFF4C1, emissive: 0xFFF2A8, emissiveIntensity: 0.1 }));
    lampShade.position.set(stand.position.x, 0.68, stand.position.z);
    lampShade.castShadow = true;
    roomGroup.add(lampShade);

    // small point light for lamp
    const lampLight = new THREE.PointLight(0xfff3c7, 0.6, 4);
    lampLight.position.set(stand.position.x, 0.8, stand.position.z);
    lampLight.castShadow = true;
    roomGroup.add(lampLight);

    // --- TOY BLOCKS (scattered colorful cubes) ---
    const blockColors = [0xff6b6b, 0xffb86b, 0xfff77a, 0x8bd3dd, 0x9b8cff];
    const blocks = new THREE.Group();
    for (let i = 0; i < 12; i++) {
        const size = 0.18 + Math.random() * 0.12;
        const g = new THREE.BoxGeometry(size, size, size);
        const m = new THREE.MeshStandardMaterial({ color: blockColors[i % blockColors.length] });
        const cube = new THREE.Mesh(g, m);
        cube.position.set((Math.random() - 0.5) * 3.5, size / 2, (Math.random() - 0.2) * 3.5);
        cube.rotation.y = Math.random() * Math.PI;
        cube.castShadow = true;
        blocks.add(cube);
    }
    blocks.position.set(0.6, 0, 1.0);
    roomGroup.add(blocks);


    // --- AMBIENT LIGHT ---
    const ambient = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    roomGroup.add(ambient);

    // --- TRAIN SET (beside the bed) ---
    // Simple circular track + 3-car train. Expose updateTrain(delta) for animation.
    const trainGroup = new THREE.Group();
    trainGroup.name = 'TrainGroup';

    // Center the loop near the right side of the bed
    const loopCenter = new THREE.Vector3(
        bedGroup.position.x - (bedWidth / 2) - 1.2, // left of bed
        0,
        bedGroup.position.z + 0.6
    );
    const loopRadius = 0.9;

    // track (thin torus)
    const track = new THREE.Mesh(
        new THREE.TorusGeometry(loopRadius, 0.03, 8, 64),
        new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7, roughness: 0.5 })
    );
    track.rotation.x = -Math.PI / 2;
    track.position.copy(loopCenter);
    track.receiveShadow = true;
    track.castShadow = false;
    trainGroup.add(track);

    // create simple car function
    function makeCar(width, height, depth, color) {
        const g = new THREE.BoxGeometry(width, height, depth);
        const m = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(g, m);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    // locomotive
    const loco = new THREE.Group();
    const locoBody = makeCar(0.5, 0.28, 0.36, 0xff3333);
    locoBody.position.y = 0.14;
    loco.add(locoBody);
    const locoCab = makeCar(0.22, 0.2, 0.22, 0xaa2222);
    locoCab.position.set(0.09, 0.25, 0);
    loco.add(locoCab);
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    chimney.position.set(-0.18, 0.28, 0);
    loco.add(chimney);

    // two small wagons
    const wagon1 = new THREE.Group();
    const w1Box = makeCar(0.42, 0.22, 0.34, 0x3366ff);
    w1Box.position.y = 0.11;
    wagon1.add(w1Box);

    const wagon2 = new THREE.Group();
    const w2Box = makeCar(0.42, 0.22, 0.34, 0x33cc66);
    w2Box.position.y = 0.11;
    wagon2.add(w2Box);

    // assemble cars in trainGroup (initial positions will be set in update)
    trainGroup.add(loco);
    trainGroup.add(wagon1);
    trainGroup.add(wagon2);

    // small connector offsets along the loop (meters)
    const carSpacing = 0.5;

    // internal train state
    let trainAngle = 0; // radians
    const trainSpeed = 1.2; // radians/sec approx (adjust speed visually by caller)

    // update function to be called from your render loop; delta in seconds
    function updateTrain(delta) {
        if (typeof delta !== 'number') return;
        trainAngle -= trainSpeed * delta; // negative so it goes clockwise visually

        // helper to place a car at a certain distance behind the nose
        function placeCar(car, distanceBehind) {
            const angle = trainAngle + (distanceBehind / loopRadius);
            const x = loopCenter.x + Math.cos(angle) * loopRadius;
            const z = loopCenter.z + Math.sin(angle) * loopRadius;
            car.position.set(x, 0.12, z);
            // orient tangent to circle: rotation so nose points along direction of movement
            car.rotation.y = -angle + Math.PI / 2;
        }

        placeCar(loco, 0);
        placeCar(wagon1, carSpacing);
        placeCar(wagon2, carSpacing * 2);
    }

    // place initial positions
    updateTrain(0);

    roomGroup.add(trainGroup);

    // --- enable shadows on group children (where appropriate) ---
    roomGroup.traverse(obj => {
        if (obj.isMesh) {
            // avoid enabling shadows on transparent window plane
            if (obj === windowMesh) return;
            obj.castShadow = obj.castShadow ?? true;
            obj.receiveShadow = obj.receiveShadow ?? true;
        }
    });

    // Final position: put the room so that floor y=0 in world space
    roomGroup.position.y = 0;

    Scene.add(roomGroup);

    // Return useful refs so caller can tweak / add physics and animate the train
    return { roomGroup, floor, blocks, bedGroup, lampLight, trainGroup, updateTrain };
}
