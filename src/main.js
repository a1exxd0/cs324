import "./style.css";
import { LevelManager } from "./LevelManager.js";
import { GameStateManager } from "./core/GameStateManager.js";
import { InputManager } from "./core/InputManager.js";
import { PauseMenu } from "./ui/PauseMenu.js";

// Create landing page
const landingPage = document.createElement("div");
landingPage.id = "landing-page";
document.body.appendChild(landingPage);

// Initialize managers
const stateManager = new GameStateManager();
const inputManager = new InputManager(stateManager);
inputManager.init();

// Level manager instance
let levelManager = null;

// Create pause menu with callbacks
const pauseMenu = new PauseMenu(stateManager, {
  onShowInstructions: (fromPause) => {
    // Show landing page with instructions
    if (!document.body.contains(landingPage)) {
      document.body.appendChild(landingPage);
    }
    showInstructions(fromPause);
  },
  onReturnToMainMenu: () => {
    // Cleanup level before returning to menu
    if (levelManager) {
      levelManager.cleanup();
      levelManager = null;
    }
    // Show landing page with main menu content
    if (!document.body.contains(landingPage)) {
      document.body.appendChild(landingPage);
    }
    showMainMenu();
  }
});

// Listen for ESC key to toggle pause
inputManager.onSystemInput('escape', () => {
  if (stateManager.isPlaying()) {
    stateManager.pause();
  } else if (stateManager.isPaused()) {
    stateManager.resume();
  }
});

// Show main menu initially
showMainMenu();

// Function to show main menu
function showMainMenu() {
  // Update state
  stateManager.enterMainMenu();

  // Release pointer lock if active
  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  landingPage.innerHTML = `
    <div class="menu-container">
      <h1 class="game-title">STATION EPSILON-7</h1>
      <h2 class="game-subtitle">DARK SIGNAL</h2>
      <div class="menu-buttons">
        <button id="play-btn" class="menu-button">PLAY</button>
        <button id="instructions-btn" class="menu-button">INSTRUCTIONS</button>
      </div>
    </div>
  `;

  // Button event listeners
  document.getElementById("play-btn").addEventListener("click", showLevelSelect);
  document.getElementById("instructions-btn").addEventListener("click", () => showInstructions(false));
}

// Function to show level selection menu
function showLevelSelect() {
  // Update state
  stateManager.enterLevelSelect();

  // Release pointer lock if active
  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  const level1Unlocked = stateManager.isLevelUnlocked(1);

  landingPage.innerHTML = `
    <div class="menu-container level-select-container">
      <h1 class="menu-subtitle">SELECT MISSION</h1>
      <div class="level-grid">
        <div class="level-card" id="level-0-card">
          <h3 class="level-title">LEVEL 0</h3>
          <p class="level-name">Briefing</p>
        </div>
        <div class="level-card ${level1Unlocked ? '' : 'locked'}" id="level-1-card">
          ${level1Unlocked ? '' : '<div class="level-lock">🔒</div>'}
          <h3 class="level-title">LEVEL 1</h3>
          <p class="level-name">Surface Facility</p>
        </div>
        <div class="level-card locked">
          <div class="level-lock">🔒</div>
          <h3 class="level-title">LEVEL 2</h3>
          <p class="level-name">The Arctic Circle</p>
        </div>
      </div>
      <button id="back-btn" class="menu-button back-button">BACK</button>
    </div>
  `;

  // Level 0 click listener
  document.getElementById("level-0-card").addEventListener("click", startLevel0);

  // Level 1 click listener (only if unlocked)
  if (level1Unlocked) {
    document.getElementById("level-1-card").addEventListener("click", startGame);
  }

  // Level 2 click listener (only if unlocked)
  const level2Unlocked = stateManager.isLevelUnlocked(2);
  if (level2Unlocked) {
    // Update the level 2 card to be unlocked
    const level2Card = document.querySelector('.level-grid > .level-card:nth-child(3)');
    if (level2Card) {
      level2Card.classList.remove('locked');
      level2Card.innerHTML = `
        <h3 class="level-title">LEVEL 2</h3>
        <p class="level-name">The Arctic Circle</p>
      `;
      level2Card.id = 'level-2-card';
      level2Card.addEventListener("click", startLevel2);
    }
  }

  // Back button listener
  document.getElementById("back-btn").addEventListener("click", showMainMenu);
}

// Function to show instructions page
function showInstructions(fromPauseMenu = false) {
  // Update state (will be overridden if coming from pause)
  if (!fromPauseMenu) {
    stateManager.enterInstructions();
  }

  // Release pointer lock if active
  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  landingPage.innerHTML = `
    <div class="menu-container instructions-container">
      <h1 class="menu-subtitle">INSTRUCTIONS</h1>

      <div class="instructions-section">
        <h2 class="instructions-heading">CONTROLS</h2>
        <div class="controls-grid">
          <div class="control-item">
            <span class="control-key">WASD</span>
            <span class="control-desc">Movement</span>
          </div>
          <div class="control-item">
            <span class="control-key">MOUSE</span>
            <span class="control-desc">Look around</span>
          </div>
          <div class="control-item">
            <span class="control-key">E</span>
            <span class="control-desc">Interact</span>
          </div>
          <div class="control-item">
            <span class="control-key">C</span>
            <span class="control-desc">Switch camera view</span>
          </div>
          <div class="control-item">
            <span class="control-key">ESC</span>
            <span class="control-desc">Pause menu</span>
          </div>
        </div>
      </div>

      <div class="instructions-section">
        <h2 class="instructions-heading">OBJECTIVE</h2>
        <p class="objective-text">
          Explore the facility, investigate the scene,<br>
          and discover what happened to the crew.
        </p>
      </div>

      <button id="back-btn" class="menu-button back-button">BACK</button>
    </div>
  `;

  // Back button listener - return to pause menu or main menu depending on context
  document.getElementById("back-btn").addEventListener("click", () => {
    if (fromPauseMenu) {
      landingPage.remove();
      // Return to pause menu (not directly to game)
      stateManager.returnToPauseMenu();
    } else {
      showMainMenu();
    }
  });
}

// Backstory slides
const backstorySlides = [
  "Communications from Arctic Research Station Epsilon-7 ceased 48 hours ago.",
  "You have been dispatched as a safety inspector to investigate the facility.",
  "Your mission: discover what happened to the crew.",
];

// Function to start Level 0 (Briefing)
function startLevel0() {
  // Update state
  stateManager.startBriefing();

  // Release pointer lock if active
  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  let currentSlide = 0;
  let isTyping = false;

  function showSlide(index) {
    if (index >= backstorySlides.length) {
      // All slides complete - unlock Level 1 and return to level select
      stateManager.unlockLevel(1);
      showLevelSelect();
      return;
    }

    landingPage.innerHTML = `
      <div class="briefing-container">
        <div class="briefing-slide">
          <p class="briefing-text" id="briefing-text"></p>
        </div>
        <div class="briefing-hint">Click to continue...</div>
      </div>
    `;

    const textElement = document.getElementById("briefing-text");
    const text = backstorySlides[index];
    let charIndex = 0;
    isTyping = true;

    // Typewriter effect
    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        textElement.textContent += text[charIndex];
        charIndex++;
      } else {
        clearInterval(typeInterval);
        isTyping = false;
      }
    }, 50); // 50ms per character

    // Click to continue
    landingPage.addEventListener("click", function continueHandler() {
      if (isTyping) {
        // Skip typing animation
        clearInterval(typeInterval);
        textElement.textContent = text;
        isTyping = false;
      } else {
        // Go to next slide
        landingPage.removeEventListener("click", continueHandler);
        currentSlide++;
        showSlide(currentSlide);
      }
    });
  }

  showSlide(currentSlide);
}

// Function to show blank pages
function showBlankPage(title) {
  landingPage.innerHTML = `
    <div class="blank-page">
      <h1>${title}</h1>
    </div>
  `;
}

// Game initialization function (Level 1)
async function startGame() {
  // Remove landing page
  landingPage.remove();

  // Cleanup previous level manager if exists
  if (levelManager) {
    levelManager.cleanup();
  }

  // Create new level manager with managers
  levelManager = new LevelManager(stateManager, inputManager);

  try {
    // Start Level 1 with callback for when cutscene ends
    await levelManager.startLevel1(() => {
      // Callback for when cutscene ends - unlock Level 2 and return to mission select
      stateManager.unlockLevel(2);
      console.log("Level 2 unlocked!");
      document.body.appendChild(landingPage);
      showLevelSelect();
    });
  } catch (error) {
    console.error("Failed to start level:", error);
    // On error, return to main menu
    document.body.appendChild(landingPage);
    showMainMenu();
  }
}

// Level 2 initialization function
async function startLevel2() {
  // Remove landing page
  landingPage.remove();

  // Cleanup previous level manager if exists
  if (levelManager) {
    levelManager.cleanup();
  }

  // Create new level manager with managers
  levelManager = new LevelManager(stateManager, inputManager);

  try {
    // Start Level 2 with callback to return to mission select after cutscene
    await levelManager.startLevel2(() => {
      // Return to mission select after cutscene
      document.body.appendChild(landingPage);
      showLevelSelect();
    });
  } catch (error) {
    console.error("Failed to start level 2:", error);
    // On error, return to main menu
    document.body.appendChild(landingPage);
    showMainMenu();
  }
}
