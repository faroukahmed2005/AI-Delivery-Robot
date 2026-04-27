// houseC1.js — Block C, House 1

const HOUSE_C1 = {
    modelPath: './models/modern_house.glb',
    rotY: (Math.PI / 270.65) + Math.PI,
    targetSize: 15,
    yOffset: 0,
};

let _hC1_gltf = null;

function buildHouseC1(scene, x, z) {
    function spawn(gltf) {
        const house = gltf.scene.clone(true);
        house.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });

        const box = new THREE.Box3().setFromObject(house);
        const size = box.getSize(new THREE.Vector3());
        const s = HOUSE_C1.targetSize / Math.max(size.x, size.z);
        house.scale.set(s, s, s);
        house.rotation.y = HOUSE_C1.rotY;
        house.updateMatrixWorld(true);

        const box2 = new THREE.Box3().setFromObject(house);
        const center = box2.getCenter(new THREE.Vector3());
        house.position.x += x - center.x - 4;
        house.position.y -= box2.min.y - HOUSE_C1.yOffset;
        house.position.z += z - center.z -3;
        scene.add(house);
    }

    if (_hC1_gltf) { spawn(_hC1_gltf); return; }
    new THREE.GLTFLoader().load(HOUSE_C1.modelPath,
        gltf => { _hC1_gltf = gltf; spawn(gltf); },
        undefined, err => console.error('houseC1.js:', err));
}