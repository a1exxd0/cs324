import * as THREE from "three";

export class ThirdPersonCamera {
  constructor(camera, offset = new THREE.Vector3(0, 0.2, -2)) {
    this.camera = camera;
    this.offset = offset;
    this.target = null;
  }

  setTarget(character) {
    this.target = character;
  }

  update() {
    if (!this.target?.container) return;

    const headPos = this.target.getHeadPosition();
    const rotatedOffset = this.offset
      .clone()
      .applyQuaternion(this.target.container.quaternion);

    this.camera.position.copy(headPos.clone().add(rotatedOffset));
    this.camera.lookAt(headPos);
  }
}
