import Phaser from "phaser";
import { createConfig } from "./config";

export function createGame(parent: string): Phaser.Game {
  return new Phaser.Game(createConfig(parent));
}
