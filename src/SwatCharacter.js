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
    };

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
    ]);

    console.log("SWAT character loaded with all animations");
    return this.model;
  }

  setupInputHandlers() {
    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (key in this.keys) {
        this.keys[key] = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      const key = e.key.toLowerCase();
      if (key in this.keys) {
        this.keys[key] = false;
      }
    });
  }

  update(deltaTime) {
    super.update(deltaTime);

    if (!this.model) return;

    const moveDirection = new THREE.Vector3();
    let targetAnimation = "idle";

    if (this.keys.w) {
      moveDirection.z -= 1;
      targetAnimation = "walkForward";
    } else if (this.keys.s) {
      moveDirection.z += 1;
      targetAnimation = "walkBackward";
    } else if (this.keys.a) {
      moveDirection.x -= 1;
      targetAnimation = "strafeLeft";
    } else if (this.keys.d) {
      moveDirection.x += 1;
      targetAnimation = "strafeRight";
    }

    // Only switch animation if it's different from current
    if (
      this.currentAction &&
      this.currentAction.getClip().name !== targetAnimation
    ) {
      this.playAnimation(targetAnimation);
    } else if (!this.currentAction) {
      this.playAnimation(targetAnimation);
    }

    if (targetAnimation !== "idle") {
      moveDirection.normalize();
      moveDirection.multiplyScalar(this.moveSpeed * deltaTime);
      this.model.position.add(moveDirection);
    }
  }
}
