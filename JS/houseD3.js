// houseD3.js — Block D, House 3

const HOUSE_D3 = {
    modelPath:  './models/modern_home1.glb',
    rotY:       Math.PI/1.16+(Math.PI / 2),  
    targetSize: 35,
    yOffset:    0,
};

let _hD3_gltf = null;

function buildHouseD3(scene, x, z) {
    function spawn(gltf) {
        const house = gltf.scene.clone(true);
        house.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });

        const box = new THREE.Box3().setFromObject(house);
        const size = box.getSize(new THREE.Vector3());
        const s = HOUSE_D3.targetSize / Math.max(size.x, size.z);
        house.scale.set(s, s, s);
        house.rotation.y = HOUSE_D3.rotY;
        house.updateMatrixWorld(true);

        const box2 = new THREE.Box3().setFromObject(house);
        const center = box2.getCenter(new THREE.Vector3());
        house.position.x += 38;
        house.position.y -= box2.min.y - HOUSE_D3.yOffset;
        house.position.z += 43;
        scene.add(house);
    }

    if (_hD3_gltf) { spawn(_hD3_gltf); return; }
    new THREE.GLTFLoader().load(HOUSE_D3.modelPath,
        gltf => { _hD3_gltf = gltf; spawn(gltf); },
        undefined, err => console.error('houseD3.js:', err));
}