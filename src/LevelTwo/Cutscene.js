/**
 * Cutscene system for Level 2
 */

/**
 * Show a cutscene with text that appears character by character
 * @param {Array<string>} slides - Array of text slides to show
 * @param {Function} onComplete - Callback when cutscene completes
 * @param {Object} renderer - Three.js renderer to hide
 * @param {Object} hud - HUD to hide
 */
export function showCutscene(slides, onComplete, renderer = null, hud = null) {
  // Hide renderer canvas and HUD
  if (renderer && renderer.domElement) {
    renderer.domElement.style.display = "none";
  }
  if (hud) {
    hud.hide();
  }

  // Create cutscene container
  const cutsceneContainer = document.createElement("div");
  cutsceneContainer.id = "cutscene-container";
  cutsceneContainer.className = "briefing-container";
  cutsceneContainer.style.backgroundColor = "#1a1a1a"; // Solid background

  let currentSlide = 0;
  let isTyping = false;

  function showSlide(index) {
    if (index >= slides.length) {
      // All slides complete - cleanup and callback
      cutsceneContainer.remove();
      if (onComplete) {
        onComplete();
      }
      return;
    }

    cutsceneContainer.innerHTML = `
      <div class="briefing-slide">
        <p class="briefing-text" id="cutscene-text"></p>
      </div>
      <div class="briefing-hint">Click to continue...</div>
    `;

    document.body.appendChild(cutsceneContainer);

    const textElement = document.getElementById("cutscene-text");
    const text = slides[index];
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
    const clickHandler = function() {
      if (isTyping) {
        // Skip typing animation
        clearInterval(typeInterval);
        textElement.textContent = text;
        isTyping = false;
      } else {
        // Go to next slide
        cutsceneContainer.removeEventListener("click", clickHandler);
        currentSlide++;
        showSlide(currentSlide);
      }
    };

    cutsceneContainer.addEventListener("click", clickHandler);
  }

  showSlide(currentSlide);
}
