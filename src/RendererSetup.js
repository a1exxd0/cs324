import * as THREE from "three";

/**
 * Creates and configures the WebGL renderer with optimal settings
 * @returns {THREE.WebGLRenderer} Configured renderer instance
 */
export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({
    powerPreference: "high-performance",
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.physicallyCorrectLights = true;

  document.body.appendChild(renderer.domElement);

  return renderer;
}

/**
 * Sets up window resize handler for camera and renderer
 * @param {THREE.PerspectiveCamera} camera - The camera to update
 * @param {THREE.WebGLRenderer} renderer - The renderer to resize
 */
export function setupResizeHandler(camera, renderer) {
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/**
 * Suppresses Three.js texture unit warnings in console
 */
export function suppressTextureWarnings() {
  const originalWarn = console.warn;
  console.warn = function (message, ...args) {
    if (typeof message === "string" && message.includes("texture units")) {
      return;
    }
    originalWarn.apply(console, [message, ...args]);
  };
}
