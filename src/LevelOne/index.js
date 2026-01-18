import LevelData from "../LevelData.js";
import RoomBuilder from "./RoomBuilder.js";
import PropLoader from "./PropLoader.js";
import config from "./config.js";
import * as LightingProps from "./props/LightingProps.js";
import * as FurnitureProps from "./props/FurnitureProps.js";
import * as EnvironmentalProps from "./props/EnvironmentalProps.js";
import * as CharacterProps from "./props/CharacterProps.js";

/**
 * LevelOne - Surface Facility
 * Creates the first level geometry and returns level data
 */
class LevelOne {
  constructor() {
    this.scene = null;
    this.collidables = [];
    this.lights = {};
    this.doors = {};
    this.mixers = [];
    this.config = config;
    this.vaultDoorState = {}; // Track vault door state
    this.portalState = {}; // Track portal state
  }

  /**
   * Build the level and return level data
   * @param {THREE.Scene} scene - The Three.js scene to add objects to
   * @param {InteractionManager} interactionManager - Optional interaction manager for interactive objects
   * @param {HUD} hud - Optional HUD instance for updating objectives
   * @returns {LevelData} Level data with spawn point, collidables, lights, doors, and mixers
   */
  build(scene, interactionManager = null, hud = null) {
    this.scene = scene;
    this.interactionManager = interactionManager;
    this.hud = hud;
    this.buildReception();
    this.buildLaboratory();

    return new LevelData({
      playerStart: { x: 0, y: 1.2, z: 0 },
      collidables: this.collidables,
      lights: this.lights,
      doors: this.doors,
      mixers: this.mixers,
      toggleDoor: this.toggleDoor.bind(this),
      portalState: this.portalState, // Expose portal state
    });
  }

  /**
   * Get the portal state (for setting character reference)
   * @returns {Object} Portal state object
   */
  getPortalState() {
    return this.portalState;
  }

  /**
   * Build the reception room
   */
  buildReception() {
    const roomBuilder = new RoomBuilder(
      this.scene,
      this.collidables,
      this.doors,
      this.config,
    );
    const propLoader = new PropLoader(
      this.scene,
      this.collidables,
      this.lights,
      this.mixers,
    );

    // Build room geometry
    roomBuilder.buildFloorAndCeiling();
    roomBuilder.buildWalls();
    roomBuilder.buildBloodDecals();

    // Load props (grouped by type)
    LightingProps.loadCeilingLights(propLoader, this.config);
    FurnitureProps.loadReceptionDesk(propLoader, this.config);
    FurnitureProps.loadEmergencyKeycard(
      propLoader,
      this.config,
      this.interactionManager,
      this.hud,
      this.portalState, // Pass portal state to enable it after pickup
    );
    FurnitureProps.loadVaultDoor(
      propLoader,
      this.config,
      this.vaultDoorState,
      () => {
        // When vault door animation completes, open the west door
        this.toggleDoor("west");
      },
      this.interactionManager,
    );
    EnvironmentalProps.loadRadioactiveBarrels(propLoader, this.config);
    EnvironmentalProps.loadRottenWindow(propLoader, this.config);
    CharacterProps.loadDeadBody(propLoader, this.config);
  }

  /**
   * Build the laboratory room (west of reception)
   */
  buildLaboratory() {
    const roomBuilder = new RoomBuilder(
      this.scene,
      this.collidables,
      this.doors,
      this.config,
    );
    const propLoader = new PropLoader(
      this.scene,
      this.collidables,
      this.lights,
      this.mixers,
    );

    // Build laboratory floor and ceiling
    roomBuilder.buildFloorAndCeiling({
      width: this.config.lab.width,
      depth: this.config.lab.depth,
      height: this.config.lab.wallHeight,
      offsetX: this.config.lab.offsetX,
      offsetZ: this.config.lab.offsetZ,
      floorColor: 0xd0d0d0, // Slightly lighter floor for laboratory
      ceilingColor: 0xc8c8c8,
    });

    // Build laboratory walls with doorway on east side (connecting to reception)
    roomBuilder.buildWalls({
      width: this.config.lab.width,
      depth: this.config.lab.depth,
      height: this.config.lab.wallHeight,
      offsetX: this.config.lab.offsetX,
      offsetZ: this.config.lab.offsetZ,
      doorways: {
        north: false, // Solid north wall
        south: false, // Solid south wall
        east: "lab-east", // Doorway to reception on east side
        west: false, // Solid west wall
      },
    });

    // Add blood decals to laboratory
    roomBuilder.buildBloodDecals({
      bloodPuddles: this.config.labBloodPuddles,
      radioactiveSpillCenter: this.config.labRadioactiveSpillCenter,
    });

    // Load laboratory lighting (dim grid of ceiling lights)
    LightingProps.loadLaboratoryLights(propLoader, this.config);

    // Load laboratory props
    FurnitureProps.loadBodyScanningMachines(propLoader, this.config);
    FurnitureProps.loadTimeMachine(propLoader, this.config);
    FurnitureProps.loadSecurityCamera(propLoader, this.config);

    // Load portal on time machine
    EnvironmentalProps.loadPortal(
      propLoader,
      this.config,
      this.interactionManager,
      this.portalState,
      this.hud,
    );

    // Automatically open the laboratory doorway
    this.toggleDoor("lab-east");
  }

  /**
   * Toggle a door between open and closed states
   * @param {string} doorName - The name of the door to toggle ('south' or 'west')
   *
   * NOTE: For future "press to interact" functionality, this logic
   * should move to a dedicated InteractionManager that handles all
   * player interactions (doors, items, logs, etc.)
   */
  toggleDoor(doorName) {
    const door = this.doors[doorName];
    if (!door) {
      console.warn(`Door "${doorName}" not found`);
      return;
    }

    if (door.isClosed) {
      // Open the door - remove from collidables
      const index = this.collidables.indexOf(door.mesh);
      if (index > -1) {
        this.collidables.splice(index, 1);
      }
      door.isClosed = false;
    } else {
      // Close the door - add to collidables
      this.collidables.push(door.mesh);
      door.isClosed = true;
    }
  }
}

export default LevelOne;
