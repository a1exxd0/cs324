import * as THREE from "three";
import { TerrainGenerator } from "./TerrainGenerator.js";
import PropLoader from "./PropLoader.js";
import { loadSciFiBuilding } from "./props/BuildingProps.js";
import config from "./config.js";

/**
 * Setup Level 2 (Arctic Circle) scene
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {InteractionManager} interactionManager - Interaction manager for interactive objects
 * @param {Function} onBuildingInspect - Callback when building is inspected
 * @returns {Object} Level data including collidables and terrain generator
 */
export function setupLevelTwo(scene, interactionManager, onBuildingInspect) {
  // Setup collidables array for props
  const collidables = [];

  // Generate terrain
  const terrainGenerator = new TerrainGenerator(config.terrainSeed);
  const { terrain, collidable } = terrainGenerator.createTerrain(
    config.terrainSize,
    config.terrainResolution,
    config.terrainThickness
  );
  scene.add(terrain);
  collidables.push(collidable);

  // Add skybox and lighting
  terrainGenerator.createSkybox(scene);
  terrainGenerator.addLighting(scene);

  // Apply scene settings
  scene.fog = new THREE.Fog(
    config.fog.color,
    config.fog.near,
    config.fog.far
  );
  scene.background = new THREE.Color(config.backgroundColor);

  // Load props
  const propLoader = new PropLoader(scene, collidables);
  loadSciFiBuilding(propLoader, config, interactionManager, onBuildingInspect);

  // Calculate player spawn height based on terrain
  const spawnHeight = terrainGenerator.getHeight(
    config.playerStart.x,
    config.playerStart.z
  ) + config.playerStart.y;

  return {
    terrainGenerator,
    collidables: collidables,
    playerStart: {
      x: config.playerStart.x,
      y: spawnHeight,
      z: config.playerStart.z,
    },
    playerFacing: config.playerFacing,
    mixers: [],
    lights: {},
  };
}
