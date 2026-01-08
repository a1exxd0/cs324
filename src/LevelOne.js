import * as THREE from "three";
import LevelData from "./LevelData.js";

/**
 * LevelOne - Surface Facility
 * Creates the first level geometry and returns level data
 */
class LevelOne {
  static build(scene) {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.8,
        metalness: 0.2,
      })
    );

    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    return new LevelData({
      playerStart: { x: 0, y: 1.6, z: 0 },
    });
  }
}

export default LevelOne;
