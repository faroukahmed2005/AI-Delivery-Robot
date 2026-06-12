// houseC3.js — Block C, House 3

const HOUSE_C3 = {
    modelPath: './models/modern_house.glb',
    rotY: (Math.PI * 10.50) + Math.PI,
    targetSize: 15,
    yOffset: 0,
};

let _hC3_gltf = null;

function buildHouseC3(scene, x, z) {
    function spawn(gltf) {
        const house = gltf.scene.clone(true);
        house.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });

        const box = new THREE.Box3().setFromObject(house);
        const size = box.getSize(new THREE.Vector3());
        const s = HOUSE_C3.targetSize / Math.max(size.x, size.z);
        house.scale.set(s, s, s);
        house.rotation.y = HOUSE_C3.rotY;
        house.updateMatrixWorld(true);

        const box2 = new THREE.Box3().setFromObject(house);
        const center = box2.getCenter(new THREE.Vector3());
        house.position.x += x - center.x;
        house.position.y -= box2.min.y - HOUSE_C3.yOffset;
        house.position.z += z - center.z;
        scene.add(house);
    }

    if (_hC3_gltf) { spawn(_hC3_gltf); return; }
    new THREE.GLTFLoader().load(HOUSE_C3.modelPath,
        gltf => { _hC3_gltf = gltf; spawn(gltf); },
        undefined, err => console.error('houseC3.js:', err));
}