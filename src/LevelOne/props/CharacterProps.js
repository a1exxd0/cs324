/**
 * CharacterProps - Dead bodies and character models
 */

/**
 * Load and configure dead body
 * @param {PropLoader} propLoader - The prop loader instance
 * @param {Object} config - Level configuration
 */
export function loadDeadBody(propLoader, config) {
  const { deadBodyPosition } = config;

  propLoader.loadModel("/models/dead_hazmat_female.glb", (gltf) => {
    const body = gltf.scene;
    body.position.set(
      deadBodyPosition.x,
      deadBodyPosition.y,
      deadBodyPosition.z,
    );
    body.scale.set(1, 1, 1);
    propLoader.scene.add(body);

    // Add collider for the body
    propLoader.addCollider(1.5, 2, 0.1, {
      x: deadBodyPosition.x,
      y: 1,
      z: deadBodyPosition.z + 0.3,
    });
  });
}
