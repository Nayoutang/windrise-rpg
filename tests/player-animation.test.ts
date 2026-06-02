import { describe, expect, it } from "vitest";
import { PlayerAnimation } from "../src/game/systems/PlayerAnimation";

describe("PlayerAnimation", () => {
  it("starts idle while facing down", () => {
    const animation = new PlayerAnimation();

    expect(animation.resolve("ayaka", 0, 0, 0)).toEqual({
      action: "idle",
      direction: "down",
      frame: 0,
      moving: false,
      texture: "ayaka-down-0",
    });
  });

  it("uses the dominant movement axis to change direction", () => {
    const animation = new PlayerAnimation();

    expect(animation.resolve("ayaka", -120, 20, 0).direction).toBe("left");
    expect(animation.resolve("ayaka", 20, -120, 0).direction).toBe("up");
    expect(animation.resolve("ayaka", 20, 120, 0).direction).toBe("down");
    expect(animation.resolve("ayaka", 120, 20, 0).direction).toBe("right");
  });

  it("keeps the last movement direction while idle", () => {
    const animation = new PlayerAnimation();

    animation.resolve("furina", 0, -120, 0);

    expect(animation.resolve("furina", 0, 0, 500)).toEqual({
      action: "idle",
      direction: "up",
      frame: 0,
      moving: false,
      texture: "furina-up-0",
    });
  });

  it("cycles through the idle pose between walking strides", () => {
    const animation = new PlayerAnimation();

    expect(animation.resolve("ayaka", 120, 0, 0).frame).toBe(0);
    expect(animation.resolve("ayaka", 120, 0, 110).frame).toBe(1);
    expect(animation.resolve("ayaka", 120, 0, 220).frame).toBe(0);
    expect(animation.resolve("ayaka", 120, 0, 330).frame).toBe(2);
    expect(animation.resolve("ayaka", 120, 0, 440).frame).toBe(0);
  });

  it("plays a three-frame attack before returning to idle", () => {
    const animation = new PlayerAnimation();

    animation.resolve("ayaka", 120, 0, 0);
    animation.attack(100);

    expect(animation.resolve("ayaka", 120, 0, 100)).toMatchObject({
      action: "attack",
      direction: "right",
      frame: 0,
      texture: "ayaka-attack-right-0",
    });
    expect(animation.resolve("ayaka", 120, 0, 200)).toMatchObject({
      action: "attack",
      frame: 1,
      texture: "ayaka-attack-right-1",
    });
    expect(animation.resolve("ayaka", 0, 0, 300)).toMatchObject({
      action: "attack",
      frame: 2,
      texture: "ayaka-attack-right-2",
    });
    expect(animation.resolve("ayaka", 0, 0, 400)).toMatchObject({
      action: "idle",
      frame: 0,
      texture: "ayaka-right-0",
    });
  });
});
