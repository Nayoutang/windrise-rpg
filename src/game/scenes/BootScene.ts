import Phaser from "phaser";
import { createProceduralTextures } from "../../assets/generated";
import { RUNTIME_ART } from "../../assets/manifest";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload(): void {
    for (const [key, path] of Object.entries(RUNTIME_ART)) {
      this.load.image(key, path);
    }
  }

  create(): void {
    createProceduralTextures(this);
    this.scene.start("world");
  }
}
