import { Character } from "./Character.js";
import * as THREE from "three";

export class SwatCharacter extends Character {
  constructor() {
    super();
    this.moveSpeed = 2.0;
    this.keys = { w: false, a: false, s: false, d: false, " ": false };

    // Jump physics
    this.jumpForce = 5.0;
    this.gravity = -15.0;
    this.verticalVelocity = 0;
    this.groundHeight = 1.6;
    this.isJumping = false;
    this.jumpCooldown = 0;
    this.jumpCooldownDuration = 0.5;

    this.setupInputHandlers();
  }

  async initialize() {
    await this.load("/models/characters/swat_man_idle.glb");
    await Promise.all([
      this.loadAnimation(
        "/models/characters/swat_man_walk_forward.glb",
        "walkForward",
      ),
      this.loadAnimation(
        "/models/characters/swat_man_walk_backward.glb",
        "walkBackward",
      ),
      this.loadAnimation(
        "/models/characters/swat_man_strafe_left.glb",
        "strafeLeft",
      ),
      this.loadAnimation(
        "/models/characters/swat_man_strafe_right.glb",
        "strafeRight",
      ),
      this.loadAnimation("models/characters/swat_man_jump.glb", "jump"),
    ]);
    return this.container;
  }

  setupInputHandlers() {
    const handleKey = (e, value) => {
      const key = e.key.toLowerCase();
      if (key in this.keys) this.keys[key] = value;
    };

    window.addEventListener("keydown", (e) => handleKey(e, true));
    window.addEventListener("keyup", (e) => handleKey(e, false));
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (!this.model) return;

    const moveDirection = new THREE.Vector3();
    let targetAnimation = "idle";

    if (this.jumpCooldown > 0) {
      this.jumpCooldown -= deltaTime;
    }

    if (this.keys[" "] && !this.isJumping && this.jumpCooldown <= 0) {
      this.verticalVelocity = this.jumpForce;
      this.isJumping = true;
    }

    this.verticalVelocity += this.gravity * deltaTime;
    this.container.position.y += this.verticalVelocity * deltaTime;

    if (this.container.position.y <= this.groundHeight) {
      this.container.position.y = this.groundHeight;
      this.verticalVelocity = 0;

      if (this.isJumping) {
        this.jumpCooldown = this.jumpCooldownDuration;
      }
      this.isJumping = false;
    }

    if (this.isJumping) {
      targetAnimation = "jump";
    } else if (this.keys.w) {
      moveDirection.z = 1;
      targetAnimation = "walkForward";
    } else if (this.keys.s) {
      moveDirection.z = -1;
      targetAnimation = "walkBackward";
    } else if (this.keys.a) {
      moveDirection.x = 1;
      targetAnimation = "strafeLeft";
    } else if (this.keys.d) {
      moveDirection.x = -1;
      targetAnimation = "strafeRight";
    }

    // Update animation if changed
    const currentClipName = this.currentAction?.getClip().name;
    if (!this.currentAction || currentClipName !== targetAnimation) {
      this.playAnimation(targetAnimation);
    }

    // Apply horizontal movement
    if (moveDirection.length() > 0) {
      moveDirection
        .normalize()
        .multiplyScalar(this.moveSpeed * deltaTime)
        .applyQuaternion(this.container.quaternion);
      this.container.position.add(moveDirection);
    }
  }
}
