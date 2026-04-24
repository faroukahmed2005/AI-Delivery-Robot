// cafe.js
function buildCafe(scene, cx, cz) {
    const loader = new THREE.GLTFLoader();
    loader.load('./models/coffee_shop.glb', gltf => {
        const model = gltf.scene;
        model.scale.set(3.5, 3.5, 3.5);
        model.rotation.y = Math.PI/2;
        model.position.set(cx+1, 0, cz+5);
        model.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        scene.add(model);
    }, undefined, err => console.error('cafe.js:', err));
}