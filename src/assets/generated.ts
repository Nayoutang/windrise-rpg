import Phaser from "phaser";
import { TEXTURES } from "./manifest";

type Paint = (graphics: Phaser.GameObjects.Graphics) => void;

function texture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  paint: Paint,
): void {
  if (scene.textures.exists(key)) {
    return;
  }
  const graphics = scene.add.graphics();
  paint(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

function character(
  scene: Phaser.Scene,
  key: string,
  colors: { outline: number; coat: number; accent: number; hair: number },
): void {
  texture(scene, key, 32, 46, (g) => {
    g.fillStyle(colors.outline).fillRect(9, 2, 14, 38);
    g.fillStyle(colors.hair).fillRect(11, 4, 10, 10);
    g.fillStyle(0xf6dfd1).fillRect(12, 10, 8, 8);
    g.fillStyle(colors.coat).fillRect(11, 18, 10, 17);
    g.fillStyle(colors.accent).fillRect(8, 21, 3, 12).fillRect(21, 21, 3, 12);
    g.fillStyle(colors.outline).fillRect(11, 35, 4, 7).fillRect(17, 35, 4, 7);
    g.fillStyle(0xffffff).fillRect(14, 13, 2, 2).fillRect(18, 13, 2, 2);
  });
}

function slime(scene: Phaser.Scene, key: string, color: number, accent: number): void {
  texture(scene, key, 34, 28, (g) => {
    g.fillStyle(0x25314d).fillRect(4, 8, 26, 16);
    g.fillStyle(color).fillRect(6, 6, 22, 16);
    g.fillStyle(accent).fillRect(9, 10, 4, 4).fillRect(21, 10, 4, 4);
    g.fillStyle(0xffffff).fillRect(10, 10, 2, 2).fillRect(22, 10, 2, 2);
    g.fillStyle(color).fillRect(9, 4, 16, 4);
  });
}

function hilichurl(scene: Phaser.Scene, key: string, boss = false): void {
  const scale = boss ? 2 : 1;
  texture(scene, key, 34 * scale, 44 * scale, (g) => {
    const rect = (x: number, y: number, w: number, h: number, color: number) =>
      g.fillStyle(color).fillRect(x * scale, y * scale, w * scale, h * scale);
    rect(8, 4, 18, 34, 0x382923);
    rect(10, 7, 14, 12, 0xd9c39b);
    rect(12, 10, 3, 3, 0x2f4056);
    rect(19, 10, 3, 3, 0x2f4056);
    rect(11, 20, 12, 16, boss ? 0x8d5140 : 0x70564b);
    rect(4, 19, 6, 16, boss ? 0x8d5140 : 0x70564b);
    rect(24, 19, 6, 16, boss ? 0x8d5140 : 0x70564b);
    rect(10, 36, 5, 7, 0x382923);
    rect(19, 36, 5, 7, 0x382923);
    if (boss) {
      rect(1, 2, 5, 26, 0x594233);
      rect(26, 2, 5, 26, 0x594233);
    }
  });
}

export function createProceduralTextures(scene: Phaser.Scene): void {
  texture(scene, TEXTURES.grass, 32, 32, (g) => {
    g.fillStyle(0x63a85b).fillRect(0, 0, 32, 32);
    g.fillStyle(0x559c52).fillRect(4, 6, 3, 2).fillRect(21, 14, 4, 2).fillRect(12, 26, 3, 2);
  });
  texture(scene, TEXTURES.path, 32, 32, (g) => {
    g.fillStyle(0xc9ad79).fillRect(0, 0, 32, 32);
    g.fillStyle(0xb49668).fillRect(6, 5, 7, 3).fillRect(19, 19, 8, 4).fillRect(2, 27, 5, 2);
  });
  texture(scene, TEXTURES.water, 32, 32, (g) => {
    g.fillStyle(0x4aa6b8).fillRect(0, 0, 32, 32);
    g.fillStyle(0x7ad2d8).fillRect(3, 6, 14, 3).fillRect(16, 21, 13, 3);
  });
  texture(scene, TEXTURES.ruin, 40, 84, (g) => {
    g.fillStyle(0x4e5d58).fillRect(2, 2, 36, 80);
    g.fillStyle(0xa6a884).fillRect(6, 4, 28, 76);
    g.fillStyle(0x7d846f).fillRect(9, 12, 22, 5).fillRect(9, 56, 22, 6);
  });
  texture(scene, TEXTURES.tent, 84, 58, (g) => {
    g.fillStyle(0x57402e).fillTriangle(4, 54, 42, 2, 80, 54);
    g.fillStyle(0xd3a66f).fillTriangle(10, 52, 42, 8, 74, 52);
    g.fillStyle(0x8b5d42).fillTriangle(36, 52, 42, 8, 48, 52);
  });
  texture(scene, TEXTURES.crate, 34, 34, (g) => {
    g.fillStyle(0x69472e).fillRect(1, 1, 32, 32);
    g.fillStyle(0xa37343).fillRect(4, 4, 26, 26);
    g.fillStyle(0x69472e).fillRect(14, 4, 5, 26).fillRect(4, 14, 26, 5);
  });
  texture(scene, TEXTURES.bush, 50, 32, (g) => {
    g.fillStyle(0x2f6c46).fillRect(4, 11, 42, 18);
    g.fillStyle(0x478b51).fillRect(10, 4, 17, 21).fillRect(24, 7, 17, 18);
  });
  texture(scene, TEXTURES.flower, 16, 24, (g) => {
    g.fillStyle(0x47783f).fillRect(7, 9, 3, 15);
    g.fillStyle(0xf4e4a3).fillRect(3, 2, 11, 11);
    g.fillStyle(0x77c4d2).fillRect(6, 5, 5, 5);
  });
  texture(scene, TEXTURES.tree, 180, 220, (g) => {
    g.fillStyle(0x69472e).fillRect(78, 92, 35, 126);
    g.fillStyle(0x3b794c).fillRect(22, 28, 142, 106);
    g.fillStyle(0x4d9657).fillRect(42, 4, 98, 98).fillRect(3, 59, 82, 68).fillRect(105, 51, 72, 75);
  });
  texture(scene, TEXTURES.gate, 44, 92, (g) => {
    g.fillStyle(0x545f60).fillRect(2, 2, 40, 90);
    g.fillStyle(0x9aa48e).fillRect(7, 7, 30, 78);
    g.fillStyle(0x6a7472).fillRect(12, 18, 20, 58);
  });
  character(scene, TEXTURES.ayaka, {
    outline: 0x38516d,
    coat: 0xd6edf4,
    accent: 0x78a7d3,
    hair: 0xc4d3e4,
  });
  character(scene, TEXTURES.furina, {
    outline: 0x243659,
    coat: 0x315f91,
    accent: 0xecf5f6,
    hair: 0xe7f2ef,
  });
  character(scene, TEXTURES.scout, {
    outline: 0x4a3928,
    coat: 0x78a459,
    accent: 0xe4d39b,
    hair: 0x805f3d,
  });
  slime(scene, TEXTURES.hydroSlime, 0x62bdd5, 0xd4f6f5);
  slime(scene, TEXTURES.cryoSlime, 0x9ed9e4, 0xf3ffff);
  hilichurl(scene, TEXTURES.hilichurlFighter);
  hilichurl(scene, TEXTURES.hilichurlShooter);
  hilichurl(scene, TEXTURES.mutatedMitachurl, true);
  texture(scene, TEXTURES.cryoFx, 52, 20, (g) => {
    g.fillStyle(0xd9fbff).fillTriangle(0, 10, 52, 1, 52, 19);
    g.fillStyle(0x8ed7ed).fillTriangle(2, 10, 37, 6, 37, 14);
  });
  texture(scene, TEXTURES.hydroFx, 26, 18, (g) => {
    g.fillStyle(0x87e7ef).fillEllipse(13, 9, 24, 16);
    g.fillStyle(0xe1ffff).fillEllipse(17, 6, 7, 5);
  });
  texture(scene, TEXTURES.freezeFx, 38, 44, (g) => {
    g.fillStyle(0xb7eff7, 0.8).fillTriangle(19, 1, 3, 39, 35, 39);
    g.lineStyle(3, 0xf5ffff, 0.9).strokeTriangle(19, 1, 3, 39, 35, 39);
  });
}
