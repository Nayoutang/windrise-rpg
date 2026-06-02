import { describe, expect, it } from "vitest";
import { EnemyAnimation } from "../src/game/systems/EnemyAnimation";

describe("EnemyAnimation", () => {
  it("starts with an idle loop", () => {
    const animation = new EnemyAnimation("hilichurl-fighter");

    expect(animation.resolve(0, 0, 0)).toEqual({
      action: "idle",
      frame: 0,
      texture: "hilichurl-fighter-idle-0",
    });
    expect(animation.resolve(0, 0, 220).texture).toBe("hilichurl-fighter-idle-1");
  });

  it("uses a walk loop while moving", () => {
    const animation = new EnemyAnimation("hydro-slime");

    expect(animation.resolve(20, 0, 0).texture).toBe("hydro-slime-walk-0");
    expect(animation.resolve(20, 0, 160).texture).toBe("hydro-slime-walk-1");
    expect(animation.resolve(20, 0, 320).texture).toBe("hydro-slime-walk-2");
  });

  it("plays a three-frame attack before returning to idle", () => {
    const animation = new EnemyAnimation("mutated-mitachurl");

    animation.attack(100);

    expect(animation.resolve(0, 0, 100).texture).toBe("mutated-mitachurl-attack-0");
    expect(animation.resolve(0, 0, 240).texture).toBe("mutated-mitachurl-attack-1");
    expect(animation.resolve(0, 0, 380).texture).toBe("mutated-mitachurl-attack-2");
    expect(animation.resolve(0, 0, 540).action).toBe("idle");
  });
});
