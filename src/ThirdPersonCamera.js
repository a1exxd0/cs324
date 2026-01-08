import * as THREE from "three";

export class ThirdPersonCamera {
  constructor(camera, offset = new THREE.Vector3(0, 0.2, -1)) {
    this.camera = camera;
    this.offset = offset;
    this.target = null;
  }

  setTarget(character) {
    this.target = character;
  }

  update() {
    if (!this.target || !this.target.model) return;

    const headPos = this.target.getHeadPosition();
    const rotatedOffset = this.offset.clone();
    rotatedOffset.applyQuaternion(this.target.model.quaternion);

    const targetPos = headPos.clone().add(rotatedOffset);
    this.camera.position.copy(targetPos);
    this.camera.lookAt(headPos);
  }
}
