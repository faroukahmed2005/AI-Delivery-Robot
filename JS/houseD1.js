// houseD1.js — Block D, House 1
// Modify scale, rotY, targetSize, and modelPath freely for this house.

const HOUSE_D1 = {
    modelPath:  './models/modern_home1.glb',
    rotY:       45.150 + (Math.PI / 2) + (Math.PI ),
    targetSize: 35,
    yOffset:    0,
};

let _hD1_gltf = null;

function buildHouseD1(scene, x, z) {
    function spawn(gltf) {
        const house = gltf.scene.clone(true);
        house.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });

        const box = new THREE.Box3().setFromObject(house);
        const size = box.getSize(new THREE.Vector3());
        const s = HOUSE_D1.targetSize / Math.max(size.x, size.z);
        house.scale.set(s, s, s);
        house.rotation.y = HOUSE_D1.rotY;
        house.updateMatrixWorld(true);

        const box2 = new THREE.Box3().setFromObject(house);
        const center = box2.getCenter(new THREE.Vector3());
        house.position.x += x - center.x;
        house.position.y -= box2.min.y - HOUSE_D1.yOffset;
        house.position.z += z - center.z;
        scene.add(house);
    }

    if (_hD1_gltf) { spawn(_hD1_gltf); return; }
    new THREE.GLTFLoader().load(HOUSE_D1.modelPath,
        gltf => { _hD1_gltf = gltf; spawn(gltf); },
        undefined, err => console.error('houseD1.js:', err));
}
