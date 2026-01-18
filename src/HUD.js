/**
 * HUD (Heads-Up Display) manager
 * Displays crosshair and objective overlay
 */
export class HUD {
  constructor() {
    this.visible = true;
    this.objective = "";
    this.interactionPrompt = "";
    this.createHUDElements();
  }

  /**
   * Creates the HUD HTML elements
   */
  createHUDElements() {
    // Create HUD container
    this.container = document.createElement("div");
    this.container.id = "hud";
    this.container.className = "hud-container";

    // Create crosshair
    this.crosshair = document.createElement("div");
    this.crosshair.className = "crosshair";
    this.crosshair.innerHTML = `
      <div class="crosshair-line crosshair-horizontal"></div>
      <div class="crosshair-line crosshair-vertical"></div>
    `;

    // Create objective display
    this.objectiveElement = document.createElement("div");
    this.objectiveElement.className = "objective";

    // Create interaction prompt display
    this.interactionElement = document.createElement("div");
    this.interactionElement.className = "interaction-prompt";
    this.interactionElement.style.display = "none";

    // Create camera view indicator
    this.cameraViewElement = document.createElement("div");
    this.cameraViewElement.className = "camera-view-indicator";
    this.cameraViewElement.style.display = "none";

    // Assemble HUD
    this.container.appendChild(this.crosshair);
    this.container.appendChild(this.objectiveElement);
    this.container.appendChild(this.interactionElement);
    this.container.appendChild(this.cameraViewElement);
    document.body.appendChild(this.container);
  }

  /**
   * Set the current objective text
   * @param {string} text - The objective to display
   */
  setObjective(text) {
    this.objective = text;
    this.objectiveElement.textContent = text;
  }

  /**
   * Show an interaction prompt (e.g., "E to open")
   * @param {string} text - The prompt text to display
   */
  showInteractionPrompt(text) {
    this.interactionPrompt = text;
    this.interactionElement.textContent = text;
    this.interactionElement.style.display = "block";
  }

  /**
   * Hide the interaction prompt
   */
  hideInteractionPrompt() {
    this.interactionPrompt = "";
    this.interactionElement.style.display = "none";
  }

  /**
   * Show camera view indicator
   * @param {string} viewName - The name of the camera view
   * @param {boolean} isSecurityCamera - Whether this is the security camera view (for styling)
   */
  showCameraView(viewName, isSecurityCamera = false) {
    this.cameraViewElement.textContent = viewName;
    this.cameraViewElement.style.display = "block";

    if (isSecurityCamera) {
      this.cameraViewElement.className = "camera-view-indicator security-camera";
    } else {
      this.cameraViewElement.className = "camera-view-indicator player-camera";
    }
  }

  /**
   * Hide camera view indicator
   */
  hideCameraView() {
    this.cameraViewElement.style.display = "none";
  }

  /**
   * Show the HUD
   */
  show() {
    this.visible = true;
    this.container.style.display = "block";
  }

  /**
   * Hide the HUD
   */
  hide() {
    this.visible = false;
    this.container.style.display = "none";
  }

  /**
   * Toggle HUD visibility
   */
  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Check if HUD is currently visible
   * @returns {boolean}
   */
  isVisible() {
    return this.visible;
  }
}
