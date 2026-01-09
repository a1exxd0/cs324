import LevelOne from "./LevelOne/index.js";

/**
 * Load a level by name into the scene
 * @param {string} levelName - Name of the level to load
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {InteractionManager} interactionManager - Optional interaction manager
 * @returns {LevelData} Level configuration data
 */
class SceneLoader {
  loadLevel(levelName, scene, interactionManager = null) {
    switch (levelName) {
      case "level1":
        const levelOne = new LevelOne();
        return levelOne.build(scene, interactionManager);
      default:
        throw new Error(`Unknown level: ${levelName}`);
    }
  }
}

export default SceneLoader;
