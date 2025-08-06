// ===== GAME ENGINE CORE =====
class CityBuilder {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Game state
        this.gameState = {
            budget: 100000,
            population: 0,
            happiness: 50,
            isPaused: false,
            gameSpeed: 1,
            selectedTool: 'build',
            selectedBuilding: null
        };
        
        // Grid system
        this.gridSize = 50;
        this.cellSize = 2;
        this.grid = [];
        this.buildings = [];
        this.roads = [];
        
        // Game objects
        this.groundPlane = null;
        this.gridHelper = null;
        this.placementPreview = null;
        
        // Initialize game
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupGrid();
        this.setupUI();
        this.setupEventListeners();
        this.animate();
        
        // Hide loading screen and show game
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
            document.getElementById('game-container').classList.remove('hidden');
            this.showNotification('Welcome to Skyline Cities! Start building your dream city.', 'success');
        }, 3000);
    }
    
    // ===== 3D SCENE SETUP =====
    setupScene() {
        const viewport = document.getElementById('game-viewport');
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(30, 40, 30);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        viewport.appendChild(this.renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(this.gridSize * this.cellSize, this.gridSize * this.cellSize);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3a7c47 }); // Grass green
        this.groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
        this.groundPlane.rotation.x = -Math.PI / 2;
        this.groundPlane.receiveShadow = true;
        this.scene.add(this.groundPlane);
        
        // Grid helper
        this.gridHelper = new THREE.GridHelper(
            this.gridSize * this.cellSize, 
            this.gridSize, 
            0x888888, 
            0x444444
        );
        this.gridHelper.material.opacity = 0.3;
        this.gridHelper.material.transparent = true;
        this.scene.add(this.gridHelper);
    }
    
    // ===== GRID SYSTEM =====
    setupGrid() {
        // Initialize empty grid
        for (let x = 0; x < this.gridSize; x++) {
            this.grid[x] = [];
            for (let z = 0; z < this.gridSize; z++) {
                this.grid[x][z] = {
                    type: 'empty',
                    building: null,
                    hasRoad: false,
                    hasPower: false,
                    hasWater: false,
                    zoneType: null
                };
            }
        }
    }
    
    // ===== BUILDING SYSTEM =====
    createBuilding(type, x, z) {
        const buildings = {
            road: () => this.createRoad(x, z),
            residential: () => this.createZone('residential', x, z),
            commercial: () => this.createZone('commercial', x, z),
            industrial: () => this.createZone('industrial', x, z),
            'power-plant': () => this.createService('power-plant', x, z),
            'water-tower': () => this.createService('water-tower', x, z),
            hospital: () => this.createService('hospital', x, z),
            school: () => this.createService('school', x, z),
            'fire-station': () => this.createService('fire-station', x, z),
            'police-station': () => this.createService('police-station', x, z)
        };
        
        if (buildings[type]) {
            return buildings[type]();
        }
        return null;
    }
    
    createRoad(x, z) {
        const geometry = new THREE.BoxGeometry(this.cellSize * 0.9, 0.1, this.cellSize * 0.9);
        const material = new THREE.MeshLambertMaterial({ color: 0x555555 });
        const road = new THREE.Mesh(geometry, material);
        
        const worldX = (x - this.gridSize / 2) * this.cellSize + this.cellSize / 2;
        const worldZ = (z - this.gridSize / 2) * this.cellSize + this.cellSize / 2;
        
        road.position.set(worldX, 0.05, worldZ);
        road.receiveShadow = true;
        
        this.scene.add(road);
        this.grid[x][z].type = 'road';
        this.grid[x][z].building = road;
        this.grid[x][z].hasRoad = true;
        
        return road;
    }
    
    createZone(zoneType, x, z) {
        const colors = {
            residential: 0x4CAF50,
            commercial: 0x2196F3,
            industrial: 0xFF9800
        };
        
        const geometry = new THREE.BoxGeometry(this.cellSize * 0.8, 0.2, this.cellSize * 0.8);
        const material = new THREE.MeshLambertMaterial({ 
            color: colors[zoneType],
            transparent: true,
            opacity: 0.7
        });
        const zone = new THREE.Mesh(geometry, material);
        
        const worldX = (x - this.gridSize / 2) * this.cellSize + this.cellSize / 2;
        const worldZ = (z - this.gridSize / 2) * this.cellSize + this.cellSize / 2;
        
        zone.position.set(worldX, 0.1, worldZ);
        zone.castShadow = true;
        zone.receiveShadow = true;
        
        this.scene.add(zone);
        this.grid[x][z].type = 'zone';
        this.grid[x][z].zoneType = zoneType;
        this.grid[x][z].building = zone;
        
        // Spawn buildings over time if connected to road
        setTimeout(() => this.developZone(x, z), Math.random() * 5000 + 2000);
        
        return zone;
    }
    
    createService(serviceType, x, z) {
        const buildingTypes = {
            'power-plant': { color: 0x8B4513, height: 6, width: 3 },
            'water-tower': { color: 0x4169E1, height: 8, width: 1.5 },
            hospital: { color: 0xFF1744, height: 4, width: 2.5 },
            school: { color: 0xFFEB3B, height: 3, width: 2 },
            'fire-station': { color: 0xFF5722, height: 3, width: 2 },
            'police-station': { color: 0x3F51B5, height: 3, width: 2 }
        };
        
        const buildingData = buildingTypes[serviceType];
        const geometry = new THREE.BoxGeometry(
            this.cellSize * buildingData.width / 2, 
            buildingData.height, 
            this.cellSize * buildingData.width / 2
        );
        const material = new THREE.MeshLambertMaterial({ color: buildingData.color });
        const building = new THREE.Mesh(geometry, material);
        
        const worldX = (x - this.gridSize / 2) * this.cellSize + this.cellSize / 2;
        const worldZ = (z - this.gridSize / 2) * this.cellSize + this.cellSize / 2;
        
        building.position.set(worldX, buildingData.height / 2, worldZ);
        building.castShadow = true;
        building.receiveShadow = true;
        
        this.scene.add(building);
        this.grid[x][z].type = 'service';
        this.grid[x][z].building = building;
        this.grid[x][z].serviceType = serviceType;
        
        return building;
    }
    
    developZone(x, z) {
        const cell = this.grid[x][z];
        if (cell.type !== 'zone' || !this.hasRoadAccess(x, z)) return;
        
        // Remove zone marker and create actual building
        this.scene.remove(cell.building);
        
        const heights = {
            residential: 3 + Math.random() * 8,
            commercial: 4 + Math.random() * 12,
            industrial: 2 + Math.random() * 6
        };
        
        const colors = {
            residential: 0x8BC34A,
            commercial: 0x03A9F4,
            industrial: 0xFFA726
        };
        
        const height = heights[cell.zoneType];
        const geometry = new THREE.BoxGeometry(
            this.cellSize * 0.7, 
            height, 
            this.cellSize * 0.7
        );
        const material = new THREE.MeshLambertMaterial({ color: colors[cell.zoneType] });
        const building = new THREE.Mesh(geometry, material);
        
        const worldX = (x - this.gridSize / 2) * this.cellSize + this.cellSize / 2;
        const worldZ = (z - this.gridSize / 2) * this.cellSize + this.cellSize / 2;
        
        building.position.set(worldX, height / 2, worldZ);
        building.castShadow = true;
        building.receiveShadow = true;
        
        this.scene.add(building);
        cell.building = building;
        cell.type = 'building';
        
        // Update population and happiness
        if (cell.zoneType === 'residential') {
            this.gameState.population += Math.floor(Math.random() * 10) + 5;
            this.updateUI();
        }
        
        this.showNotification(`New ${cell.zoneType} building constructed!`, 'success');
    }
    
    hasRoadAccess(x, z) {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        return directions.some(([dx, dz]) => {
            const nx = x + dx;
            const nz = z + dz;
            return nx >= 0 && nx < this.gridSize && 
                   nz >= 0 && nz < this.gridSize && 
                   this.grid[nx][nz].hasRoad;
        });
    }
    
    // ===== UI SYSTEM =====
    setupUI() {
        this.updateUI();
        
        // Building panel toggle
        const buildBtn = document.getElementById('build-btn');
        const buildingPanel = document.getElementById('building-panel');
        
        buildBtn.addEventListener('click', () => {
            buildingPanel.classList.toggle('open');
        });
        
        // Close panel
        document.getElementById('close-panel').addEventListener('click', () => {
            buildingPanel.classList.remove('open');
        });
        
        // Building selection
        document.querySelectorAll('.building-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.building-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                this.gameState.selectedBuilding = item.dataset.type;
                buildingPanel.classList.remove('open');
            });
        });
        
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.gameState.selectedTool = btn.id.replace('-btn', '');
            });
        });
        
        // Game speed controls
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.gameState.isPaused = !this.gameState.isPaused;
            const icon = document.querySelector('#pause-btn i');
            icon.className = this.gameState.isPaused ? 'fas fa-play' : 'fas fa-pause';
        });
        
        ['1x', '2x', '3x'].forEach(speed => {
            document.getElementById(`speed-${speed}`).addEventListener('click', () => {
                document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                document.getElementById(`speed-${speed}`).classList.add('active');
                this.gameState.gameSpeed = parseInt(speed);
            });
        });
        
        // Camera controls
        document.getElementById('rotate-left').addEventListener('click', () => {
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = -2;
            setTimeout(() => this.controls.autoRotate = false, 1000);
        });
        
        document.getElementById('rotate-right').addEventListener('click', () => {
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 2;
            setTimeout(() => this.controls.autoRotate = false, 1000);
        });
    }
    
    updateUI() {
        document.getElementById('population').textContent = this.gameState.population.toLocaleString();
        document.getElementById('budget').textContent = '$' + this.gameState.budget.toLocaleString();
        document.getElementById('happiness').textContent = this.gameState.happiness + '%';
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.getElementById('notifications').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
    
    // ===== EVENT HANDLERS =====
    setupEventListeners() {
        // Mouse events
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
    }
    
    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update placement preview
        this.updatePlacementPreview();
    }
    
    onMouseClick(event) {
        if (this.gameState.selectedTool === 'build' && this.gameState.selectedBuilding) {
            this.placeBuildingAtCursor();
        } else if (this.gameState.selectedTool === 'bulldoze') {
            this.bulldozeAtCursor();
        } else if (this.gameState.selectedTool === 'info') {
            this.showInfoAtCursor();
        }
    }
    
    onKeyDown(event) {
        switch (event.key) {
            case '1':
                this.gameState.selectedTool = 'build';
                this.updateToolButtons();
                break;
            case '2':
                this.gameState.selectedTool = 'bulldoze';
                this.updateToolButtons();
                break;
            case '3':
                this.gameState.selectedTool = 'info';
                this.updateToolButtons();
                break;
            case ' ':
                event.preventDefault();
                this.gameState.isPaused = !this.gameState.isPaused;
                document.getElementById('pause-btn').click();
                break;
        }
    }
    
    updateToolButtons() {
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${this.gameState.selectedTool}-btn`).classList.add('active');
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // ===== PLACEMENT SYSTEM =====
    updatePlacementPreview() {
        if (this.gameState.selectedTool !== 'build' || !this.gameState.selectedBuilding) {
            this.removePlacementPreview();
            return;
        }
        
        const gridPos = this.getGridPosition();
        if (!gridPos) {
            this.removePlacementPreview();
            return;
        }
        
        const { x, z } = gridPos;
        if (!this.isValidPlacement(x, z)) {
            this.removePlacementPreview();
            return;
        }
        
        this.removePlacementPreview();
        this.createPlacementPreview(x, z);
    }
    
    createPlacementPreview(x, z) {
        const geometry = new THREE.BoxGeometry(this.cellSize * 0.8, 0.5, this.cellSize * 0.8);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: 0.5 
        });
        this.placementPreview = new THREE.Mesh(geometry, material);
        
        const worldX = (x - this.gridSize / 2) * this.cellSize + this.cellSize / 2;
        const worldZ = (z - this.gridSize / 2) * this.cellSize + this.cellSize / 2;
        
        this.placementPreview.position.set(worldX, 0.25, worldZ);
        this.scene.add(this.placementPreview);
    }
    
    removePlacementPreview() {
        if (this.placementPreview) {
            this.scene.remove(this.placementPreview);
            this.placementPreview = null;
        }
    }
    
    getGridPosition() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.groundPlane);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            const x = Math.floor((point.x + this.gridSize * this.cellSize / 2) / this.cellSize);
            const z = Math.floor((point.z + this.gridSize * this.cellSize / 2) / this.cellSize);
            
            if (x >= 0 && x < this.gridSize && z >= 0 && z < this.gridSize) {
                return { x, z };
            }
        }
        return null;
    }
    
    isValidPlacement(x, z) {
        return this.grid[x][z].type === 'empty';
    }
    
    placeBuildingAtCursor() {
        const gridPos = this.getGridPosition();
        if (!gridPos) return;
        
        const { x, z } = gridPos;
        if (!this.isValidPlacement(x, z)) {
            this.showNotification('Cannot build here!', 'error');
            return;
        }
        
        const cost = this.getBuildingCost(this.gameState.selectedBuilding);
        if (this.gameState.budget < cost) {
            this.showNotification('Insufficient funds!', 'error');
            return;
        }
        
        const building = this.createBuilding(this.gameState.selectedBuilding, x, z);
        if (building) {
            this.gameState.budget -= cost;
            this.updateUI();
            this.showNotification(`Built ${this.gameState.selectedBuilding}!`, 'success');
        }
    }
    
    bulldozeAtCursor() {
        const gridPos = this.getGridPosition();
        if (!gridPos) return;
        
        const { x, z } = gridPos;
        const cell = this.grid[x][z];
        
        if (cell.type === 'empty') {
            this.showNotification('Nothing to demolish here!', 'warning');
            return;
        }
        
        if (cell.building) {
            this.scene.remove(cell.building);
            this.gameState.budget += this.getBuildingCost(cell.type) * 0.5; // 50% refund
            this.updateUI();
        }
        
        // Reset cell
        this.grid[x][z] = {
            type: 'empty',
            building: null,
            hasRoad: false,
            hasPower: false,
            hasWater: false,
            zoneType: null
        };
        
        this.showNotification('Building demolished!', 'success');
    }
    
    showInfoAtCursor() {
        const gridPos = this.getGridPosition();
        if (!gridPos) return;
        
        const { x, z } = gridPos;
        const cell = this.grid[x][z];
        
        const infoDiv = document.getElementById('building-info');
        const nameDiv = document.getElementById('building-name');
        const descDiv = document.getElementById('building-description');
        
        if (cell.type === 'empty') {
            nameDiv.textContent = 'Empty Land';
            descDiv.textContent = 'Available for construction';
        } else {
            nameDiv.textContent = cell.type.charAt(0).toUpperCase() + cell.type.slice(1);
            descDiv.textContent = `Type: ${cell.type}`;
            if (cell.zoneType) descDiv.textContent += `, Zone: ${cell.zoneType}`;
        }
        
        infoDiv.classList.remove('hidden');
        
        setTimeout(() => {
            infoDiv.classList.add('hidden');
        }, 3000);
    }
    
    getBuildingCost(buildingType) {
        const costs = {
            road: 50,
            'power-line': 25,
            'water-pipe': 30,
            residential: 100,
            commercial: 150,
            industrial: 200,
            'power-plant': 5000,
            'water-tower': 3000,
            hospital: 8000,
            school: 4000,
            'fire-station': 6000,
            'police-station': 7000
        };
        return costs[buildingType] || 100;
    }
    
    // ===== GAME LOOP =====
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.gameState.isPaused) {
            this.updateSimulation();
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    updateSimulation() {
        // Update game systems based on game speed
        const now = Date.now();
        if (!this.lastUpdate) this.lastUpdate = now;
        
        const deltaTime = (now - this.lastUpdate) * this.gameState.gameSpeed;
        
        if (deltaTime > 1000) { // Update every second
            this.updateEconomy();
            this.updateHappiness();
            this.lastUpdate = now;
        }
    }
    
    updateEconomy() {
        // Generate income from commercial and industrial buildings
        let income = 0;
        let expenses = 50; // Base maintenance cost
        
        for (let x = 0; x < this.gridSize; x++) {
            for (let z = 0; z < this.gridSize; z++) {
                const cell = this.grid[x][z];
                if (cell.type === 'building') {
                    if (cell.zoneType === 'commercial') {
                        income += Math.floor(Math.random() * 20) + 10;
                    } else if (cell.zoneType === 'industrial') {
                        income += Math.floor(Math.random() * 30) + 15;
                    }
                    expenses += 5; // Building maintenance
                } else if (cell.type === 'service') {
                    expenses += 20; // Service building maintenance
                }
            }
        }
        
        // Population tax
        income += this.gameState.population * 2;
        
        this.gameState.budget += income - expenses;
        this.updateUI();
        
        if (this.gameState.budget < 0) {
            this.showNotification('City is running out of money!', 'warning');
        }
    }
    
    updateHappiness() {
        let happiness = 50;
        
        // Basic services bonus
        const serviceTypes = ['hospital', 'school', 'fire-station', 'police-station'];
        serviceTypes.forEach(service => {
            const count = this.countBuildingType(service);
            happiness += Math.min(count * 5, 20);
        });
        
        // Population density penalty
        if (this.gameState.population > 1000) {
            happiness -= Math.floor((this.gameState.population - 1000) / 100);
        }
        
        // Budget impact
        if (this.gameState.budget < 1000) {
            happiness -= 10;
        }
        
        this.gameState.happiness = Math.max(0, Math.min(100, happiness));
        this.updateUI();
    }
    
    countBuildingType(type) {
        let count = 0;
        for (let x = 0; x < this.gridSize; x++) {
            for (let z = 0; z < this.gridSize; z++) {
                const cell = this.grid[x][z];
                if (cell.serviceType === type) {
                    count++;
                }
            }
        }
        return count;
    }
}

// ===== INITIALIZE GAME =====
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new CityBuilder();
});