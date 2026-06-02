export type CharacterId = "ayaka" | "furina";

export type ElementType = "physical" | "cryo" | "hydro";

export type EnemyType =
  | "hydro-slime"
  | "cryo-slime"
  | "hilichurl-fighter"
  | "hilichurl-shooter"
  | "mutated-mitachurl";

export interface PartyMember {
  id: CharacterId;
  name: string;
  element: Extract<ElementType, "cryo" | "hydro">;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
}
