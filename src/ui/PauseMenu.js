/**
 * PauseMenu - Dedicated pause menu component
 *
 * Creates and manages the pause menu UI. Shows/hides based on
 * GameStateManager events and handles user interactions.
 */

export class PauseMenu {
  constructor(stateManager, callbacks = {}) {
    this.stateManager = stateManager;
    this.element = null;

    // Callbacks for menu actions
    this.onShowInstructions = callbacks.onShowInstructions || (() => {});
    this.onReturnToMainMenu = callbacks.onReturnToMainMenu || (() => {});

    this.create();
    this.setupEventListeners();
  }

  /**
   * Create the pause menu DOM element
   */
  create() {
    this.element = document.createElement('div');
    this.element.id = 'pause-menu';
    this.element.style.display = 'none'; // Hidden by default
    this.element.innerHTML = `
      <div class="pause-overlay">
        <div class="menu-container pause-menu-container">
          <h1 class="menu-subtitle">PAUSED</h1>
          <div class="menu-buttons">
            <button id="resume-btn" class="menu-button">RESUME</button>
            <button id="instructions-pause-btn" class="menu-button">INSTRUCTIONS</button>
            <button id="main-menu-btn" class="menu-button">MAIN MENU</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.element);
  }

  /**
   * Setup event listeners for state changes and button clicks
   */
  setupEventListeners() {
    // Subscribe to state changes
    this.stateManager.on('gamePaused', () => this.show());
    this.stateManager.on('gameResumed', () => this.hide());

    // Also hide when returning to main menu
    this.stateManager.on('menuEntered', () => this.hide());

    // Button handlers
    const resumeBtn = document.getElementById('resume-btn');
    const instructionsBtn = document.getElementById('instructions-pause-btn');
    const mainMenuBtn = document.getElementById('main-menu-btn');

    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        this.stateManager.resume();
        // Request pointer lock directly in click handler to ensure valid user gesture
        document.body.requestPointerLock();
      });
    }

    if (instructionsBtn) {
      instructionsBtn.addEventListener('click', () => {
        // Transition to instructions state
        this.stateManager.enterInstructions();
        // Call callback to show instructions page
        this.onShowInstructions(true); // true = coming from pause menu
      });
    }

    if (mainMenuBtn) {
      mainMenuBtn.addEventListener('click', () => {
        // Cleanup level and return to main menu
        // Note: onReturnToMainMenu calls showMainMenu() which handles state transition
        this.onReturnToMainMenu();
      });
    }
  }

  /**
   * Show the pause menu
   */
  show() {
    if (this.element) {
      this.element.style.display = 'flex';
    }

    // Release pointer lock when pausing
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  /**
   * Hide the pause menu
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  /**
   * Dispose of the pause menu (remove from DOM)
   */
  dispose() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
