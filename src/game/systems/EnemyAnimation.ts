import type { EnemyType } from "./types";

export const ENEMY_ACTIONS = ["idle", "walk", "attack"] as const;

export type EnemyAction = (typeof ENEMY_ACTIONS)[number];

export interface EnemyAnimationFrame {
  action: EnemyAction;
  frame: number;
  texture: string;
}

export function enemyTexture(enemy: EnemyType, action: EnemyAction, frame: number): string {
  return `${enemy}-${action}-${frame}`;
}

const LOOP_FRAME_DURATION = 160;
const ATTACK_FRAME_DURATION = 140;
const ATTACK_DURATION = ATTACK_FRAME_DURATION * 3;

export class EnemyAnimation {
  private attackStartedAt = Number.NEGATIVE_INFINITY;
  private attackUntil = Number.NEGATIVE_INFINITY;

  constructor(private readonly enemy: EnemyType) {}

  resolve(velocityX: number, velocityY: number, time: number): EnemyAnimationFrame {
    if (time < this.attackUntil) {
      const frame = Math.min(2, Math.floor((time - this.attackStartedAt) / ATTACK_FRAME_DURATION));
      return {
        action: "attack",
        frame,
        texture: enemyTexture(this.enemy, "attack", frame),
      };
    }
    const action = velocityX !== 0 || velocityY !== 0 ? "walk" : "idle";
    const frame = Math.floor(time / LOOP_FRAME_DURATION) % 3;
    return {
      action,
      frame,
      texture: enemyTexture(this.enemy, action, frame),
    };
  }

  attack(time: number): void {
    this.attackStartedAt = time;
    this.attackUntil = time + ATTACK_DURATION;
  }
}
