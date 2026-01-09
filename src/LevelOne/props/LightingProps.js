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

    // Second fixture (cloned)
    const fixtureB = fixtureA.clone(true);
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
