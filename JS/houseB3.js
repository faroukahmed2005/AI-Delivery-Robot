// houseB3.js — Block B, House 3
// Modify scale, rotY, targetSize, and modelPath freely for this house.

const HOUSE_B3 = {
    modelPath:  './models/modern_home1.glb',
    rotY:       Math.PI / 2.7 + (Math.PI),
    targetSize: 35,
    yOffset:    0,
};

let _hB3_gltf = null;

function buildHouseB3(scene, x, z) {
    function spawn(gltf) {
        const house = gltf.scene.clone(true);
        house.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });

        const box = new THREE.Box3().setFromObject(house);
        const size = box.getSize(new THREE.Vector3());
        const s = HOUSE_B3.targetSize / Math.max(size.x, size.z);
        house.scale.set(s, s, s);
        house.rotation.y = HOUSE_B3.rotY;
        house.updateMatrixWorld(true);

        const box2 = new THREE.Box3().setFromObject(house);
        const center = box2.getCenter(new THREE.Vector3());
        house.position.x += 38;
        house.position.y -= box2.min.y - HOUSE_B3.yOffset;
        house.position.z += z - center.z;
        scene.add(house);
    }

    if (_hB3_gltf) { spawn(_hB3_gltf); return; }
    new THREE.GLTFLoader().load(HOUSE_B3.modelPath,
        gltf => { _hB3_gltf = gltf; spawn(gltf); },
        undefined, err => console.error('houseB3.js:', err));
}
