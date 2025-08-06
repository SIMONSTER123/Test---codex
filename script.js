// Global variables
let scene, camera, renderer, controls;
let heroObjects = [];
let portfolioScenes = {};
let mouse = new THREE.Vector2();
let windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initHeroScene();
    initPortfolioScenes();
    setupScrollAnimations();
    setupInteractions();
    animate();
});

// Hero Scene Setup
function initHeroScene() {
    const container = document.getElementById('three-container');
    
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00f5ff, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const pointLight1 = new THREE.PointLight(0xff00ff, 1, 100);
    pointLight1.position.set(-25, 25, 25);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xffff00, 0.8, 100);
    pointLight2.position.set(25, -25, 25);
    scene.add(pointLight2);
    
    // Create floating objects
    createFloatingObjects();
    
    // Create particle system
    createParticleSystem();
    
    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = Math.PI / 1.5;
}

// Create floating geometric objects
function createFloatingObjects() {
    const geometries = [
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.SphereGeometry(1.5, 32, 32),
        new THREE.ConeGeometry(1, 3, 8),
        new THREE.TorusGeometry(1.5, 0.5, 16, 32),
        new THREE.OctahedronGeometry(1.5),
    ];
    
    const materials = [
        new THREE.MeshPhongMaterial({ 
            color: 0x00f5ff, 
            transparent: true, 
            opacity: 0.8,
            shininess: 100
        }),
        new THREE.MeshPhongMaterial({ 
            color: 0xff00ff, 
            transparent: true, 
            opacity: 0.8,
            shininess: 100
        }),
        new THREE.MeshPhongMaterial({ 
            color: 0xffff00, 
            transparent: true, 
            opacity: 0.8,
            shininess: 100
        }),
    ];
    
    for (let i = 0; i < 15; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = materials[Math.floor(Math.random() * materials.length)].clone();
        const mesh = new THREE.Mesh(geometry, material);
        
        // Random position
        mesh.position.set(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60
        );
        
        // Random rotation
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        // Random scale
        const scale = 0.5 + Math.random() * 1.5;
        mesh.scale.set(scale, scale, scale);
        
        // Store animation properties
        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: 0.001 + Math.random() * 0.002,
            floatRadius: 2 + Math.random() * 3,
            originalY: mesh.position.y
        };
        
        scene.add(mesh);
        heroObjects.push(mesh);
    }
}

// Create particle system
function createParticleSystem() {
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        
        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.2 + 0.5, 1, 0.5);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    heroObjects.push(particleSystem);
}

// Initialize portfolio 3D scenes
function initPortfolioScenes() {
    // Rotating Cube
    initCubeScene();
    
    // Morphing Sphere
    initSphereScene();
    
    // Glowing Torus
    initTorusScene();
}

function initCubeScene() {
    const container = document.getElementById('portfolio-cube');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Create wireframe cube
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0x00f5ff, linewidth: 2 });
    const cube = new THREE.LineSegments(edges, material);
    scene.add(cube);
    
    // Inner solid cube
    const innerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00f5ff, 
        transparent: true, 
        opacity: 0.1 
    });
    const innerCube = new THREE.Mesh(geometry, innerMaterial);
    scene.add(innerCube);
    
    camera.position.z = 8;
    
    portfolioScenes.cube = { scene, camera, renderer, objects: [cube, innerCube] };
}

function initSphereScene() {
    const container = document.getElementById('portfolio-sphere');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Create morphing sphere
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xff00ff, 
        wireframe: true 
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    
    // Store original vertices for morphing
    const originalVertices = geometry.attributes.position.array.slice();
    sphere.userData = { originalVertices, morphTime: 0 };
    
    camera.position.z = 6;
    
    portfolioScenes.sphere = { scene, camera, renderer, objects: [sphere] };
}

function initTorusScene() {
    const container = document.getElementById('portfolio-torus');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Create glowing torus
    const geometry = new THREE.TorusGeometry(2, 0.8, 16, 32);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.8
    });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);
    
    // Add glow effect
    const glowGeometry = new THREE.TorusGeometry(2.2, 1, 16, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00, 
        transparent: true, 
        opacity: 0.2 
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);
    
    camera.position.z = 8;
    
    portfolioScenes.torus = { scene, camera, renderer, objects: [torus, glow] };
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update hero scene
    updateHeroScene();
    
    // Update portfolio scenes
    updatePortfolioScenes();
    
    // Render scenes
    if (renderer && scene && camera) {
        controls.update();
        renderer.render(scene, camera);
    }
    
    // Render portfolio scenes
    Object.values(portfolioScenes).forEach(sceneData => {
        sceneData.renderer.render(sceneData.scene, sceneData.camera);
    });
}

function updateHeroScene() {
    const time = Date.now() * 0.001;
    
    heroObjects.forEach((object, index) => {
        if (object.userData && object.userData.rotationSpeed) {
            // Rotation
            object.rotation.x += object.userData.rotationSpeed.x;
            object.rotation.y += object.userData.rotationSpeed.y;
            object.rotation.z += object.userData.rotationSpeed.z;
            
            // Floating motion
            object.position.y = object.userData.originalY + 
                Math.sin(time * object.userData.floatSpeed + index) * object.userData.floatRadius;
        }
        
        // Particle system rotation
        if (object.isPoints) {
            object.rotation.y += 0.001;
        }
    });
    
    // Mouse interaction
    if (camera) {
        camera.position.x += (mouse.x * 5 - camera.position.x) * 0.02;
        camera.position.y += (-mouse.y * 5 - camera.position.y) * 0.02;
    }
}

function updatePortfolioScenes() {
    const time = Date.now() * 0.001;
    
    // Update cube
    if (portfolioScenes.cube) {
        portfolioScenes.cube.objects.forEach(obj => {
            obj.rotation.x += 0.01;
            obj.rotation.y += 0.01;
        });
    }
    
    // Update sphere (morphing)
    if (portfolioScenes.sphere) {
        const sphere = portfolioScenes.sphere.objects[0];
        sphere.userData.morphTime += 0.02;
        
        const positions = sphere.geometry.attributes.position;
        const originalVertices = sphere.userData.originalVertices;
        
        for (let i = 0; i < positions.count; i++) {
            const x = originalVertices[i * 3];
            const y = originalVertices[i * 3 + 1];
            const z = originalVertices[i * 3 + 2];
            
            const noise = Math.sin(sphere.userData.morphTime + x * 0.5) * 
                         Math.cos(sphere.userData.morphTime + y * 0.5) * 
                         Math.sin(sphere.userData.morphTime + z * 0.5) * 0.3;
            
            positions.setXYZ(i, x + noise, y + noise, z + noise);
        }
        
        positions.needsUpdate = true;
        sphere.rotation.y += 0.005;
    }
    
    // Update torus (glowing)
    if (portfolioScenes.torus) {
        portfolioScenes.torus.objects.forEach((obj, index) => {
            obj.rotation.x += 0.02;
            obj.rotation.y += 0.01;
            
            // Pulsing glow effect
            if (index === 1) { // glow object
                obj.material.opacity = 0.1 + Math.sin(time * 3) * 0.1;
            }
        });
    }
}

// Setup scroll animations
function setupScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Setup interactions
function setupInteractions() {
    // Mouse tracking
    document.addEventListener('mousemove', onMouseMove, false);
    
    // Window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Smooth scrolling for navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // CTA button interaction
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Form submission
    const form = document.querySelector('.contact-form form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simulate form submission
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.style.opacity = '0.7';
            
            setTimeout(() => {
                submitBtn.textContent = 'Message Sent!';
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.opacity = '1';
                    form.reset();
                }, 2000);
            }, 1500);
        });
    }
}

function onMouseMove(event) {
    mouse.x = (event.clientX - windowHalf.x) / windowHalf.x;
    mouse.y = (event.clientY - windowHalf.y) / windowHalf.y;
}

function onWindowResize() {
    windowHalf.set(window.innerWidth / 2, window.innerHeight / 2);
    
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Resize portfolio scenes
    Object.values(portfolioScenes).forEach(sceneData => {
        const container = sceneData.renderer.domElement.parentNode;
        sceneData.camera.aspect = container.offsetWidth / container.offsetHeight;
        sceneData.camera.updateProjectionMatrix();
        sceneData.renderer.setSize(container.offsetWidth, container.offsetHeight);
    });
}