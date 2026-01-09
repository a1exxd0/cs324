import * as THREE from "three";

/**
 * InteractionManager - Handles player interactions with objects
 *
 * Manages a registry of interactive objects and provides methods to:
 * - Register/unregister interactive objects
 * - Check what object the player is looking at and in range of
 * - Trigger interaction callbacks when player presses interact key
 *
 * Interactive objects must provide:
 * - mesh: THREE.Object3D to raycast against
 * - radius: maximum distance for interaction
 * - promptText: text to display in HUD (e.g., "E to open")
 * - onInteract: callback function to execute
 * - enabled: whether interaction is currently allowed
 */
class InteractionManager {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.interactiveObjects = [];
    this.raycaster = new THREE.Raycaster();
    this.currentTarget = null; // Currently highlighted interactive object

    // Bind keyboard listener
    this.handleKeyPress = this.handleKeyPress.bind(this);
    window.addEventListener("keydown", this.handleKeyPress);
  }

  /**
   * Register an object as interactive
   * @param {Object} interactiveObject - Object with mesh, radius, promptText, onInteract, enabled
   * @returns {string} Unique ID for this interactive object
   */
  register(interactiveObject) {
    const id = `interactive_${Date.now()}_${Math.random()}`;
    this.interactiveObjects.push({
      id,
      ...interactiveObject,
    });
    return id;
  }

  /**
   * Unregister an interactive object by ID
   * @param {string} id - The ID returned from register()
   */
  unregister(id) {
    const index = this.interactiveObjects.findIndex((obj) => obj.id === id);
    if (index > -1) {
      this.interactiveObjects.splice(index, 1);
    }
  }

  /**
   * Enable or disable an interactive object
   * @param {string} id - The interactive object ID
   * @param {boolean} enabled - Whether to enable or disable
   */
  setEnabled(id, enabled) {
    const obj = this.interactiveObjects.find((o) => o.id === id);
    if (obj) {
      obj.enabled = enabled;
    }
  }

  /**
   * Update interaction state each frame
   * Checks what the player is looking at and if it's in range
   * @returns {Object|null} The current interactive object or null
   */
  update() {
    // Cast ray from camera center
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    // Find all intersections with interactive objects
    let closestInteractive = null;
    let closestDistance = Infinity;

    for (const interactive of this.interactiveObjects) {
      if (!interactive.enabled) continue;

      // Get all meshes in the interactive object (handles nested objects)
      const meshes = [];
      interactive.mesh.traverse((child) => {
        if (child.isMesh) {
          meshes.push(child);
        }
      });

      // Check for ray intersection
      const intersects = this.raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        // Use the distance along the ray, not 3D distance from camera to mesh center
        const distance = intersects[0].distance;

        // Check if within interaction radius and closer than current closest
        if (distance <= interactive.radius && distance < closestDistance) {
          closestDistance = distance;
          closestInteractive = interactive;
        }
      }
    }

    this.currentTarget = closestInteractive;
    return this.currentTarget;
  }

  /**
   * Get the currently targeted interactive object
   * @returns {Object|null} Current target or null
   */
  getCurrentTarget() {
    return this.currentTarget;
  }

  /**
   * Handle keyboard input for interactions
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyPress(event) {
    if (event.code === "KeyE" && this.currentTarget) {
      // Trigger the interaction callback
      if (this.currentTarget.onInteract) {
        this.currentTarget.onInteract();
      }
    }
  }

  /**
   * Cleanup - remove event listeners
   */
  dispose() {
    window.removeEventListener("keydown", this.handleKeyPress);
  }
}

export default InteractionManager;
