import { Character } from "./Character.js";
import * as THREE from "three";

export class SwatCharacter extends Character {
  constructor() {
    super();
    this.moveSpeed = 2.0;
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      " ": false,
      shift: false,
    };

    this.jumpForce = 5.0;
    this.gravity = -15.0;
    this.verticalVelocity = 0;
    this.isJumping = false;
    this.jumpCooldown = 0;
    this.jumpCooldownDuration = 0.5;
    this.isFrozen = false; // New flag for freezing character
    this.inCutscene = false; // Flag for cutscene mode (no player input)

    // Collision detection
    this.collidables = [];
    this.collisionDistance = 0.6; // Distance to check for obstacles
    this.raycaster = new THREE.Raycaster();
    this.groundCheckDistance = 10; // Max distance to check for ground

    this.setupInputHandlers();
  }

  /**
   * Freeze the character (prevent all movement)
   */
  freeze() {
    this.isFrozen = true;
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      " ": false,
      shift: false,
    };
    // Set to idle animation
    if (this.currentAction) {
      this.playAnimation("idle");
    }
  }

  /**
   * Unfreeze the character (allow movement again)
   */
  unfreeze() {
    this.isFrozen = false;
  }

  setCollidables(collidables) {
    this.collidables = collidables;
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
      this.loadAnimation("/models/characters/swat_man_running.glb", "run"),
    ]);
    return this.container;
  }

  setupInputHandlers() {
    const handleKey = (e, value) => {
      if (this.isFrozen || this.inCutscene) return; // Ignore input when frozen or in cutscene

      const key = e.key.toLowerCase();
      if (key === "shift") {
        this.keys.shift = value;
      } else if (key in this.keys) {
        this.keys[key] = value;
      }
    };

    window.addEventListener("keydown", (e) => handleKey(e, true));
    window.addEventListener("keyup", (e) => handleKey(e, false));
  }

  checkCollision(direction) {
    if (this.collidables.length === 0) return false;

    const normalizedDirection = direction.clone().normalize();

    // Cast multiple rays at different heights for better collision detection
    const heights = [0.1, 0.5, 1.0, 1.5]; // Feet, knees, waist, chest

    for (const height of heights) {
      const origin = this.container.position.clone();
      origin.y += height;

      this.raycaster.set(origin, normalizedDirection);
      const intersects = this.raycaster.intersectObjects(
        this.collidables,
        false,
      );

      // Check if any collision is within the collision distance
      if (
        intersects.length > 0 &&
        intersects[0].distance < this.collisionDistance
      ) {
        return true;
      }
    }

    return false;
  }

  findGroundBelow() {
    if (this.collidables.length === 0) return null;

    // Cast ray downward from slightly above character's feet (pivot point)
    // This prevents the ray from starting inside the floor geometry
    const origin = this.container.position.clone();
    origin.y += 0.1; // Start slightly above feet to avoid starting inside geometry
    const direction = new THREE.Vector3(0, -1, 0);

    this.raycaster.set(origin, direction);
    const intersects = this.raycaster.intersectObjects(this.collidables, false);

    // Return the closest ground below (if any within range)
    if (
      intersects.length > 0 &&
      intersects[0].distance < this.groundCheckDistance
    ) {
      return intersects[0];
    }
    return null;
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (!this.model) return;
    if (this.isFrozen || this.inCutscene) return; // Don't process movement when frozen or in cutscene

    const moveDirection = new THREE.Vector3();
    let targetAnimation = "idle";

    if (this.jumpCooldown > 0) {
      this.jumpCooldown -= deltaTime;
    }

    if (this.keys[" "] && !this.isJumping && this.jumpCooldown <= 0) {
      this.verticalVelocity = this.jumpForce;
      this.isJumping = true;
    }

    // Apply gravity and vertical movement
    this.verticalVelocity += this.gravity * deltaTime;
    const newY = this.container.position.y + this.verticalVelocity * deltaTime;

    // Check ground collision before moving
    const groundHit = this.findGroundBelow();

    if (groundHit) {
      const groundY = groundHit.point.y;

      // If falling and would go through ground, snap to ground
      // Add small epsilon (0.05) above ground to prevent phasing
      if (this.verticalVelocity <= 0 && newY <= groundY + 0.05) {
        this.container.position.y = groundY + 0.05;
        this.verticalVelocity = 0;

        if (this.isJumping) {
          this.jumpCooldown = this.jumpCooldownDuration;
        }
        this.isJumping = false;
      } else {
        // Safe to move
        this.container.position.y = newY;
      }
    } else {
      // No ground detected, apply movement
      this.container.position.y = newY;
    }

    // Determine horizontal movement direction (independent of jump state)
    let isRunning = false;
    if (this.keys.w && this.keys.shift) {
      moveDirection.z = 1;
      targetAnimation = "run";
      isRunning = true;
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

    // Jump animation overrides movement animation
    if (this.isJumping) {
      targetAnimation = "jump";
    }

    // Update animation if changed
    const currentClipName = this.currentAction?.getClip().name;
    if (!this.currentAction || currentClipName !== targetAnimation) {
      this.playAnimation(targetAnimation);
    }

    // Apply horizontal movement with collision detection and sliding
    if (moveDirection.length() > 0) {
      const normalizedDirection = moveDirection.clone().normalize();
      const worldDirection = normalizedDirection
        .clone()
        .applyQuaternion(this.container.quaternion);

      const currentSpeed = isRunning ? this.moveSpeed * 2 : this.moveSpeed;
      const movement = moveDirection
        .clone()
        .normalize()
        .multiplyScalar(currentSpeed * deltaTime)
        .applyQuaternion(this.container.quaternion);

      const oldPosition = this.container.position.clone();

      // Try full movement first
      if (!this.checkCollision(worldDirection)) {
        this.container.position.add(movement);

        // Check if we're still above ground after moving
        // Prevent walking off edges into void
        const groundCheck = this.findGroundBelow();
        if (!groundCheck || groundCheck.distance - 0.1 > 2.0) {
          // Too far from ground or no ground - undo movement
          this.container.position.copy(oldPosition);
        }
      } else {
        // Blocked - try sliding along X axis only
        const xMovement = new THREE.Vector3(movement.x, 0, 0);
        const xDirection = xMovement.clone().normalize();

        if (xMovement.length() > 0 && !this.checkCollision(xDirection)) {
          this.container.position.add(xMovement);
          const groundCheck = this.findGroundBelow();
          if (!groundCheck || groundCheck.distance - 0.1 > 2.0) {
            this.container.position.copy(oldPosition);
          }
        }

        // Try sliding along Z axis only (from original position)
        const oldPos2 = this.container.position.clone();
        this.container.position.copy(oldPosition);

        const zMovement = new THREE.Vector3(0, 0, movement.z);
        const zDirection = zMovement.clone().normalize();

        if (zMovement.length() > 0 && !this.checkCollision(zDirection)) {
          this.container.position.add(zMovement);
          const groundCheck = this.findGroundBelow();
          if (!groundCheck || groundCheck.distance - 0.1 > 2.0) {
            this.container.position.copy(oldPos2);
          }
        } else {
          // Restore X movement if Z failed
          this.container.position.copy(oldPos2);
        }
      }
    }
  }
}
