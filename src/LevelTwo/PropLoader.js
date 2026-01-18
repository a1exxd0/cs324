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
}

export default PropLoader;
