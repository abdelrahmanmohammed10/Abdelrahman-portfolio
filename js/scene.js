/* 
 * V3 Interplanetary Portfolio Redesign
 * 6. The Earth System (WebGL Scene)
 */

window.AppScene = {
  canvas: null,
  scene: null,
  camera: null,
  renderer: null,
  earth: null,
  moon: null,
  starField: null,
  isWebGLSupported: false,
  
  // Animation state
  targetPositions: { earth: {x:0, y:0, scale:1}, moon: {x:0, y:0, scale:0} },
  currentPositions: { earth: {x:0, y:0, scale:1}, moon: {x:0, y:0, scale:0} }
};

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('three-planet-canvas');
  if (!canvas) return;
  window.AppScene.canvas = canvas;

  // WebGL Feature Detect
  try {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      window.AppScene.isWebGLSupported = true;
    }
  } catch (e) {}

  if (!window.AppScene.isWebGLSupported || typeof THREE === 'undefined') {
    document.body.classList.add('no-webgl-fallback');
    return;
  }

  initScene();
});

function initScene() {
  const S = window.AppScene;
  S.scene = new THREE.Scene();

  S.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  S.camera.position.z = 10;

  // Cap pixel ratio at 2 for performance
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  
  S.renderer = new THREE.WebGLRenderer({
    canvas: S.canvas,
    alpha: true,
    antialias: window.innerWidth > 768,
    powerPreference: "high-performance"
  });
  S.renderer.setPixelRatio(pixelRatio);
  S.renderer.setSize(window.innerWidth, window.innerHeight);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  S.scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight.position.set(-5, 3, 5);
  S.scene.add(dirLight);

  // Aurora Emerald Rim Light (Tertiary Highlight)
  const rimLight = new THREE.DirectionalLight(0x2EC4B6, 1.5);
  rimLight.position.set(5, -2, -5);
  S.scene.add(rimLight);

  // Starfield
  const starCount = window.innerWidth > 768 ? 1000 : 400;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for(let i=0; i<starCount*3; i+=3){
    starPos[i] = (Math.random() - 0.5) * 60;
    starPos[i+1] = (Math.random() - 0.5) * 60;
    starPos[i+2] = -Math.random() * 30 - 5;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.6 });
  S.starField = new THREE.Points(starGeo, starMat);
  S.scene.add(S.starField);

  // Load Models
  const manager = window.THREE_MANAGER || new THREE.LoadingManager();
  const loader = new THREE.GLTFLoader(manager);

  // Earth Group
  S.earth = new THREE.Group();
  S.scene.add(S.earth);
  loader.load('glb/earth.glb', (gltf) => {
    setupModel(gltf.scene, S.earth, 2.5);
  });

  // Moon Group
  S.moon = new THREE.Group();
  S.moon.scale.set(0,0,0); // Starts hidden
  S.scene.add(S.moon);
  loader.load('glb/moon.glb', (gltf) => {
    setupModel(gltf.scene, S.moon, 1.8);
  });

  // Resize
  window.addEventListener('resize', debounceResize);
  window.addEventListener('orientationchange', debounceResize);

  // Start Loop
  animateScene();
}

function setupModel(model, group, targetSize) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) {
    const scale = targetSize / maxDim;
    model.scale.set(scale, scale, scale);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  }
  group.add(model);
}

function animateScene() {
  requestAnimationFrame(animateScene);
  const S = window.AppScene;
  
  if (S.starField) S.starField.rotation.y += 0.0002;
  
  if (S.earth && S.earth.children.length > 0) {
    S.earth.rotation.y += 0.002;
    // Glide position/scale
    S.currentPositions.earth.x += (S.targetPositions.earth.x - S.currentPositions.earth.x) * 0.05;
    S.currentPositions.earth.y += (S.targetPositions.earth.y - S.currentPositions.earth.y) * 0.05;
    S.currentPositions.earth.scale += (S.targetPositions.earth.scale - S.currentPositions.earth.scale) * 0.05;
    
    S.earth.position.set(S.currentPositions.earth.x, S.currentPositions.earth.y, 0);
    S.earth.scale.setScalar(S.currentPositions.earth.scale);
  }

  if (S.moon && S.moon.children.length > 0) {
    S.moon.rotation.y += 0.001;
    S.currentPositions.moon.x += (S.targetPositions.moon.x - S.currentPositions.moon.x) * 0.05;
    S.currentPositions.moon.y += (S.targetPositions.moon.y - S.currentPositions.moon.y) * 0.05;
    S.currentPositions.moon.scale += (S.targetPositions.moon.scale - S.currentPositions.moon.scale) * 0.05;
    
    S.moon.position.set(S.currentPositions.moon.x, S.currentPositions.moon.y, 0);
    S.moon.scale.setScalar(S.currentPositions.moon.scale);
  }

  S.renderer.render(S.scene, S.camera);
}

let resizeTimeout;
function debounceResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const S = window.AppScene;
    if (!S.camera) return;
    S.camera.aspect = window.innerWidth / window.innerHeight;
    S.camera.updateProjectionMatrix();
    S.renderer.setSize(window.innerWidth, window.innerHeight);
    // Let slides.js recalculate the specific positions based on new breakpoint
    window.dispatchEvent(new Event('sceneResize'));
  }, 150);
}

// Global API exposed for slides.js
window.moveEarthTo = function(pctX, pctY, scale, target) {
  const S = window.AppScene;
  if (!S.isWebGLSupported) return;
  
  // Calculate raw units based on camera frustum at z=0
  const vFov = (S.camera.fov * Math.PI) / 180;
  const height = 2 * Math.tan(vFov / 2) * S.camera.position.z;
  const width = height * S.camera.aspect;

  // pctX, pctY are percentages from center (e.g. 0 = center, -50 = left edge)
  const xUnit = (pctX / 100) * (width / 2);
  const yUnit = (pctY / 100) * (height / 2);

  if (target === 'earth') {
    S.targetPositions.earth = { x: xUnit, y: -yUnit, scale: scale }; // Invert Y because WebGL Y is up
  } else if (target === 'moon') {
    S.targetPositions.moon = { x: xUnit, y: -yUnit, scale: scale };
  }
};
