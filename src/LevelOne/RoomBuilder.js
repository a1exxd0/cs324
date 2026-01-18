import * as THREE from "three";
import { createMaterial } from "./utils/MaterialUtils.js";

/**
 * RoomBuilder - Constructs room geometry, walls, floors, and decorations
 */
class RoomBuilder {
  constructor(scene, collidables, doors, config) {
    this.scene = scene;
    this.collidables = collidables;
    this.doors = doors;
    this.config = config;
  }

  /**
   * Add a mesh to the scene and optionally to collidables
   */
  addMesh(mesh, isCollidable = false) {
    this.scene.add(mesh);
    if (isCollidable) {
      this.collidables.push(mesh);
    }
  }

  /**
   * Create a wall mesh with standard properties
   */
  createWall(geometry, position, material) {
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(position.x, position.y, position.z);
    wall.castShadow = false;
    wall.receiveShadow = true;
    return wall;
  }

  /**
   * Create floor and ceiling
   * @param {Object} options - Optional parameters for custom dimensions and position
   * @param {number} options.width - Width of the room (defaults to config.roomWidth)
   * @param {number} options.depth - Depth of the room (defaults to config.roomDepth)
   * @param {number} options.height - Height of the room (defaults to config.wallHeight)
   * @param {number} options.offsetX - X offset from origin (defaults to 0)
   * @param {number} options.offsetZ - Z offset from origin (defaults to 0)
   * @param {number} options.floorColor - Floor color (defaults to 0xcccccc)
   * @param {number} options.ceilingColor - Ceiling color (defaults to 0xcccccc)
   */
  buildFloorAndCeiling(options = {}) {
    const {
      width = this.config.roomWidth,
      depth = this.config.roomDepth,
      height = this.config.wallHeight,
      offsetX = 0,
      offsetZ = 0,
      floorColor = 0xcccccc,
      ceilingColor = 0xcccccc,
    } = options;

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.1, depth),
      createMaterial(floorColor, 0.8, 0.5),
    );
    floor.position.set(offsetX, -0.05, offsetZ);
    floor.receiveShadow = true;
    this.addMesh(floor, true);

    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.1, depth),
      createMaterial(ceilingColor, 0.8, 0.2),
    );
    ceiling.position.set(offsetX, height + 0.05, offsetZ);
    ceiling.receiveShadow = true;
    this.addMesh(ceiling, true);
  }

  /**
   * Build all room walls
   * @param {Object} options - Optional parameters for custom dimensions and position
   * @param {number} options.width - Width of the room (defaults to config.roomWidth)
   * @param {number} options.depth - Depth of the room (defaults to config.roomDepth)
   * @param {number} options.height - Height of the room (defaults to config.wallHeight)
   * @param {number} options.offsetX - X offset from origin (defaults to 0)
   * @param {number} options.offsetZ - Z offset from origin (defaults to 0)
   * @param {Object} options.doorways - Object specifying which walls have doorways
   *   e.g., { north: false, south: "south", east: false, west: "west" }
   */
  buildWalls(options = {}) {
    const {
      width = this.config.roomWidth,
      depth = this.config.roomDepth,
      height = this.config.wallHeight,
      offsetX = 0,
      offsetZ = 0,
      doorways = { north: false, south: false, east: false, west: "west" },
    } = options;

    const wallMaterial = createMaterial(0xe0e0e0, 0.7, 0.1);

    // North wall (back)
    if (!doorways.north) {
      const northWall = this.createWall(
        new THREE.BoxGeometry(width, height, this.config.wallThickness),
        { x: offsetX, y: height / 2, z: offsetZ - depth / 2 },
        wallMaterial,
      );
      this.addMesh(northWall, true);
    } else {
      this.buildWallWithDoorway(
        {
          width: width,
          depth: this.config.wallThickness,
          axis: "x",
          position: { x: offsetX, z: offsetZ - depth / 2 },
          doorName: doorways.north,
          height: height,
        },
        wallMaterial,
      );
    }

    // South wall (front)
    if (!doorways.south) {
      const southWall = this.createWall(
        new THREE.BoxGeometry(width, height, this.config.wallThickness),
        { x: offsetX, y: height / 2, z: offsetZ + depth / 2 },
        wallMaterial,
      );
      this.addMesh(southWall, true);
    } else {
      this.buildWallWithDoorway(
        {
          width: width,
          depth: this.config.wallThickness,
          axis: "x",
          position: { x: offsetX, z: offsetZ + depth / 2 },
          doorName: doorways.south,
          height: height,
        },
        wallMaterial,
      );
    }

    // West wall (left)
    if (!doorways.west) {
      const westWall = this.createWall(
        new THREE.BoxGeometry(this.config.wallThickness, height, depth),
        { x: offsetX - width / 2, y: height / 2, z: offsetZ },
        wallMaterial,
      );
      this.addMesh(westWall, true);
    } else {
      this.buildWallWithDoorway(
        {
          width: this.config.wallThickness,
          depth: depth,
          axis: "z",
          position: { x: offsetX - width / 2, z: offsetZ },
          doorName: doorways.west,
          height: height,
        },
        wallMaterial,
      );
    }

    // East wall (right)
    if (!doorways.east) {
      const eastWall = this.createWall(
        new THREE.BoxGeometry(this.config.wallThickness, height, depth),
        { x: offsetX + width / 2, y: height / 2, z: offsetZ },
        wallMaterial,
      );
      this.addMesh(eastWall, true);
    } else {
      this.buildWallWithDoorway(
        {
          width: this.config.wallThickness,
          depth: depth,
          axis: "z",
          position: { x: offsetX + width / 2, z: offsetZ },
          doorName: doorways.east,
          height: height,
        },
        wallMaterial,
      );
    }
  }

  /**
   * Build a wall with a doorway in it
   */
  buildWallWithDoorway(config, material) {
    const { doorWidth } = this.config;
    const {
      width,
      depth,
      axis,
      position,
      doorName,
      height = this.config.wallHeight,
    } = config;

    // Calculate segment dimension along the wall's main axis
    const mainDimension = axis === "x" ? width : depth;
    const segmentSize = (mainDimension - doorWidth) / 2;

    // Geometry dimensions based on axis
    const geometry =
      axis === "x"
        ? new THREE.BoxGeometry(segmentSize, height, depth)
        : new THREE.BoxGeometry(width, height, segmentSize);

    // Create positions for the two wall segments
    const halfDimension = mainDimension / 2;
    const offset1 = -halfDimension + segmentSize / 2;
    const offset2 = halfDimension - segmentSize / 2;

    const segment1Pos = {
      x: axis === "x" ? position.x + offset1 : position.x,
      y: height / 2,
      z: axis === "z" ? position.z + offset1 : position.z,
    };

    const segment2Pos = {
      x: axis === "x" ? position.x + offset2 : position.x,
      y: height / 2,
      z: axis === "z" ? position.z + offset2 : position.z,
    };

    // Create and add both wall segments
    const segment1 = this.createWall(geometry, segment1Pos, material);
    this.addMesh(segment1, true);

    const segment2 = this.createWall(geometry, segment2Pos, material);
    this.addMesh(segment2, true);

    // Create transparent door segment in the middle
    const doorGeometry =
      axis === "x"
        ? new THREE.BoxGeometry(doorWidth, height, depth)
        : new THREE.BoxGeometry(width, height, doorWidth);

    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      roughness: 0.7,
      metalness: 0.1,
      transparent: true,
      opacity: 0.3,
    });

    const doorPos = {
      x: position.x,
      y: height / 2,
      z: position.z,
    };

    const door = this.createWall(doorGeometry, doorPos, doorMaterial);

    // Add door to scene and collidables (initially closed)
    this.addMesh(door, true);

    // Store door reference with its closed state
    this.doors[doorName] = {
      mesh: door,
      isClosed: true,
    };
  }

  /**
   * Create blood decals on the floor
   * @param {Object} options - Optional parameters for blood decals
   * @param {Array} options.bloodPuddles - Array of blood puddle positions (defaults to config.bloodPuddles)
   * @param {Object} options.radioactiveSpillCenter - Center position for spill area (defaults to config.radioactiveSpillCenter)
   */
  buildBloodDecals(options = {}) {
    const {
      bloodPuddles = this.config.bloodPuddles,
      radioactiveSpillCenter = this.config.radioactiveSpillCenter,
    } = options;

    const bloodMaterial = createMaterial(0x7a0f0f, 0.95, 0.0);

    // Main blood puddles
    bloodPuddles.forEach((puddle) => {
      const mesh = new THREE.Mesh(
        new THREE.CircleGeometry(puddle.radius, 16),
        bloodMaterial,
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(puddle.x, 0.001, puddle.z);
      this.scene.add(mesh);
    });

    for (let i = 0; i < 12; i++) {
      const spill = new THREE.Mesh(
        new THREE.CircleGeometry(THREE.MathUtils.randFloat(0.6, 1.4), 24),
        bloodMaterial,
      );
      spill.rotation.x = -Math.PI / 2;
      spill.rotation.z = THREE.MathUtils.randFloat(0, Math.PI * 2);
      spill.position.set(
        radioactiveSpillCenter.x + THREE.MathUtils.randFloat(-1.7, 2.5),
        0.001 + i * 0.01,
        radioactiveSpillCenter.z + THREE.MathUtils.randFloat(-1.5, 3.0),
      );
      this.scene.add(spill);
    }
  }
}

export default RoomBuilder;
