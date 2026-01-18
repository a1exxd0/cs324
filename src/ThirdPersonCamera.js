import * as THREE from "three";

export class ThirdPersonCamera {
  constructor(
    camera,
    inputManager,
    offset = new THREE.Vector3(0, 0.2, -2),
    centeringOffset = new THREE.Vector3(-0.3, 0, 0),
  ) {
    this.camera = camera;
    this.inputManager = inputManager;
    this.offset = offset;
    this.centeringOffset = centeringOffset;
    this.target = null;
    this.mouseSensitivity = 0.002;
    this.collidables = [];
    this.raycaster = new THREE.Raycaster();
    this.collisionBuffer = 0.2; // Keep camera this distance from obstacles
    this.setupMouseControl();
  }

  setTarget(character) {
    this.target = character;
  }

  setCollidables(collidables) {
    this.collidables = collidables;
  }

  setupMouseControl() {
    // Request pointer lock on click
    this.inputManager.onGameInput('click', () => {
      this.inputManager.requestPointerLock();
    });

    // Handle mouse movement
    this.inputManager.onGameInput('mousemove', (e) => {
      if (this.target?.container) {
        // Rotate character based on horizontal mouse movement (left/right)
        const rotationDelta = -e.movementX * this.mouseSensitivity;
        this.target.container.rotateY(rotationDelta);
      }
    });
  }

  /**
   * Clean up - clear references
   */
  cleanup() {
    // InputManager handles event listener cleanup
    this.target = null;
  }

  update() {
    if (!this.target?.container) return;

    const headPos = this.target.getHeadPosition();
    const rotatedOffset = this.offset
      .clone()
      .add(this.centeringOffset)
      .applyQuaternion(this.target.container.quaternion);

    // Calculate ideal camera position
    const idealCameraPos = headPos.clone().add(rotatedOffset);

    // Check for obstacles between head and ideal camera position
    const direction = idealCameraPos.clone().sub(headPos);
    const distance = direction.length();
    direction.normalize();

    this.raycaster.set(headPos, direction);
    this.raycaster.far = distance;

    const intersects = this.raycaster.intersectObjects(
      this.collidables,
      true, // Check children
    );

    // Position camera at intersection point or ideal position
    let finalCameraPos;
    if (intersects.length > 0 && intersects[0].distance < distance) {
      // Obstacle detected - move camera closer to player
      const adjustedDistance = Math.max(
        0.1,
        intersects[0].distance - this.collisionBuffer,
      );
      finalCameraPos = headPos.clone().add(direction.multiplyScalar(adjustedDistance));
    } else {
      // No obstacles - use ideal position
      finalCameraPos = idealCameraPos;
    }

    // Camera looks at point offset to the right of head
    const lookAtTarget = headPos
      .clone()
      .add(
        this.centeringOffset
          .clone()
          .applyQuaternion(this.target.container.quaternion),
      );

    this.camera.position.copy(finalCameraPos);
    this.camera.lookAt(lookAtTarget);
  }
}
