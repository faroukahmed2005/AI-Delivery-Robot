// cafe2.js
function buildCafe2(scene, cx, cz) {
    const loader = new THREE.GLTFLoader();
    loader.load('./models/coffee_shop_black.glb', gltf => {
        const model = gltf.scene;
        model.scale.set(3, 3, 3);
        model.rotation.y = Math.PI;
        model.position.set(cx, 0, cz);
        model.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        scene.add(model);
    }, undefined, err => console.error('cafe2.js:', err));
}