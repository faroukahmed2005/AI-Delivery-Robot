// ── pawns.js ───────────────────────────────────────────────────
// Scene entities (pawns): lamps, building placement, and houses.

(function initPawnEntities(global) {
    function placeBuildings(scene, block, cfg) {
        cfg.DICE5.forEach(s => {
            const bx = block.x + s.dx * cfg.BLOCK;
            const bz = block.z + s.dz * cfg.BLOCK;

            if (s.type === 'cafe') {
                if (block.id === 'A') buildCafe(scene, bx, bz);
                else if (block.id === 'B') buildCafe2(scene, bx, bz);
                else if (block.id === 'C') buildCafe3(scene, bx, bz);
                else if (block.id === 'D') buildCafe4(scene, bx, bz);
            } else if (s.type === 'restaurant') {
                if (block.id === 'A') placeRestaurant3(scene, bx, bz);
                else if (block.id === 'B') placeRestaurant2(scene, bx, bz);
                else if (block.id === 'C') placeRestaurant1(scene, bx, bz);
                else if (block.id === 'D') placeRestaurant4(scene, bx, bz);
            }
        });
    }

    // ── Dispatch table: each house gets its own dedicated builder ──
    // To change a specific house, edit its houseXY.js file directly.
    const HOUSE_BUILDERS = {
        A: [buildHouseA1, buildHouseA2, buildHouseA3],
        B: [buildHouseB1, buildHouseB2, buildHouseB3],
        C: [buildHouseC1, buildHouseC2, buildHouseC3],
        D: [buildHouseD1, buildHouseD2, buildHouseD3],
    };

    function buildGLBHouses(scene, cfg) {
        cfg.BLOCKS.forEach(block => {
            let houseIdx = 0;
            cfg.DICE5.forEach(cell => {
                if (cell.type !== 'house') return;
                const x = block.x + cell.dx * cfg.BLOCK;
                const z = block.z + cell.dz * cfg.BLOCK;
                const builders = HOUSE_BUILDERS[block.id];
                if (builders && builders[houseIdx]) {
                    builders[houseIdx](scene, x, z);
                }
                houseIdx++;
            });
        });
    }

    function buildLamp(scene, x, z, mats, sidewalkTopY) {
        const poleHeight = 7;
        const armY = sidewalkTopY + poleHeight - 0.4;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, poleHeight, 6), mats.pole);
        pole.position.set(x, sidewalkTopY + poleHeight / 2, z);
        pole.castShadow = true;
        scene.add(pole);

        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2, 5), mats.pole);
        arm.rotation.z = Math.PI / 2;
        arm.position.set(x + 1, armY, z);
        scene.add(arm);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 6), mats.lampHead);
        head.position.set(x + 2, armY, z);
        scene.add(head);
    }

    function buildLamps(scene, sidewalkBandCenter, mats, sidewalkTopY) {
        for (let i = -3; i <= 3; i++) {
            if (i === 0) continue;
            const t = i * 26;
            buildLamp(scene, t, sidewalkBandCenter, mats, sidewalkTopY);
            buildLamp(scene, t, -sidewalkBandCenter, mats, sidewalkTopY);
            buildLamp(scene, sidewalkBandCenter, t, mats, sidewalkTopY);
            buildLamp(scene, -sidewalkBandCenter, t, mats, sidewalkTopY);
        }
    }

    function makeTextSprite(label) {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 128;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(28, 30, 200, 68);
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 3;
        ctx.strokeRect(28, 30, 200, 68);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 128, 64);

        const tex = new THREE.CanvasTexture(c);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(5.6, 2.8, 1);
        return sprite;
    }

    // Label heights per building type (tune if models are taller/shorter)
    const LABEL_Y = { house: 18, restaurant: 22, cafe: 18 };

    function buildApartmentLabels(scene, cfg) {
        cfg.BLOCKS.forEach(block => {
            let houseIdx = 0;
            cfg.DICE5.forEach(cell => {
                const x = block.x + cell.dx * cfg.BLOCK;
                const z = block.z + cell.dz * cfg.BLOCK;

                let label = '';
                if (cell.type === 'house') {
                    houseIdx += 1;
                    label = `${block.id}${houseIdx}`;
                } else if (cell.type === 'restaurant') {
                    label = `${block.id}-R`;
                } else if (cell.type === 'cafe') {
                    label = `${block.id}-C`;
                }

                if (!label) return;
                const y = LABEL_Y[cell.type] || 15;
                const s = makeTextSprite(label);
                s.position.set(x, y, z);
                scene.add(s);
            });
        });
    }

    global.PawnEntities = {
        placeBuildings,
        buildGLBHouses,
        buildLamps,
        buildApartmentLabels,
    };
})(window);