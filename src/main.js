import "./style.css";
import * as THREE from "three";
import { SwatCharacter } from "./SwatCharacter.js";
import { ThirdPersonCamera } from "./ThirdPersonCamera.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const camera = new THREE.PerspectiveCamera(75, 1024 / 720);
const thirdPersonCamera = new ThirdPersonCamera(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(1080, 720);
document.body.appendChild(renderer.domElement);

const character = new SwatCharacter();
character
  .initialize()
  .then((model) => {
    scene.add(model);
    thirdPersonCamera.setTarget(character);
  })
  .catch((error) => console.error("Failed to load character:", error));

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  character.update(delta);
  thirdPersonCamera.update();

  renderer.render(scene, camera);
}
animate();
