/**
 * LevelData stores configuration for a game level
 * @param {Object} config - Level configuration
 * @param {Object} config.playerStart - Starting position {x, y, z}
 * @param {Array} config.collidables - Objects that block player movement
 * @param {Object} config.lights - Light objects in the level
 * @param {Object} config.doors - Door objects that can be toggled
 * @param {Array} config.mixers - Animation mixers for animated objects
 * @param {Function} config.toggleDoor - Function to toggle door states
 * @param {Object} config.portalState - Portal state object for special interactions
 */
class LevelData {
  constructor(config) {
    this.playerStart = config.playerStart || { x: 0, y: 1.6, z: 0 };
    this.playerFacing = config.playerFacing || Math.PI;
    this.collidables = config.collidables || [];
    this.lights = config.lights || {};
    this.doors = config.doors || {};
    this.mixers = config.mixers || [];
    this.toggleDoor = config.toggleDoor || (() => {});
    this.portalState = config.portalState || null;
  }
}

export default LevelData;
