import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Character {
  constructor() {
    this.model = null;
    this.mixer = null;
    this.head = null;
    this.animations = {};
    this.currentAction = null;
  }

  async load(modelPath) {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        modelPath,
        (gltf) => {
          this.model = gltf.scene;
          this.model.position.set(0, 0, 0);

          if (gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);

            gltf.animations.forEach((clip) => {
              this.animations[clip.name] = clip;
              console.log("Animation available:", clip.name);
            });

            if (gltf.animations[0]) {
              this.playAnimation(gltf.animations[0].name);
            }
          }

          this.model.traverse((child) => {
            if (child.isBone && child.name.toLowerCase().includes("head")) {
              this.head = child;
            }
          });

          resolve(this.model);
        },
        undefined,
        (error) => reject(error),
      );
    });
  }

  async loadAnimation(animationPath, animationName) {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        animationPath,
        (gltf) => {
          if (gltf.animations.length > 0) {
            this.animations[animationName] = gltf.animations[0];
            console.log("Loaded animation:", animationName);
          }
          resolve();
        },
        undefined,
        (error) => reject(error),
      );
    });
  }

  playAnimation(name) {
    if (!this.mixer || !this.animations[name]) {
      console.warn("Animation not found:", name);
      return;
    }

    const nextAction = this.mixer.clipAction(this.animations[name]);
    if (this.currentAction && this.currentAction !== nextAction) {
      this.currentAction.fadeOut(0.2);
      nextAction.reset().fadeIn(0.2).play();
    } else if (!this.currentAction) {
      nextAction.play();
    }
    this.currentAction = nextAction;
  }

  getHeadPosition() {
    if (this.head) {
      const worldPos = new THREE.Vector3();
      this.head.getWorldPosition(worldPos);
      return worldPos;
    }

    return this.model.position.clone().add(new THREE.Vector3(0, 1.7, 0));
  }

  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  getModel() {
    return this.model;
  }
}
