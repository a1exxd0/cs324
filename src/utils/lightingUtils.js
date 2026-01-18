/**
 * Apply flickering effect to a light source
 * @param {THREE.Light} light - The light to flicker
 * @param {number} time - Current elapsed time
 * @param {Object} options - Flicker parameters
 * @param {number} options.base - Base intensity
 * @param {number} options.variance - Intensity variance
 * @param {number} options.speed - Flicker speed multiplier
 * @param {number} options.dropoutChance - Probability of complete dropout per frame
 */
export function flickerLight(
  light,
  time,
  { base = 8, variance = 3, speed = 12, dropoutChance = 0.002 } = {},
) {
  if (!light) return;

  // Occasional hard flicker-off
  if (Math.random() < dropoutChance) {
    light.intensity = 0;
    return;
  }

  // Noisy sinusoidal flicker
  light.intensity = base + Math.sin(time * speed + Math.random()) * variance;
}
