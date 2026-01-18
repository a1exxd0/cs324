/**
 * LightingProps - Ceiling lights and other lighting fixtures
 */

/**
 * Load and configure ceiling light fixtures
 * @param {PropLoader} propLoader - The prop loader instance
 * @param {Object} config - Level configuration
 */
export function loadCeilingLights(propLoader, config) {
  const { wallHeight, ceilingLightPositions } = config;

  propLoader.loadModel("/models/fluorescent_ceiling_light.glb", (gltf) => {
    // Collect materials to share across clones
    const sharedMaterials = new Map();
    gltf.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        sharedMaterials.set(child.uuid, child.material);
      }
    });

    // First fixture
    const fixtureA = gltf.scene;
    fixtureA.position.set(
      ceilingLightPositions[0].x,
      wallHeight + 0.02,
      ceilingLightPositions[0].z,
    );
    fixtureA.scale.set(0.02, 0.02, 0.02);
    fixtureA.rotation.z = Math.PI;

    const lightA = fixtureA.getObjectByName("Point");
    if (propLoader.configurePointLight(lightA, 8, 5, 2, 0xeeeeee)) {
      propLoader.lights.ceilingA = lightA;
    }
    propLoader.scene.add(fixtureA);

    // Second fixture (shallow clone with shared materials)
    const fixtureB = fixtureA.clone();
    fixtureB.traverse((child) => {
      if (child.isMesh) {
        const originalChild = fixtureA.getObjectByProperty("uuid", child.uuid.split("-")[0]);
        if (originalChild && originalChild.material) {
          child.material = originalChild.material;
        }
      }
    });
    fixtureB.position.set(
      ceilingLightPositions[1].x,
      wallHeight + 0.02,
      ceilingLightPositions[1].z,
    );

    const lightB = fixtureB.getObjectByName("Point");
    if (propLoader.configurePointLight(lightB, 7.5, 5, 2, 0xeeeeee)) {
      propLoader.lights.ceilingB = lightB;
    }
    propLoader.scene.add(fixtureB);
  });
}

/**
 * Load a grid of dim ceiling lights for the laboratory
 * @param {PropLoader} propLoader - The prop loader instance
 * @param {Object} config - Level configuration
 */
export function loadLaboratoryLights(propLoader, config) {
  const { lab } = config;
  const spacing = 5; // Space between lights (reduced count to avoid texture unit limit)
  const lightIntensity = 6; // Slightly brighter since there are fewer lights

  propLoader.loadModel("/models/fluorescent_ceiling_light.glb", (gltf) => {
    // Calculate grid dimensions
    const numLightsX = Math.floor(lab.width / spacing);
    const numLightsZ = Math.floor(lab.depth / spacing);

    // Calculate starting positions to center the grid
    const startX = lab.offsetX - lab.width / 2 + spacing / 2;
    const startZ = lab.offsetZ - lab.depth / 2 + spacing / 2;

    // Store original materials to share across all clones
    const originalMaterials = [];
    gltf.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        originalMaterials.push(child.material);
      }
    });

    // 2D for loop to create light grid
    for (let x = 0; x < numLightsX; x++) {
      for (let z = 0; z < numLightsZ; z++) {
        // Clone the fixture for each grid position (shallow clone)
        const fixture = x === 0 && z === 0 ? gltf.scene : gltf.scene.clone();

        // For clones, reuse materials from the original
        if (x !== 0 || z !== 0) {
          let materialIndex = 0;
          fixture.traverse((child) => {
            if (child.isMesh) {
              child.material = originalMaterials[materialIndex % originalMaterials.length];
              materialIndex++;
            }
          });
        }

        // Position the fixture
        fixture.position.set(
          startX + x * spacing,
          lab.wallHeight + 0.02,
          startZ + z * spacing,
        );
        fixture.scale.set(0.02, 0.02, 0.02);
        fixture.rotation.z = Math.PI;

        // Configure dim point light (don't add to propLoader.lights)
        const light = fixture.getObjectByName("Point");
        if (light) {
          propLoader.configurePointLight(light, lightIntensity, 5, 2, 0xdddddd);
        }

        propLoader.scene.add(fixture);
      }
    }
  });
}
