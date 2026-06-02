import {
  PLAYER_DIRECTIONS,
  playerAttackTexture,
  playerTexture,
} from "../game/systems/PlayerAnimation";
import { ENEMY_ACTIONS, enemyTexture } from "../game/systems/EnemyAnimation";
import type { CharacterId, EnemyType } from "../game/systems/types";

export const TEXTURES = {
  grass: "grass",
  path: "path",
  water: "water",
  ruin: "ruin",
  tent: "tent",
  crate: "crate",
  bush: "bush",
  flower: "flower",
  tree: "tree",
  gate: "gate",
  ayaka: "ayaka",
  furina: "furina",
  scout: "scout",
  hydroSlime: "hydro-slime",
  cryoSlime: "cryo-slime",
  hilichurlFighter: "hilichurl-fighter",
  hilichurlShooter: "hilichurl-shooter",
  mutatedMitachurl: "mutated-mitachurl",
  cryoFx: "cryo-fx",
  hydroFx: "hydro-fx",
  freezeFx: "freeze-fx",
  salonBubbleFx: "salon-bubble-fx",
  ayakaSkillFx: "ayaka-skill-fx",
  ayakaBurstFx: "ayaka-burst-fx",
  furinaSkillFx: "furina-skill-fx",
  furinaBurstFx: "furina-burst-fx",
} as const;

const PLAYER_CHARACTERS: CharacterId[] = ["ayaka", "furina"];
const ENEMIES: EnemyType[] = [
  "hydro-slime",
  "cryo-slime",
  "hilichurl-fighter",
  "hilichurl-shooter",
  "mutated-mitachurl",
];

function publicAsset(path: string): string {
  return `${import.meta.env.BASE_URL}assets/${path}`;
}

export const PLAYER_RUNTIME_ART = Object.fromEntries(
  PLAYER_CHARACTERS.flatMap((character) =>
    PLAYER_DIRECTIONS.flatMap((direction) =>
      [0, 1, 2].flatMap((frame) => {
        const movementKey = playerTexture(character, direction, frame);
        const attackKey = playerAttackTexture(character, direction, frame);
        return [
          [movementKey, publicAsset(`runtime/${movementKey}.png`)],
          [attackKey, publicAsset(`runtime/${attackKey}.png`)],
        ];
      }),
    ),
  ),
);

export const ENEMY_RUNTIME_ART = Object.fromEntries(
  ENEMIES.flatMap((enemy) =>
    ENEMY_ACTIONS.flatMap((action) =>
      [0, 1, 2].map((frame) => {
        const key = enemyTexture(enemy, action, frame);
        return [key, publicAsset(`runtime/${key}.png`)];
      }),
    ),
  ),
);

export const GENERATED_ART = {
  ayakaPortrait: publicAsset("runtime/ayaka.png"),
  furinaPortrait: publicAsset("runtime/furina.png"),
  enemySheet: publicAsset("generated/windrise-enemies.png"),
  environmentSheet: publicAsset("generated/windrise-environment.png"),
} as const;

export const RUNTIME_ART: Record<string, string> = {
  [TEXTURES.ayaka]: publicAsset("runtime/ayaka.png"),
  [TEXTURES.furina]: publicAsset("runtime/furina.png"),
  [TEXTURES.hydroSlime]: publicAsset("runtime/hydro-slime.png"),
  [TEXTURES.cryoSlime]: publicAsset("runtime/cryo-slime.png"),
  [TEXTURES.hilichurlFighter]: publicAsset("runtime/hilichurl-fighter.png"),
  [TEXTURES.hilichurlShooter]: publicAsset("runtime/hilichurl-shooter.png"),
  [TEXTURES.mutatedMitachurl]: publicAsset("runtime/mutated-mitachurl.png"),
  [TEXTURES.tree]: publicAsset("runtime/tree.png"),
  [TEXTURES.tent]: publicAsset("runtime/tent.png"),
  [TEXTURES.crate]: publicAsset("runtime/crate.png"),
  [TEXTURES.ruin]: publicAsset("runtime/ruin.png"),
  [TEXTURES.bush]: publicAsset("runtime/bush.png"),
  [TEXTURES.flower]: publicAsset("runtime/flower.png"),
  [TEXTURES.gate]: publicAsset("runtime/gate.png"),
  [TEXTURES.path]: publicAsset("runtime/path.png"),
  [TEXTURES.cryoFx]: publicAsset("runtime/cryo-fx.png"),
  [TEXTURES.hydroFx]: publicAsset("runtime/hydro-fx.png"),
  [TEXTURES.freezeFx]: publicAsset("runtime/freeze-fx.png"),
  [TEXTURES.salonBubbleFx]: publicAsset("runtime/salon-bubble-fx.png"),
  [TEXTURES.ayakaSkillFx]: publicAsset("runtime/ayaka-skill-fx.png"),
  [TEXTURES.ayakaBurstFx]: publicAsset("runtime/ayaka-burst-fx.png"),
  [TEXTURES.furinaSkillFx]: publicAsset("runtime/furina-skill-fx.png"),
  [TEXTURES.furinaBurstFx]: publicAsset("runtime/furina-burst-fx.png"),
  ...PLAYER_RUNTIME_ART,
  ...ENEMY_RUNTIME_ART,
};
