/**
 * GameStateManager - Centralized state management for the game
 *
 * Manages game state transitions and emits events when state changes occur.
 * Ensures only valid state transitions can occur and provides a single source
 * of truth for the current game state.
 */

// Game state constants
export const GameState = {
  // Menu states
  MAIN_MENU: "MAIN_MENU",
  LEVEL_SELECT: "LEVEL_SELECT",
  INSTRUCTIONS: "INSTRUCTIONS",

  // Game states
  BRIEFING: "BRIEFING",
  LEVEL_1_ACTIVE: "LEVEL_1_ACTIVE",
  LEVEL_2_ACTIVE: "LEVEL_2_ACTIVE",
  CUTSCENE: "CUTSCENE",

  // Pause state
  PAUSED: "PAUSED",
};

// Valid state transitions map
const VALID_TRANSITIONS = {
  [GameState.MAIN_MENU]: [GameState.LEVEL_SELECT, GameState.INSTRUCTIONS],
  [GameState.LEVEL_SELECT]: [
    GameState.MAIN_MENU,
    GameState.BRIEFING,
    GameState.LEVEL_1_ACTIVE,
    GameState.LEVEL_2_ACTIVE,
  ],
  [GameState.INSTRUCTIONS]: [GameState.MAIN_MENU, GameState.PAUSED],
  [GameState.BRIEFING]: [GameState.LEVEL_1_ACTIVE, GameState.CUTSCENE],
  [GameState.LEVEL_1_ACTIVE]: [
    GameState.PAUSED,
    GameState.LEVEL_2_ACTIVE,
    GameState.CUTSCENE,
    GameState.MAIN_MENU,
  ],
  [GameState.LEVEL_2_ACTIVE]: [
    GameState.PAUSED,
    GameState.CUTSCENE,
    GameState.MAIN_MENU,
  ],
  [GameState.CUTSCENE]: [GameState.LEVEL_1_ACTIVE, GameState.LEVEL_2_ACTIVE],
  [GameState.PAUSED]: [
    GameState.LEVEL_1_ACTIVE,
    GameState.LEVEL_2_ACTIVE,
    GameState.MAIN_MENU,
    GameState.INSTRUCTIONS,
  ],
};

export class GameStateManager {
  constructor() {
    this.currentState = GameState.MAIN_MENU;
    this.previousState = null;
    this.stateBeforePause = null;
    this.eventListeners = new Map();
    this.gameData = {
      unlockedLevels: [0],
      currentLevel: null,
    };
  }

  /**
   * Get the current game state
   * @returns {string} Current state constant
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Check if currently in any menu state
   * @returns {boolean}
   */
  isInMenu() {
    return [
      GameState.MAIN_MENU,
      GameState.LEVEL_SELECT,
      GameState.INSTRUCTIONS,
    ].includes(this.currentState);
  }

  /**
   * Check if currently playing a level
   * @returns {boolean}
   */
  isPlaying() {
    return [GameState.LEVEL_1_ACTIVE, GameState.LEVEL_2_ACTIVE].includes(
      this.currentState,
    );
  }

  /**
   * Check if game is paused
   * @returns {boolean}
   */
  isPaused() {
    return this.currentState === GameState.PAUSED;
  }

  /**
   * Check if in a cutscene
   * @returns {boolean}
   */
  isInCutscene() {
    return this.currentState === GameState.CUTSCENE;
  }

  /**
   * Transition to a new state
   * @private
   * @param {string} newState - Target state
   */
  _transitionTo(newState) {
    const validTransitions = VALID_TRANSITIONS[this.currentState] || [];

    if (!validTransitions.includes(newState)) {
      console.warn(
        `Invalid state transition: ${this.currentState} -> ${newState}`,
      );
      return;
    }

    const previousState = this.currentState;
    this.previousState = previousState;
    this.currentState = newState;

    // Emit state change events
    this.emit("stateChanged", { from: previousState, to: newState });

    // Emit specific state events
    if (this.isInMenu()) {
      this.emit("menuEntered", newState);
    }

    if (this.isPlaying()) {
      this.emit("gameStarted", newState);
    }

    console.log(`State transition: ${previousState} -> ${newState}`);
  }

  /**
   * Enter main menu state
   */
  enterMainMenu() {
    this._transitionTo(GameState.MAIN_MENU);
    this.gameData.currentLevel = null;
    this.stateBeforePause = null;
  }

  /**
   * Enter level select state
   */
  enterLevelSelect() {
    this._transitionTo(GameState.LEVEL_SELECT);
  }

  /**
   * Enter instructions state
   */
  enterInstructions() {
    this._transitionTo(GameState.INSTRUCTIONS);
  }

  /**
   * Start briefing cutscene
   */
  startBriefing() {
    this._transitionTo(GameState.BRIEFING);
    this.gameData.currentLevel = 0;
  }

  /**
   * Start a level
   * @param {number} levelNum - Level number (1 or 2)
   */
  startLevel(levelNum) {
    if (levelNum === 1) {
      this._transitionTo(GameState.LEVEL_1_ACTIVE);
      this.gameData.currentLevel = 1;
    } else if (levelNum === 2) {
      this._transitionTo(GameState.LEVEL_2_ACTIVE);
      this.gameData.currentLevel = 2;
    } else {
      console.warn(`Invalid level number: ${levelNum}`);
    }
  }

  /**
   * Enter cutscene state
   */
  enterCutscene() {
    this._transitionTo(GameState.CUTSCENE);
  }

  /**
   * Exit cutscene and return to the level
   */
  exitCutscene() {
    // Return to the appropriate level state based on current level
    if (this.gameData.currentLevel === 1) {
      this._transitionTo(GameState.LEVEL_1_ACTIVE);
    } else if (this.gameData.currentLevel === 2) {
      this._transitionTo(GameState.LEVEL_2_ACTIVE);
    } else {
      console.warn("exitCutscene called but no current level set");
    }
  }

  /**
   * Pause the game
   */
  pause() {
    if (!this.isPlaying()) {
      console.warn("Cannot pause - not currently playing");
      return;
    }

    this.stateBeforePause = this.currentState;
    this._transitionTo(GameState.PAUSED);
    this.emit("gamePaused");
  }

  /**
   * Resume the game from pause
   */
  resume() {
    if (!this.isPaused()) {
      console.warn("Cannot resume - not currently paused");
      return;
    }

    if (this.stateBeforePause) {
      this._transitionTo(this.stateBeforePause);
      this.stateBeforePause = null;
      this.emit("gameResumed");
    } else {
      console.warn("Cannot resume - no previous state saved");
    }
  }

  /**
   * Return to pause menu from instructions
   * Used when viewing instructions during gameplay
   */
  returnToPauseMenu() {
    if (this.currentState !== GameState.INSTRUCTIONS) {
      console.warn("Can only return to pause menu from instructions state");
      return;
    }

    this._transitionTo(GameState.PAUSED);
    this.emit("gamePaused");
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    if (!this.eventListeners.has(event)) return;

    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emit an event to all subscribers
   * @private
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.eventListeners.has(event)) return;

    const listeners = this.eventListeners.get(event);
    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Unlock a level
   * @param {number} levelNum - Level number to unlock
   */
  unlockLevel(levelNum) {
    if (!this.gameData.unlockedLevels.includes(levelNum)) {
      this.gameData.unlockedLevels.push(levelNum);
      this.emit("levelUnlocked", levelNum);
    }
  }

  /**
   * Check if a level is unlocked
   * @param {number} levelNum - Level number to check
   * @returns {boolean}
   */
  isLevelUnlocked(levelNum) {
    return this.gameData.unlockedLevels.includes(levelNum);
  }

  /**
   * Get the current level number
   * @returns {number|null}
   */
  getCurrentLevel() {
    return this.gameData.currentLevel;
  }
}
