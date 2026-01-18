import * as THREE from "three";
import { SwatCharacter } from "./SwatCharacter.js";
import { ThirdPersonCamera } from "./ThirdPersonCamera.js";
import SceneLoader from "./SceneLoader.js";
import { HUD } from "./HUD.js";
import InteractionManager from "./InteractionManager.js";
import { CameraManager } from "./CameraManager.js";
import { GameLoop } from "./GameLoop.js";
import {
  createRenderer,
  setupResizeHandler,
  suppressTextureWarnings,
} from "./RendererSetup.js";
import { setupLevelOne } from "./LevelOne/setup.js";
import { setupLevelTwo } from "./LevelTwo/setup.js";
import { showCutscene } from "./LevelTwo/Cutscene.js";

/**
 * Manages level lifecycle - initialization, cleanup, and state
 */
export class LevelManager {
  constructor(stateManager, inputManager) {
    this.stateManager = stateManager;
    this.inputManager = inputManager;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.character = null;
    this.thirdPersonCamera = null;
    this.cameraManager = null;
    this.interactionManager = null;
    this.hud = null;
    this.gameLoop = null;
    this.levelData = null;
    this.sceneLoader = null;
  }

  /**
   * Initialize and start Level 1
   * @param {Function} onCutsceneEnd - Callback when cutscene completes
   */
  async startLevel1(onCutsceneEnd) {
    // Update game state
    this.stateManager.startLevel(1);

    // Suppress Three.js texture unit warnings
    suppressTextureWarnings();

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x808080);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.03));

    // Camera and renderer
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.renderer = createRenderer();
    setupResizeHandler(this.camera, this.renderer);

    // HUD setup
    this.hud = new HUD();
    this.hud.setObjective("Find the Emergency Override Keycard");

    // Interaction system
    this.interactionManager = new InteractionManager(
      this.camera,
      this.scene,
      this.hud,
      this.inputManager
    );

    // Camera manager
    this.cameraManager = new CameraManager(this.camera, this.hud, this.inputManager);
    this.hud.showCameraView("Player View (C to switch)", false);

    // Level loading
    this.sceneLoader = new SceneLoader();
    this.levelData = this.sceneLoader.loadLevel(
      "level1",
      this.scene,
      this.interactionManager,
      this.hud,
    );
    console.log("Level data loaded, portalState:", this.levelData.portalState);
    this.thirdPersonCamera = new ThirdPersonCamera(this.camera, this.inputManager);
    this.thirdPersonCamera.setCollidables(this.levelData.collidables);

    // Character loading
    this.character = new SwatCharacter(this.camera, this.inputManager, this.stateManager);
    const model = await this.character.initialize();

    this.scene.add(model);
    const { x, y, z } = this.levelData.playerStart;
    model.position.set(x, y, z);
    model.rotateY(this.levelData.playerFacing);
    this.character.setCollidables(this.levelData.collidables);
    this.thirdPersonCamera.setTarget(this.character);

    // Setup level-specific functionality (cameras, portal callbacks, etc.)
    setupLevelOne(this.levelData, this.character, this.cameraManager, () => {
      // Callback for when cutscene ends
      this.cleanup();
      if (onCutsceneEnd) {
        onCutsceneEnd();
      }
    });

    // Start the game loop
    this.gameLoop = new GameLoop(
      this.renderer,
      this.scene,
      this.camera,
      this.character,
      this.thirdPersonCamera,
      this.cameraManager,
      this.interactionManager,
      this.hud,
      this.levelData,
    );
    this.gameLoop.start();

    // ESC key is now handled by InputManager in main.js
  }

  /**
   * Initialize and start Level 2 (Arctic Terrain)
   * @param {Function} onCutsceneComplete - Callback when cutscene completes
   */
  async startLevel2(onCutsceneComplete) {
    // Update game state
    this.stateManager.startLevel(2);

    // Suppress Three.js texture unit warnings
    suppressTextureWarnings();

    // Scene setup
    this.scene = new THREE.Scene();

    // Camera and renderer
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.renderer = createRenderer();
    setupResizeHandler(this.camera, this.renderer);

    // HUD setup
    this.hud = new HUD();
    this.hud.setObjective("Explore the Arctic terrain");

    // Interaction system
    this.interactionManager = new InteractionManager(
      this.camera,
      this.scene,
      this.hud,
      this.inputManager
    );

    // Setup Level 2 scene (terrain, lighting, etc.)
    // Pass callback for building inspection
    const onBuildingInspect = () => {
      // Cutscene story slides
      const storySlides = [
        "The building's doors are sealed shut, covered in frost and ice.",
        "Through a cracked window, you spot rows of cryogenic chambers inside.",
        "Each chamber contains a frozen figure, perfectly preserved in the arctic cold.",
        "Whatever experiment was happening here... it's been abandoned for years.",
      ];

      // Show cutscene with renderer and HUD hidden, then cleanup and return to mission select
      showCutscene(storySlides, () => {
        this.cleanup();
        if (onCutsceneComplete) {
          onCutsceneComplete();
        }
      }, this.stateManager, this.renderer, this.hud);
    };

    this.levelData = setupLevelTwo(this.scene, this.interactionManager, onBuildingInspect);

    // Camera manager
    this.cameraManager = new CameraManager(this.camera, this.hud, this.inputManager);
    this.hud.showCameraView("Player View (C to switch)", false);

    // Character loading
    this.character = new SwatCharacter(this.camera, this.inputManager, this.stateManager);
    const model = await this.character.initialize();

    this.scene.add(model);

    // Position character using level data
    const { x, y, z } = this.levelData.playerStart;
    model.position.set(x, y, z);
    model.rotateY(this.levelData.playerFacing);

    // Set up terrain collision
    this.character.setCollidables(this.levelData.collidables);

    // Set up third person camera
    this.thirdPersonCamera = new ThirdPersonCamera(this.camera, this.inputManager);
    this.thirdPersonCamera.setTarget(this.character);
    this.thirdPersonCamera.setCollidables(this.levelData.collidables);

    // Start the game loop
    this.gameLoop = new GameLoop(
      this.renderer,
      this.scene,
      this.camera,
      this.character,
      this.thirdPersonCamera,
      this.cameraManager,
      this.interactionManager,
      this.hud,
      this.levelData,
    );
    this.gameLoop.start();

    // ESC key is now handled by InputManager in main.js
  }

  /**
   * Clean up all level resources
   */
  cleanup() {
    console.log("Cleaning up level resources...");

    // Release pointer lock
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    // Stop game loop
    if (this.gameLoop) {
      this.gameLoop.stop();
      this.gameLoop = null;
    }

    // Event listeners are now managed by InputManager - no cleanup needed here

    // Hide and remove HUD
    if (this.hud) {
      this.hud.hide();
      if (this.hud.container && this.hud.container.parentNode) {
        this.hud.container.parentNode.removeChild(this.hud.container);
      }
      this.hud = null;
    }

    // Remove renderer canvas
    if (this.renderer) {
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
      this.renderer = null;
    }

    // Dispose character
    if (this.character) {
      // Remove character model from scene
      if (this.scene && this.character.model) {
        this.scene.remove(this.character.model);
      }
      this.character = null;
    }

    // Dispose scene objects
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      this.scene.clear();
      this.scene = null;
    }

    // Clean up third person camera event listeners
    if (this.thirdPersonCamera) {
      this.thirdPersonCamera.cleanup();
      this.thirdPersonCamera = null;
    }

    // Clear other references
    this.camera = null;
    this.cameraManager = null;
    this.interactionManager = null;
    this.levelData = null;
    this.sceneLoader = null;

    console.log("Level cleanup complete");
  }
}
