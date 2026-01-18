import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createCollider } from "./utils/ColliderUtils.js";

/**
 * PropLoader - Utilities for loading 3D models and props
 * Provides common patterns for model loading, collider creation, and light setup
 */
class PropLoader {
  constructor(scene, collidables, lights, mixers) {
    this.scene = scene;
    this.collidables = collidables;
    this.lights = lights;
    this.mixers = mixers;
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

  /**
   * Add a collider to the scene and collidables array
   * @param {number} width - Collider width
   * @param {number} height - Collider height
   * @param {number} depth - Collider depth
   * @param {Object} position - Position {x, y, z}
   */
  addCollider(width, height, depth, position, visible = false) {
    const collider = createCollider(width, height, depth, position, visible);
    this.scene.add(collider);
    this.collidables.push(collider);
  }

  /**
   * Set up an animation mixer for a model
   * @param {THREE.Object3D} model - The model to animate
   * @param {THREE.AnimationClip} animation - The animation clip
   * @param {Object} options - Animation options
   * @param {boolean} options.loop - Whether to loop the animation (default: true)
   * @param {Function} options.onFinish - Callback when animation finishes
   * @returns {THREE.AnimationAction|null} The animation action or null
   */
  addAnimation(model, animation, options = {}) {
    if (!animation) return null;

    const { loop = true, onFinish = null } = options;

    const mixer = new THREE.AnimationMixer(model);
    const action = mixer.clipAction(animation);

    // Configure looping
    if (!loop) {
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true; // Hold at final frame
    }

    // Add finish listener if callback provided
    if (onFinish) {
      mixer.addEventListener("finished", onFinish);
    }

    action.play();

    this.mixers.push(mixer);
    return action;
  }
}

export default PropLoader;
