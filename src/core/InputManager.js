/**
 * InputManager - Centralized input handling with state awareness
 *
 * Registers a SINGLE set of event listeners for the entire application
 * and routes input events based on the current game state. This prevents
 * event listener accumulation and ensures proper input isolation between
 * menu and game states.
 */

import { GameState } from './GameStateManager.js';

export class InputManager {
  constructor(gameStateManager) {
    this.stateManager = gameStateManager;
    this.initialized = false;

    // Handler registries - organized by input type
    this.handlers = {
      // Game-specific inputs (WASD, Space, Click, MouseMove during gameplay)
      gameKeydown: [],
      gameKeyup: [],
      gameClick: [],
      gameMousemove: [],

      // Menu-specific inputs (Click, MouseMove during menus)
      menuClick: [],
      menuMousemove: [],

      // System inputs (ESC, C key - work across states)
      systemEscape: [],
      systemCameraToggle: [],
      systemInteract: [], // E key
    };

    // Bound methods for cleanup
    this.boundKeydown = null;
    this.boundKeyup = null;
    this.boundClick = null;
    this.boundMousemove = null;

    // Pointer lock state
    this.pointerLockRequested = false;
  }

  /**
   * Initialize the input manager (register global listeners)
   */
  init() {
    if (this.initialized) {
      console.warn('InputManager already initialized');
      return;
    }

    // Create bound methods
    this.boundKeydown = this._handleKeydown.bind(this);
    this.boundKeyup = this._handleKeyup.bind(this);
    this.boundClick = this._handleClick.bind(this);
    this.boundMousemove = this._handleMousemove.bind(this);

    // Register SINGLE global listeners
    window.addEventListener('keydown', this.boundKeydown);
    window.addEventListener('keyup', this.boundKeyup);
    document.addEventListener('click', this.boundClick);
    document.addEventListener('mousemove', this.boundMousemove);

    // Listen for pointer lock changes
    document.addEventListener('pointerlockchange', this._handlePointerLockChange.bind(this));

    this.initialized = true;
    console.log('InputManager initialized');
  }

  /**
   * Cleanup all event listeners
   */
  cleanup() {
    if (!this.initialized) return;

    window.removeEventListener('keydown', this.boundKeydown);
    window.removeEventListener('keyup', this.boundKeyup);
    document.removeEventListener('click', this.boundClick);
    document.removeEventListener('mousemove', this.boundMousemove);

    // Clear all handler registries
    Object.keys(this.handlers).forEach(key => {
      this.handlers[key] = [];
    });

    this.initialized = false;
    console.log('InputManager cleaned up');
  }

  /**
   * Central keydown handler - routes based on state
   * @private
   */
  _handleKeydown(event) {
    const state = this.stateManager.getCurrentState();
    const key = event.key.toLowerCase();

    // System inputs work in all states (with state checks)
    if (key === 'escape') {
      this._dispatchToHandlers('systemEscape', event);
      return;
    }

    if (key === 'c') {
      this._dispatchToHandlers('systemCameraToggle', event);
      return;
    }

    if (key === 'e') {
      this._dispatchToHandlers('systemInteract', event);
      return;
    }

    // Game inputs only work during gameplay (not in menus, pause, or cutscenes)
    if (this.stateManager.isPlaying()) {
      this._dispatchToHandlers('gameKeydown', event);
    }

    // Menu inputs (if needed for keyboard navigation)
    // Currently menus are mouse-only, but can be extended
  }

  /**
   * Central keyup handler - routes based on state
   * @private
   */
  _handleKeyup(event) {
    // Only route keyup to game handlers during gameplay
    if (this.stateManager.isPlaying()) {
      this._dispatchToHandlers('gameKeyup', event);
    }
  }

  /**
   * Central click handler - routes based on state
   * @private
   */
  _handleClick(event) {
    const state = this.stateManager.getCurrentState();

    // During gameplay, dispatch to game handlers
    if (this.stateManager.isPlaying()) {
      this._dispatchToHandlers('gameClick', event);
    }

    // During menus, dispatch to menu handlers
    if (this.stateManager.isInMenu() || this.stateManager.isPaused()) {
      this._dispatchToHandlers('menuClick', event);
    }
  }

  /**
   * Central mousemove handler - routes based on state
   * @private
   */
  _handleMousemove(event) {
    // Only dispatch mousemove during gameplay (for camera control)
    if (this.stateManager.isPlaying() && document.pointerLockElement === document.body) {
      this._dispatchToHandlers('gameMousemove', event);
    }

    // Menu mousemove (for hover effects, etc.)
    if (this.stateManager.isInMenu() || this.stateManager.isPaused()) {
      this._dispatchToHandlers('menuMousemove', event);
    }
  }

  /**
   * Dispatch event to all registered handlers
   * @private
   */
  _dispatchToHandlers(handlerType, event) {
    const handlers = this.handlers[handlerType];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in ${handlerType} handler:`, error);
      }
    });
  }

  /**
   * Handle pointer lock state changes
   * @private
   */
  _handlePointerLockChange() {
    if (!document.pointerLockElement && this.pointerLockRequested) {
      console.log('Pointer lock released');
      this.pointerLockRequested = false;
    }
  }

  /**
   * Subscribe to game input events (WASD, Space, mouse during gameplay)
   * @param {string} inputType - 'keydown', 'keyup', 'click', 'mousemove'
   * @param {Function} callback - Handler function
   * @returns {Function} Unsubscribe function
   */
  onGameInput(inputType, callback) {
    const handlerKey = `game${inputType.charAt(0).toUpperCase()}${inputType.slice(1)}`;

    if (!this.handlers[handlerKey]) {
      console.warn(`Unknown game input type: ${inputType}`);
      return () => {};
    }

    this.handlers[handlerKey].push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.handlers[handlerKey].indexOf(callback);
      if (index > -1) {
        this.handlers[handlerKey].splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to menu input events (click, mousemove during menus)
   * @param {string} inputType - 'click', 'mousemove'
   * @param {Function} callback - Handler function
   * @returns {Function} Unsubscribe function
   */
  onMenuInput(inputType, callback) {
    const handlerKey = `menu${inputType.charAt(0).toUpperCase()}${inputType.slice(1)}`;

    if (!this.handlers[handlerKey]) {
      console.warn(`Unknown menu input type: ${inputType}`);
      return () => {};
    }

    this.handlers[handlerKey].push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.handlers[handlerKey].indexOf(callback);
      if (index > -1) {
        this.handlers[handlerKey].splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to system input events (ESC, C key, E key)
   * System inputs can work across different states
   * @param {string} inputType - 'escape', 'cameraToggle', 'interact'
   * @param {Function} callback - Handler function
   * @returns {Function} Unsubscribe function
   */
  onSystemInput(inputType, callback) {
    const handlerKey = `system${inputType.charAt(0).toUpperCase()}${inputType.slice(1)}`;

    if (!this.handlers[handlerKey]) {
      console.warn(`Unknown system input type: ${inputType}`);
      return () => {};
    }

    this.handlers[handlerKey].push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.handlers[handlerKey].indexOf(callback);
      if (index > -1) {
        this.handlers[handlerKey].splice(index, 1);
      }
    };
  }

  /**
   * Request pointer lock (for first-person camera control)
   */
  requestPointerLock() {
    if (!this.stateManager.isPlaying()) {
      console.warn('Cannot request pointer lock - not in gameplay state');
      return;
    }

    if (document.pointerLockElement !== document.body) {
      document.body.requestPointerLock();
      this.pointerLockRequested = true;
    }
  }

  /**
   * Exit pointer lock
   */
  exitPointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
      this.pointerLockRequested = false;
    }
  }

  /**
   * Enable game controls (automatically handled by state-based routing)
   * This is a no-op but provided for API consistency
   */
  enableGameControls() {
    // Game controls are automatically enabled when state is PLAYING
    // No action needed - routing is handled by state checks
  }

  /**
   * Disable game controls (automatically handled by state-based routing)
   * This is a no-op but provided for API consistency
   */
  disableGameControls() {
    // Game controls are automatically disabled when state is not PLAYING
    // No action needed - routing is handled by state checks
    this.exitPointerLock();
  }

  /**
   * Enable menu controls (automatically handled by state-based routing)
   * This is a no-op but provided for API consistency
   */
  enableMenuControls() {
    // Menu controls are automatically enabled when state is MENU
    // No action needed - routing is handled by state checks
  }

  /**
   * Disable menu controls (automatically handled by state-based routing)
   * This is a no-op but provided for API consistency
   */
  disableMenuControls() {
    // Menu controls are automatically disabled when state is not MENU
    // No action needed - routing is handled by state checks
  }
}
