/**
 * FurnitureProps - Desks, vault door, and other furniture
 */

/**
 * Load and configure reception desk
 * @param {PropLoader} propLoader - The prop loader instance
 * @param {Object} config - Level configuration
 */
export function loadReceptionDesk(propLoader, config) {
  const { deskPosition } = config;

  propLoader.loadModel("/models/reception_desk.glb", (gltf) => {
    const desk = gltf.scene;
    desk.position.set(deskPosition.x, deskPosition.y, deskPosition.z);
    desk.scale.set(1.2, 1.2, 1.2);
    desk.rotation.y = Math.PI;

    const lampLight = desk.getObjectByName("Point");
    propLoader.configurePointLight(lampLight, 7, 4, 2, 0xffcc88);

    propLoader.addCollider(1.45, 0.9, 0.85, {
      x: deskPosition.x,
      y: deskPosition.y + 0.45,
      z: deskPosition.z,
    });

    propLoader.scene.add(desk);
  });
}

/**
 * Load and configure vault door with animation
 * @param {PropLoader} propLoader - The prop loader instance
 * @param {Object} config - Level configuration
 * @param {Object} vaultDoorState - Object to store vault door state
 * @param {Function} onAnimationComplete - Callback when animation finishes
 * @param {InteractionManager} interactionManager - Optional interaction manager
 */
export function loadVaultDoor(
  propLoader,
  config,
  vaultDoorState,
  onAnimationComplete,
  interactionManager = null,
) {
  const { vaultDoorPosition } = config;

  propLoader.loadModel("/models/vault_door.glb", (gltf) => {
    const door = gltf.scene;
    door.position.set(
      vaultDoorPosition.x,
      vaultDoorPosition.y,
      vaultDoorPosition.z,
    );
    door.scale.set(3.35, 3.35, 3.35);

    // Store reference to the door mesh
    vaultDoorState.mesh = door;
    vaultDoorState.isOpen = false;

    // Set up animation to play once (but don't auto-play)
    if (gltf.animations && gltf.animations.length > 0) {
      const animation = gltf.animations.find(
        (anim) => anim.name === "Take 001",
      );

      if (animation) {
        vaultDoorState.action = propLoader.addAnimation(door, animation, {
          loop: false,
          onFinish: () => {
            vaultDoorState.isOpen = true;
            if (onAnimationComplete) {
              onAnimationComplete();
            }
            // Disable interaction after opening
            if (vaultDoorState.interactionId && interactionManager) {
              interactionManager.setEnabled(vaultDoorState.interactionId, false);
            }
          },
        });

        // Stop the animation initially - wait for player interaction
        vaultDoorState.action.stop();
      }
    }

    // Register as interactive object if interaction manager provided
    if (interactionManager) {
      vaultDoorState.interactionId = interactionManager.register({
        mesh: door,
        radius: 3.5, // Interaction distance
        promptText: "E to open vault door",
        enabled: true,
        onInteract: () => {
          // Only allow interaction if not already open
          if (!vaultDoorState.isOpen && vaultDoorState.action) {
            vaultDoorState.action.play();
            // Disable further interaction while opening
            if (vaultDoorState.interactionId) {
              interactionManager.setEnabled(vaultDoorState.interactionId, false);
            }
          }
        },
      });
    }

    propLoader.scene.add(door);
  });
}
