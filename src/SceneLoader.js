import LevelOne from "./LevelOne.js";

/**
 * Load a level by name into the scene
 * @param {string} levelName - Name of the level to load
 * @param {THREE.Scene} scene - The Three.js scene
 * @returns {LevelData} Level configuration data
 */
class SceneLoader {
  loadLevel(levelName, scene) {
    switch (levelName) {
      case "level1":
        return LevelOne.build(scene);
      default:
        throw new Error(`Unknown level: ${levelName}`);
    }
  }
}

export default SceneLoader;
