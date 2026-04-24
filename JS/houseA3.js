// houseA3.js — Block A, House 3
// Modify scale, rotY, targetSize, and modelPath freely for this house.

const HOUSE_A3 = {
    modelPath:  './models/modern_house.glb',
    rotY:       Math.PI/270.65 - (Math.PI/2),
    targetSize: 15,
    yOffset:    0,
};

let _hA3_gltf = null;

function buildHouseA3(scene, x, z) {
    function spawn(gltf) {
        const house = gltf.scene.clone(true);
        house.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });

        const box = new THREE.Box3().setFromObject(house);
        const size = box.getSize(new THREE.Vector3());
        const s = HOUSE_A3.targetSize / Math.max(size.x, size.z);
        house.scale.set(s, s, s);
        house.rotation.y = HOUSE_A3.rotY;
        house.updateMatrixWorld(true);

        const box2 = new THREE.Box3().setFromObject(house);
        const center = box2.getCenter(new THREE.Vector3());
        house.position.x += x - center.x;
        house.position.y -= box2.min.y - HOUSE_A3.yOffset;
        house.position.z += z - center.z;
        scene.add(house);
    }

    if (_hA3_gltf) { spawn(_hA3_gltf); return; }
    new THREE.GLTFLoader().load(HOUSE_A3.modelPath,
        gltf => { _hA3_gltf = gltf; spawn(gltf); },
        undefined, err => console.error('houseA3.js:', err));
}
