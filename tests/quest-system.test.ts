import { describe, expect, it } from "vitest";
import { QuestSystem } from "../src/game/systems/QuestSystem";

describe("QuestSystem", () => {
  it("unlocks the boss after the investigation and camp clear", () => {
    const quest = new QuestSystem();

    quest.speakToScout();
    quest.investigateRuin();
    quest.clearCamp();

    expect(quest.canEnterBossArena).toBe(true);
  });

  it("completes only after the boss falls and the party returns", () => {
    const quest = new QuestSystem();

    quest.speakToScout();
    quest.investigateRuin();
    quest.clearCamp();
    quest.defeatBoss();

    expect(quest.isComplete).toBe(false);

    quest.returnToScout();

    expect(quest.isComplete).toBe(true);
  });

  it("ignores quest events that arrive out of order", () => {
    const quest = new QuestSystem();

    quest.clearCamp();
    quest.defeatBoss();

    expect(quest.phase).toBe("meet-scout");
    expect(quest.canEnterBossArena).toBe(false);
  });
});
