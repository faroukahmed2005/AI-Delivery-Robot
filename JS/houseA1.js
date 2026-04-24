// houseA1.js — Block A, House 1
// Modify scale, rotY, targetSize, and modelPath freely for this house.

const HOUSE_A1 = {
    modelPath:  './models/modern_house.glb',
    rotY:       Math.PI*10.50+(Math.PI/2),
    targetSize: 15,           // auto-scales so width/depth fits this size
    yOffset:    0,            // extra vertical nudge (0 = sit on ground)
};

let _hA1_gltf = null;

function buildHouseA1(scene, x, z) {
    function spawn(gltf) {
        const house = gltf.scene.clone(true);
        house.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });

        const box = new THREE.Box3().setFromObject(house);
        const size = box.getSize(new THREE.Vector3());
        const s = HOUSE_A1.targetSize / Math.max(size.x, size.z);
        house.scale.set(s, s, s);
        house.rotation.y = HOUSE_A1.rotY;
        house.updateMatrixWorld(true);

        const box2 = new THREE.Box3().setFromObject(house);
        const center = box2.getCenter(new THREE.Vector3());
        house.position.x += x - center.x -4;
        house.position.y -= box2.min.y - HOUSE_A1.yOffset;
        house.position.z += z - center.z-3;
        scene.add(house);
    }

    if (_hA1_gltf) { spawn(_hA1_gltf); return; }
    new THREE.GLTFLoader().load(HOUSE_A1.modelPath,
        gltf => { _hA1_gltf = gltf; spawn(gltf); },
        undefined, err => console.error('houseA1.js:', err));
}
