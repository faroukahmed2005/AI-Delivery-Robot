// cafe3.js
function buildCafe3(scene, cx, cz) {
    const loader = new THREE.GLTFLoader();
    loader.load('./models/coffee_shop_corner.glb', gltf => {
        const model = gltf.scene;
        model.scale.set(9, 9, 9);
        model.position.set(-21, 8, cz + 3);
        model.rotation.y = Math.PI;
        model.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        scene.add(model);
    }, undefined, err => console.error('cafe3.js:', err));
}