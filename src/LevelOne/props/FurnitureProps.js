/**
 * FurnitureProps - Desks, vault door, and other furniture
 */
import * as THREE from "three";

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
              interactionManager.setEnabled(
                vaultDoorState.interactionId,
                false,
              );
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
              interactionManager.setEnabled(
                vaultDoorState.interactionId,
                false,
              );
            }
          }
        },
      });
    }

    propLoader.scene.add(door);
  });
}

/**
 * Load and configure body scanning machines
 * @param {PropLoader} propLoader - The prop loader instance
 * @param {Object} config - Level configuration
 */
export function loadBodyScanningMachines(propLoader, config) {
  const { bodyScanningMachinePositions } = config;

  bodyScanningMachinePositions.forEach((position) => {
    // Choose model based on whether there's an alien on the bed
    const modelPath = position.hasAlien
      ? "/models/alien_on_bed.glb"
      : "/models/body_scanning_machine.glb";

    propLoader.loadModel(modelPath, (gltf) => {
      const machine = gltf.scene.clone();
      machine.position.set(position.x, position.y, position.z);
      machine.scale.set(1, 1, 1);
      machine.rotation.y = position.rotation || 0;

      propLoader.scene.add(machine);
    });
  });
}

/**
 * Load and configure time machine
 * @param {PropLoader} propLoader - The prop loader instance
 * @param {Object} config - Level configuration
 */
export function loadTimeMachine(propLoader, config) {
  const { timeMachinePosition } = config;

  propLoader.loadModel("/models/time_machine.glb", (gltf) => {
    const timeMachine = gltf.scene;
    timeMachine.position.set(
      timeMachinePosition.x,
      timeMachinePosition.y,
      timeMachinePosition.z,
    );
    timeMachine.scale.set(0.068, 0.068, 0.068);
    timeMachine.rotateY(Math.PI);

    propLoader.addCollider(5, 1, 1, timeMachinePosition, false);
    propLoader.addCollider(
      1,
      0.5,
      1,
      {
        x: timeMachinePosition.x + 3,
        y: timeMachinePosition.y,
        z: timeMachinePosition.z,
      },
      false,
    );
    propLoader.scene.add(timeMachine);
  });
}

/**
 * Load and configure security camera
 * @param {PropLoader} propLoader - The prop loader instance
 * @param {Object} config - Level configuration
 */
export function loadSecurityCamera(propLoader, config) {
  const { securityCameraPosition } = config;

  propLoader.loadModel("/models/security_camera.glb", (gltf) => {
    const camera = gltf.scene;
    camera.position.set(
      securityCameraPosition.x,
      securityCameraPosition.y,
      securityCameraPosition.z,
    );
    camera.scale.set(1.3, 1.3, 1.3);
    // Rotate to face into the room (southwest direction)
    camera.rotation.y = Math.PI * 0.75 + Math.PI;
    camera.rotation.x = Math.PI * 0.1;

    propLoader.scene.add(camera);
  });
}

/**
 * Load and configure emergency keycard (uno reverse card)
 * @param {PropLoader} propLoader - The prop loader instance
 * @param {Object} config - Level configuration
 * @param {InteractionManager} interactionManager - Interaction manager
 * @param {HUD} hud - HUD instance to update objective
 * @param {Object} portalState - Portal state to enable after pickup
 */
export function loadEmergencyKeycard(
  propLoader,
  config,
  interactionManager,
  hud,
  portalState,
) {
  const { deskPosition } = config;

  propLoader.loadModel("/models/uno_reverse_card.glb", (gltf) => {
    const keycard = gltf.scene;
    // Position on top of reception desk
    keycard.position.set(
      deskPosition.x + 0.35,
      deskPosition.y + 0.94,
      deskPosition.z + 0.1,
    );
    keycard.scale.set(0.3, 0.3, 0.3);
    keycard.rotation.y = Math.PI / 4; // Rotate 45 degrees for visual interest

    // Add a larger invisible mesh for easier interaction detection
    const interactionGeometry = new THREE.BoxGeometry(1.5, 5, 1.5);
    const interactionMaterial = new THREE.MeshBasicMaterial({
      visible: false,
      transparent: true,
      opacity: 0,
    });
    const interactionMesh = new THREE.Mesh(
      interactionGeometry,
      interactionMaterial,
    );
    keycard.add(interactionMesh);

    propLoader.scene.add(keycard);

    // Register as interactive object
    if (interactionManager) {
      const interactionId = interactionManager.register({
        mesh: keycard,
        radius: 3, // Increased interaction distance
        promptText: "E to collect Emergency Override Keycard",
        enabled: true,
        onInteract: () => {
          // Remove keycard from scene
          propLoader.scene.remove(keycard);

          // Unregister the interaction so the prompt doesn't show anymore
          interactionManager.unregister(interactionId);

          // Update HUD objective
          if (hud) {
            hud.setObjective("Activate portal with keycard");
          }

          // Enable the portal after keycard pickup
          if (portalState) {
            // Import and call enablePortal function
            import("./EnvironmentalProps.js").then((module) => {
              module.enablePortal(portalState, interactionManager);
            });
          }
        },
      });
    }
  });
}
