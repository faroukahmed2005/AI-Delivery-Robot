/**
 * robot.js
 * Handles robot meshes, classes, and the main animation loop.
 */

function setShadows(obj){obj.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});}

// ── Weathered metal texture ───────────────────────────────────────────────
function makeWeatheredMetal(baseColor,rustColor){
    const size=256;const c=document.createElement('canvas');c.width=c.height=size;
    const ctx=c.getContext('2d');
    ctx.fillStyle=baseColor;ctx.fillRect(0,0,size,size);
    for(let i=0;i<2600;i++){ctx.fillStyle=`rgba(35,35,35,${0.05+Math.random()*0.2})`;ctx.beginPath();ctx.arc(Math.random()*size,Math.random()*size,Math.random()*2.1,0,Math.PI*2);ctx.fill();}
    for(let i=0;i<150;i++){ctx.globalAlpha=0.1+Math.random()*0.22;ctx.fillStyle=rustColor;ctx.fillRect(Math.random()*size,Math.random()*size,8+Math.random()*34,5+Math.random()*20);}
    ctx.globalAlpha=1;
    const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(1.2,1.2);return tex;
}

// ── Outer robot mesh (Wall-E style) ──────────────────────────────────────
function buildRobotMesh(){
    const g=new THREE.Group();
    const bodyTex=makeWeatheredMetal('#b88a2f','#6b3f16');
    const darkTex=makeWeatheredMetal('#404449','#332b24');
    const matBody=new THREE.MeshStandardMaterial({color:0xc7963b,map:bodyTex,roughness:0.9,metalness:0.35});
    const matRust=new THREE.MeshStandardMaterial({color:0x8e5d24,map:bodyTex,roughness:0.95,metalness:0.2});
    const matDark=new THREE.MeshStandardMaterial({color:0x3a3f45,map:darkTex,roughness:0.8,metalness:0.55});
    const matRubber=new THREE.MeshStandardMaterial({color:0x1f2124,roughness:0.92,metalness:0.08});
    const matEyeShell=new THREE.MeshStandardMaterial({color:0x555a61,roughness:0.55,metalness:0.85});
    const matEyeGlass=new THREE.MeshPhysicalMaterial({color:0x9ec7e8,roughness:0.08,metalness:0.02,transmission:0.65,transparent:true,opacity:0.92,clearcoat:1.0});
    const matLensInner=new THREE.MeshStandardMaterial({color:0x0c1118,roughness:0.2,metalness:0.75});
    const matWarn=new THREE.MeshStandardMaterial({color:0xffd34f,roughness:0.6,metalness:0.2});
    const matScreen=new THREE.MeshStandardMaterial({color:0x6cb5d3,emissive:0x143445,roughness:0.25,metalness:0.5});
    const wheelGeo=new THREE.CylinderGeometry(0.25,0.25,0.18,20);
    const hubGeo=new THREE.CylinderGeometry(0.1,0.1,0.22,14);
    const wheelX=0.78,wheelY=0.27;
    [[-wheelX,0.42],[-wheelX,-0.42],[wheelX,0.42],[wheelX,-0.42]].forEach(([x,z])=>{
        const w=new THREE.Mesh(wheelGeo,matRubber);w.rotation.z=Math.PI/2;w.position.set(x,wheelY,z);g.add(w);
        const hub=new THREE.Mesh(hubGeo,matDark);hub.rotation.z=Math.PI/2;hub.position.set(x,wheelY,z);g.add(hub);
    });
    const sideSkirtL=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.36,1.12),matDark);sideSkirtL.position.set(-0.67,0.45,0);g.add(sideSkirtL);
    const sideSkirtR=sideSkirtL.clone();sideSkirtR.position.x=0.67;g.add(sideSkirtR);
    const base=new THREE.Mesh(new THREE.BoxGeometry(1.38,0.36,1.2),matRust);base.position.y=0.62;g.add(base);
    const body=new THREE.Mesh(new THREE.BoxGeometry(1.12,1.14,1.02),matBody);body.position.y=1.28;g.add(body);
    const panel=new THREE.Mesh(new THREE.BoxGeometry(0.84,0.45,0.08),matRust);panel.position.set(0,1.22,0.55);g.add(panel);
    const screen=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.2,0.02),matScreen);screen.position.set(0,1.05,0.6);g.add(screen);
    const w1=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.08,0.01),matWarn);w1.position.set(-0.24,1.33,0.6);g.add(w1);
    const w2=w1.clone();w2.position.set(0.24,1.05,0.6);g.add(w2);
    const hatch=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.18,0.05),matDark);hatch.position.set(0,1.4,0.6);g.add(hatch);
    for(let i=0;i<6;i++){const seg=new THREE.Mesh(new THREE.TorusGeometry(0.12,0.03,8,16),matDark);seg.rotation.x=Math.PI/2;seg.position.set(0,1.87+i*0.08,-0.08-i*0.015);g.add(seg);}
    const headRig=new THREE.Group();headRig.position.set(0.02,2.34,0.1);headRig.rotation.z=-0.08;g.add(headRig);
    const eyeBridge=new THREE.Mesh(new THREE.BoxGeometry(0.92,0.17,0.18),matEyeShell);eyeBridge.position.set(0,0,0.06);headRig.add(eyeBridge);
    const eyeL=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.24,0.46,20),matEyeShell);eyeL.rotation.z=Math.PI/2;eyeL.position.set(-0.28,0,0.15);headRig.add(eyeL);
    const eyeR=eyeL.clone();eyeR.position.x=0.3;headRig.add(eyeR);
    const lensL=new THREE.Mesh(new THREE.SphereGeometry(0.14,18,14),matEyeGlass);lensL.position.set(-0.28,0,0.34);headRig.add(lensL);
    const lensR=lensL.clone();lensR.position.x=0.3;headRig.add(lensR);
    const irisL=new THREE.Mesh(new THREE.CircleGeometry(0.065,18),matLensInner);irisL.position.set(-0.28,0,0.47);headRig.add(irisL);
    const irisR=irisL.clone();irisR.position.x=0.3;headRig.add(irisR);
    function addArm(side){
        const s=side==='L'?-1:1,arm=new THREE.Group();
        const shoulder=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.25,0.12),matDark);arm.add(shoulder);
        const seg1=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,0.34,10),matDark);seg1.rotation.z=s*0.5;seg1.position.set(s*0.14,-0.13,0.08);arm.add(seg1);
        const seg2=new THREE.Mesh(new THREE.CylinderGeometry(0.036,0.036,0.3,10),matDark);seg2.rotation.z=s*0.35;seg2.position.set(s*0.28,-0.24,0.14);arm.add(seg2);
        const clawBase=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.08,0.1),matRust);clawBase.position.set(s*0.38,-0.34,0.2);arm.add(clawBase);
        arm.position.set(s*0.7,1.2,0.05);g.add(arm);
    }
    addArm('L');addArm('R');
    g.scale.set(1.08,1.08,1.08);setShadows(g);return g;
}

// ── Outer DeliveryRobot ───────────────────────────────────────────────────
class DeliveryRobot{
    constructor(scene,startNode,id){
        this.scene=scene;this.id=id;this.speed=18;
        this.currentNodeId=startNode.id;this.targetNodeId=null;
        this.waitingForInput=true;this.stopType=null;
        this.pendingTriangle=null;this.activeOrderId=null;
        this.lastMoveDir=new THREE.Vector3(0,0,1);
        this.onArrival=null;
        this._directX=null;this._directZ=null;this._directDone=null;
        this.mesh=buildRobotMesh();
        this.mesh.position.set(startNode.x,0.34,startNode.z);
        this.mesh.rotation.y=0;
        scene.add(this.mesh);
    }

    moveToNode(node){
        this.targetNodeId=node.id;this.waitingForInput=false;
        this.stopType=null;
    }

    // Direct move: robot goes straight to (x,z) ignoring triangle markers
    moveDirectTo(x,z,onDone){
        this._directX=x;this._directZ=z;this._directDone=onDone||null;
        this.targetNodeId=null;this.waitingForInput=false;this.stopType=null;
    }

    // Legacy coord move (kept for backward compat)
    moveTo(x,z,onDone){ this.moveDirectTo(x,z,onDone); }

    update(delta,network,onStop){
        // ── Direct mode (auto, no triangle stops) ────────────────────────
        if(this._directX!==null&&this._directZ!==null){
            const pos=this.mesh.position;
            const dx=this._directX-pos.x,dz=this._directZ-pos.z;
            const dist=Math.hypot(dx,dz);
            if(dist<0.08){
                pos.set(this._directX,pos.y,this._directZ);
                const cb=this._directDone;
                this._directX=null;this._directZ=null;this._directDone=null;
                this.waitingForInput=true;
                if(typeof cb==='function')cb();
            } else {
                const step=Math.min(dist,this.speed*delta);
                pos.x+=dx/dist*step;pos.z+=dz/dist*step;
                this.mesh.lookAt(pos.x + dx, pos.y, pos.z + dz);
            }
            return;
        }

        // ── Node-targeted mode ────────────────────────────────────────────
        if(this.targetNodeId===null)return;
        const target=network&&network.nodes?network.nodes[this.targetNodeId]:null;
        if(!target)return;
        const pos=this.mesh.position;
        const dx=target.x-pos.x,dz=target.z-pos.z;
        const dist=Math.hypot(dx,dz);
        if(dist<0.08){
            pos.set(target.x,pos.y,target.z);
            this.currentNodeId=this.targetNodeId;
            this.targetNodeId=null;this.waitingForInput=true;
            this.stopType='circle';
            const cb=this.onArrival;this.onArrival=null;
            if(typeof onStop==='function')onStop({type:'circle',nodeId:this.currentNodeId});
            if(typeof cb==='function')cb();
            return;
        }
        const step=Math.min(dist,this.speed*delta);
        pos.x+=dx/dist*step;pos.z+=dz/dist*step;
        this.mesh.lookAt(pos.x + dx, pos.y, pos.z + dz);

        // Triangle stops only in manual outer phase
        if(window.__solveMode==='manual'&&network&&network.triangles&&network.triangles.length){
            const prevX=pos.x-dx/dist*step,prevZ=pos.z-dz/dist*step;
            const isHoriz=Math.abs(target.z-prevZ)<Math.abs(target.x-prevX);
            for(const tri of network.triangles){
                if(tri.id===this.pendingTriangle)continue;
                if(isHoriz){
                    if(Math.abs(tri.z-target.z)>0.2)continue;
                    const minX=Math.min(prevX,pos.x)-0.05,maxX=Math.max(prevX,pos.x)+0.05;
                    if(tri.x>=minX&&tri.x<=maxX){
                        pos.x=tri.x;pos.z=tri.z;this.waitingForInput=true;
                        this.stopType='triangle';this.pendingTriangle=tri.id;this.targetNodeId=null;
                        if(typeof onStop==='function')onStop({type:'triangle',triangleId:tri.id});return;
                    }
                } else {
                    if(Math.abs(tri.x-target.x)>0.2)continue;
                    const minZ=Math.min(prevZ,pos.z)-0.05,maxZ=Math.max(prevZ,pos.z)+0.05;
                    if(tri.z>=minZ&&tri.z<=maxZ){
                        pos.x=tri.x;pos.z=tri.z;this.waitingForInput=true;
                        this.stopType='triangle';this.pendingTriangle=tri.id;this.targetNodeId=null;
                        if(typeof onStop==='function')onStop({type:'triangle',triangleId:tri.id});return;
                    }
                }
            }
        }
    }
}

// ── Inner block robot (blue, moves on internal graph) ────────────────────
class InnerDeliveryRobot{
    constructor(scene,blockId,startNode){
        this.scene=scene;this.blockId=blockId;
        this.currentNodeId=startNode.id;
        this.targetNodeId=null;
        this._targetX=startNode.x;this._targetZ=startNode.z;
        this.speed=12;
        this._moving=false;
        this._onDone=null;
        this.onArrival=null;
        this.mesh=this._buildMesh();
        this.mesh.position.set(startNode.x,0.42,startNode.z);
        scene.add(this.mesh);
    }

    _buildMesh(){
        const g=new THREE.Group();
        const matBody=new THREE.MeshStandardMaterial({color:0x2a72c3,roughness:0.4,metalness:0.7});
        const matDark=new THREE.MeshStandardMaterial({color:0x1a1a2e,roughness:0.6,metalness:0.5});
        const matLight=new THREE.MeshStandardMaterial({color:0x00e5ff,emissive:0x004466,roughness:0.3});
        const matWheel=new THREE.MeshStandardMaterial({color:0x111111,roughness:0.9});
        const body=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.5,0.9),matBody);body.position.y=0.55;g.add(body);
        const lid=new THREE.Mesh(new THREE.BoxGeometry(0.58,0.08,0.76),matDark);lid.position.y=0.82;g.add(lid);
        const scr=new THREE.Mesh(new THREE.BoxGeometry(0.38,0.22,0.04),matLight);scr.position.set(0,0.56,0.47);g.add(scr);
        const wGeo=new THREE.CylinderGeometry(0.14,0.14,0.1,14);
        [[-0.4,0.33],[-0.4,-0.33],[0.4,0.33],[0.4,-0.33]].forEach(([x,z])=>{
            const w=new THREE.Mesh(wGeo,matWheel);w.rotation.z=Math.PI/2;w.position.set(x,0.14,z);g.add(w);
        });
        const ant=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.3,6),matDark);ant.position.set(0.2,1.0,0);g.add(ant);
        const ball=new THREE.Mesh(new THREE.SphereGeometry(0.045,6,6),matLight);ball.position.set(0.2,1.18,0);g.add(ball);
        g.scale.set(1.1,1.1,1.1);setShadows(g);return g;
    }

    moveTo(x,z,onDone){
        this._targetX=x;this._targetZ=z;
        this._moving=true;this._onDone=onDone||null;
    }

    moveToNode(node){
        this.targetNodeId=node.id;
        this._targetX=node.x;this._targetZ=node.z;
        this._moving=true;
    }

    update(delta){
        if(!this._moving)return;
        const pos=this.mesh.position;
        const dx=this._targetX-pos.x,dz=this._targetZ-pos.z;
        const dist=Math.hypot(dx,dz);
        if(dist<0.08){
            pos.x=this._targetX;pos.z=this._targetZ;
            this._moving=false;
            if(this.targetNodeId!==null){
                this.currentNodeId=this.targetNodeId;this.targetNodeId=null;
                const onArr=this.onArrival;this.onArrival=null;
                if(typeof onArr==='function')onArr();
            }
            const cb=this._onDone;this._onDone=null;
            if(typeof cb==='function')cb();
            return;
        }
        const step=Math.min(dist,this.speed*delta);
        pos.x+=dx/dist*step;pos.z+=dz/dist*step;
        this.mesh.lookAt(pos.x + dx, pos.y, pos.z + dz);
    }
}

// ── initRobots ────────────────────────────────────────────────────────────
function initRobots(scene){
    if(!window.PathNetwork||!window.PathNetwork.nodes.length)return;
    const network=window.PathNetwork;

    // Spawn outer robots at node 1 (9.25,-9.25) — center area
    const robot1=new DeliveryRobot(scene,network.nodes[1],1);
    const robots=[robot1];

    // Spawn one inner robot per block at its gate node
    const innerRobots={};
    ['A','B','C','D'].forEach(bid=>{
        const intNodes=window.InternalNodes[bid];
        const stops=window.BuildingStops[bid];
        const gateNode=intNodes.find(n=>n.id===stops.gate)||intNodes[0];
        innerRobots[bid]=new InnerDeliveryRobot(scene,bid,gateNode);
    });
    window.InnerRobots = innerRobots;
    window.OuterRobots = robots;

    makeOrderUI(network,robots,innerRobots);

    // ── Click handler (manual mode) ────────────────────────────────────────
    const MAX_MOVE_DIST = 30; // world units — ~1 road gap; tune as needed
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // flat y=0
    const groundPoint = new THREE.Vector3();
    const runtime   = window.__mapRuntime;
    const dom       = runtime && runtime.getRendererDom ? runtime.getRendererDom() : null;

    // Phase sets — determine which robot the click should control
    const INNER_SRC_PHASES = new Set(['inner_pickup', 'inner_to_gate']);
    const INNER_DST_PHASES = new Set(['dst_inner_to_gate', 'inner_deliver']);
    const OUTER_PHASES     = new Set(['outer_to_src', 'outer_to_dst']);

    if(dom){
        dom.addEventListener('click', e => {
            const ui = window.__robotUI;
            if(!ui || !window.isManualMode) return;

            const phase = ui.getCurrentPhase();
            if(!phase) return;

            // ── Convert mouse → NDC ───────────────────────────────────────
            const rect = dom.getBoundingClientRect();
            mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
            mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, runtime.getActiveCamera());

            // ══ OUTER ROBOT (main road phases) ═══════════════════════════
            if(OUTER_PHASES.has(phase)){
                const outerRobot = robots[0];
                if(!outerRobot.waitingForInput) return;

                // Same approach as inner robot: click anywhere → find nearest node
                raycaster.ray.intersectPlane(groundPlane, groundPoint);
                if(!groundPoint) return;

                // Find nearest outer network node to the clicked point
                let nearestNode = null, nearestDist = Infinity;
                network.nodes.forEach(n => {
                    const d = Math.hypot(n.x - groundPoint.x, n.z - groundPoint.z);
                    if(d < nearestDist){ nearestDist = d; nearestNode = n; }
                });

                if(!nearestNode || nearestDist > MAX_MOVE_DIST){
                    ui.setStatus('Click closer to a road node.');
                    return;
                }

                // Adjacency check — only move along real road edges, not across grass
                const outerConnected = network.edges.some(e =>
                    (e.from === outerRobot.currentNodeId && e.to   === nearestNode.id) ||
                    (e.to   === outerRobot.currentNodeId && e.from === nearestNode.id)
                );
                if(!outerConnected){
                    ui.setStatus('Must move to a directly connected node.');
                    return;
                }

                outerRobot.moveDirectTo(nearestNode.x, nearestNode.z, () => {
                    outerRobot.currentNodeId = nearestNode.id;
                    ui.setStatus(`Outer robot at N${nearestNode.id}`);
                    ui.renderOrders();
                    ui.manualArrival(nearestNode.id);
                });
                return;
            }

            // ══ INNER ROBOT (block phases) ════════════════════════════════
            if(INNER_SRC_PHASES.has(phase) || INNER_DST_PHASES.has(phase)){
                raycaster.ray.intersectPlane(groundPlane, groundPoint);
                if(!groundPoint) return;

                const order = ui.getOrderByRobot();
                if(!order) return;

                const isInnerSrc = INNER_SRC_PHASES.has(phase);
                const blockId    = isInnerSrc ? order.srcBlockId : order.dstBlockId;
                const innerRobot = window.InnerRobots && window.InnerRobots[blockId];
                if(!innerRobot || innerRobot._moving) return;

                const intNet = window.buildInternalNetwork(blockId);
                let nearestNode = null, nearestDist = Infinity;
                intNet.nodes.forEach(n => {
                    const d = Math.hypot(n.x - groundPoint.x, n.z - groundPoint.z);
                    if(d < nearestDist){ nearestDist = d; nearestNode = n; }
                });

                if(!nearestNode || nearestDist > MAX_MOVE_DIST){
                    ui.setStatus('Click closer to an inner path node.');
                    return;
                }

                // Adjacency check — only move along real inner path edges
                const innerConnected = (intNet.adj[innerRobot.currentNodeId] || []).includes(nearestNode.id);
                if(!innerConnected){
                    ui.setStatus('Must move to a directly connected node.');
                    return;
                }

                innerRobot.moveToNode(nearestNode);
                innerRobot.onArrival = () => {
                    ui.setStatus(`Inner robot [${blockId}] at I${nearestNode.id}`);
                    ui.renderOrders();
                    ui.manualArrival(nearestNode.id);
                };
            }
        });
    }

    // ── Game loop ──────────────────────────────────────────────────────────
    let last=performance.now();
    (function robotLoop(now){
        requestAnimationFrame(robotLoop);
        const delta=Math.min(0.05,(now-last)/1000);
        last=now;
        robots.forEach(r=>r.update(delta,network,ev=>{
            const ui=window.__robotUI;if(!ui)return;
            if(ev.type==='circle'){ui.addNodeToOrderPath(r,ev.nodeId);ui.renderOrders();ui.setStatus(`Outer at N${ev.nodeId}.`);}
            if(ev.type==='triangle'){
                const tri=network.triangles.find(t=>t.id===ev.triangleId);
                ui.addTriangleToOrderPath(r,ev.triangleId);
                if(tri&&tri.blockId&&window.__solveMode==='manual')ui.completeOrder();
                ui.renderOrders();
            }
        }));
        Object.values(window.InnerRobots||{}).forEach(ir=>ir.update(delta));

        // Update floating status label
        const activeRob = window.__activeRobotForHint;
        const label = document.getElementById('robot-status-label');
        if (activeRob && activeRob.mesh && label && window.__mapRuntime) {
            const camera = window.__mapRuntime.getActiveCamera();
            if (camera) {
                const pos = new THREE.Vector3();
                activeRob.mesh.getWorldPosition(pos);
                pos.y += 1.8;
                pos.project(camera);
                
                const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-(pos.y * 0.5) + 0.5) * window.innerHeight;
                
                if (pos.z < 1) { // Only show if in front of camera
                    label.style.display = 'block';
                    label.style.left = `${x}px`;
                    label.style.top = `${y}px`;
                    const msg = window.__activeRobotHintMsg || '';
                    const time = window.__activeRobotTime || '';
                    label.innerHTML = `<div>${msg}</div><div style="color:#ffaa00;font-weight:bold;margin-top:2px;">Time: ${time}</div>`;
                } else {
                    label.style.display = 'none';
                }
            }
        } else if (label) {
            label.style.display = 'none';
        }
    })(last);
}