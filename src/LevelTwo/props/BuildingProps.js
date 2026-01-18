/**
 * BuildingProps - Sci-fi building and structures
 */
import * as THREE from "three";

/**
 * Load and configure sci-fi building with interaction
 * @param {PropLoader} propLoader - The prop loader instance
 * @param {Object} config - Level configuration
 * @param {InteractionManager} interactionManager - Interaction manager
 * @param {Function} onInspect - Callback when building is inspected
 */
export function loadSciFiBuilding(propLoader, config, interactionManager, onInspect) {
  const { sciFiBuildingPosition, sciFiBuildingScale } = config;

  propLoader.loadModel("/models/sci_fi_building.glb", (gltf) => {
    const building = gltf.scene;
    building.position.set(
      sciFiBuildingPosition.x,
      sciFiBuildingPosition.y,
      sciFiBuildingPosition.z,
    );
    building.scale.set(
      sciFiBuildingScale,
      sciFiBuildingScale,
      sciFiBuildingScale,
    );

    // Add a large invisible interaction mesh
    const interactionGeometry = new THREE.BoxGeometry(10, 30, 10);
    const interactionMaterial = new THREE.MeshBasicMaterial({
      visible: false,
      transparent: true,
      opacity: 0,
    });
    const interactionMesh = new THREE.Mesh(
      interactionGeometry,
      interactionMaterial,
    );
    interactionMesh.position.set(
      sciFiBuildingPosition.x,
      sciFiBuildingPosition.y + 15, // Center the box vertically (half of height)
      sciFiBuildingPosition.z,
    );

    propLoader.scene.add(building);
    propLoader.scene.add(interactionMesh);

    // Register as interactive object
    if (interactionManager) {
      const interactionId = interactionManager.register({
        mesh: interactionMesh,
        radius: 8, // Interaction distance
        promptText: "E to Inspect",
        enabled: true,
        onInteract: () => {
          console.log("Inspecting sci-fi building...");
          // Disable interaction after inspecting
          interactionManager.setEnabled(interactionId, false);
          // Trigger cutscene
          if (onInspect) {
            onInspect();
          }
        },
      });
    }
  });
}
