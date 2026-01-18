import * as THREE from "three";
import config from "./config.js";
import { setPortalCharacter } from "./props/EnvironmentalProps.js";

/**
 * Setup level-specific camera views and interactions
 * @param {Object} levelData - The loaded level data
 * @param {Object} character - The player character
 * @param {CameraManager} cameraManager - The camera manager instance
 * @param {Function} onCutsceneEnd - Callback to execute when cutscene ends
 */
export function setupLevelOne(levelData, character, cameraManager, onCutsceneEnd) {
  // Register security camera view
  cameraManager.registerSecurityCamera(
    "Lab",
    new THREE.Vector3(
      config.securityCameraPosition.x - 0.2,
      config.securityCameraPosition.y - 0.1,
      config.securityCameraPosition.z,
    ),
    new THREE.Vector3(
      config.securityCameraTarget.x,
      config.securityCameraTarget.y,
      config.securityCameraTarget.z,
    ),
  );

  // Setup portal state if it exists
  if (levelData.portalState) {
    setPortalCharacter(levelData.portalState, character);

    // Store camera manager reference for cutscene
    levelData.portalState.cameraManager = cameraManager;

    // Set cutscene callback to switch to security camera
    levelData.portalState.onCutsceneStart = () => {
      console.log("Cutscene started - switching to security camera");
      cameraManager.forceSwitchToSecurity(
        "Lab",
        "-- CUTSCENE IN PROGRESS --",
      );

      // After 10 seconds, return to mission select
      setTimeout(() => {
        console.log("Cutscene ended - returning to mission select");
        if (onCutsceneEnd) {
          onCutsceneEnd();
        }
      }, 10000); // 10 seconds
    };
  }
}
