const _PATH_SURFACE_Y = (window.PATH_SURFACE_Y !== undefined) ? window.PATH_SURFACE_Y : 0.282;
const _RAIL_CENTER_Y  = (window.RAIL_CENTER_Y  !== undefined) ? window.RAIL_CENTER_Y  : _PATH_SURFACE_Y + 0.05;
const _MARKER_Y       = (window.MARKER_Y        !== undefined) ? window.MARKER_Y        : _PATH_SURFACE_Y + 0.1;

const WAYPOINTS = [
    /* 0*/[9.25,9.25],  /* 1*/[9.25,-9.25],  /* 2*/[-9.25,9.25],  /* 3*/[-9.25,-9.25],
    /* 4*/[9.25,-94.25],/* 5*/[9.25,-75.75], /* 6*/[-9.25,-94.25],/* 7*/[-9.25,-75.75],
    /* 8*/[9.25,94.25], /* 9*/[9.25,75.75],  /*10*/[-9.25,94.25], /*11*/[-9.25,75.75],
    /*12*/[94.25,9.25], /*13*/[94.25,-9.25], /*14*/[75.75,9.25],  /*15*/[75.75,-9.25],
    /*16*/[94.25,-94.25],/*17*/[94.25,-75.75],/*18*/[75.75,-94.25],/*19*/[75.75,-75.75],
    /*20*/[94.25,94.25],/*21*/[94.25,75.75], /*22*/[75.75,94.25], /*23*/[75.75,75.75],
    /*24*/[-94.25,9.25],/*25*/[-94.25,-9.25],/*26*/[-75.75,9.25], /*27*/[-75.75,-9.25],
    /*28*/[-94.25,-94.25],/*29*/[-94.25,-75.75],/*30*/[-75.75,-94.25],/*31*/[-75.75,-75.75],
    /*32*/[-94.25,94.25],/*33*/[-94.25,75.75],/*34*/[-75.75,94.25],/*35*/[-75.75,75.75],
    /*36*/[-9.25,-42.5], // Block A gate (left blocks, x=-9.25 rail)
    /*37*/[9.25,-42.5],  // Block B gate (right blocks, x=+9.25 rail)
    /*38*/[-9.25,42.5],  // Block C gate
    /*39*/[9.25,42.5],   // Block D gate
];

const OUTER_EDGES = [
    [24,26],[26,2],[2,0],[0,14],[14,12],
    [25,27],[27,3],[3,1],[1,15],[15,13],
    [33,35],[35,11],[11,9],[9,23],[23,21],
    [32,34],[34,10],[10,8],[8,22],[22,20],
    [29,31],[31,7],[7,5],[5,19],[19,17],
    [28,30],[30,6],[6,4],[4,18],[18,16],
    [4,5],[5,1],[1,0],[0,9],[9,8],
    [6,7],[7,3],[3,2],[2,11],[11,10],
    [18,19],[19,15],[15,14],[14,23],[23,22],
    [16,17],[17,13],[13,12],[12,21],[21,20],
    [30,31],[31,27],[27,26],[26,35],[35,34],
    [28,29],[29,25],[25,24],[24,33],[33,32],
    [3,36],[36,7],   // Block A gate on x=-9.25
    [1,37],[37,5],   // Block B gate on x=+9.25
    [2,38],[38,11],  // Block C gate on x=-9.25
    [0,39],[39,9],   // Block D gate on x=+9.25
];

const BLOCK_GATE_NODES = { A:36, B:37, C:38, D:39 };

const TRIANGLE_MARKERS = [];

const APARTMENT_DELIVERY_STOPS = [
    { key:'aptA1',label:'A1',x:75.75, z:75.75 },
    { key:'aptA2',label:'A2',x:94.25, z:75.75 },
    { key:'aptA3',label:'A3',x:75.75, z:94.25 },
    { key:'aptB1',label:'B1',x:-75.75,z:75.75 },
    { key:'aptB2',label:'B2',x:-94.25,z:75.75 },
    { key:'aptB3',label:'B3',x:-75.75,z:94.25 },
    { key:'aptC1',label:'C1',x:75.75, z:-75.75},
    { key:'aptC2',label:'C2',x:94.25, z:-75.75},
    { key:'aptC3',label:'C3',x:75.75, z:-94.25},
    { key:'aptD1',label:'D1',x:-75.75,z:-75.75},
    { key:'aptD2',label:'D2',x:-94.25,z:-75.75},
    { key:'aptD3',label:'D3',x:-75.75,z:-94.25},
];

// Bulid the internal net
function generateInternalGraph() {
    const IN = {A:[], B:[], C:[], D:[]};
    const IE = {A:[], B:[], C:[], D:[]};
    const BS = {A:{}, B:{}, C:{}, D:{}};
    CFG.BLOCKS.forEach(b => {
        const id = b.id;
        if (id === 'A' || id === 'C') {
            const dn = [
                {id:0, dx:10, dz:1.5},    
                {id:1, dx:28, dz:1.5},    
                {id:2, dx:10, dz:10},     
                {id:3, dx:-10, dz:10},    
                {id:4, dx:-10, dz:-10},   
                {id:5, dx:10, dz:-10},    
                {id:6, dx:20, dz:10},     
                {id:7, dx:20, dz:20},     
                {id:8, dx:-19.5, dz:10},  
                {id:9, dx:-19.5, dz:19.25},
                {id:10, dx:-19.5, dz:-10},
                {id:11, dx:-19.5, dz:-15},
                {id:12, dx:19.5, dz:-10}, 
                {id:13, dx:19.5, dz:-19.25} 
            ];
            IE[id] = [[5,0],[0,2],[4,3],[3,2],[4,5],[0,1],[2,6],[6,7],[3,8],[8,9],[4,10],[10,11],[5,12],[12,13]];
            IN[id] = dn.map(n => ({id: n.id, x: b.x + n.dx, z: b.z + n.dz}));
            BS[id] = { restaurant: 9, cafe: 7, house1: 11, house2: 13, house3: 4, gate: 1 };
        } else {
            const dn = [
                {id:0, dx:-10, dz:1.5},   
                {id:1, dx:-28, dz:1.5},   
                {id:2, dx:10, dz:15},     
                {id:3, dx:-10, dz:15},    
                {id:4, dx:-10, dz:-15},   
                {id:5, dx:10, dz:-15},    
                {id:6, dx:-10, dz:-10},   
                {id:7, dx:-20, dz:-10},   
                {id:8, dx:-20, dz:-20},   
                {id:9, dx:-10, dz:10},    
                {id:10, dx:-20, dz:10},  
                {id:11, dx:-20, dz:20},   
                {id:12, dx:10, dz:-10},   
                {id:13, dx:20, dz:-10},   
                {id:14, dx:20, dz:-20},   
                {id:15, dx:10, dz:10},    
                {id:16, dx:20, dz:10},    
                {id:17, dx:20, dz:20}     
            ];
            IE[id] = [[4,6],[6,0],[0,9],[9,3], [5,12],[12,15],[15,2], [3,2],[4,5], [0,1], [6,7],[7,8], [9,10],[10,11], [12,13],[13,14], [15,16],[16,17]];
            IN[id] = dn.map(n => ({id: n.id, x: b.x + n.dx, z: b.z + n.dz}));
            BS[id] = { restaurant: 11, cafe: 17, house1: 8, house2: 14, house3: 4, gate: 1 };
        }
    });
    return {IN, IE, BS};
}

// Build the entire path system
function buildRobotPath(scene) {
    const {IN, IE, BS} = generateInternalGraph();
    window.InternalNodes  = IN;
    window.InternalEdges  = IE;
    window.BuildingStops  = BS;
    
    buildInternalBlockPaths(scene);
    paintGateArrows(scene);
    paintApartmentArrows(scene);
    const waypoints = buildWaypoints(scene);
    const network   = buildPathNetwork(scene, waypoints);
    window.PathNetwork    = network;
    window.BlockGateNodes = BLOCK_GATE_NODES;

    const nodeMat = new THREE.MeshBasicMaterial({color: 0x00ffcc});
    const edgeMat = new THREE.LineBasicMaterial({color: 0x00aaff, linewidth: 2});
    
    CFG.BLOCKS.forEach(b => {
        const nodes = IN[b.id];
        const edges = IE[b.id];
        
        nodes.forEach(n => {
            const mat = nodeMat.clone();
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), mat);
            sphere.position.set(n.x, 0.45, n.z);
            n.mesh = sphere;
            n.originalMat = mat.clone();
            scene.add(sphere);
        });

        edges.forEach(([fId, tId]) => {
            const f = nodes.find(n => n.id === fId);
            const t = nodes.find(n => n.id === tId);
            if (f && t) {
                const pts = [new THREE.Vector3(f.x, 0.45, f.z), new THREE.Vector3(t.x, 0.45, t.z)];
                const geo = new THREE.BufferGeometry().setFromPoints(pts);
                const line = new THREE.Line(geo, edgeMat);
                scene.add(line);
            }
        });
    });
}

const INT_RAIL_MATS = {
    metallic: new THREE.MeshStandardMaterial({color:0x707880,metalness:0.9,roughness:0.35}),
    ties:     new THREE.MeshStandardMaterial({color:0x2f2f2f,metalness:0.45,roughness:0.7}),
};

function drawInternalRailSegment(scene,x,z,length,direction){
    const railOffset=0.16,railRadius=0.05,tieSpacing=3.8,elevation=0.43;
    const isX=(direction==='x'||direction===1);
    const half=length/2;
    function addTube(p1,p2){
        const geo=new THREE.TubeGeometry(new THREE.LineCurve3(p1,p2),32,railRadius,10,false);
        scene.add(new THREE.Mesh(geo,INT_RAIL_MATS.metallic));
    }
    if(isX){
        addTube(new THREE.Vector3(x-half,elevation,z+railOffset),new THREE.Vector3(x+half,elevation,z+railOffset));
        addTube(new THREE.Vector3(x-half,elevation,z-railOffset),new THREE.Vector3(x+half,elevation,z-railOffset));
        for(let t=-half;t<=half;t+=tieSpacing){const tie=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.05,0.5),INT_RAIL_MATS.ties);tie.position.set(x+t,elevation-0.02,z);scene.add(tie);}
    } else {
        addTube(new THREE.Vector3(x+railOffset,elevation,z-half),new THREE.Vector3(x+railOffset,elevation,z+half));
        addTube(new THREE.Vector3(x-railOffset,elevation,z-half),new THREE.Vector3(x-railOffset,elevation,z+half));
        for(let t=-half;t<=half;t+=tieSpacing){const tie=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.05,0.25),INT_RAIL_MATS.ties);tie.position.set(x,elevation-0.02,z+t);scene.add(tie);}
    }
}

function drawInternalCompoundPath(scene,x,z,length,direction){
    const isX=(direction==='x'||direction===1);
    const trackMat=new THREE.MeshStandardMaterial({color:0x3d3d3d,roughness:0.9});
    const trackGeo=isX?new THREE.BoxGeometry(length,0.05,0.9):new THREE.BoxGeometry(0.9,0.05,length);
    const trackMesh=new THREE.Mesh(trackGeo,trackMat);
    trackMesh.position.set(x,0.38,z);
    trackMesh.receiveShadow=true;
    scene.add(trackMesh);
    drawInternalRailSegment(scene,x,z,length,direction);
}

function buildInternalBlockPaths(scene){
    const walkwayMat=new THREE.MeshLambertMaterial({color:0x9C3D1E});
    const tileSize=2,gap=0.5,step=tileSize+gap;
    CFG.BLOCKS.forEach(b=>{
        if(b.id==='C'||b.id==='A'){
            for(let xOff=30;xOff>=10;xOff-=step) makePlane(scene,walkwayMat,b.x+xOff+2,b.z-0.3,tileSize,tileSize,0.35);
            for(let zOff=10;zOff<=19.5;zOff+=step) makePlane(scene,walkwayMat,b.x-21,b.z+zOff,2.5,tileSize,0.35);
            for(let zOff=10;zOff<=20;zOff+=step)   makePlane(scene,walkwayMat,b.x+21.5,b.z+zOff,2.5,tileSize,0.35);
            for(let zOff=10;zOff<=15;zOff+=step)   makePlane(scene,walkwayMat,b.x-21,b.z-zOff,2.5,tileSize,0.35);
            for(let zOff=10;zOff<=19.5;zOff+=step) makePlane(scene,walkwayMat,b.x+21,b.z-zOff-1,2.5,tileSize,0.35);
            drawInternalCompoundPath(scene,b.x+21,b.z+1.5,22,'x');
            drawInternalCompoundPath(scene,b.x,b.z+10,20,'x');
            drawInternalCompoundPath(scene,b.x,b.z-10,20,'x');
            drawInternalCompoundPath(scene,b.x-10,b.z,20,'z');
            drawInternalCompoundPath(scene,b.x+10,b.z,20,'z');
            drawInternalCompoundPath(scene,b.x-12,b.z+10,15,'x');
            drawInternalCompoundPath(scene,b.x-19.5,b.z+14.5,9.5,'z');
            drawInternalCompoundPath(scene,b.x+15,b.z+10,10,'x');
            drawInternalCompoundPath(scene,b.x+20,b.z+15,10,'z');
            drawInternalCompoundPath(scene,b.x-12,b.z-10,15,'x');
            drawInternalCompoundPath(scene,b.x-19.5,b.z-12.5,5,'z');
            drawInternalCompoundPath(scene,b.x+12,b.z-10,15,'x');
            drawInternalCompoundPath(scene,b.x+19.5,b.z-14.5,9.5,'z');
        } else {
            for(let xOff=30;xOff>=10;xOff-=step) makePlane(scene,walkwayMat,b.x-xOff,b.z-0.3,tileSize,tileSize,0.35);
            for(let zOff=10;zOff<=20;zOff+=step){
                makePlane(scene,walkwayMat,b.x-21.5,b.z-zOff,2.5,tileSize,0.35);
                makePlane(scene,walkwayMat,b.x-21.5,b.z+zOff,2.5,tileSize,0.35);
                makePlane(scene,walkwayMat,b.x+21.5,b.z-zOff,2.5,tileSize,0.35);
                makePlane(scene,walkwayMat,b.x+21.5,b.z+zOff,2.5,tileSize,0.35);
            }
            drawInternalCompoundPath(scene,b.x-21,b.z+1.5,22,'x');
            drawInternalCompoundPath(scene,b.x,b.z+15,20,'x');
            drawInternalCompoundPath(scene,b.x,b.z-15,20,'x');
            drawInternalCompoundPath(scene,b.x-10,b.z,30,'z');
            drawInternalCompoundPath(scene,b.x+10,b.z,30,'z');
            drawInternalCompoundPath(scene,b.x-15,b.z-10,10,'x');
            drawInternalCompoundPath(scene,b.x-20,b.z-15,10,'z');
            drawInternalCompoundPath(scene,b.x-15,b.z+10,10,'x');
            drawInternalCompoundPath(scene,b.x-20,b.z+15,10,'z');
            drawInternalCompoundPath(scene,b.x+15,b.z-10,10,'x');
            drawInternalCompoundPath(scene,b.x+20,b.z-15,10,'z');
            drawInternalCompoundPath(scene,b.x+15,b.z+10,10,'x');
            drawInternalCompoundPath(scene,b.x+20,b.z+15,10,'z');
        }
    });
}

function addArrow(scene,x,z,rotY,opts){
    const baseColor=opts&&opts.delivery?0x3ecf7a:0xf2c94c;
    const emissive =opts&&opts.delivery?0x0a3020:0x3a2a00;
    const mat=new THREE.MeshStandardMaterial({color:baseColor,emissive,metalness:0.2,roughness:0.7});
    const shape=new THREE.Shape();
    shape.moveTo(0,0.8);shape.lineTo(0.5,-0.4);shape.lineTo(-0.5,-0.4);shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:0.12,bevelEnabled:false});
    const m=new THREE.Mesh(geo,mat);
    m.rotation.x=-Math.PI/2; m.rotation.z=rotY;
    m.position.set(x,_MARKER_Y+0.06,z);
    m.castShadow=true; m.receiveShadow=true;
    scene.add(m);
    return m;
}

function paintGateArrows(scene){
    ['A','B','C','D'].forEach(id=>{
        const gateNodeIdx = BLOCK_GATE_NODES[id];
        const [wx,wz] = WAYPOINTS[gateNodeIdx];
        const rotY = (id==='A'||id==='C') ? Math.PI/2 : -Math.PI/2;
        const gm = window.__GateMarkers && window.__GateMarkers[id];
        const ax = gm ? gm.x : wx;
        const az = gm ? gm.z : wz;
        TRIANGLE_MARKERS.push({
            id: TRIANGLE_MARKERS.length,
            x: ax, z: az,
            r: rotY, mesh: null,
            gateKey: `gate${id}`, blockId: id,
            outerNodeId: gateNodeIdx,
        });
    });
}

function paintApartmentArrows(scene){
    APARTMENT_DELIVERY_STOPS.forEach(apt=>{
        const rotY=apt.x>0?-Math.PI/2:Math.PI/2;
        const mesh=addArrow(scene,apt.x,apt.z,rotY,{delivery:true});
        TRIANGLE_MARKERS.push({
            id:TRIANGLE_MARKERS.length,x:apt.x,z:apt.z,
            r:rotY,mesh,deliveryLabel:apt.label,destKey:apt.key,
        });
    });
}

function buildWaypoints(scene){
    const mat=new THREE.MeshStandardMaterial({color:0x58f58a,emissive:0x0f3d1e,metalness:0.35,roughness:0.45});
    const gateNodeIds = new Set(Object.values(BLOCK_GATE_NODES));
    const gateMat=new THREE.MeshStandardMaterial({color:0xf2c94c,emissive:0x3a2000,metalness:0.35,roughness:0.45});
    return WAYPOINTS.map(([x,z],idx)=>{
        const useMat = gateNodeIds.has(idx) ? gateMat.clone() : mat.clone();
        const ring=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.14,8,20),useMat);
        ring.rotation.x=Math.PI/2;
        ring.position.set(x,_MARKER_Y+0.01,z);
        ring.castShadow=true; ring.receiveShadow=true;
        ring.userData.nodeId=idx;
        scene.add(ring);
        return {id:idx,x,z,mesh:ring, originalMat: useMat.clone()};
    });
}

function buildPathNetwork(scene,nodes){
    const segmentMeshes=[];
    const segMat=new THREE.MeshBasicMaterial({color:0x66ccff,transparent:true,opacity:0.12});

    OUTER_EDGES.forEach(([fromId,toId])=>{
        const a=nodes[fromId], b=nodes[toId];
        if(!a||!b) return;
        const dx=b.x-a.x, dz=b.z-a.z;
        const len=Math.hypot(dx,dz);
        const isX=Math.abs(dz)<Math.abs(dx);
        const mesh=new THREE.Mesh(
            isX ? new THREE.BoxGeometry(len,0.03,2.5) : new THREE.BoxGeometry(2.5,0.03,len),
            segMat.clone()
        );
        mesh.position.set((a.x+b.x)/2,_MARKER_Y-0.025,(a.z+b.z)/2);
        mesh.userData.edge={from:fromId,to:toId};
        scene.add(mesh);
        segmentMeshes.push(mesh);
    });

    return {
        nodes,
        edges: OUTER_EDGES.map(([from,to])=>({from,to})),
        segmentMeshes,
        triangles: TRIANGLE_MARKERS.slice(),
    };
}

function buildInternalNetwork(blockId){
    const nodes=window.InternalNodes[blockId];
    const edgePairs=window.InternalEdges[blockId];
    const edges=edgePairs.map(([f,t])=>({from:f,to:t}));
    const adj={};
    nodes.forEach(n=>adj[n.id]=[]);
    edges.forEach(e=>{adj[e.from].push(e.to);adj[e.to].push(e.from);});
    return {nodes,edges,adj};
}

window.buildInternalNetwork = buildInternalNetwork;
window.buildRobotPath = buildRobotPath;