import * as THREE from "three";

/**
 * Create a standard material with given properties
 * @param {number} color - Hex color value
 * @param {number} roughness - Material roughness (0-1)
 * @param {number} metalness - Material metalness (0-1)
 * @param {number|null} emissive - Optional emissive color
 * @param {number} emissiveIntensity - Emissive intensity
 * @returns {THREE.MeshStandardMaterial}
 */
export function createMaterial(
  color,
  roughness,
  metalness,
  emissive = null,
  emissiveIntensity = 0,
) {
  const materialProps = { color, roughness, metalness };
  if (emissive) {
    materialProps.emissive = new THREE.Color(emissive);
    materialProps.emissiveIntensity = emissiveIntensity;
  }
  return new THREE.MeshStandardMaterial(materialProps);
}
