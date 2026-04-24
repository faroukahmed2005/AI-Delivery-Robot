// restaurant1.js
const RESTAURANT1 = { path: './models/pizza_restaurant.glb', scale: 4, rotY: Math.PI, offset: { x: 0, y: 0, z: 6 } };
let _r1template = null;
function placeRestaurant1(scene, cx, cz) {
    function spawnAt(t) {
        const c = t.clone(true);
        c.scale.setScalar(RESTAURANT1.scale);
        c.rotation.y = RESTAURANT1.rotY;
        c.position.set(cx + RESTAURANT1.offset.x, RESTAURANT1.offset.y, cz + RESTAURANT1.offset.z);
        c.traverse(ch => { if (ch.isMesh) { ch.castShadow = true; ch.receiveShadow = true; } });
        scene.add(c);
    }
    if (_r1template) { spawnAt(_r1template); return; }
    new THREE.GLTFLoader().load(RESTAURANT1.path,
        gltf => { _r1template = gltf.scene; spawnAt(_r1template); },
        undefined, err => console.error('restaurant1:', err));
}