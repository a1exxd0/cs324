import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * PropLoader for Level 2 - Utilities for loading 3D models and props
 */
class PropLoader {
  constructor(scene, collidables) {
    this.scene = scene;
    this.collidables = collidables;
    this.loader = new GLTFLoader();
  }

  /**
   * Load a GLTF model from the given path
   * @param {string} path - Path to the .glb file
   * @param {Function} onLoad - Callback function when model loads
   */
  loadModel(path, onLoad) {
    return this.loader.load(path, onLoad);
  }

  /**
   * Configure a point light from a loaded model
   * @param {THREE.Light} light - The light object from the model
   * @param {number} intensity - Light intensity
   * @param {number} distance - Light distance
   * @param {number} decay - Light decay
   * @param {number} color - Light color (hex)
   * @returns {boolean} Success status
   */
  configurePointLight(light, intensity, distance, decay, color) {
    if (!light || !light.isLight) return false;

    light.visible = true;
    light.intensity = intensity;
    light.distance = distance;
    light.decay = decay;
    light.castShadow = true;
    light.color.set(color);
    return true;
  }
}

export default PropLoader;
