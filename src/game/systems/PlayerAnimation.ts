import type { CharacterId } from "./types";

export const PLAYER_DIRECTIONS = ["down", "left", "right", "up"] as const;

export type PlayerDirection = (typeof PLAYER_DIRECTIONS)[number];
export type PlayerAction = "idle" | "walk" | "attack";

export interface PlayerAnimationFrame {
  action: PlayerAction;
  direction: PlayerDirection;
  frame: number;
  moving: boolean;
  texture: string;
}

export function playerTexture(character: CharacterId, direction: PlayerDirection, frame: number): string {
  return `${character}-${direction}-${frame}`;
}

export function playerAttackTexture(character: CharacterId, direction: PlayerDirection, frame: number): string {
  return `${character}-attack-${direction}-${frame}`;
}

const WALK_FRAMES = [0, 1, 0, 2];
const WALK_FRAME_DURATION = 110;
const ATTACK_FRAME_DURATION = 100;
const ATTACK_DURATION = ATTACK_FRAME_DURATION * 3;

export class PlayerAnimation {
  private direction: PlayerDirection = "down";
  private moving = false;
  private walkStartedAt = 0;
  private attackStartedAt = Number.NEGATIVE_INFINITY;
  private attackUntil = Number.NEGATIVE_INFINITY;

  resolve(character: CharacterId, velocityX: number, velocityY: number, time: number): PlayerAnimationFrame {
    const moving = velocityX !== 0 || velocityY !== 0;
    const attacking = time < this.attackUntil;
    if (moving && !attacking) {
      const nextDirection =
        Math.abs(velocityX) > Math.abs(velocityY)
          ? velocityX < 0
            ? "left"
            : "right"
          : velocityY < 0
            ? "up"
            : "down";
      if (!this.moving || nextDirection !== this.direction) {
        this.walkStartedAt = time;
      }
      this.direction = nextDirection;
    }
    this.moving = moving;
    if (attacking) {
      const frame = Math.min(2, Math.floor((time - this.attackStartedAt) / ATTACK_FRAME_DURATION));
      return {
        action: "attack",
        direction: this.direction,
        frame,
        moving: false,
        texture: playerAttackTexture(character, this.direction, frame),
      };
    }
    const frame = moving ? WALK_FRAMES[Math.floor((time - this.walkStartedAt) / WALK_FRAME_DURATION) % WALK_FRAMES.length] : 0;
    return {
      action: moving ? "walk" : "idle",
      direction: this.direction,
      frame,
      moving,
      texture: playerTexture(character, this.direction, frame),
    };
  }

  attack(time: number): void {
    this.attackStartedAt = time;
    this.attackUntil = time + ATTACK_DURATION;
  }

  reset(): void {
    this.direction = "down";
    this.moving = false;
    this.walkStartedAt = 0;
    this.attackStartedAt = Number.NEGATIVE_INFINITY;
    this.attackUntil = Number.NEGATIVE_INFINITY;
  }
}
