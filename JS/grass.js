/**
 * grass.js
 * Procedural grass texture generation and lawn building.
 */

function makeGrassTexture() {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    
    // Base green
    ctx.fillStyle = '#3a6b2a';
    ctx.fillRect(0, 0, size, size);
    
    // Add noise and grass blade variations
    for (let i = 0; i < 15000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const h = 2 + Math.random() * 5;
        const w = 1 + Math.random() * 2;
        
        const r = Math.random();
        if (r < 0.3) ctx.fillStyle = '#4a8a2a';
        else if (r < 0.6) ctx.fillStyle = '#2d5a1e';
        else if (r < 0.8) ctx.fillStyle = '#5c9a3a';
        else ctx.fillStyle = '#1e3a12';
        
        ctx.fillRect(x, y, w, h);
    }
    
    // Subtle organic patches
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const rad = 20 + Math.random() * 60;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
        grad.addColorStop(0, 'rgba(40, 80, 20, 0.15)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    
    // Create a bump map from the same canvas (grayscale version)
    const bumpC = document.createElement('canvas');
    bumpC.width = bumpC.height = size;
    const bCtx = bumpC.getContext('2d');
    bCtx.filter = 'grayscale(100%) contrast(150%)';
    bCtx.drawImage(c, 0, 0);
    const bumpTex = new THREE.CanvasTexture(bumpC);
    bumpTex.wrapS = bumpTex.wrapT = THREE.RepeatWrapping;
    bumpTex.repeat.set(4, 4);
    
    return { map: tex, bumpMap: bumpTex };
}

/**
 * Creates 3D grass blades using InstancedMesh for high performance.
 */
function createBlades(scene, x, z, width, length) {
    const count = 4000;
    const bladeGeo = new THREE.PlaneGeometry(0.15, 0.4, 1, 1);
    bladeGeo.translate(0, 0.2, 0); // Pivot at bottom
    
    const bladeMat = new THREE.MeshStandardMaterial({
        color: 0x4a8a2a,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
        transparent: true,
        roughness: 0.8
    });
    
    const mesh = new THREE.InstancedMesh(bladeGeo, bladeMat, count);
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
        const px = (Math.random() - 0.5) * width;
        const pz = (Math.random() - 0.5) * length;
        
        dummy.position.set(x + px, 0.03, z + pz);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.rotation.x = (Math.random() - 0.5) * 0.2; // Slight tilt
        
        const scale = 0.5 + Math.random() * 1.5;
        dummy.scale.set(scale, scale, scale);
        
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        
        // Vary color slightly
        const col = new THREE.Color().setHSL(0.25 + Math.random() * 0.1, 0.5, 0.3 + Math.random() * 0.2);
        mesh.setColorAt(i, col);
    }
    
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
}

/**
 * Creates a grass lawn with 3D blades and adds it to the scene.
 */
window.createGrassLawn = function(scene, x, z, width, length, y = 0.03) {
    if (!window.__grassAssets) {
        const textures = makeGrassTexture();
        window.__grassAssets = {
            material: new THREE.MeshStandardMaterial({ 
                map: textures.map,
                bumpMap: textures.bumpMap,
                bumpScale: 0.05,
                color: 0xddffdd, 
                roughness: 0.8, 
                metalness: 0.02
            })
        };
    }

    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(width, length),
        window.__grassAssets.material
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    // Add 3D blades
    createBlades(scene, x, z, width, length);
    
    return mesh;
};
