// houseB2.js — Block B, House 2

const HOUSE_B2 = {
    modelPath:  './models/modern_house.glb',
    rotY:       Math.PI/270.65+(Math.PI),
    targetSize: 15,
    yOffset:    0,
};

let _hB2_gltf = null;

function buildHouseB2(scene, x, z) {
    function spawn(gltf) {
        const house = gltf.scene.clone(true);
        house.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });

        const box = new THREE.Box3().setFromObject(house);
        const size = box.getSize(new THREE.Vector3());
        const s = HOUSE_B2.targetSize / Math.max(size.x, size.z);
        house.scale.set(s, s, s);
        house.rotation.y = HOUSE_B2.rotY;
        house.updateMatrixWorld(true);

        const box2 = new THREE.Box3().setFromObject(house);
        const center = box2.getCenter(new THREE.Vector3());
        house.position.x += x - center.x+4;
        house.position.y -= box2.min.y - HOUSE_B2.yOffset;
        house.position.z += z - center.z-3;
        scene.add(house);
    }

    if (_hB2_gltf) { spawn(_hB2_gltf); return; }
    new THREE.GLTFLoader().load(HOUSE_B2.modelPath,
        gltf => { _hB2_gltf = gltf; spawn(gltf); },
        undefined, err => console.error('houseB2.js:', err));
}