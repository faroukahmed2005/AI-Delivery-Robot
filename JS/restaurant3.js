// restaurant3.js
const RESTAURANT3 = { path: './models/korean_bakery.glb', scale: 4, rotY: Math.PI, offset: { x: -3, y: 0, z: 6 } };
let _r3template = null;
function placeRestaurant3(scene, cx, cz) {
    function spawnAt(t) {
        const c = t.clone(true);
        c.scale.setScalar(RESTAURANT3.scale);
        c.rotation.y = RESTAURANT3.rotY;
        c.position.set(cx + RESTAURANT3.offset.x, RESTAURANT3.offset.y, cz + RESTAURANT3.offset.z);
        c.traverse(ch => { if (ch.isMesh) { ch.castShadow = true; ch.receiveShadow = true; } });
        scene.add(c);
    }
    if (_r3template) { spawnAt(_r3template); return; }
    new THREE.GLTFLoader().load(RESTAURANT3.path,
        gltf => { _r3template = gltf.scene; spawnAt(_r3template); },
        undefined, err => console.error('restaurant3:', err));
}