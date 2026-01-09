import * as THREE from "three";

/**
 * Create an invisible collider box
 * @param {number} width - Collider width
 * @param {number} height - Collider height
 * @param {number} depth - Collider depth
 * @param {Object} position - Position {x, y, z}
 * @param {boolean} visible - Whether to make the collider visible (for debugging)
 * @returns {THREE.Mesh}
 */
export function createCollider(width, height, depth, position, visible = false) {
  const collider = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshBasicMaterial({ visible: visible }),
  );
  collider.position.set(position.x, position.y, position.z);
  return collider;
}
