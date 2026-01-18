import * as THREE from "three";
import { flickerLight } from "./utils/lightingUtils.js";

/**
 * Manages the main game animation loop
 */
export class GameLoop {
  constructor(
    renderer,
    scene,
    camera,
    character,
    thirdPersonCamera,
    cameraManager,
    interactionManager,
    hud,
    levelData,
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.character = character;
    this.thirdPersonCamera = thirdPersonCamera;
    this.cameraManager = cameraManager;
    this.interactionManager = interactionManager;
    this.hud = hud;
    this.levelData = levelData;

    this.clock = new THREE.Clock();
    this.elapsed = 0;
    this.animationFrameId = null;
  }

  /**
   * Start the animation loop
   */
  start() {
    this.animate();
  }

  /**
   * Stop the animation loop
   */
  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main animation loop
   */
  animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    this.elapsed += delta;

    // Update character
    this.character.update(delta);

    // Only update player camera when not in security camera view
    if (!this.cameraManager.isInSecurityView()) {
      this.thirdPersonCamera.update();
    }

    // Update animation mixers
    this.levelData.mixers.forEach((mixer) => mixer.update(delta));

    // Update interaction system and HUD prompts (if interaction manager exists)
    if (this.interactionManager) {
      const currentInteractive = this.interactionManager.update();
      if (currentInteractive) {
        this.hud.showInteractionPrompt(currentInteractive.promptText);
      } else {
        this.hud.hideInteractionPrompt();
      }
    }

    // Flicker ceiling lights for atmosphere
    this.updateLightEffects();

    // Render scene
    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Update lighting effects (flickering, etc.)
   */
  updateLightEffects() {
    if (this.levelData.lights.ceilingA) {
      flickerLight(this.levelData.lights.ceilingA, this.elapsed, {
        base: 4,
        variance: 0.05,
        speed: 0.5,
        dropoutChance: 0.003,
      });
    }

    if (this.levelData.lights.ceilingB) {
      flickerLight(this.levelData.lights.ceilingB, this.elapsed, {
        base: 0.7,
        variance: 0.03,
        speed: 1,
        dropoutChance: 0.01,
      });
    }
  }
}
