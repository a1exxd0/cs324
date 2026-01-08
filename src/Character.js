import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Character {
  constructor() {
    this.container = new THREE.Object3D(); // Root container for movement
    this.model = null; // The actual mesh (affected by animations)
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

          // Add model to container to prevent animation root motion from affecting position
          this.container.add(this.model);

          if (gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);
            gltf.animations.forEach((clip) => {
              this.animations[clip.name] = clip;
            });
            this.playAnimation(gltf.animations[0].name);
          }

          this.model.traverse((child) => {
            if (child.isBone && child.name.toLowerCase().includes("head")) {
              this.head = child;
            }
          });

          resolve(this.container);
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
            const clip = gltf.animations[0];

            // Remove Hips position track to prevent root motion conflicts
            const tracks = clip.tracks.filter(
              (track) => !track.name.toLowerCase().includes("hips.position")
            );

            this.animations[animationName] = new THREE.AnimationClip(
              animationName,
              clip.duration,
              tracks
            );
          }
          resolve();
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  playAnimation(name) {
    if (!this.mixer || !this.animations[name]) return;

    const nextAction = this.mixer.clipAction(this.animations[name]);

    if (this.currentAction !== nextAction) {
      this.currentAction?.fadeOut(0.2);
      nextAction.reset().fadeIn(0.2).play();
      this.currentAction = nextAction;
    }
  }

  getHeadPosition() {
    if (this.head) {
      return this.head.getWorldPosition(new THREE.Vector3());
    }
    return this.container.position.clone().add(new THREE.Vector3(0, 1.7, 0));
  }

  update(deltaTime) {
    this.mixer?.update(deltaTime);
  }

  getModel() {
    return this.container;
  }
}
