import type { CharacterId, ElementType, EnemyType } from "../systems/types";

export interface PlayerDefinition {
  id: CharacterId;
  texture: CharacterId;
  attackElement: ElementType;
  moveSpeed: number;
}

export const PLAYERS: Record<CharacterId, PlayerDefinition> = {
  ayaka: { id: "ayaka", texture: "ayaka", attackElement: "physical", moveSpeed: 190 },
  furina: { id: "furina", texture: "furina", attackElement: "hydro", moveSpeed: 180 },
};

export interface EnemySpawn {
  type: EnemyType;
  x: number;
  y: number;
  zone: "field" | "outpost" | "boss";
}

export const ENEMY_SPAWNS: EnemySpawn[] = [
  { type: "hydro-slime", x: 545, y: 520, zone: "field" },
  { type: "cryo-slime", x: 645, y: 610, zone: "field" },
  { type: "hilichurl-fighter", x: 1040, y: 340, zone: "outpost" },
  { type: "hilichurl-fighter", x: 1140, y: 405, zone: "outpost" },
  { type: "hilichurl-shooter", x: 1190, y: 300, zone: "outpost" },
  { type: "mutated-mitachurl", x: 1360, y: 790, zone: "boss" },
];
