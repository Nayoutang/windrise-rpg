import { describe, expect, it } from "vitest";
import { GameState } from "../src/game/systems/GameState";

describe("GameState", () => {
  it("switches from Ayaka to Furina and applies a cooldown", () => {
    const state = GameState.create();

    expect(state.switchCharacter(0)).toBe(true);
    expect(state.activeCharacter.id).toBe("furina");
    expect(state.switchCharacter(0)).toBe(false);
  });

  it("automatically switches when the active character falls", () => {
    const state = GameState.create();

    state.damageActiveCharacter(999);

    expect(state.activeCharacter.id).toBe("furina");
    expect(state.isPartyDefeated).toBe(false);
  });

  it("marks the party defeated after both characters fall", () => {
    const state = GameState.create();

    state.damageActiveCharacter(999);
    state.damageActiveCharacter(999);

    expect(state.isPartyDefeated).toBe(true);
  });
});
