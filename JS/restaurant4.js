// restaurant4.js
const RESTAURANT4 = { path: './models/japanese_restaurant.glb', scale: 1, rotY: Math.PI, offset: { x: -2, y: 0, z: 3 } };
let _r4template = null;
function placeRestaurant4(scene, cx, cz) {
    function spawnAt(t) {
        const c = t.clone(true);
        c.scale.setScalar(RESTAURANT4.scale);
        c.rotation.y = RESTAURANT4.rotY;
        c.position.set(cx + RESTAURANT4.offset.x, RESTAURANT4.offset.y, cz + RESTAURANT4.offset.z);
        c.traverse(ch => { if (ch.isMesh) { ch.castShadow = true; ch.receiveShadow = true; } });
        scene.add(c);
    }
    if (_r4template) { spawnAt(_r4template); return; }
    new THREE.GLTFLoader().load(RESTAURANT4.path,
        gltf => { _r4template = gltf.scene; spawnAt(_r4template); },
        undefined, err => console.error('restaurant4:', err));
}