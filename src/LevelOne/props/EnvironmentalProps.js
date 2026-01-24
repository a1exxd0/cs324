/**
 * EnvironmentalProps - Barrels, windows, and environmental decorations
 */
import * as THREE from "three";

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

    const barrelB = barrel.clone(true);
    barrelB.position.set(barrelPositions[1].x, 0.5, barrelPositions[1].z);
    propLoader.addCollider(1.3, 1.4, 1.3, barrelPositions[1]);
    propLoader.scene.add(barrelB);

    const barrelC = barrel.clone(true);
    barrelC.position.set(barrelPositions[2].x, 0.5, barrelPositions[2].z);
    propLoader.addCollider(1.3, 1.4, 1.3, barrelPositions[2], true);
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

/**
 * Load and configure portal on time machine
 * @param {PropLoader} propLoader - The prop loader instance
 * @param {Object} config - Level configuration
 * @param {InteractionManager} interactionManager - Interaction manager
 * @param {Object} portalState - Object to store portal state
 * @param {HUD} hud - HUD instance for updating text
 * @returns {Object} Portal state object with mesh and interaction ID
 */
export function loadPortal(
  propLoader,
  config,
  interactionManager,
  portalState,
  hud = null,
) {
  const { portalPosition } = config;

  // Create portal as a glowing red circle
  const portalGeometry = new THREE.CircleGeometry(1.1, 32);
  const portalMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000, // Red color
    emissive: 0xff0000, // Red glow
    emissiveIntensity: 0.2,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0, // Start invisible
  });

  const portal = new THREE.Mesh(portalGeometry, portalMaterial);
  portal.position.set(portalPosition.x, portalPosition.y, portalPosition.z);
  portal.rotation.y = Math.PI / 2; // Face the player

  // Add a point light for extra glow effect
  const portalLight = new THREE.PointLight(0xff0000, 0, 3);
  portalLight.position.set(0, 0, 0.1);
  portal.add(portalLight);

  // Create particle system for sparkles
  const particleCount = 100;
  const particles = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 2;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

    particleVelocities.push({
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.01,
    });
  }

  particles.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3),
  );

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffaa00,
    size: 0.05,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });

  const particleSystem = new THREE.Points(particles, particleMaterial);
  portal.add(particleSystem);

  propLoader.scene.add(portal);

  // Store portal reference
  portalState.mesh = portal;
  portalState.light = portalLight;
  portalState.material = portalMaterial;
  portalState.isActivated = false;
  portalState.particleSystem = particleSystem;
  portalState.particleVelocities = particleVelocities;
  portalState.hud = hud;
  portalState.character = null; // Will be set later
  portalState.cameraManager = null; // Will be set in setup

  // Register as interactive object (initially disabled)
  if (interactionManager) {
    portalState.interactionId = interactionManager.register({
      mesh: portal,
      radius: 4, // Interaction distance
      promptText: "E to activate portal",
      enabled: false, // Start disabled
      onInteract: () => {
        if (!portalState.isActivated) {
          activatePortal(portalState, interactionManager);
        }
      },
    });
  }

  // Store interaction manager reference
  portalState.interactionManager = interactionManager;

  return portalState;
}

/**
 * Enable portal interaction after keycard pickup
 * @param {Object} portalState - Portal state object
 * @param {InteractionManager} interactionManager - Interaction manager
 */
export function enablePortal(portalState, interactionManager) {
  if (portalState.interactionId && interactionManager) {
    // Fade in the portal
    const targetOpacity = 0.7;
    const fadeSpeed = 0.02;

    const fadeIn = () => {
      if (portalState.material.opacity < targetOpacity) {
        portalState.material.opacity += fadeSpeed;
        portalState.light.intensity += 0.5;
        requestAnimationFrame(fadeIn);
      } else {
        portalState.material.opacity = targetOpacity;
        portalState.light.intensity = 10;
      }
    };

    fadeIn();

    // Enable interaction
    interactionManager.setEnabled(portalState.interactionId, true);
  }
}

/**
 * Activate the portal - create red glowing effect
 * @param {Object} portalState - Portal state object
 * @param {InteractionManager} interactionManager - Interaction manager to disable prompt
 */
function activatePortal(portalState, interactionManager) {
  portalState.isActivated = true;

  // Disable the interaction immediately to remove the prompt
  if (portalState.interactionId && interactionManager) {
    interactionManager.setEnabled(portalState.interactionId, false);
  }

  // Update HUD with dramatic text
  if (portalState.hud) {
    portalState.hud.setObjective("You suddenly feel a force pulling you in...");
  }

  // Freeze the character
  if (portalState.character) {
    portalState.character.freeze();
    console.log("Character frozen:", portalState.character.isFrozen);
  } else {
    console.warn("No character reference in portalState!");
  }

  // Animate to full opacity and increased glow
  const animateActivation = () => {
    if (portalState.material.opacity < 1) {
      portalState.material.opacity += 0.05;
      portalState.material.emissiveIntensity += 0.1;
      portalState.light.intensity += 1;

      // Fade in particles
      if (portalState.particleSystem.material.opacity < 0.8) {
        portalState.particleSystem.material.opacity += 0.04;
      }

      requestAnimationFrame(animateActivation);
    } else {
      portalState.material.opacity = 1;
      portalState.material.emissiveIntensity = 2;
      portalState.light.intensity = 20;
      portalState.particleSystem.material.opacity = 0.8;

      // Add pulsing effect
      startPortalPulse(portalState);

      // Start particle animation
      startParticleAnimation(portalState);

      // Start cutscene after a short delay
      setTimeout(() => {
        startPortalCutscene(portalState);
      }, 1000);
    }
  };

  animateActivation();
}

/**
 * Start the portal cutscene - position character and walk them to portal
 * @param {Object} portalState - Portal state object
 */
function startPortalCutscene(portalState) {
  console.log("Starting portal cutscene");

  // Lock camera to prevent switching during cutscene
  if (portalState.cameraManager) {
    portalState.cameraManager.lockCamera();
  }

  // Trigger security camera view
  if (portalState.onCutsceneStart) {
    portalState.onCutsceneStart();
  }

  if (!portalState.character) {
    console.warn("No character for cutscene!");
    return;
  }

  const character = portalState.character;
  const portalPosition = portalState.mesh.position;

  // Enable cutscene mode (prevents player input but allows animation)
  character.isFrozen = false;
  character.inCutscene = true;

  // Position character away from portal (near lab entrance)
  const startX = portalPosition.x + 2.7;
  const startY = 0.9;
  const startZ = 0;
  character.container.position.set(startX, startY, startZ);

  // Face character towards portal
  character.container.rotation.y = (3 * Math.PI) / 2; // Face west towards portal

  // Store original move speed and reduce it
  const originalSpeed = character.moveSpeed;
  character.moveSpeed = originalSpeed * 0.2;

  // Play walking animation
  character.playAnimation("walkForward");

  // Animate character walking towards portal
  const targetX = portalPosition.x - 0.5; // Stop slightly before portal
  const walkSpeed = character.moveSpeed;

  const walkToPortal = () => {
    if (character.container.position.x > targetX) {
      // Move character towards portal
      character.container.position.x -= walkSpeed * 0.016; // Approximate delta time
      requestAnimationFrame(walkToPortal);
    } else {
      // Reached portal, stop and play idle
      character.playAnimation("idle");
      character.inCutscene = false;
      console.log("Character reached portal");

      // Optional: Add fade to black or next level transition here
    }
  };

  walkToPortal();
}

/**
 * Create pulsing glow effect for activated portal
 * @param {Object} portalState - Portal state object
 */
function startPortalPulse(portalState) {
  let time = 0;

  const pulse = () => {
    if (portalState.isActivated) {
      time += 0.05;
      const pulseValue = Math.sin(time) * 0.5 + 1.5;
      portalState.material.emissiveIntensity = pulseValue;
      portalState.light.intensity = 15 + pulseValue * 5;
      requestAnimationFrame(pulse);
    }
  };

  pulse();
}

/**
 * Animate particles swirling around the portal
 * @param {Object} portalState - Portal state object
 */
function startParticleAnimation(portalState) {
  const { particleSystem, particleVelocities } = portalState;
  const positions = particleSystem.geometry.attributes.position.array;

  const animate = () => {
    if (portalState.isActivated) {
      // Update particle positions
      for (let i = 0; i < positions.length / 3; i++) {
        const i3 = i * 3;

        // Add velocity
        positions[i3] += particleVelocities[i].x;
        positions[i3 + 1] += particleVelocities[i].y;
        positions[i3 + 2] += particleVelocities[i].z;

        // Reset particles that go too far
        const distance = Math.sqrt(
          positions[i3] * positions[i3] + positions[i3 + 1] * positions[i3 + 1],
        );

        if (distance > 1.5) {
          positions[i3] = (Math.random() - 0.5) * 0.5;
          positions[i3 + 1] = (Math.random() - 0.5) * 0.5;
          positions[i3 + 2] = (Math.random() - 0.5) * 0.2;
        }
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;
      requestAnimationFrame(animate);
    }
  };

  animate();
}

/**
 * Set the character reference for the portal (to freeze on activation)
 * @param {Object} portalState - Portal state object
 * @param {SwatCharacter} character - Character instance
 */
export function setPortalCharacter(portalState, character) {
  portalState.character = character;
  console.log("Portal character set:", character);
}
