/**
 * EnvironmentalProps - Barrels, windows, and environmental decorations
 */

/**
 * Load and configure radioactive barrels
 * @param {PropLoader} propLoader - The prop loader instance
 * @param {Object} config - Level configuration
 */
export function loadRadioactiveBarrels(propLoader, config) {
  const { barrelPositions } = config;

  propLoader.loadModel("/models/radioactive_metal_barrel.glb", (gltf) => {
    // First barrel with light
    const barrel = gltf.scene;
    barrel.position.set(barrelPositions[0].x, 0.3, barrelPositions[0].z);
    barrel.rotateY(Math.PI);

    const lampLight = barrel.getObjectByName("Point");
    propLoader.configurePointLight(lampLight, 5, 2, 3, 0x2cfa1f);

    propLoader.addCollider(1.3, 1.4, 1.3, {
      x: barrelPositions[0].x,
      y: 0.5,
      z: barrelPositions[0].z,
    });

    propLoader.scene.add(barrel);

    // Clone barrels for other positions
    const barrelB = barrel.clone(true);
    barrelB.position.set(barrelPositions[1].x, 0.5, barrelPositions[1].z);
    propLoader.scene.add(barrelB);

    const barrelC = barrel.clone(true);
    barrelC.position.set(barrelPositions[2].x, 0.5, barrelPositions[2].z);
    propLoader.scene.add(barrelC);
  });
}

/**
 * Load and configure rotten window
 * @param {PropLoader} propLoader - The prop loader instance
 * @param {Object} config - Level configuration
 */
export function loadRottenWindow(propLoader, config) {
  const { rottenWindowPosition } = config;

  propLoader.loadModel("/models/rotten_window.glb", (gltf) => {
    const window = gltf.scene;
    window.position.set(
      rottenWindowPosition.x,
      rottenWindowPosition.y,
      rottenWindowPosition.z,
    );
    window.scale.set(0.001, 0.001, 0.001);
    window.rotateZ(Math.PI / 2);
    window.rotateY(Math.PI / 2);
    window.rotateX(Math.PI);
    propLoader.scene.add(window);
  });
}
