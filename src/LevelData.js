/**
 * LevelData stores configuration for a game level
 * @param {Object} config - Level configuration
 * @param {Object} config.playerStart - Starting position {x, y, z}
 */
class LevelData {
  constructor(config) {
    this.playerStart = config.playerStart || { x: 0, y: 1.6, z: 0 };
  }
}

export default LevelData;
