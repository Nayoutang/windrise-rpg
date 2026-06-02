import type { CharacterId, PartyMember } from "./types";

const SWITCH_COOLDOWN_MS = 900;

function createParty(): Record<CharacterId, PartyMember> {
  return {
    ayaka: {
      id: "ayaka",
      name: "神里绫华",
      element: "cryo",
      hp: 120,
      maxHp: 120,
      stamina: 100,
      maxStamina: 100,
    },
    furina: {
      id: "furina",
      name: "芙宁娜",
      element: "hydro",
      hp: 105,
      maxHp: 105,
      stamina: 100,
      maxStamina: 100,
    },
  };
}

export class GameState {
  private activeId: CharacterId = "ayaka";
  private switchReadyAt = 0;

  readonly party = createParty();

  static create(): GameState {
    return new GameState();
  }

  get activeCharacter(): PartyMember {
    return this.party[this.activeId];
  }

  get isPartyDefeated(): boolean {
    return Object.values(this.party).every((member) => member.hp <= 0);
  }

  getSwitchCooldown(now: number): number {
    return Math.max(0, this.switchReadyAt - now);
  }

  switchCharacter(now: number): boolean {
    if (now < this.switchReadyAt || this.isPartyDefeated) {
      return false;
    }

    const nextId: CharacterId = this.activeId === "ayaka" ? "furina" : "ayaka";
    if (this.party[nextId].hp <= 0) {
      return false;
    }

    this.activeId = nextId;
    this.switchReadyAt = now + SWITCH_COOLDOWN_MS;
    return true;
  }

  damageActiveCharacter(amount: number): void {
    const member = this.activeCharacter;
    member.hp = Math.max(0, member.hp - amount);
    if (member.hp === 0) {
      this.switchToLivingCharacter();
    }
  }

  consumeStamina(amount: number): boolean {
    const member = this.activeCharacter;
    if (member.stamina < amount) {
      return false;
    }
    member.stamina -= amount;
    return true;
  }

  tick(deltaMs: number): void {
    for (const member of Object.values(this.party)) {
      member.stamina = Math.min(member.maxStamina, member.stamina + deltaMs * 0.02);
    }
  }

  reset(): void {
    this.activeId = "ayaka";
    this.switchReadyAt = 0;
    Object.assign(this.party, createParty());
  }

  private switchToLivingCharacter(): void {
    const next = Object.values(this.party).find((member) => member.hp > 0);
    if (next) {
      this.activeId = next.id;
      this.switchReadyAt = 0;
    }
  }
}
