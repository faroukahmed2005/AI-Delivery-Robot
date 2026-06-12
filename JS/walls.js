(function () {
    if (typeof THREE === 'undefined') return;

    const PATH_SURFACE_Y = 0.282;

    const BLOCK_HALF = 32;
    const BLOCKS = {
        A: { x: -42.5, z: -42.5 },
        B: { x: 42.5, z: -42.5 },
        C: { x: -42.5, z: 42.5 },
        D: { x: 42.5, z: 42.5 },
    };

    const WALL = {
        height: 2.6,
        thickness: 0.7,
        inset: 0.3,       
        capH: 0.22,
        capInset: 0.05,
        color: 0x8a8880,
        capColor: 0x6e6c68,
    };

    const GATE = {
        opening: 6.0,
        frameW: 0.28,
        frameDepth: 0.55,
        frameH: 3.0,
        panelH: 2.25,
        panelD: 0.18,
        panelW: 2.9, 
        frameColor: 0x445566,
        panelColor: 0x8a949e,
        closedGlow: 0xff2200,
        openGlow: 0x00ff88,
    };

    const DOCK = {
        size: 4.0,
        h: 0.28,
        color: 0x334455,
        y: PATH_SURFACE_Y + 0.02,
        ringR: 1.55,
        ringTube: 0.08,
        ringColor: 0x6fe7ff,
        ringEmissive: 0x0a2a33,
    };

    // Get (Gate / Wall) Positions
    function gateSpecForBlock(id) {
        const b = BLOCKS[id];
        if (!b) return null;
        const isLeft = b.x < 0;
        const side = isLeft ? 'E' : 'W'; 
        const edgeX = b.x + (isLeft ? +BLOCK_HALF : -BLOCK_HALF);
        const wallX = edgeX - (isLeft ? WALL.inset : -WALL.inset); 
        const streetDir = isLeft ? +1 : -1; 
        return { side, wallX, streetDir };
    }

    function makeMat(color, metalness, roughness, emissive) {
        return new THREE.MeshStandardMaterial({
            color,
            metalness: metalness ?? 0.1,
            roughness: roughness ?? 0.85,
            emissive: emissive ?? 0x000000,
            emissiveIntensity: emissive ? 0.65 : 1.0,
        });
    }

    function makeBox(w, h, d, mat) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.castShadow = true;
        m.receiveShadow = true;
        return m;
    }

    const __gateRuntime = {
        gates: {}, 
        started: false,
    };

    // Build walls around a block
    function buildPerimeterWall(scene, blockId) {
        const b = BLOCKS[blockId];
        const spec = gateSpecForBlock(blockId);
        if (!b || !spec) return null;

        const group = new THREE.Group();
        group.name = `BlockWall_${blockId}`;

        const wallMat = makeMat(WALL.color, 0.0, 0.95);
        const capMat = makeMat(WALL.capColor, 0.0, 0.9);

        const y = PATH_SURFACE_Y + WALL.height / 2 + 0.02;
        const capY = PATH_SURFACE_Y + WALL.height + WALL.capH / 2 + 0.02;

        const minX = b.x - BLOCK_HALF + WALL.inset;
        const maxX = b.x + BLOCK_HALF - WALL.inset;
        const minZ = b.z - BLOCK_HALF + WALL.inset;
        const maxZ = b.z + BLOCK_HALF - WALL.inset;

        const spanX = maxX - minX;
        const spanZ = maxZ - minZ;

        const opening = GATE.opening;
        const gap = opening + 0.35; 
        const halfGap = gap / 2;

        {
            const zN = maxZ;
            const zS = minZ;
            const wSeg = spanX;
            const north = makeBox(wSeg, WALL.height, WALL.thickness, wallMat);
            north.position.set(b.x, y, zN);
            group.add(north);
            const northCap = makeBox(wSeg - WALL.capInset * 2, WALL.capH, WALL.thickness - WALL.capInset * 2, capMat);
            northCap.position.set(b.x, capY, zN);
            group.add(northCap);

            const south = makeBox(wSeg, WALL.height, WALL.thickness, wallMat);
            south.position.set(b.x, y, zS);
            group.add(south);
            const southCap = makeBox(wSeg - WALL.capInset * 2, WALL.capH, WALL.thickness - WALL.capInset * 2, capMat);
            southCap.position.set(b.x, capY, zS);
            group.add(southCap);
        }

        function addZWallsWithOptionalGate(xWall, hasGate) {
            const zMid = b.z;
            const fullLen = spanZ;
            const segLen = hasGate ? (fullLen / 2 - halfGap) : fullLen;
            const makeSeg = (zCenter, len) => {
                const seg = makeBox(WALL.thickness, WALL.height, len, wallMat);
                seg.position.set(xWall, y, zCenter);
                group.add(seg);
                const cap = makeBox(WALL.thickness - WALL.capInset * 2, WALL.capH, Math.max(0.2, len - WALL.capInset * 2), capMat);
                cap.position.set(xWall, capY, zCenter);
                group.add(cap);
            };

            if (!hasGate) {
                makeSeg(zMid, fullLen);
                return;
            }

            // Two segments above/below the opening
            const topCenter = b.z + (halfGap + segLen / 2);
            const botCenter = b.z - (halfGap + segLen / 2);
            makeSeg(topCenter, segLen);
            makeSeg(botCenter, segLen);
        }

        const xE = maxX;
        const xW = minX;
        if (spec.side === 'E') {
            addZWallsWithOptionalGate(xE, true);
            addZWallsWithOptionalGate(xW, false);
        } else {
            addZWallsWithOptionalGate(xW, true);
            addZWallsWithOptionalGate(xE, false);
        }

        scene.add(group);
        return { group, bounds: { minX, maxX, minZ, maxZ }, gateWallX: spec.wallX, gateSide: spec.side, streetDir: spec.streetDir };
    }

    function buildGate(scene, blockId, wallInfo) {
        const b = BLOCKS[blockId];
        const spec = gateSpecForBlock(blockId);
        if (!b || !spec || !wallInfo) return null;

        const gate = new THREE.Group();
        gate.name = `BlockGate_${blockId}`;

        const x = wallInfo.gateWallX;
        const z = b.z;
        const baseY = PATH_SURFACE_Y + 0.02;

        const frameMat = makeMat(GATE.frameColor, 0.85, 0.35);
        const panelMat = makeMat(GATE.panelColor, 0.65, 0.45);

        const postH = GATE.frameH;
        const postW = GATE.frameW;
        const postD = GATE.frameDepth;

        const leftPost = makeBox(postD, postH, postW, frameMat);  
        const rightPost = makeBox(postD, postH, postW, frameMat);
        leftPost.position.set(0, postH / 2, -GATE.opening / 2);
        rightPost.position.set(0, postH / 2, +GATE.opening / 2);
        gate.add(leftPost, rightPost);

        const topBeam = makeBox(postD, postW, GATE.opening + postW * 2, frameMat);
        topBeam.position.set(0, postH - postW / 2, 0);
        gate.add(topBeam);

        const panelY = Math.min(postH - 0.35, GATE.panelH) / 2 + 0.25;
        const panelH = Math.min(postH - 0.55, GATE.panelH);
        const panelD = GATE.panelD;
        const panelW = GATE.panelW;

        const panelL = makeBox(panelD, panelH, panelW, panelMat);
        const panelR = makeBox(panelD, panelH, panelW, panelMat);
        panelL.position.set(0.02, panelY, -panelW / 2 + 0.02);
        panelR.position.set(0.02, panelY, +panelW / 2 - 0.02);
        gate.add(panelL, panelR);

        const lightGeo = new THREE.SphereGeometry(0.16, 12, 10);
        const lightMat = makeMat(0xffffff, 0.0, 0.2, GATE.closedGlow);
        lightMat.emissiveIntensity = 1.3;
        const indicator = new THREE.Mesh(lightGeo, lightMat);
        indicator.position.set(postD / 2 + 0.12, postH - 0.65, 0);
        indicator.castShadow = false;
        gate.add(indicator);

        gate.position.set(x, baseY, z);
        gate.position.x += wallInfo.streetDir * (WALL.thickness * 0.12);

        scene.add(gate);

        const runtime = {
            id: blockId,
            gate,
            panelL,
            panelR,
            indicatorMat: lightMat,
            state: 'closed',
            target: 0,  
            openness: 0,
            wallInfo,
        };
        __gateRuntime.gates[blockId] = runtime;
        return runtime;
    }

    // Build The Front Platform
    function buildDock(scene, blockId, wallInfo) {
        const b = BLOCKS[blockId];
        if (!b || !wallInfo) return null;

        const group = new THREE.Group();
        group.name = `BlockDock_${blockId}`;

        const streetDir = wallInfo.streetDir;
        const dockX = wallInfo.gateWallX + streetDir * (WALL.thickness * 0.7 + 2.65);
        const dockZ = b.z;

        const dockMat = makeMat(DOCK.color, 0.35, 0.6);
        const platform = makeBox(DOCK.size, DOCK.h, DOCK.size, dockMat);
        platform.position.set(dockX, DOCK.y + DOCK.h / 2, dockZ);
        group.add(platform);

        const ringMat = makeMat(DOCK.ringColor, 0.15, 0.35, DOCK.ringEmissive);
        ringMat.emissiveIntensity = 0.9;
        ringMat.transparent = true;
        ringMat.opacity = 0.7;

        const ring = new THREE.Mesh(new THREE.TorusGeometry(DOCK.ringR, DOCK.ringTube, 10, 28), ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(dockX, DOCK.y + DOCK.h + 0.02, dockZ);
        ring.castShadow = false;
        ring.receiveShadow = false;
        group.add(ring);

        scene.add(group);
        return { group, platform, ring, pos: { x: dockX, z: dockZ } };
    }

    function ensureTicker() {
        if (__gateRuntime.started) return;
        __gateRuntime.started = true;
        let last = performance.now();
        (function loop() {
            requestAnimationFrame(loop);
            const now = performance.now();
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            tick(dt);
        })();
    }

    function buildGateArrow(scene, blockId, wallInfo) {
        if (!wallInfo) return;
        const b = BLOCKS[blockId];
        if (!b) return;
        const arrowX = wallInfo.gateWallX + wallInfo.streetDir * 2.5;
        const arrowZ = b.z;
        const rotY = wallInfo.streetDir > 0 ? -Math.PI / 2 : Math.PI / 2;
        const mat = new THREE.MeshStandardMaterial({ color: 0xf2c94c, emissive: 0x3a2a00, metalness: 0.2, roughness: 0.7 });
        const shape = new THREE.Shape();
        shape.moveTo(0, 0.8); shape.lineTo(0.5, -0.4); shape.lineTo(-0.5, -0.4); shape.closePath();
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false });
        const m = new THREE.Mesh(geo, mat);
        m.rotation.x = -Math.PI / 2;
        m.rotation.z = rotY;
        m.position.set(arrowX, PATH_SURFACE_Y + 0.15, arrowZ);
        m.castShadow = true; m.receiveShadow = true;
        scene.add(m);
        if (!window.__GateMarkers) window.__GateMarkers = {};
        window.__GateMarkers[blockId] = { x: arrowX, z: arrowZ, rotY };
    }


    function buildWalls(scene) {
        if (!scene) return;
        if (scene.userData && scene.userData.__wallsBuilt) return;
        if (!scene.userData) scene.userData = {};
        scene.userData.__wallsBuilt = true;

        const docks = {};
        ['A', 'B', 'C', 'D'].forEach(id => {
            const wallInfo = buildPerimeterWall(scene, id);
            const gateRt = buildGate(scene, id, wallInfo);
            buildGateArrow(scene, id, wallInfo);
            if (gateRt) {
                gateRt.target = 0;
                gateRt.openness = 0;
                setGatePanels(gateRt, 0);
                setGateIndicator(gateRt, false);
            }
        });

        window.__BlockDocks = docks;
        ensureTicker();
    }

    function openGate(blockId) {}
    function closeGate(blockId) {}
    function setGateIndicator(runtime, open) {}
    function setGatePanels(runtime, openness01) {}
    function tick(dt) {}

    function getGatePosition(blockId) {
        const id = String(blockId || '').toUpperCase();
        const d = window.__BlockDocks && window.__BlockDocks[id];
        if (!d) return null;
        return { x: d.pos.x, z: d.pos.z };
    }

    window.BlockGates = {
        openGate,
        closeGate,
        getGatePosition,
    };

    function hook() {
        if (typeof window.buildPaths === 'function' && !window.buildPaths.__wallsHooked) {
            const orig = window.buildPaths;
            const wrapped = function (scene) {
                const r = orig(scene);
                try { buildWalls(scene); } catch (e) { /* ignore */ }
                return r;
            };
            wrapped.__wallsHooked = true;
            window.buildPaths = wrapped;
            return true;
        }
        return false;
    }

    if (!hook()) {
        let tries = 0;
        const t = setInterval(() => {
            tries++;
            if (hook() || tries > 120) clearInterval(t);
        }, 50);
    }
})();