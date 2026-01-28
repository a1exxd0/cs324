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
    config.terrainThickness,
  );
  scene.add(terrain);
  collidables.push(collidable);

  // Add skybox and lighting
  terrainGenerator.createSkybox(scene);
  terrainGenerator.addLighting(scene);

  // Apply scene settings
  scene.fog = new THREE.Fog(config.fog.color, config.fog.near, config.fog.far);
  scene.background = new THREE.Color(config.backgroundColor);

  // Load props
  const propLoader = new PropLoader(scene, collidables);
  loadSciFiBuilding(propLoader, config, interactionManager, onBuildingInspect);

  // Add radioactive barrel near spawn
  const barrelX = 4;
  const barrelZ = 3;
  const barrelTerrainHeight = terrainGenerator.getHeight(barrelX, barrelZ);

  propLoader.loadModel("/models/radioactive_metal_barrel.glb", (gltf) => {
    const barrel = gltf.scene;
    barrel.position.set(barrelX, barrelTerrainHeight + 2.3, barrelZ);

    const barrelLight = barrel.getObjectByName("Point");
    propLoader.configurePointLight(barrelLight, 5, 2, 3, 0x2cfa1f);

    scene.add(barrel);

    // Second barrel next to the first
    const barrelB = barrel.clone(true);
    const barrelBX = barrelX + 1.2;
    const barrelBZ = barrelZ + 0.5;
    const barrelBHeight = terrainGenerator.getHeight(barrelBX, barrelBZ);
    barrelB.position.set(barrelBX, barrelBHeight + 2.3, barrelBZ);

    const barrelBLight = barrelB.getObjectByName("Point");
    propLoader.configurePointLight(barrelBLight, 5, 2, 3, 0x2cfa1f);

    scene.add(barrelB);
  });

  // Calculate player spawn height based on terrain
  const spawnHeight =
    terrainGenerator.getHeight(config.playerStart.x, config.playerStart.z) +
    config.playerStart.y;

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
