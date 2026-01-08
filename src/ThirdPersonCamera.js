import * as THREE from "three";

export class ThirdPersonCamera {
  constructor(
    camera,
    offset = new THREE.Vector3(0, 0.2, -2),
    centeringOffset = new THREE.Vector3(-0.3, 0, 0),
  ) {
    this.camera = camera;
    this.offset = offset;
    this.centeringOffset = centeringOffset;
    this.target = null;
    this.mouseSensitivity = 0.002;
    this.setupMouseControl();
  }

  setTarget(character) {
    this.target = character;
  }

  setupMouseControl() {
    // Request pointer lock on click
    document.addEventListener("click", () => {
      document.body.requestPointerLock();
    });

    // Handle mouse movement
    document.addEventListener("mousemove", (e) => {
      if (
        document.pointerLockElement === document.body &&
        this.target?.container
      ) {
        // Rotate character based on horizontal mouse movement (left/right)
        const rotationDelta = -e.movementX * this.mouseSensitivity;
        this.target.container.rotateY(rotationDelta);
      }
    });
  }

  update() {
    if (!this.target?.container) return;

    const headPos = this.target.getHeadPosition();
    const rotatedOffset = this.offset
      .clone()
      .add(this.centeringOffset)
      .applyQuaternion(this.target.container.quaternion);

    // Camera looks at point offset to the right of head
    const lookAtTarget = headPos
      .clone()
      .add(
        this.centeringOffset
          .clone()
          .applyQuaternion(this.target.container.quaternion),
      );

    this.camera.position.copy(headPos.clone().add(rotatedOffset));
    this.camera.lookAt(lookAtTarget);
  }
}
