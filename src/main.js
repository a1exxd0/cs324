import "./style.css";
import * as THREE from "three";
import { SwatCharacter } from "./SwatCharacter.js";
import { ThirdPersonCamera } from "./ThirdPersonCamera.js";
import SceneLoader from "./SceneLoader.js";
import { HUD } from "./HUD.js";
import InteractionManager from "./InteractionManager.js";

// Suppress Three.js texture unit warnings
const originalWarn = console.warn;
console.warn = function (message, ...args) {
  if (typeof message === "string" && message.includes("texture units")) {
    return;
  }
  originalWarn.apply(console, [message, ...args]);
};

function flickerLight(
  light,
  time,
  { base = 8, variance = 3, speed = 12, dropoutChance = 0.002 } = {},
) {
  if (!light) return;

  // Occasional hard flicker-off
  if (Math.random() < dropoutChance) {
    light.intensity = 0;
    return;
  }

  // Noisy sinusoidal flicker
  light.intensity = base + Math.sin(time * speed + Math.random()) * variance;
}

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.03));

// Camera and renderer
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// HUD setup
const hud = new HUD();
hud.setObjective("Find the Emergency Override Keycard");

// Interaction system
const interactionManager = new InteractionManager(camera, scene);

// Level loading
const sceneLoader = new SceneLoader();
const levelData = sceneLoader.loadLevel("level1", scene, interactionManager);
const thirdPersonCamera = new ThirdPersonCamera(camera);
thirdPersonCamera.setCollidables(levelData.collidables);

// Character loading
const character = new SwatCharacter();
character
  .initialize()
  .then((model) => {
    scene.add(model);
    const { x, y, z } = levelData.playerStart;
    model.position.set(x, y, z);
    model.rotateY(levelData.playerFacing);
    character.setCollidables(levelData.collidables);
    thirdPersonCamera.setTarget(character);
  })
  .catch((error) => console.error("Failed to load character:", error));

// Animation loop
const clock = new THREE.Clock();
let elapsed = 0;
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  elapsed += delta;

  character.update(delta);
  thirdPersonCamera.update();

  // Update animation mixers
  levelData.mixers.forEach((mixer) => mixer.update(delta));

  // Update interaction system and HUD prompts
  const currentInteractive = interactionManager.update();
  if (currentInteractive) {
    hud.showInteractionPrompt(currentInteractive.promptText);
  } else {
    hud.hideInteractionPrompt();
  }

  // Flicker ceiling lights for atmosphere
  flickerLight(levelData.lights.ceilingA, elapsed, {
    base: 4,
    variance: 0.05,
    speed: 0.5,
    dropoutChance: 0.003,
  });
  flickerLight(levelData.lights.ceilingB, elapsed, {
    base: 0.7,
    variance: 0.03,
    speed: 1,
    dropoutChance: 0.01,
  });

  renderer.render(scene, camera);
}
animate();
