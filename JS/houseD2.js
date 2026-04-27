// houseD2.js — Block D, House 2

const HOUSE_D2 = {
    modelPath:  './models/modern_house.glb',
    rotY:       300 + (Math.PI / 2) + (Math.PI ),
    targetSize: 15,
    yOffset:    0,
};

let _hD2_gltf = null;

function buildHouseD2(scene, x, z) {
    function spawn(gltf) {
        const house = gltf.scene.clone(true);
        house.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });

        const box = new THREE.Box3().setFromObject(house);
        const size = box.getSize(new THREE.Vector3());
        const s = HOUSE_D2.targetSize / Math.max(size.x, size.z);
        house.scale.set(s, s, s);
        house.rotation.y = HOUSE_D2.rotY;
        house.updateMatrixWorld(true);

        const box2 = new THREE.Box3().setFromObject(house);
        const center = box2.getCenter(new THREE.Vector3());
        house.position.x += x - center.x + 3.5;
        house.position.y -= box2.min.y - HOUSE_D2.yOffset;
        house.position.z += z - center.z-3;
        scene.add(house);
    }

    if (_hD2_gltf) { spawn(_hD2_gltf); return; }
    new THREE.GLTFLoader().load(HOUSE_D2.modelPath,
        gltf => { _hD2_gltf = gltf; spawn(gltf); },
        undefined, err => console.error('houseD2.js:', err));
}