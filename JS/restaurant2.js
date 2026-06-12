// restaurant2.js
const RESTAURANT2 = { path: './models/krusty.glb', scale: 1.1, rotY: 50.1 + Math.PI, offset: { x: 0, y: -1, z: 3 } };
let _r2template = null;
function placeRestaurant2(scene, cx, cz) {
    function spawnAt(t) {
        const c = t.clone(true);
        c.scale.setScalar(RESTAURANT2.scale);
        c.rotation.y = RESTAURANT2.rotY;
        c.position.set(cx + RESTAURANT2.offset.x, RESTAURANT2.offset.y, cz + RESTAURANT2.offset.z);
        c.traverse(ch => { if (ch.isMesh) { ch.castShadow = true; ch.receiveShadow = true; } });
        scene.add(c);
    }
    if (_r2template) { spawnAt(_r2template); return; }
    new THREE.GLTFLoader().load(RESTAURANT2.path,
        gltf => { _r2template = gltf.scene; spawnAt(_r2template); },
        undefined, err => console.error('restaurant2:', err));
}