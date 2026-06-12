// cafe4.js
function buildCafe4(scene, cx, cz) {
    const loader = new THREE.GLTFLoader();
    loader.load('./models/coffee_cup.glb', gltf => {
        const model = gltf.scene;
        model.scale.set(80, 80, 80);
        model.rotation.y = Math.PI;
        model.position.set(cx+2, 0, cz+5);
        model.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        scene.add(model);
    }, undefined, err => console.error('cafe4.js:', err));
}