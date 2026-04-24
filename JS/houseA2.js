// houseA2.js — Block A, House 2
// Modify scale, rotY, targetSize, and modelPath freely for this house.

const HOUSE_A2 = {
    modelPath:  './models/modern_home1.glb',
    rotY:       (Math.PI / 2.7 + Math.PI) + (Math.PI / 2),
    targetSize: 35,
    yOffset:    0,
};

let _hA2_gltf = null;

function buildHouseA2(scene, x, z) {
    function spawn(gltf) {
        const house = gltf.scene.clone(true);
        house.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });

        const box = new THREE.Box3().setFromObject(house);
        const size = box.getSize(new THREE.Vector3());
        const s = HOUSE_A2.targetSize / Math.max(size.x, size.z);
        house.scale.set(s, s, s);
        house.rotation.y = HOUSE_A2.rotY;
        house.updateMatrixWorld(true);

        const box2 = new THREE.Box3().setFromObject(house);
        const center = box2.getCenter(new THREE.Vector3());
        house.position.x += x  ;
        house.position.y -= box2.min.y - HOUSE_A2.yOffset;
        house.position.z += z - center.z;
        scene.add(house);
    }

    if (_hA2_gltf) { spawn(_hA2_gltf); return; }
    new THREE.GLTFLoader().load(HOUSE_A2.modelPath,
        gltf => { _hA2_gltf = gltf; spawn(gltf); },
        undefined, err => console.error('houseA2.js:', err));
}
