import { describe, expect, it } from "vitest";
import { CombatSystem } from "../src/game/systems/CombatSystem";

describe("CombatSystem", () => {
  it("freezes a normal enemy after Hydro and Cryo application", () => {
    const combat = new CombatSystem();
    const enemy = combat.createEnemy("hydro-slime");

    combat.hit(enemy, { damage: 4, element: "hydro" }, 0);
    combat.hit(enemy, { damage: 4, element: "cryo" }, 100);

    expect(enemy.status.frozenUntil).toBeGreaterThan(100);
    expect(enemy.status.stagger).toBe(0);
  });

  it("slows and staggers a boss instead of fully freezing it", () => {
    const combat = new CombatSystem();
    const boss = combat.createEnemy("mutated-mitachurl");

    combat.hit(boss, { damage: 4, element: "hydro" }, 0);
    combat.hit(boss, { damage: 4, element: "cryo" }, 100);

    expect(boss.status.frozenUntil).toBe(0);
    expect(boss.status.slowedUntil).toBeGreaterThan(100);
    expect(boss.status.stagger).toBeGreaterThan(0);
  });

  it("expires elemental attachments after their duration", () => {
    const combat = new CombatSystem();
    const enemy = combat.createEnemy("hilichurl-fighter");

    combat.hit(enemy, { damage: 4, element: "hydro" }, 0);
    combat.tickEnemy(enemy, 5000);

    expect(enemy.status.hydroUntil).toBe(0);
  });
});
