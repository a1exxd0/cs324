import * as THREE from "three";

/**
 * Generates procedural terrain with a seed
 */
export class TerrainGenerator {
  constructor(seed = 12345) {
    this.seed = seed;
  }

  /**
   * Seeded random number generator
   * Returns a value between 0 and 1
   */
  random() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Generate a simple noise value for terrain height
   * @param {number} x - X coordinate
   * @param {number} z - Z coordinate
   * @returns {number} Height value
   */
  noise(x, z) {
    // Simple hash-based noise
    const hash = (x * 374761393 + z * 668265263) ^ (this.seed * 1274126177);
    const n = Math.sin(hash) * 43758.5453;
    return (n - Math.floor(n));
  }

  /**
   * Generate smooth terrain height using multiple noise octaves
   * @param {number} x - X coordinate
   * @param {number} z - Z coordinate
   * @returns {number} Height value
   */
  getHeight(x, z) {
    let height = 0;
    let amplitude = 1;
    let frequency = 0.02;

    // Multiple octaves for more natural terrain
    for (let i = 0; i < 3; i++) {
      height += this.noise(x * frequency, z * frequency) * amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return height * 3; // Scale the height (reduced from 8 to 3 for gentler hills)
  }

  /**
   * Create a terrain mesh with thickness and collision
   * @param {number} size - Size of the terrain
   * @param {number} resolution - Number of segments
   * @param {number} thickness - Thickness of terrain below surface
   * @returns {Object} { terrain: THREE.Group, collidable: THREE.Mesh }
   */
  createTerrain(size = 200, resolution = 50, thickness = 20) {
    // Create top surface - using PlaneGeometry but we'll manually set it to XZ plane
    const topGeometry = new THREE.PlaneGeometry(size, size, resolution, resolution);

    // Rotate geometry itself (not the mesh) so it's in XZ plane with Y as height
    topGeometry.rotateX(-Math.PI / 2);

    // Modify vertices to create hills
    const vertices = topGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2]; // Z is now at index 2 after rotation
      const height = this.getHeight(x, z);
      vertices[i + 1] = height; // Y is now at index 1 (height)
    }

    // Recalculate normals for proper lighting
    topGeometry.computeVertexNormals();

    // Create snow material
    const material = new THREE.MeshStandardMaterial({
      color: 0xf0f8ff, // Snow white with slight blue tint
      roughness: 0.9,
      metalness: 0.1,
      flatShading: false,
    });

    const topSurface = new THREE.Mesh(topGeometry, material);
    topSurface.receiveShadow = true;

    // Create bottom surface (flat plane below)
    const bottomGeometry = new THREE.PlaneGeometry(size, size, 2, 2);
    bottomGeometry.rotateX(-Math.PI / 2);
    const bottomMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e8f0,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.BackSide,
    });
    const bottomSurface = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottomSurface.position.y = -thickness;

    // Create sides to give thickness
    const sideGeometry = new THREE.PlaneGeometry(size, thickness, 2, 2);
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: 0xdce8f0,
      roughness: 0.9,
      metalness: 0.1,
    });

    // Four sides
    const side1 = new THREE.Mesh(sideGeometry, sideMaterial);
    side1.position.set(0, -thickness / 2, size / 2);
    side1.rotation.x = 0;

    const side2 = new THREE.Mesh(sideGeometry, sideMaterial);
    side2.position.set(0, -thickness / 2, -size / 2);
    side2.rotation.x = 0;

    const side3 = new THREE.Mesh(sideGeometry, sideMaterial);
    side3.position.set(size / 2, -thickness / 2, 0);
    side3.rotation.y = Math.PI / 2;

    const side4 = new THREE.Mesh(sideGeometry, sideMaterial);
    side4.position.set(-size / 2, -thickness / 2, 0);
    side4.rotation.y = Math.PI / 2;

    // Group all terrain parts
    const terrainGroup = new THREE.Group();
    terrainGroup.add(topSurface);
    terrainGroup.add(bottomSurface);
    terrainGroup.add(side1);
    terrainGroup.add(side2);
    terrainGroup.add(side3);
    terrainGroup.add(side4);

    // Create a simplified collision mesh (just the top surface)
    // Use the actual top surface mesh for collision
    // The geometry is already in world-space orientation (XZ plane with Y as height)
    const collisionMesh = topSurface;

    return {
      terrain: terrainGroup,
      collidable: collisionMesh
    };
  }

  /**
   * Create a skybox for the arctic environment
   * @param {THREE.Scene} scene - The scene to add the skybox to
   */
  createSkybox(scene) {
    // Create a simple gradient sky
    const skyColor = 0x87ceeb; // Light blue
    const groundColor = 0xe0f0ff; // Light snow color
    const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, 0.6);
    scene.add(hemisphereLight);

    // Fog for atmosphere
    scene.fog = new THREE.Fog(0xd0e8f0, 50, 200);
    scene.background = new THREE.Color(0xd0e8f0);
  }

  /**
   * Add lighting appropriate for arctic environment
   * @param {THREE.Scene} scene - The scene to add lights to
   */
  addLighting(scene) {
    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    scene.add(sunLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xb0c4de, 0.4);
    scene.add(ambientLight);
  }
}
