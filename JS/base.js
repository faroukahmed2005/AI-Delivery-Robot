const CFG = {
    BLOCK: 64, CAR_W: 8, SWK_W: 4, ROB_W: 2.5,
    HALF_ROAD: 10.5, GAP: 21, OFF: 42.5,
    SWK_H: 0.28,
    SWK_TOP_Y: 0.28,
};

CFG.BLOCKS = [
    { id: 'A', x: -42.5, z: -42.5 },
    { id: 'B', x: 42.5, z: -42.5 },
    { id: 'C', x: -42.5, z: 42.5 },
    { id: 'D', x: 42.5, z: 42.5 },
];

CFG.DICE5 = [
    { dx: -0.30, dz: -0.30, type: 'house' },
    { dx: 0.30, dz: -0.30, type: 'house' },
    { dx: 0.00, dz: 0.00, type: 'house' },
    { dx: -0.30, dz: 0.30, type: 'restaurant' },
    { dx: 0.30, dz: 0.30, type: 'cafe' },
];

// ── Materials
let M = {};
function initMats() {
    M.dirt      = new THREE.MeshLambertMaterial({ color: 0x5a4a30 });
    M.asphalt   = new THREE.MeshLambertMaterial({ color: 0x333333 });
    M.sidewalk  = new THREE.MeshLambertMaterial({ color: 0xc0b49a });
    M.robot     = new THREE.MeshLambertMaterial({ color: 0x222222 });
    M.dashW     = new THREE.MeshLambertMaterial({ color: 0xffffff });
    M.houseWall = new THREE.MeshLambertMaterial({ color: 0xd4b896 });
    M.houseRoof = new THREE.MeshLambertMaterial({ color: 0x8b3a2a });
    M.cafeWall  = new THREE.MeshLambertMaterial({ color: 0xc87848 });
    M.cafeRoof  = new THREE.MeshLambertMaterial({ color: 0x4a2818 });
    M.window    = new THREE.MeshLambertMaterial({ color: 0x99ccff, emissive: 0x112233 });
    M.door      = new THREE.MeshLambertMaterial({ color: 0x5a3010 });
    M.chimney   = new THREE.MeshLambertMaterial({ color: 0x7a3a18 });
    M.step      = new THREE.MeshLambertMaterial({ color: 0x999988 });
    M.awning    = new THREE.MeshLambertMaterial({ color: 0xcc4422 });
    M.sign      = new THREE.MeshLambertMaterial({ color: 0xffe8a0, emissive: 0x221100 });
    M.pole      = new THREE.MeshLambertMaterial({ color: 0x888888 });
    M.lampHead  = new THREE.MeshLambertMaterial({ color: 0xffffcc, emissive: 0x777733 });
}
initMats();

// ── camera controls
function makeTopDownControls(cam, el) {
    const state = { dragging: false, last: { x: 0, y: 0 }, active: false };
    el.addEventListener('mousedown', e => {
        if (!state.active) return;
        state.dragging = true;
        state.last = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => state.dragging = false);
    window.addEventListener('mousemove', e => {
        if (!state.dragging || !state.active) return;
        const dx = e.clientX - state.last.x;
        const dy = e.clientY - state.last.y;
        const speed = cam.position.y * 0.001;
        cam.position.x -= dx * speed;
        cam.position.z -= dy * speed;
        state.last = { x: e.clientX, y: e.clientY };
    });
    el.addEventListener('wheel', e => {
        if (!state.active) return;
        e.preventDefault();
        cam.position.y *= e.deltaY < 0 ? 0.92 : 1 / 0.92;
        cam.position.y = Math.max(20, Math.min(500, cam.position.y));
    }, { passive: false });
    return { update: () => {}, state };
}

// ── initBaseMap
function initBaseMap(container) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x87ceeb);
    renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera1 = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    camera1.position.set(0, 100, 50);
    camera1.lookAt(0, 0, 0);

    let orbitControls = null;
    if (typeof THREE.OrbitControls === 'function') {
        orbitControls = new THREE.OrbitControls(camera1, renderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.05;
        orbitControls.screenSpacePanning = true;
        orbitControls.rotateSpeed = 0.8;
        orbitControls.panSpeed = 1.5;
        orbitControls.zoomSpeed = 1.2;
        orbitControls.maxPolarAngle = Math.PI / 2;
        orbitControls.minDistance = 1;
        orbitControls.maxDistance = 500;
        orbitControls.target.set(0, 0, 0);
        orbitControls.update();
    }

    const camera2 = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1000);
    camera2.position.set(0, 200, 0);
    camera2.lookAt(0, 0, 0);
    const topDownControls = makeTopDownControls(camera2, renderer.domElement);

    let activeCamera = camera1;
    let camMode = 1;
    topDownControls.state.active = false;

    window.addEventListener('keydown', e => {
        if (e.key === '1' && camMode !== 1) {
            camMode = 1; activeCamera = camera1;
            topDownControls.state.active = false;
            if (orbitControls) { orbitControls.enabled = true; orbitControls.update(); }
        }
        if (e.key === '2' && camMode !== 2) {
            camMode = 2; activeCamera = camera2;
            topDownControls.state.active = true;
            if (orbitControls) orbitControls.enabled = false;
        }
        if (e.key === 'r' || e.key === 'R') {
            if (camMode === 1) {
                camera1.position.set(0, 100, 50);
                camera1.lookAt(0, 0, 0);
                if (orbitControls) { orbitControls.target.set(0, 0, 0); orbitControls.update(); }
            } else {
                camera2.position.set(0, 200, 0);
                camera2.lookAt(0, 0, 0);
            }
        }
    });

    window.addEventListener('resize', () => {
        camera1.aspect = camera2.aspect = innerWidth / innerHeight;
        camera1.updateProjectionMatrix();
        camera2.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
    });

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 2.5));
    const sun = new THREE.DirectionalLight(0xfff8e0, 1.0);
    sun.position.set(0, 200, 0);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 700;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -250;
    sun.shadow.camera.right = sun.shadow.camera.top = 250;
    sun.shadow.bias = -0.001;
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x4a8a2a, 0.4));

    buildWorld(scene);

    window.__mapRuntime = {
        getActiveCamera: () => activeCamera,
        getRendererDom:  () => renderer.domElement,
    };

    (function animate() {
        requestAnimationFrame(animate);
        if (camMode === 1) {
            if (orbitControls) orbitControls.update();
        } else {
            topDownControls.update();
            camera2.lookAt(camera2.position.x, 0, camera2.position.z);
        }
        renderer.render(scene, activeCamera);
    })();

    return { scene, camera1, camera2, renderer, orbitControls, topDownControls };
}

// ── Helpers
function makePlane(scene, mat, x, z, w, l, y, dir = 1) {
    const m = new THREE.Mesh(
        dir === 1 ? new THREE.PlaneGeometry(w, l) : new THREE.PlaneGeometry(l, w),
        mat
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.receiveShadow = true;
    scene.add(m);
}

function B(w, h, d, mat) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}

function makeStrip(scene, mat, x, z, w, l, h, dir = 1) {
    const g = dir === 1
        ? new THREE.BoxGeometry(w, h, l)
        : new THREE.BoxGeometry(l, h, w);
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, h / 2, z);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
}

// ── Ground
function buildGround(scene) {
    makePlane(scene, M.dirt, 0, 0, 200, 200, 0);
}

// ── Roads
function corridor(scene, cx, cz, len, width, dir) {
    const swkC = width / 2 + 2;
    const robC = width / 2 + 4 + 1.25;
    makePlane(scene, M.asphalt, cx, cz, len, width, 0.01, dir);
    if (dir === 1) {
        makeStrip(scene, M.sidewalk, cx, cz + swkC, len, 4, CFG.SWK_H, 1);
        makeStrip(scene, M.sidewalk, cx, cz - swkC, len, 4, CFG.SWK_H, 1);
        makePlane(scene, M.robot, cx, cz + robC, len, 2.5, CFG.SWK_TOP_Y + 0.002, 1);
        makePlane(scene, M.robot, cx, cz - robC, len, 2.5, CFG.SWK_TOP_Y + 0.002, 1);
    } else {
        makeStrip(scene, M.sidewalk, cx + swkC, cz, len, 4, CFG.SWK_H, -1);
        makeStrip(scene, M.sidewalk, cx - swkC, cz, len, 4, CFG.SWK_H, -1);
        makePlane(scene, M.robot, cx + robC, cz, len, 2.5, CFG.SWK_TOP_Y + 0.002, -1);
        makePlane(scene, M.robot, cx - robC, cz, len, 2.5, CFG.SWK_TOP_Y + 0.002, -1);
    }
}

function buildIntersection(scene, cx, cz) {
    const intSize = 21, r = 6.5, off = 7.25;
    makePlane(scene, M.asphalt, cx, cz, intSize, intSize, 0.012);
    const radius = r * 0.5;
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
        const shape = new THREE.Shape();
        shape.moveTo(-r / 2, -r / 2);
        shape.lineTo(r / 2 - radius, -r / 2);
        shape.absarc(r / 2 - radius, -r / 2 + radius, radius, -Math.PI / 2, 0, false);
        shape.lineTo(r / 2, r / 2);
        shape.lineTo(-r / 2, r / 2);
        shape.lineTo(-r / 2, -r / 2);
        const ex = new THREE.ExtrudeGeometry(shape, { depth: CFG.SWK_H, bevelEnabled: false });
        const mesh = new THREE.Mesh(ex, M.sidewalk);
        mesh.rotation.x = -Math.PI / 2;
        if (sx === -1 && sz === -1) mesh.rotation.z = 0;
        if (sx ===  1 && sz === -1) mesh.rotation.z = -Math.PI / 2;
        if (sx ===  1 && sz ===  1) mesh.rotation.z = Math.PI;
        if (sx === -1 && sz ===  1) mesh.rotation.z = Math.PI / 2;
        mesh.position.set(cx + sx * off, 0, cz + sz * off);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
    });
    const laneOff = 9.25;
    makePlane(scene, M.robot, cx, cz + laneOff,  intSize, 2.5, CFG.SWK_TOP_Y + 0.003, 1);
    makePlane(scene, M.robot, cx, cz - laneOff,  intSize, 2.5, CFG.SWK_TOP_Y + 0.003, 1);
    makePlane(scene, M.robot, cx + laneOff, cz,  intSize, 2.5, CFG.SWK_TOP_Y + 0.003, -1);
    makePlane(scene, M.robot, cx - laneOff, cz,  intSize, 2.5, CFG.SWK_TOP_Y + 0.003, -1);
}

function buildRoads(scene) {
    corridor(scene,  42.5,   0,  64, 8,  1);
    corridor(scene, -42.5,   0,  64, 8,  1);
    corridor(scene,  42.5, -85,  64, 8,  1);
    corridor(scene, -42.5, -85,  64, 8,  1);
    corridor(scene,  42.5,  85,  64, 8,  1);
    corridor(scene, -42.5,  85,  64, 8,  1);
    corridor(scene,   0,  42.5,  64, 8, -1);
    corridor(scene,   0, -42.5,  64, 8, -1);
    corridor(scene,  85, -42.5,  64, 8, -1);
    corridor(scene,  85,  42.5,  64, 8, -1);
    corridor(scene, -85, -42.5,  64, 8, -1);
    corridor(scene, -85,  42.5,  64, 8, -1);
    [0, 85, -85].forEach(cx => [0, -85, 85].forEach(cz => buildIntersection(scene, cx, cz)));
    buildMarkings(scene);
}

function buildDashLine(scene, from, to, step, cx, cz, gap, dir) {
    for (let t = from; t <= to; t += step) {
        if (Math.abs(t) < gap) continue;
        makePlane(scene, M.dashW,
            dir === 1 ? t : cx,
            dir === -1 ? t : cz,
            5, 0.22, 0.015, dir);
    }
}

function buildMarkings(scene) {
    buildDashLine(scene, -70, 70, 10, 0,   0,  20,  1);
    buildDashLine(scene, -70, 70, 10, 0, -85,  20,  1);
    buildDashLine(scene, -70, 70, 10, 0,  85,  20,  1);
    buildDashLine(scene, -70, 70, 10, 0,   0,  20, -1);
    buildDashLine(scene, -70, 70, 10, 85,  0,  20, -1);
    buildDashLine(scene, -70, 70, 10, -85, 0,  20, -1);
}

// ── Lawn
function buildLawn(scene, b) {
    if (window.createGrassLawn) {
        window.createGrassLawn(scene, b.x, b.z, 64, 64);
    }
}

// ── Build world
function buildWorld(scene) {
    buildGround(scene);
    buildRoads(scene);
    CFG.BLOCKS.forEach(b => {
        buildLawn(scene, b);
        PawnEntities.placeBuildings(scene, b, CFG);
    });
    PawnEntities.buildGLBHouses(scene, CFG);
    PawnEntities.buildApartmentLabels(scene, CFG);
    PawnEntities.buildLamps(scene, 7, M, CFG.SWK_TOP_Y);
}