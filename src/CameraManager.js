import * as THREE from "three";

/**
 * Manages camera view switching between player and security camera views
 */
export class CameraManager {
  constructor(camera, hud) {
    this.camera = camera;
    this.hud = hud;
    this.isSecurityView = false;
    this.securityCameras = new Map(); // Map of camera name -> {position, target}
    this.currentSecurityCamera = null;
    this.isLocked = false; // Prevents camera switching during cutscenes

    this.setupKeyboardControls();
  }

  /**
   * Register a security camera view
   * @param {string} name - Camera identifier
   * @param {THREE.Vector3} position - Camera position
   * @param {THREE.Vector3} target - Camera look-at target
   */
  registerSecurityCamera(name, position, target) {
    this.securityCameras.set(name, { position, target });
    if (!this.currentSecurityCamera) {
      this.currentSecurityCamera = name;
    }
  }

  /**
   * Set up keyboard controls for camera switching
   */
  setupKeyboardControls() {
    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "c") {
        this.toggleCamera();
      }
    });
  }

  /**
   * Toggle between player and security camera views
   */
  toggleCamera() {
    // Don't allow switching if locked (during cutscenes)
    if (this.isLocked) {
      return;
    }

    this.isSecurityView = !this.isSecurityView;

    if (this.isSecurityView) {
      this.switchToSecurityView();
    } else {
      this.switchToPlayerView();
    }
  }

  /**
   * Switch to security camera view
   */
  switchToSecurityView() {
    const cameraData = this.securityCameras.get(this.currentSecurityCamera);
    if (cameraData) {
      this.camera.position.copy(cameraData.position);
      this.camera.lookAt(cameraData.target);
      this.hud.showCameraView(
        `Security Camera - ${this.currentSecurityCamera} (C to switch)`,
        true,
      );
    }
  }

  /**
   * Switch back to player view
   */
  switchToPlayerView() {
    this.hud.showCameraView("Player View (C to switch)", false);
  }

  /**
   * Force switch to security view (for cutscenes)
   * @param {string} cameraName - Name of camera to switch to
   * @param {string} customText - Optional custom text to display
   */
  forceSwitchToSecurity(cameraName = null, customText = null) {
    if (cameraName && this.securityCameras.has(cameraName)) {
      this.currentSecurityCamera = cameraName;
    }
    this.isSecurityView = true;

    const cameraData = this.securityCameras.get(this.currentSecurityCamera);
    if (cameraData) {
      this.camera.position.copy(cameraData.position);
      this.camera.lookAt(cameraData.target);

      // Use custom text if provided, otherwise use default
      const displayText = customText || `Security Camera - ${this.currentSecurityCamera} (C to switch)`;
      this.hud.showCameraView(displayText, true);
    }
  }

  /**
   * Check if currently in security camera view
   * @returns {boolean}
   */
  isInSecurityView() {
    return this.isSecurityView;
  }

  /**
   * Lock camera switching (for cutscenes)
   */
  lockCamera() {
    this.isLocked = true;
  }

  /**
   * Unlock camera switching (after cutscenes)
   */
  unlockCamera() {
    this.isLocked = false;
  }
}
