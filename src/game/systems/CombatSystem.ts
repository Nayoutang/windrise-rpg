import type { ElementType, EnemyType } from "./types";

const ATTACHMENT_DURATION_MS = 3600;
const FREEZE_DURATION_MS = 1800;
const BOSS_SLOW_DURATION_MS = 1400;

export interface EnemyStatus {
  hydroUntil: number;
  cryoUntil: number;
  frozenUntil: number;
  slowedUntil: number;
  stagger: number;
}

export interface EnemyState {
  id: string;
  type: EnemyType;
  name: string;
  hp: number;
  maxHp: number;
  isBoss: boolean;
  defeated: boolean;
  status: EnemyStatus;
}

export interface Hit {
  damage: number;
  element: ElementType;
}

export interface HitResult {
  damage: number;
  defeated: boolean;
  reaction: "freeze" | null;
}

const ENEMY_STATS: Record<EnemyType, { name: string; hp: number; isBoss: boolean }> = {
  "hydro-slime": { name: "水史莱姆", hp: 24, isBoss: false },
  "cryo-slime": { name: "冰史莱姆", hp: 24, isBoss: false },
  "hilichurl-fighter": { name: "丘丘人战士", hp: 38, isBoss: false },
  "hilichurl-shooter": { name: "丘丘人射手", hp: 28, isBoss: false },
  "mutated-mitachurl": { name: "异常丘丘暴徒", hp: 250, isBoss: true },
};

export class CombatSystem {
  private nextEnemyId = 1;

  createEnemy(type: EnemyType): EnemyState {
    const stats = ENEMY_STATS[type];
    return {
      id: `enemy-${this.nextEnemyId++}`,
      type,
      name: stats.name,
      hp: stats.hp,
      maxHp: stats.hp,
      isBoss: stats.isBoss,
      defeated: false,
      status: {
        hydroUntil: 0,
        cryoUntil: 0,
        frozenUntil: 0,
        slowedUntil: 0,
        stagger: 0,
      },
    };
  }

  hit(enemy: EnemyState, hit: Hit, now: number): HitResult {
    if (enemy.defeated) {
      return { damage: 0, defeated: true, reaction: null };
    }

    enemy.hp = Math.max(0, enemy.hp - hit.damage);
    enemy.defeated = enemy.hp === 0;

    if (hit.element === "hydro") {
      enemy.status.hydroUntil = now + ATTACHMENT_DURATION_MS;
    }
    if (hit.element === "cryo") {
      enemy.status.cryoUntil = now + ATTACHMENT_DURATION_MS;
    }

    const reaction = this.applyFreezeIfReady(enemy, now);
    return { damage: hit.damage, defeated: enemy.defeated, reaction };
  }

  tickEnemy(enemy: EnemyState, now: number): void {
    if (enemy.status.hydroUntil <= now) {
      enemy.status.hydroUntil = 0;
    }
    if (enemy.status.cryoUntil <= now) {
      enemy.status.cryoUntil = 0;
    }
    if (enemy.status.frozenUntil <= now) {
      enemy.status.frozenUntil = 0;
    }
    if (enemy.status.slowedUntil <= now) {
      enemy.status.slowedUntil = 0;
    }
  }

  isImmobilized(enemy: EnemyState, now: number): boolean {
    return enemy.status.frozenUntil > now;
  }

  speedMultiplier(enemy: EnemyState, now: number): number {
    return enemy.status.slowedUntil > now ? 0.5 : 1;
  }

  private applyFreezeIfReady(enemy: EnemyState, now: number): "freeze" | null {
    if (enemy.status.hydroUntil <= now || enemy.status.cryoUntil <= now) {
      return null;
    }

    enemy.status.hydroUntil = 0;
    enemy.status.cryoUntil = 0;
    if (enemy.isBoss) {
      enemy.status.slowedUntil = now + BOSS_SLOW_DURATION_MS;
      enemy.status.stagger += 36;
    } else {
      enemy.status.frozenUntil = now + FREEZE_DURATION_MS;
    }
    return "freeze";
  }
}
