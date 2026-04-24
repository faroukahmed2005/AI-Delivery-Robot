// ── paths.js ── Roads, Sidewalks, Rail Lanes, Lamps

const PATH_SURFACE_Y = 0.282;
const RAIL_CENTER_Y  = PATH_SURFACE_Y + 0.05;
const MARKER_Y       = PATH_SURFACE_Y + 0.1;

function buildPaths(scene) {
    buildRobotRails(scene);
}

function addRailSegment(scene, x, z, length, dir = 1) {
    const railOffset = 0.16;
    const railRadius = 0.05;
    const railY = RAIL_CENTER_Y;
    const metallic = new THREE.MeshStandardMaterial({ color: 0x707880, metalness: 0.9, roughness: 0.35 });
    const tieMat   = new THREE.MeshStandardMaterial({ color: 0x2f2f2f, metalness: 0.45, roughness: 0.7 });

    function addTube(a, b) {
        const curve = new THREE.LineCurve3(a, b);
        const geo   = new THREE.TubeGeometry(curve, 32, railRadius, 10, false);
        const m     = new THREE.Mesh(geo, metallic);
        m.castShadow = true; m.receiveShadow = true;
        scene.add(m);
    }

    if (dir === 1) {
        addTube(new THREE.Vector3(x - length/2, railY, z + railOffset), new THREE.Vector3(x + length/2, railY, z + railOffset));
        addTube(new THREE.Vector3(x - length/2, railY, z - railOffset), new THREE.Vector3(x + length/2, railY, z - railOffset));
        for (let t = -length/2; t <= length/2; t += 3.8) {
            const tie = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.5), tieMat);
            tie.position.set(x + t, railY - 0.015, z);
            tie.castShadow = true; tie.receiveShadow = true;
            scene.add(tie);
        }
    } else {
        addTube(new THREE.Vector3(x + railOffset, railY, z - length/2), new THREE.Vector3(x + railOffset, railY, z + length/2));
        addTube(new THREE.Vector3(x - railOffset, railY, z - length/2), new THREE.Vector3(x - railOffset, railY, z + length/2));
        for (let t = -length/2; t <= length/2; t += 3.8) {
            const tie = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.25), tieMat);
            tie.position.set(x, railY - 0.015, z + t);
            tie.castShadow = true; tie.receiveShadow = true;
            scene.add(tie);
        }
    }
}

function buildRobotRails(scene) {
    addRailSegment(scene,    0,   9.25, 188.5,  1);
    addRailSegment(scene,    0,  -9.25, 188.5,  1);
    addRailSegment(scene,    0, -94.25, 188.5,  1);
    addRailSegment(scene,    0, -75.75, 188.5,  1);
    addRailSegment(scene,    0,  75.75, 188.5,  1);
    addRailSegment(scene,    0,  94.25, 188.5,  1);
    addRailSegment(scene,  9.25,    0,  188.5, -1);
    addRailSegment(scene, -9.25,    0,  188.5, -1);
    addRailSegment(scene,  75.75,   0,  188.5, -1);
    addRailSegment(scene,  94.25,   0,  188.5, -1);
    addRailSegment(scene, -75.75,   0,  188.5, -1);
    addRailSegment(scene, -94.25,   0,  188.5, -1);
}

window.PATH_SURFACE_Y = PATH_SURFACE_Y;
window.RAIL_CENTER_Y  = RAIL_CENTER_Y;
window.MARKER_Y       = MARKER_Y;