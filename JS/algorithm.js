const LOCATION_LIST = [
    { key: 'sushi',   label: 'Sushi Place',         blockId: 'B', buildingType: 'restaurant', nodeX: 9.25,  nodeZ: -9.25 },
    { key: 'burgers', label: 'Burger Hub',          blockId: 'B', buildingType: 'restaurant', nodeX: 9.25,  nodeZ: -9.25 },
    { key: 'pizza',   label: 'Pizza Corner',        blockId: 'C', buildingType: 'restaurant', nodeX: -9.25, nodeZ: 9.25 },
    { key: 'bakery',  label: 'Bakery House',        blockId: 'D', buildingType: 'restaurant', nodeX: 9.25,  nodeZ: 9.25 },
    { key: 'cafeA',   label: 'Mocha Cloud Cafe',    blockId: 'A', buildingType: 'cafe',       nodeX: -9.25, nodeZ: 75.75 },
    { key: 'cafeB',   label: 'Bean Republic Cafe',  blockId: 'B', buildingType: 'cafe',       nodeX: 9.25,  nodeZ: 75.75 },
    { key: 'cafeC',   label: 'Caramel Notes Cafe',  blockId: 'C', buildingType: 'cafe',       nodeX: -9.25, nodeZ: -75.75 },
    { key: 'cafeD',   label: 'Midnight Roast Cafe', blockId: 'D', buildingType: 'cafe',       nodeX: 9.25,  nodeZ: -75.75 },
];
window.LOCATION_LIST = LOCATION_LIST;

const DESTINATION_LIST = [
    { key: 'aptA1', label: 'Block A — Apt 1', blockId: 'A', houseIdx: 0, nodeX: 75.75,  nodeZ: 75.75 },
    { key: 'aptA2', label: 'Block A — Apt 2', blockId: 'A', houseIdx: 1, nodeX: 94.25,  nodeZ: 75.75 },
    { key: 'aptA3', label: 'Block A — Apt 3', blockId: 'A', houseIdx: 2, nodeX: 75.75,  nodeZ: 94.25 },
    { key: 'aptB1', label: 'Block B — Apt 1', blockId: 'B', houseIdx: 0, nodeX: -75.75, nodeZ: 75.75 },
    { key: 'aptB2', label: 'Block B — Apt 2', blockId: 'B', houseIdx: 1, nodeX: -94.25, nodeZ: 75.75 },
    { key: 'aptB3', label: 'Block B — Apt 3', blockId: 'B', houseIdx: 2, nodeX: -75.75, nodeZ: 94.25 },
    { key: 'aptC1', label: 'Block C — Apt 1', blockId: 'C', houseIdx: 0, nodeX: 75.75,  nodeZ: -75.75 },
    { key: 'aptC2', label: 'Block C — Apt 2', blockId: 'C', houseIdx: 1, nodeX: 94.25,  nodeZ: -75.75 },
    { key: 'aptC3', label: 'Block C — Apt 3', blockId: 'C', houseIdx: 2, nodeX: 75.75,  nodeZ: -94.25 },
    { key: 'aptD1', label: 'Block D — Apt 1', blockId: 'D', houseIdx: 0, nodeX: -75.75, nodeZ: -75.75 },
    { key: 'aptD2', label: 'Block D — Apt 2', blockId: 'D', houseIdx: 1, nodeX: -94.25, nodeZ: -75.75 },
    { key: 'aptD3', label: 'Block D — Apt 3', blockId: 'D', houseIdx: 2, nodeX: -75.75, nodeZ: -94.25 },
];

// ── Tree UI ───────────────────────────────────────────────────────────────
const TreeUI = {
    tree: {},
    rootId: null,
    currentId: null,
    prefixStr: '',
    nodes: null,
    algorithmType: 'BFS',
    _pathSet: null,

    // (Reset + Start) For The Tree
    init(startId, prefixStr = '', nodes = null, algorithmType = 'BFS') {
        this.tree = {};
        this.rootId = startId;
        this.currentId = startId;
        this.prefixStr = prefixStr;
        this.nodes = nodes;
        this.algorithmType = algorithmType;
        this._pathSet = null;
        this.tree[startId] = { id: startId, parentId: null, children: [], costs: null };

        if (this.nodes) {
            this.nodes.forEach(n => {
                if (n && n.mesh && n.originalMat) {
                    n.mesh.material.copy(n.originalMat);
                }
            });
        }
        this.render();
    },

    addNode(parentId, childId, costs = null) {
        if (!this.tree[parentId]) return;
        
        if (this.tree[childId]) {
            const oldParentId = this.tree[childId].parentId;
            if (oldParentId !== null && this.tree[oldParentId]) {
                this.tree[oldParentId].children = this.tree[oldParentId].children.filter(id => id !== childId);
            }
            this.tree[childId].parentId = parentId;
            if (costs) this.tree[childId].costs = costs;
        } else {
            this.tree[childId] = { id: childId, parentId: parentId, children: [], costs: costs };
        }
        
        if (!this.tree[parentId].children.includes(childId)) {
            this.tree[parentId].children.push(childId);
        }

        if (this.nodes) {
            const n = this.nodes.find(node => node.id === childId) || this.nodes[childId];
            if (n && n.mesh) {
                n.mesh.material.color.setHex(0x7aa8c0); 
                if (n.mesh.material.emissive) n.mesh.material.emissive.setHex(0x112233);
            }
        }
        this.render();
    },

    // Get Path to Current Node (for status display)
    getPathTo(nodeId) {
        const path = [];
        let curr = nodeId;
        while (curr !== undefined && curr !== null) {
            path.unshift(curr);
            if (this.tree[curr]) {
                curr = this.tree[curr].parentId;
            } else {
                break;
            }
        }
        return path;
    },

    // Select The Current Node
    setCurrent(nodeId) {
        if (this.nodes && this.currentId !== null) {
            const prev = this.nodes.find(node => node.id === this.currentId) || this.nodes[this.currentId];
            if (prev && prev.mesh) {
                prev.mesh.material.color.setHex(0x7aa8c0); 
                if (prev.mesh.material.emissive) prev.mesh.material.emissive.setHex(0x112233);
            }
        }
        this.currentId = nodeId;
        if (this.nodes) {
            const curr = this.nodes.find(node => node.id === nodeId) || this.nodes[nodeId];
            if (curr && curr.mesh) {
                curr.mesh.material.color.setHex(0xffaa00); 
                if (curr.mesh.material.emissive) curr.mesh.material.emissive.setHex(0x553300);
            }
        }

        const pathArr = this.getPathTo(nodeId);
        const pathStr = pathArr.map(id => this.prefixStr + id).join(' → ');
        const statusEl = document.getElementById('tree-status');
        if (statusEl) {
            const pathLabel = this.algorithmType === 'DFS' ? 'DFS Path:' : (this.algorithmType === 'A*' ? 'A* Path:' : 'Path:');
            statusEl.textContent = `${pathLabel} ${pathStr}`;
        }

        this.render();
    },

    // Final Path
    markPath(pathArr, nodesOverride) {
        this._pathSet = new Set(pathArr.map(id => +id));
        const nodeList = nodesOverride || this.nodes;
        if (nodeList) {
            pathArr.forEach(id => {
                const n = nodeList.find ? nodeList.find(nd => nd.id === +id) : nodeList[+id];
                if (n && n.mesh) {
                    n.mesh.material.color.setHex(0x00ee66); 
                    if (n.mesh.material.emissive) n.mesh.material.emissive.setHex(0x003322);
                }
            });
        }
        this.render();
    },

    // Visualize The Tree
    render() {
        const panel = document.getElementById('tree-content');
        if (!panel) return;

        const titleEl = document.getElementById('tree-title');
        if (titleEl) {
            titleEl.textContent = `\u25CF ${this.algorithmType} Tree`;
        }

        let html = '';
        const traverse = (nodeId, prefix, isLast, parentId) => {
            const node = this.tree[nodeId];
            if (!node) return;

            const isRoot = (nodeId === this.rootId);
            const branch = isRoot ? "" : (isLast ? " └── " : " ├── ");
            let label = isRoot ? "Gate/Start" : `${this.prefixStr}${nodeId}`;

            if (this.algorithmType === 'A*' && node.costs) {
                label += ` [g:${node.costs.g.toFixed(1)}, h:${node.costs.h.toFixed(1)}, f:${node.costs.f.toFixed(1)}]`;
            }

            const isCurrent = nodeId === this.currentId;
            const isPath = this._pathSet && this._pathSet.has(+nodeId);
            const cls = `tree-node ${isCurrent ? 'current' : isPath ? 'path' : 'visited'}`;

            html += `<div class="${cls}">`;
            html += `<span class="tree-prefix">${prefix}${branch}</span>`;
            html += `<span class="tree-label">${label}</span>`;

            if (!isRoot && parentId !== null && parentId !== undefined) {
                html += `<span class="tree-arrow">← ${this.prefixStr}${parentId}</span>`;
            }
            html += `</div>`;

            const childPrefix = isRoot ? "" : prefix + (isLast ? "    " : " │  ");

            node.children.forEach((childId, index) => {
                traverse(childId, childPrefix, index === node.children.length - 1, nodeId);
            });
        };

        traverse(this.rootId, "", true, null);
        panel.innerHTML = html;

        panel.innerHTML = html;
        panel.scrollTop = panel.scrollHeight;
    }
};

// ── BFS / DFS / A* (Return The Final Path) ─────────────────────────────────────────────────────
function bfsPath(adj, start, goal) {
    const queue = [[start]], visited = new Set([start]);
    while (queue.length) {
        const path = queue.shift(); const cur = path[path.length - 1];
        if (cur === goal) return path;
        for (const nb of (adj[cur] || [])) { if (!visited.has(nb)) { visited.add(nb); queue.push([...path, nb]); } }
    }
    return null;
}

function dfsPath(adj, start, goal) {
    const stack = [[start]], visited = new Set([start]);
    while (stack.length) {
        const path = stack.pop(); const cur = path[path.length - 1];
        if (cur === goal) return path;
        for (const nb of (adj[cur] || [])) { if (!visited.has(nb)) { visited.add(nb); stack.push([...path, nb]); } }
    }
    return null;
}

function astarPath(nodes, adj, startId, goalId) {
    startId = +startId;
    goalId = +goalId;

    const getNode = id => nodes.find(n => n.id === +id);
    const goalNode = getNode(goalId);
    if (!goalNode) return null;

    const openSet = [startId];
    const cameFrom = {};
    const gScore = { [startId]: 0 };
    const fScore = { [startId]: 0 };

    while (openSet.length > 0) {
        openSet.sort((a, b) => (fScore[a] ?? Infinity) - (fScore[b] ?? Infinity));
        const current = +openSet.shift(); 

        if (current === goalId) {
            const path = [current];
            let curr = current;
            while (cameFrom[curr] !== undefined) {
                curr = +cameFrom[curr];
                path.unshift(curr);
            }
            return path;
        }

        for (const nb of (adj[current] || [])) {
            const neighbor = +nb; 
            const currNode = getNode(current);
            const nextNode = getNode(neighbor);
            if (!currNode || !nextNode) continue;
            const cost = Math.hypot(currNode.x - nextNode.x, currNode.z - nextNode.z);

            const tentativeG = (gScore[current] ?? Infinity) + cost;
            if (tentativeG < (gScore[neighbor] ?? Infinity)) {
                cameFrom[neighbor] = current;
                gScore[neighbor] = tentativeG;
                const h = Math.hypot(goalNode.x - nextNode.x, goalNode.z - nextNode.z);
                fScore[neighbor] = tentativeG + h;
                if (!openSet.includes(neighbor)) openSet.push(neighbor);
            }
        }
    }
    return null;
}

// ==========================================================================
// ── BFS generator ──────────────────────────────────────────
function* bfsPhysicalWalkGen(adj, start, goal) {
    const parent = { [start]: null };
    const visited = new Set([start]);
    const queue = [start];
    let phys = start; 

    function* walkTo(targetId) {
        if (phys === targetId) return;
        function anc(id) {
            const chain = [];
            let c = id;
            while (c !== null && c !== undefined) { chain.push(c); c = parent[c]; }
            return chain;
        }
        const fa = anc(phys), ta = anc(targetId);
        const fs = new Set(fa);
        let lcaTIdx = ta.findIndex(n => fs.has(n));
        const lca = ta[lcaTIdx];
        const lcaFIdx = fa.indexOf(lca);

        for (let i = 0; i < lcaFIdx; i++) {
            yield { type: 'step', from: fa[i], to: fa[i + 1] };
            phys = fa[i + 1];
        }

        const down = ta.slice(0, lcaTIdx).reverse();
        for (const to of down) {
            yield { type: 'step', from: phys, to };
            phys = to;
        }
    }

    while (queue.length) {
        const cur = queue.shift();
        yield* walkTo(cur);

        if (cur === goal) { yield { type: 'found', node: cur }; return; }

        for (const nb of (adj[cur] || [])) {
            if (!visited.has(nb)) {
                visited.add(nb);
                parent[nb] = cur;
                queue.push(nb);
                yield* walkTo(cur);
                yield { type: 'step', from: cur, to: nb, isNew: true };
                phys = nb;

                if (nb === goal) {
                    yield { type: 'found', node: nb };
                    return;
                }
            }
        }
    }
    yield { type: 'fail' };
}

// ── DFS generator ──────────────────────────────────────────
function* dfsPhysicalWalkGen(adj, start, goal) {
    const parent = { [start]: null };
    const visited = new Set([start]);
    const stack = [start];        
    let phys = start;

    function* walkTo(targetId) {
        if (phys === targetId) return;
        function anc(id) {
            const chain = [];
            let c = id;
            while (c !== null && c !== undefined) { chain.push(c); c = parent[c]; }
            return chain;
        }
        const fa = anc(phys), ta = anc(targetId);
        const fs = new Set(fa);
        let lcaTIdx = ta.findIndex(n => fs.has(n));
        const lca = ta[lcaTIdx];
        const lcaFIdx = fa.indexOf(lca);
        for (let i = 0; i < lcaFIdx; i++) {
            yield { type: 'step', from: fa[i], to: fa[i + 1] };
            phys = fa[i + 1];
        }
        const down = ta.slice(0, lcaTIdx).reverse();
        for (const to of down) {
            yield { type: 'step', from: phys, to };
            phys = to;
        }
    }

    while (stack.length) {
        const cur = stack.pop();   
        yield* walkTo(cur);

        if (cur === goal) { yield { type: 'found', node: cur }; return; }

        const neighbours = (adj[cur] || []).slice().reverse();
        for (const nb of neighbours) {
            if (!visited.has(nb)) {
                visited.add(nb);
                parent[nb] = cur;
                stack.push(nb);
            }
        }

        for (const nb of neighbours) {
            if (!visited.has(nb)) {
                visited.add(nb);
                parent[nb] = cur;
                stack.push(nb);
                yield* walkTo(cur);
                yield { type: 'step', from: cur, to: nb, isNew: true };
                phys = nb;

                if (nb === goal) {
                    yield { type: 'found', node: nb };
                    return;
                }

                break;
            }
        }
    }
    yield { type: 'fail' };
}

// ── A* generator ───────────────────────────────────────────
function* astarPhysicalWalkGen(nodes, adj, start, goal) {
    start = +start;
    goal = +goal;
    const parent = { [start]: null };
    const openSet = [start];
    const gScore = { [start]: 0 };
    const fScore = { [start]: 0 };
    let phys = start;

    const getNode = id => nodes.find(n => n.id === +id);
    const goalNode = getNode(goal);

    function* walkTo(targetId) {
        if (phys === targetId) return;
        function anc(id) {
            const chain = [];
            let c = id;
            while (c !== null && c !== undefined) { chain.push(c); c = parent[c]; }
            return chain;
        }
        const fa = anc(phys), ta = anc(targetId);
        const fs = new Set(fa);
        let lcaTIdx = ta.findIndex(n => fs.has(n));
        const lca = ta[lcaTIdx];
        const lcaFIdx = fa.indexOf(lca);
        for (let i = 0; i < lcaFIdx; i++) {
            const to = fa[i+1];
            yield { type: 'step', from: fa[i], to: to, costs: { f: fScore[to] || fScore[targetId] } };
            phys = fa[i + 1];
        }
        const down = ta.slice(0, lcaTIdx).reverse();
        for (const to of down) {
            yield { type: 'step', from: phys, to: to, costs: { f: fScore[to] || fScore[targetId] } };
            phys = to;
        }
    }

    while (openSet.length > 0) {
        openSet.sort((a, b) => (fScore[a] ?? Infinity) - (fScore[b] ?? Infinity));
        const cur = +openSet.shift();

        yield* walkTo(cur);

        if (cur === goal) { yield { type: 'found', node: cur }; return; }

        for (const nbRaw of (adj[cur] || [])) {
            const nb = +nbRaw;
            const currNode = getNode(cur);
            const nextNode = getNode(nb);
            if (!currNode || !nextNode) continue;

            const cost = Math.hypot(currNode.x - nextNode.x, currNode.z - nextNode.z);
            const tentativeG = (gScore[cur] ?? Infinity) + cost;

            if (tentativeG < (gScore[nb] ?? Infinity)) {
                parent[nb] = cur;
                gScore[nb] = tentativeG;
                const h = Math.hypot(goalNode.x - nextNode.x, goalNode.z - nextNode.z);
                fScore[nb] = tentativeG + h;
                
                if (!openSet.includes(nb)) openSet.push(nb);
                yield* walkTo(cur);
                yield { type: 'step', from: cur, to: nb, isNew: true, costs: { g: gScore[nb], h: h, f: fScore[nb] } };
                phys = nb;

                if (nb === goal) {
                    yield { type: 'found', node: nb };
                    return;
                }
            }
        }
    }
    yield { type: 'fail' };
}

// ==========================================================================================
// Inner BFS walk
function stepBfsExploreInner(innerRobot, intNet, startId, goalId, onDone, onHint) {
    const gen = bfsPhysicalWalkGen(intNet.adj, startId, goalId);
    let moves = 0;
    TreeUI.init(startId, 'I', intNet.nodes, 'BFS');

    function nextStep() {
        const r = gen.next();
        if (r.done) { onDone(); return; }
        const ev = r.value;
        if (ev.type === 'found' || ev.type === 'fail') { onDone(); return; }

        if (ev.isNew) TreeUI.addNode(ev.from, ev.to);
        TreeUI.setCurrent(ev.to);
        const isDirectNeighbor = (intNet.adj[ev.from] || []).includes(ev.to);
        if (!isDirectNeighbor) {
            console.warn(`BFS inner: skipping illegal move I${ev.from} → I${ev.to} (not a direct neighbor)`);
            nextStep(); return;
        }
        if (_order) {
            _order.totalSteps++;
            if (onHint) onHint('BFS exploring...', _order.totalSteps + 's');
        }
        const node = intNet.nodes.find(n => n.id === ev.to);
        if (!node) { nextStep(); return; }
        innerRobot.moveToNode(node);
        innerRobot.onArrival = nextStep;
    }
    nextStep();
}
// Outer BFS walk
function stepBfsExploreOuter(outerRobot, network, startId, goalId, onDone, onHint) {
    const outerAdj = buildOuterAdj(network);
    const gen = bfsPhysicalWalkGen(outerAdj, startId, goalId);
    let moves = 0;
    TreeUI.init(startId, 'N', network.nodes, 'BFS');

    function nextStep() {
        const r = gen.next();
        if (r.done) { onDone(); return; }
        const ev = r.value;
        if (ev.type === 'found' || ev.type === 'fail') { onDone(); return; }

        if (ev.isNew) TreeUI.addNode(ev.from, ev.to);
        TreeUI.setCurrent(ev.to);
        const isDirectNeighbor = (outerAdj[ev.from] || []).includes(ev.to);
        if (!isDirectNeighbor) {
            console.warn(`BFS outer: skipping illegal move N${ev.from} → N${ev.to} (not a direct neighbor)`);
            nextStep(); return;
        }
        if (_order) {
            _order.totalSteps++;
            if (onHint) onHint('BFS exploring...', _order.totalSteps + 's');
        }
        const node = network.nodes[ev.to];
        if (!node) { nextStep(); return; }
        outerRobot.moveDirectTo(node.x, node.z, () => {
            outerRobot.currentNodeId = ev.to;
            nextStep();
        });
    }
    nextStep();
}

// Inner DFS walk 
function stepDfsExploreInner(innerRobot, intNet, startId, goalId, onDone, onHint) {
    const gen = dfsPhysicalWalkGen(intNet.adj, startId, goalId);
    let visitedCount = 0;
    TreeUI.init(startId, 'I', intNet.nodes, 'DFS');

    function nextStep() {
        const r = gen.next();
        if (r.done) { onDone(); return; }
        const ev = r.value;
        if (ev.type === 'found' || ev.type === 'fail') { onDone(); return; }

        if (!TreeUI.tree[ev.to]) {
            TreeUI.addNode(ev.from, ev.to);
            if (_order) _order.totalVisited++;
        }
        TreeUI.setCurrent(ev.to);
        const isDirectNeighbor = (intNet.adj[ev.from] || []).includes(ev.to);
        if (!isDirectNeighbor) {
            console.warn(`DFS inner: skipping illegal move I${ev.from} → I${ev.to}`);
            nextStep(); return;
        }
        if (_order && onHint) onHint('DFS exploring...', _order.totalVisited + ' nodes');
        const node = intNet.nodes.find(n => n.id === ev.to);
        if (!node) { nextStep(); return; }
        innerRobot.moveToNode(node);
        innerRobot.onArrival = nextStep;
    }
    nextStep();
}
// Outer DFS walk 
function stepDfsExploreOuter(outerRobot, network, startId, goalId, onDone, onHint) {
    const outerAdj = buildOuterAdj(network);
    const gen = dfsPhysicalWalkGen(outerAdj, startId, goalId);
    let visitedCount = 0;
    TreeUI.init(startId, 'N', network.nodes, 'DFS');

    function nextStep() {
        const r = gen.next();
        if (r.done) { onDone(); return; }
        const ev = r.value;
        if (ev.type === 'found' || ev.type === 'fail') { onDone(); return; }

        if (!TreeUI.tree[ev.to]) {
            TreeUI.addNode(ev.from, ev.to);
            if (_order) _order.totalVisited++;
        }
        TreeUI.setCurrent(ev.to);
        const isDirectNeighbor = (outerAdj[ev.from] || []).includes(ev.to);
        if (!isDirectNeighbor) {
            console.warn(`DFS outer: skipping illegal move N${ev.from} → N${ev.to}`);
            nextStep(); return;
        }
        if (_order && onHint) onHint('DFS exploring...', _order.totalVisited + ' nodes');
        const node = network.nodes[ev.to];
        if (!node) { nextStep(); return; }
        outerRobot.moveDirectTo(node.x, node.z, () => {
            outerRobot.currentNodeId = ev.to;
            nextStep();
        });
    }
    nextStep();
}

// Inner A* walk 
async function stepAstarExploreInner(innerRobot, intNet, startId, goalId, onDone, onHint) {
    startId = +startId;
    goalId  = +goalId;
    TreeUI.init(startId, 'I', intNet.nodes, 'A*');

    const getNode = id => intNet.nodes.find(n => n.id === +id);
    const goalNode = getNode(goalId);
    if (!goalNode) {
        if (onHint) onHint('A* failed: goal node not found.');
        onDone();
        return;
    }

    const DELAY = 20;
    const openSet   = [startId];
    const closedSet = new Set();
    const cameFrom  = {};
    const gScore    = { [startId]: 0 };
    const fScore    = { [startId]: 0 };
    let   foundPath = null;

    while (openSet.length > 0) {
        openSet.sort((a, b) => (fScore[a] ?? Infinity) - (fScore[b] ?? Infinity));
        const current = +openSet.shift();
        if (closedSet.has(current)) continue;
        closedSet.add(current);

        const parentId = cameFrom[current] ?? null;
        const g = gScore[current] ?? 0;
        const cn = getNode(current);
        const h = cn ? Math.hypot(goalNode.x - cn.x, goalNode.z - cn.z) : 0;
        if (parentId !== null) {
            TreeUI.addNode(parentId, current, { g, h, f: g + h });
        }
        TreeUI.setCurrent(current);
        if (onHint) onHint(`A* visiting I${current}...`);

        await new Promise(r => setTimeout(r, DELAY));

        if (current === goalId) {
            const path = [current];
            let c = current;
            while (cameFrom[c] !== undefined) { c = +cameFrom[c]; path.unshift(c); }
            foundPath = path;
            break;
        }

        for (const nbRaw of (intNet.adj[current] || [])) {
            const nb = +nbRaw;
            if (closedSet.has(nb)) continue;
            const currNode = getNode(current);
            const nextNode = getNode(nb);
            if (!currNode || !nextNode) continue;
            const cost       = Math.hypot(currNode.x - nextNode.x, currNode.z - nextNode.z);
            const tentativeG = (gScore[current] ?? Infinity) + cost;
            if (tentativeG < (gScore[nb] ?? Infinity)) {
                cameFrom[nb] = current;
                gScore[nb]   = tentativeG;
                const hNb    = Math.hypot(goalNode.x - nextNode.x, goalNode.z - nextNode.z);
                fScore[nb]   = tentativeG + hNb;
                if (!openSet.includes(nb)) openSet.push(nb);
            }
        }
    }

    if (!foundPath) {
        if (onHint) onHint('A* failed to find path.');
        onDone();
        return;
    }

    let totalPathCost = 0;
    for (let i = 0; i < foundPath.length - 1; i++) {
        const n1 = intNet.nodes.find(n => n.id === foundPath[i]);
        const n2 = intNet.nodes.find(n => n.id === foundPath[i + 1]);
        if (n1 && n2) totalPathCost += Math.hypot(n1.x - n2.x, n1.z - n2.z);
    }
    if (_order) _order.totalCost += totalPathCost;

    TreeUI.markPath(foundPath, intNet.nodes);
    if (onHint) onHint('A* path found! Drawing path...');
    await new Promise(r => setTimeout(r, 700));

    if (onHint && _order) onHint('Moving robot...', _order.totalCost.toFixed(1) + 's');
    let idx = (innerRobot.currentNodeId === foundPath[0]) ? 1 : 0;
    function moveRobot() {
        if (idx >= foundPath.length) { onDone(); return; }
        const node = intNet.nodes.find(n => n.id === foundPath[idx]);
        if (!node) { onDone(); return; }
        innerRobot.moveToNode(node);
        innerRobot.onArrival = () => { idx++; moveRobot(); };
    }
    moveRobot();
}
// Outer A* walk 
async function stepAstarExploreOuter(outerRobot, network, startId, goalId, onDone, onHint) {
    startId = +startId;
    goalId  = +goalId;
    const outerAdj = buildOuterAdj(network);
    TreeUI.init(startId, 'N', network.nodes, 'A*');

    const getNode = id => network.nodes.find(n => n.id === +id) || network.nodes[+id];
    const goalNode = getNode(goalId);
    if (!goalNode) {
        if (onHint) onHint('A* failed: goal node not found.');
        onDone();
        return;
    }

    const DELAY = 20; 
    const openSet   = [startId];
    const closedSet = new Set();
    const cameFrom  = {};
    const gScore    = { [startId]: 0 };
    const fScore    = { [startId]: 0 };
    let   foundPath = null;

    while (openSet.length > 0) {
        openSet.sort((a, b) => (fScore[a] ?? Infinity) - (fScore[b] ?? Infinity));
        const current = +openSet.shift();
        if (closedSet.has(current)) continue;
        closedSet.add(current);

        const parentId = cameFrom[current] ?? null;
        const g = gScore[current] ?? 0;
        const cn = getNode(current);
        const h = cn ? Math.hypot(goalNode.x - cn.x, goalNode.z - cn.z) : 0;
        if (parentId !== null) {
            TreeUI.addNode(parentId, current, { g, h, f: g + h });
        }
        TreeUI.setCurrent(current);
        if (onHint) onHint(`A* visiting N${current}...`);

        await new Promise(r => setTimeout(r, DELAY));

        if (current === goalId) {
            const path = [current];
            let c = current;
            while (cameFrom[c] !== undefined) { c = +cameFrom[c]; path.unshift(c); }
            foundPath = path;
            break;
        }

        for (const nbRaw of (outerAdj[current] || [])) {
            const nb = +nbRaw;
            if (closedSet.has(nb)) continue;
            const currNode = getNode(current);
            const nextNode = getNode(nb);
            if (!currNode || !nextNode) continue;
            const cost       = Math.hypot(currNode.x - nextNode.x, currNode.z - nextNode.z);
            const tentativeG = (gScore[current] ?? Infinity) + cost;
            if (tentativeG < (gScore[nb] ?? Infinity)) {
                cameFrom[nb] = current;
                gScore[nb]   = tentativeG;
                const hNb    = Math.hypot(goalNode.x - nextNode.x, goalNode.z - nextNode.z);
                fScore[nb]   = tentativeG + hNb;
                if (!openSet.includes(nb)) openSet.push(nb);
            }
        }
    }

    if (!foundPath) {
        if (onHint) onHint('A* failed to find path.');
        onDone();
        return;
    }

    let totalPathCost = 0;
    for (let i = 0; i < foundPath.length - 1; i++) {
        const n1 = getNode(foundPath[i]);
        const n2 = getNode(foundPath[i + 1]);
        if (n1 && n2) totalPathCost += Math.hypot(n1.x - n2.x, n1.z - n2.z);
    }
    if (_order) _order.totalCost += totalPathCost;

    TreeUI.markPath(foundPath, network.nodes);
    if (onHint) onHint('A* path found! Drawing path...');
    await new Promise(r => setTimeout(r, 700));

    if (onHint && _order) onHint('Moving robot...', _order.totalCost.toFixed(1) + 's');
    let idx = (outerRobot.currentNodeId === foundPath[0]) ? 1 : 0;
    function moveRobot() {
        if (idx >= foundPath.length) { onDone(); return; }
        const node = getNode(foundPath[idx]);
        if (!node) { onDone(); return; }
        outerRobot.moveDirectTo(node.x, node.z, () => {
            outerRobot.currentNodeId = node.id;
            idx++;
            moveRobot();
        });
    }
    moveRobot();
}


// ==========================================================================================
// build adjacency list
function buildOuterAdj(network) {
    const adj = {};
    network.nodes.forEach(n => adj[n.id] = []);
    network.edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from); });
    return adj;
}

// ── State ─────────────────────────────────────────────────────────────────
let _order = null, _phase = null, _solveMode = null;
let _innerPath = null, _outerPath = null;
let _currentPhaseGoal = null; 
const orders = []; let nextId = 1;

function makeOrderUI(network, robots, innerRobots) {
    const locSel = document.getElementById('locationSelect');
    const dstSel = document.getElementById('destinationSelect');
    const createBtn = document.getElementById('createOrderBtn');
    const astarBtn = document.getElementById('astarBtn');
    const bfsBtn = document.getElementById('bfsBtn');
    const dfsBtn = document.getElementById('dfsBtn');
    const solveBtn = document.getElementById('solveBtn');
    const hint = document.getElementById('ordersHint');
    const listEl = document.getElementById('ordersList');
    if (!locSel || !dstSel || !createBtn || !listEl) return;

    // Fill select options
    function fillSel(el, items) { el.innerHTML = ''; items.forEach(it => { const o = document.createElement('option'); o.value = it.key; o.textContent = it.label; el.appendChild(o); }); }
    fillSel(locSel, LOCATION_LIST);
    fillSel(dstSel, DESTINATION_LIST);

    const STATUS_CLS = { 'pending': 'status-red', 'delivering': 'status-yellow', 'completed': 'status-green' };

    // Display lable for time
    function setHint(m, activeRobot, timeStr) {
        if (hint) hint.textContent = m;
        window.__activeRobotForHint = activeRobot;
        window.__activeRobotHintMsg = m;
        window.__activeRobotTime = timeStr || '';
    }

    // Rebuild order list
    function render() {
        if (!orders.length) { listEl.textContent = 'No orders yet.'; return; }
        listEl.innerHTML = orders.map(o => {
            const timeVal = o.totalTime !== undefined ? `${Math.round(o.totalTime / 1000)}s` : (o.timeStr || '');
            return `<div class="order-item">
                <div><strong>Order #${o.id}</strong> &nbsp; [${o.algorithm || '-'}]</div>
                <div><strong>From:</strong> ${o.locationLabel}</div>
                <div><strong>To:</strong> ${o.destLabel}</div>
                <div><strong>Phase:</strong> ${o.phase || '-'}</div>
                <div><strong>Status:</strong> <span class="${STATUS_CLS[o.status] || ''}">${o.status}</span></div>
                ${timeVal ? `<div><strong>Time:</strong> ${timeVal}</div>` : ''}
            </div>`;
        }).join('');
    }

    const outerAdj = buildOuterAdj(network);

    function gateNodeFor(blockId) {
        const idx = window.BlockGateNodes && window.BlockGateNodes[blockId];
        return (idx !== undefined) ? network.nodes[idx] : null;
    }

    function nearestInt(intNet, x, z) {
        let best = null, bestD = Infinity;
        intNet.nodes.forEach(n => { const d = Math.hypot(n.x - x, n.z - z); if (d < bestD) { bestD = d; best = n; } });
        return best ? best.id : null;
    }

    function getBuildingCoord(blockId, btype, houseIdx) {
        try {
            const block = CFG.BLOCKS.find(b => b.id === blockId);
            if (!block) return null;
            if (btype && btype.startsWith('house')) {
                const houses = CFG.DICE5.filter(c => c.type === 'house');
                const cell = houses[typeof houseIdx === 'number' ? houseIdx : 0] || houses[0];
                return { x: block.x + cell.dx * CFG.BLOCK, z: block.z + cell.dz * CFG.BLOCK };
            }
            const cell = CFG.DICE5.find(c => c.type === btype) || CFG.DICE5.find(c => c.type === 'restaurant');
            if (!cell) return null;
            return { x: block.x + cell.dx * CFG.BLOCK, z: block.z + cell.dz * CFG.BLOCK };
        } catch (e) { return null; }
    }

    // New order creation
    function createOrder() {
        console.log("Create Order clicked");
        if (_order) { setHint('Order already in progress.'); return; }
        const locDef = LOCATION_LIST.find(l => l.key === locSel.value);
        const dstDef = DESTINATION_LIST.find(d => d.key === dstSel.value);
        if (!locDef || !dstDef) return;
        _order = {
            id: nextId++,
            destination: dstDef.label,
            status: 'pending',
            locationLabel: locDef.label, 
            destLabel: dstDef.label,
            srcBlockId: locDef.blockId, 
            dstBlockId: dstDef.blockId,
            buildingType: locDef.buildingType, 
            houseIdx: dstDef.houseIdx,
            phase: 'waiting', 
            timeStr: '',
            algorithm: '-', 
            isSameBlock: locDef.blockId === dstDef.blockId,
            startTime: Date.now(),
            totalTime: 0,
            timeStr: '0s',
            totalSteps: 0,
            totalVisited: 0,
            totalCost: 0
        };
        window.__activeRobotTime = '0s';
        orders.push(_order);
        console.log("Order created:", _order);
        
        [astarBtn, bfsBtn, dfsBtn, solveBtn].forEach(btn => { if(btn) btn.disabled = false; });

        _phase = null; _solveMode = null; _innerPath = null; _outerPath = null;
        setHint(`Order created successfully. Choose BFS / DFS / Manual.`);
        render();
    }
    createBtn.addEventListener('click', createOrder);

    function startSolve(mode) {
        console.log(`Algorithm selected: ${mode.toUpperCase()}`);
        if (!_order) { 
            setHint('Please create an order first.'); 
            return; 
        }
        _solveMode = mode;
        _order.algorithm = mode.toUpperCase();
        window.__solveMode = mode;
        window.isManualMode = (mode === 'manual');
        
        console.log(`Starting traversal for Order #${_order.id} using ${mode.toUpperCase()}`);
        
        [astarBtn, bfsBtn, dfsBtn, solveBtn].forEach(btn => { if(btn) btn.disabled = true; });

        beginPhase('inner_pickup');
    }
    if (astarBtn) astarBtn.onclick = () => startSolve('astar');
    if (bfsBtn) bfsBtn.onclick = () => startSolve('bfs');
    if (dfsBtn) dfsBtn.onclick = () => startSolve('dfs');
    if (solveBtn) solveBtn.onclick = () => startSolve('manual');

    // ── Phase engine ──────────────────────────────────────────────────────
    function beginPhase(phase) {
        if (!_order) return;
        console.log(`State Update: Transitioning to phase [${phase}] for Order #${_order.id}`);
        _order.phase = phase;
        render();

        const src = _order.srcBlockId, dst = _order.dstBlockId;
        const srcInner = innerRobots[src], dstInner = innerRobots[dst];
        const intNetSrc = buildInternalNetwork(src), intNetDst = buildInternalNetwork(dst);
        const stops = window.BuildingStops;
        const outerRobot = robots[0];

        if (phase === 'inner_pickup') {
            const bcoord = getBuildingCoord(src, _order.buildingType, _order.houseIdx);
            const fallback = stops[src][_order.buildingType] ?? stops[src]['restaurant'];
            const goalId = (bcoord && nearestInt(intNetSrc, bcoord.x, bcoord.z) !== null)
                ? nearestInt(intNetSrc, bcoord.x, bcoord.z) : fallback;
            _order.status = 'delivering';
            _currentPhaseGoal = goalId;
            if (_solveMode === 'bfs') {
                _order.timeStr = _order.totalSteps + 's';
                setHint(`[${src}] BFS exploring to ${_order.buildingType}...`, srcInner, _order.timeStr);
                stepBfsExploreInner(srcInner, intNetSrc, srcInner.currentNodeId, goalId,
                    () => beginPhase('inner_to_gate'),
                    (m, t) => { if (_order) { _order.timeStr = t; setHint(m, srcInner, t); render(); } });
            } else if (_solveMode === 'dfs') {
                _order.timeStr = _order.totalVisited + ' nodes';
                setHint(`[${src}] DFS exploring to ${_order.buildingType}...`, srcInner, _order.timeStr);
                stepDfsExploreInner(srcInner, intNetSrc, srcInner.currentNodeId, goalId,
                    () => beginPhase('inner_to_gate'),
                    (m, t) => { if (_order) { _order.timeStr = t; setHint(m, srcInner, t); render(); } });
            } else if (_solveMode === 'astar') {
                _order.timeStr = _order.totalCost.toFixed(1) + 's';
                setHint(`[${src}] A* exploring to ${_order.buildingType}...`, srcInner, _order.timeStr);
                stepAstarExploreInner(srcInner, intNetSrc, srcInner.currentNodeId, goalId,
                    () => beginPhase('inner_to_gate'),
                    (m, t) => { if (_order) { _order.timeStr = t; setHint(m, srcInner, t); render(); } });
            } else if (!window.isManualMode) {
                _innerPath = _solveMode === 'dfs'
                    ? dfsPath(intNetSrc.adj, srcInner.currentNodeId, goalId)
                    : astarPath(intNetSrc.nodes, intNetSrc.adj, srcInner.currentNodeId, goalId);
                _order.timeStr = 'Pickup ready';
                setHint(`[${src}] Inner robot heading to ${_order.buildingType}.`, srcInner);
                stepInner(srcInner, intNetSrc, () => beginPhase('inner_to_gate'));
            } else {
                _innerPath = bfsPath(intNetSrc.adj, srcInner.currentNodeId, goalId);
                _order.timeStr = 'Manual mode';
                setHint(`[Manual] Click near the inner path to move the robot to the ${_order.buildingType}.`);
            }
            render();

        } else if (phase === 'inner_to_gate') {
            const gateNodeId = stops[src]['gate'];
            _currentPhaseGoal = gateNodeId;
            const gateDone = () => {
                setHint(`[${src}] Inner robot AT gate. Outer robot going to pick up.`);
                if (_order.isSameBlock) { beginPhase('inner_deliver'); return; }
                beginPhase('outer_to_src');
            };
            if (_solveMode === 'bfs') {
                _order.timeStr = _order.totalSteps + 's';
                setHint(`[${src}] BFS exploring to gate...`, srcInner, _order.timeStr);
                stepBfsExploreInner(srcInner, intNetSrc, srcInner.currentNodeId, gateNodeId,
                    gateDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, srcInner, t); render(); } });
            } else if (_solveMode === 'dfs') {
                _order.timeStr = _order.totalVisited + ' nodes';
                setHint(`[${src}] DFS exploring to gate...`, srcInner, _order.timeStr);
                stepDfsExploreInner(srcInner, intNetSrc, srcInner.currentNodeId, gateNodeId,
                    gateDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, srcInner, t); render(); } });
            } else if (_solveMode === 'astar') {
                _order.timeStr = _order.totalCost.toFixed(1) + 's';
                setHint(`[${src}] A* exploring to gate...`, srcInner, _order.timeStr);
                stepAstarExploreInner(srcInner, intNetSrc, srcInner.currentNodeId, gateNodeId,
                    gateDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, srcInner, t); render(); } });
            } else if (!window.isManualMode) {
                _innerPath = _solveMode === 'dfs'
                    ? dfsPath(intNetSrc.adj, srcInner.currentNodeId, gateNodeId)
                    : astarPath(intNetSrc.nodes, intNetSrc.adj, srcInner.currentNodeId, gateNodeId);
                _order.timeStr = 'To gate ready';
                setHint(`[${src}] Inner robot moving to gate.`, srcInner);
                stepInner(srcInner, intNetSrc, gateDone);
            } else {
                _innerPath = bfsPath(intNetSrc.adj, srcInner.currentNodeId, gateNodeId);
                _order.timeStr = 'Manual mode';
                setHint(`[Manual] Click near the inner path to move the robot to the gate.`);
            }
            render();

        } else if (phase === 'outer_to_src') {
            const srcGateNode = gateNodeFor(src);
            if (!srcGateNode) { setHint('No src gate node found.'); return; }
            _currentPhaseGoal = srcGateNode.id;
            const srcDone = () => {
                setHint(`Outer robot AT ${src} gate. Picking up order.`);
                beginPhase('outer_to_dst');
            };
            if (_solveMode === 'bfs') {
                _order.timeStr = _order.totalSteps + 's';
                setHint(`Outer BFS exploring to ${src} gate...`, outerRobot, _order.timeStr);
                stepBfsExploreOuter(outerRobot, network, outerRobot.currentNodeId, srcGateNode.id,
                    srcDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, outerRobot, t); render(); } });
            } else if (_solveMode === 'dfs') {
                _order.timeStr = _order.totalVisited + ' nodes';
                setHint(`Outer DFS exploring to ${src} gate...`, outerRobot, _order.timeStr);
                stepDfsExploreOuter(outerRobot, network, outerRobot.currentNodeId, srcGateNode.id,
                    srcDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, outerRobot, t); render(); } });
            } else if (_solveMode === 'astar') {
                _order.timeStr = _order.totalCost.toFixed(1) + 's';
                setHint(`Outer A* exploring to ${src} gate...`, outerRobot, _order.timeStr);
                stepAstarExploreOuter(outerRobot, network, outerRobot.currentNodeId, srcGateNode.id,
                    srcDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, outerRobot, t); render(); } });
            } else if (!window.isManualMode) {
                const pathToSrc = _solveMode === 'dfs'
                    ? dfsPath(outerAdj, outerRobot.currentNodeId, srcGateNode.id)
                    : astarPath(network.nodes, outerAdj, outerRobot.currentNodeId, srcGateNode.id);
                _order.timeStr = 'Heading to src';
                setHint(`Outer robot moving to ${src} gate.`, outerRobot);
                stepOuterAlongPath(outerRobot, pathToSrc, srcDone);
            } else {
                setHint(`[Manual] Click road segments to move the outer robot to the ${src} gate.`);
            }
            render();

        } else if (phase === 'outer_to_dst') {
            const srcGateNode = gateNodeFor(src);
            const dstGateNode = gateNodeFor(dst);
            if (!srcGateNode || !dstGateNode) { setHint('Gate nodes missing.'); return; }
            _currentPhaseGoal = dstGateNode.id;
            const dstDone = () => {
                setHint(`Outer robot AT ${dst} gate. Dst inner robot coming to receive.`);
                beginPhase('dst_inner_to_gate');
            };
            if (_solveMode === 'bfs') {
                _order.timeStr = _order.totalSteps + 's';
                setHint(`Outer BFS exploring to ${dst} gate...`, outerRobot, _order.timeStr);
                stepBfsExploreOuter(outerRobot, network, outerRobot.currentNodeId, dstGateNode.id,
                    dstDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, outerRobot, t); render(); } });
            } else if (_solveMode === 'dfs') {
                _order.timeStr = _order.totalVisited + ' nodes';
                setHint(`Outer DFS exploring to ${dst} gate...`, outerRobot, _order.timeStr);
                stepDfsExploreOuter(outerRobot, network, outerRobot.currentNodeId, dstGateNode.id,
                    dstDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, outerRobot, t); render(); } });
            } else if (_solveMode === 'astar') {
                _order.timeStr = _order.totalCost.toFixed(1) + 's';
                setHint(`Outer A* exploring to ${dst} gate...`, outerRobot, _order.timeStr);
                stepAstarExploreOuter(outerRobot, network, outerRobot.currentNodeId, dstGateNode.id,
                    dstDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, outerRobot, t); render(); } });
            } else if (!window.isManualMode) {
                const pathToDst = _solveMode === 'dfs'
                    ? dfsPath(outerAdj, outerRobot.currentNodeId, dstGateNode.id)
                    : astarPath(network.nodes, outerAdj, outerRobot.currentNodeId, dstGateNode.id);
                _order.timeStr = 'Heading to dst';
                setHint(`Outer robot moving to ${dst} gate.`, outerRobot);
                stepOuterAlongPath(outerRobot, pathToDst, dstDone);
            } else {
                setHint(`[Manual] Click road segments to move the outer robot to the ${dst} gate.`);
            }
            render();

        } else if (phase === 'dst_inner_to_gate') {
            const gateNodeId = stops[dst]['gate'];
            _currentPhaseGoal = gateNodeId;
            const dstGateDone = () => {
                setHint(`[${dst}] Inner robot received order. Delivering to house.`);
                beginPhase('inner_deliver');
            };
            if (_solveMode === 'bfs') {
                _order.timeStr = _order.totalSteps + 's';
                setHint(`[${dst}] BFS exploring to gate...`, dstInner, _order.timeStr);
                stepBfsExploreInner(dstInner, intNetDst, dstInner.currentNodeId, gateNodeId,
                    dstGateDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, dstInner, t); render(); } });
            } else if (_solveMode === 'dfs') {
                _order.timeStr = _order.totalVisited + ' nodes';
                setHint(`[${dst}] DFS exploring to gate...`, dstInner, _order.timeStr);
                stepDfsExploreInner(dstInner, intNetDst, dstInner.currentNodeId, gateNodeId,
                    dstGateDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, dstInner, t); render(); } });
            } else if (_solveMode === 'astar') {
                _order.timeStr = _order.totalCost.toFixed(1) + 's';
                setHint(`[${dst}] A* exploring to gate...`, dstInner, _order.timeStr);
                stepAstarExploreInner(dstInner, intNetDst, dstInner.currentNodeId, gateNodeId,
                    dstGateDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, dstInner, t); render(); } });
            } else if (!window.isManualMode) {
                _innerPath = _solveMode === 'dfs'
                    ? dfsPath(intNetDst.adj, dstInner.currentNodeId, gateNodeId)
                    : astarPath(intNetDst.nodes, intNetDst.adj, dstInner.currentNodeId, gateNodeId);
                _order.timeStr = 'Gate pickup ready';
                setHint(`[${dst}] Inner robot moving to gate to receive.`, dstInner);
                stepInner(dstInner, intNetDst, dstGateDone);
            } else {
                _innerPath = bfsPath(intNetDst.adj, dstInner.currentNodeId, gateNodeId);
                _order.timeStr = 'Manual mode';
                setHint(`[Manual] Click near the inner path to move the ${dst} robot to the gate.`);
            }
            render();

        } else if (phase === 'inner_deliver') {
            const houseKey = ['house1', 'house2', 'house3'][_order.houseIdx] || 'house1';
            const houseCoord = (() => {
                try {
                    const block = CFG.BLOCKS.find(b => b.id === dst);
                    if (!block) return null;
                    let idx = 0;
                    for (const cell of CFG.DICE5) {
                        if (cell.type !== 'house') continue;
                        if (idx === _order.houseIdx) return { x: block.x + cell.dx * CFG.BLOCK, z: block.z + cell.dz * CFG.BLOCK };
                        idx++;
                    }
                } catch (e) { }
                return null;
            })();
            const fallback = stops[dst][houseKey];
            const goalId = (houseCoord && nearestInt(intNetDst, houseCoord.x, houseCoord.z) !== null)
                ? nearestInt(intNetDst, houseCoord.x, houseCoord.z) : fallback;
            _currentPhaseGoal = goalId;
            const deliverDone = () => {
                _order.status = 'completed'; 
                _order.phase = 'done';
                if (_order.startTime) {
                    const endTime = Date.now();
                    _order.endTime = endTime;
                    _order.totalTime = endTime - _order.startTime;
                    _order.timeStr = Math.round(_order.totalTime / 1000) + "s";
                    console.log(`Order #${_order.id} bound totalTime: ${_order.totalTime}ms`);
                }
                setHint('✅ Order completed successfully!');
                [astarBtn, bfsBtn, dfsBtn, solveBtn].forEach(btn => { if(btn) btn.disabled = true; });
                const completedOrder = _order;
                _order = null;
                window.__activeRobotTime = '';
                render();
            };
            if (_solveMode === 'bfs') {
                _order.timeStr = _order.totalSteps + 's';
                setHint(`[${dst}] BFS exploring to house...`, dstInner, _order.timeStr);
                stepBfsExploreInner(dstInner, intNetDst, dstInner.currentNodeId, goalId,
                    deliverDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, dstInner, t); render(); } });
            } else if (_solveMode === 'dfs') {
                _order.timeStr = _order.totalVisited + ' nodes';
                setHint(`[${dst}] DFS exploring to house...`, dstInner, _order.timeStr);
                stepDfsExploreInner(dstInner, intNetDst, dstInner.currentNodeId, goalId,
                    deliverDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, dstInner, t); render(); } });
            } else if (_solveMode === 'astar') {
                _order.timeStr = _order.totalCost.toFixed(1) + 's';
                setHint(`[${dst}] A* exploring to house...`, dstInner, _order.timeStr);
                stepAstarExploreInner(dstInner, intNetDst, dstInner.currentNodeId, goalId,
                    deliverDone, (m, t) => { if (_order) { _order.timeStr = t; setHint(m, dstInner, t); render(); } });
            } else if (!window.isManualMode) {
                _innerPath = _solveMode === 'dfs'
                    ? dfsPath(intNetDst.adj, dstInner.currentNodeId, goalId)
                    : astarPath(intNetDst.nodes, intNetDst.adj, dstInner.currentNodeId, goalId);
                _order.timeStr = 'Deliver ready';
                setHint(`[${dst}] Inner robot delivering to house.`, dstInner);
                stepInner(dstInner, intNetDst, deliverDone);
            } else {
                _innerPath = bfsPath(intNetDst.adj, dstInner.currentNodeId, goalId);
                _order.timeStr = 'Manual mode';
                setHint(`[Manual] Click near the inner path to deliver to the house.`);
            }
            render();
        }
    }

    // ── Robot Traversal Controls ──────────────────────────────────────────
    function stepInner(innerRobot, intNet, onDone, pathOverride) {
        const path = Array.isArray(pathOverride) ? pathOverride : _innerPath;

        if (!path || path.length === 0) {
            requestAnimationFrame(onDone);
            return;
        }

        let idx = (innerRobot.currentNodeId === path[0]) ? 1 : 0;

        function next() {
            if (idx >= path.length) { onDone(); return; }
            const node = intNet.nodes.find(n => n.id === path[idx]);
            if (!node) { onDone(); return; }
            innerRobot.moveToNode(node);
            innerRobot.onArrival = () => { idx++; next(); };
        }
        next();
    }

    // ── Outer Robot Pathfinding ──────────────────────────────────────────
    function stepOuterAlongPath(outerRobot, path, onDone) {
        if (!path || path.length < 1) { onDone(); return; }
        let idx = 0;
        if (path[0] === outerRobot.currentNodeId) idx = 1;
        if (idx >= path.length) { onDone(); return; }

        function next() {
            if (idx >= path.length) { onDone(); return; }
            const node = network.nodes[path[idx]];
            if (!node) { onDone(); return; }
            outerRobot.moveDirectTo(node.x, node.z, () => {
                outerRobot.currentNodeId = node.id;
                idx++;
                next();
            });
        }
        next();
    }
    // ── UI facade for robot.js ────────────────────────────────────────────
    window.__robotUI = {
        getOrderByRobot: () => _order,
        getSelectedRobotId: () => 1,
        setStatus: setHint,
        setClicked: setHint,
        renderOrders: render,
        addNodeToOrderPath: (robot, nodeId) => { 
        },
        addTriangleToOrderPath: (robot, triId) => {
        },
        setBackedUp: () => { },
        completeOrder: () => { if (_order) { _order.status = 'delivering'; beginPhase('inner_deliver'); } },
        isOuterPhase: () => _order && (_order.phase === 'outer_to_src' || _order.phase === 'outer_to_dst'),
        getCurrentPhase: () => _order ? _order.phase : null,
        manualArrival: (nodeId) => {
            if (!_order || !window.isManualMode) return;
            if (nodeId !== _currentPhaseGoal) return; 
            const phase = _order.phase;
            if (phase === 'inner_pickup') beginPhase('inner_to_gate');
            else if (phase === 'inner_to_gate') { if (_order.isSameBlock) beginPhase('inner_deliver'); else beginPhase('outer_to_src'); }
            else if (phase === 'outer_to_src') beginPhase('outer_to_dst');
            else if (phase === 'outer_to_dst') beginPhase('dst_inner_to_gate');
            else if (phase === 'dst_inner_to_gate') beginPhase('inner_deliver');
            else if (phase === 'inner_deliver') { 
                _order.status = 'completed'; 
                _order.phase = 'done'; 
                if (_order.startTime) {
                    const endTime = Date.now();
                    _order.endTime = endTime;
                    _order.totalTime = endTime - _order.startTime;
                    _order.timeStr = Math.round(_order.totalTime / 1000) + "s";
                    console.log(`Order #${_order.id} bound totalTime: ${_order.totalTime}ms (Manual)`);
                }
                setHint('✅ Order completed successfully!'); 
                _order = null; 
                window.__activeRobotTime = '';
                render(); 
            }
        },
    };

    render();

    // ── Live UI Update Loop ──────────────────────────────────────────────
    setInterval(() => {
        if (_order && _order.startTime && _order.status === 'delivering') {
            const currentTime = Date.now() - _order.startTime;
            const timeInSeconds = Math.floor(currentTime / 1000);
            const timeStr = timeInSeconds + 's';
            
            if (_order.timeStr !== timeStr) {
                _order.timeStr = timeStr;
                window.__activeRobotTime = timeStr;
                render();
            }
        }
    }, 100); 
}

// ── Inner DFS Demo: gate → restaurant → gate ─────────────────────────────
window.runInnerDfsDemo = function (blockId) {
    blockId = blockId || 'A';
    const robot = window._innerRobots && window._innerRobots[blockId];
    if (!robot) { console.warn('runInnerDfsDemo: no inner robot for block', blockId); return; }
    const intNet = buildInternalNetwork(blockId);
    const stops = window.BuildingStops[blockId];
    const gateId = stops['gate'];
    const restaurantId = stops['restaurant'];
    const hint = (m) => { const el = document.getElementById('ordersHint'); if (el) el.textContent = m; };

    hint(`[${blockId}] DFS: gate → restaurant...`);

    stepDfsExploreInner(robot, intNet, gateId, restaurantId, () => {
        hint(`[${blockId}] Reached restaurant! Returning to gate...`);
        setTimeout(() => {
            stepDfsExploreInner(robot, intNet, robot.currentNodeId, gateId, () => {
                hint(`✅ [${blockId}] DFS complete: back at gate.`);
            }, hint);
        }, 800);
    }, hint);
};

// ── Outer DFS Demo: gate A → gate B ─────────────────────────────────────
window.runOuterDfsDemo = function () {
    const robot = window._outerRobots && window._outerRobots[0];
    if (!robot) { console.warn('runOuterDfsDemo: no outer robot found'); return; }
    const network = window.PathNetwork;
    if (!network) { console.warn('runOuterDfsDemo: PathNetwork not ready'); return; }
    const gateA = window.BlockGateNodes['A'];
    const gateB = window.BlockGateNodes['B'];
    const hint = (m) => { const el = document.getElementById('ordersHint'); if (el) el.textContent = m; };

    hint('Outer DFS: gate A → gate B...');

    stepDfsExploreOuter(robot, network, robot.currentNodeId, gateA, () => {
        hint('Reached gate A! DFS to gate B...');
        setTimeout(() => {
            stepDfsExploreOuter(robot, network, robot.currentNodeId, gateB, () => {
                hint('✅ Outer DFS complete: reached gate B.');
            }, hint);
        }, 800);
    }, hint);
};