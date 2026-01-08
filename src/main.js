import "./style.css";
import * as THREE from "three";
import { SwatCharacter } from "./SwatCharacter.js";
import { ThirdPersonCamera } from "./ThirdPersonCamera.js";
import SceneLoader from "./SceneLoader.js";

// Configuration
const WINDOW_WIDTH = 1080;
const WINDOW_HEIGHT = 720;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Camera and renderer
const camera = new THREE.PerspectiveCamera(75, WINDOW_WIDTH / WINDOW_HEIGHT);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);
document.body.appendChild(renderer.domElement);

// Level loading
const sceneLoader = new SceneLoader();
const levelData = sceneLoader.loadLevel("level1", scene);
const thirdPersonCamera = new ThirdPersonCamera(camera);

// Character loading
const character = new SwatCharacter();
character
  .initialize()
  .then((model) => {
    scene.add(model);
    const { x, y, z } = levelData.playerStart;
    model.position.set(x, y, z);
    thirdPersonCamera.setTarget(character);
  })
  .catch((error) => console.error("Failed to load character:", error));

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  character.update(clock.getDelta());
  thirdPersonCamera.update();
  renderer.render(scene, camera);
}
animate();
