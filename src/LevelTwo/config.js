/**
 * Level 2 (Arctic Circle) Configuration
 */
export default {
  // Terrain settings
  terrainSize: 200,
  terrainResolution: 50,
  terrainThickness: 20,
  terrainSeed: 12345,

  // Player spawn settings
  playerStart: {
    x: 0,
    y: 5, // Will be adjusted based on terrain height
    z: 0,
  },
  playerFacing: 0,

  // Scene settings
  fog: {
    color: 0xd0e8f0,
    near: 10, // Fog starts closer to character
    far: 80, // Fog fully obscures at shorter distance
  },
  backgroundColor: 0xd0e8f0,

  // Lighting
  sunLight: {
    color: 0xffffff,
    intensity: 0.8,
    position: { x: 50, y: 100, z: 50 },
  },
  ambientLight: {
    color: 0xb0c4de,
    intensity: 0.4,
  },
  hemisphereLight: {
    skyColor: 0x87ceeb,
    groundColor: 0xe0f0ff,
    intensity: 0.6,
  },

  // Props
  sciFiBuildingPosition: {
    x: 30,
    y: 0,
    z: 30,
  },
  sciFiBuildingScale: 5,
};
