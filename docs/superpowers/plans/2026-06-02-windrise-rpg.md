# Windrise RPG Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable desktop-browser Phaser RPG vertical slice in which Ayaka and Furina explore Windrise, trigger Freeze reactions, clear a camp, defeat a boss, and finish the quest.

**Architecture:** Keep serializable RPG rules in framework-independent TypeScript systems and use Phaser only as the rendering, collision, input, camera, and effect adapter. Use a DOM HUD above the canvas. Load generated image2 artwork through stable manifest keys, with procedural pixel-art placeholders available while individual final assets are still being generated or processed.

**Tech Stack:** TypeScript, Vite, Phaser 3, Vitest, DOM/CSS HUD, image2 generated PNG assets.

---

## File Map

```text
package.json                         scripts and dependencies
tsconfig.json                        strict TypeScript configuration
vite.config.ts                       Vite and Vitest configuration
index.html                           canvas mount and DOM HUD shell
src/main.ts                          application entrypoint
src/ui/styles.css                    HUD, dialog, pause and onboarding theme
src/ui/hud.ts                        DOM HUD renderer and transient messages
src/game/config.ts                   Phaser configuration
src/game/main.ts                     Phaser game factory
src/game/data/actors.ts              player and enemy definitions
src/game/data/map.ts                 Windrise map landmarks and spawn groups
src/game/systems/types.ts            shared serializable gameplay types
src/game/systems/GameState.ts        party state, switching, stamina and reset
src/game/systems/CombatSystem.ts     elemental application, damage and Freeze
src/game/systems/QuestSystem.ts      quest progression and boss gate
src/game/scenes/BootScene.ts         texture manifest loading and fallback art
src/game/scenes/WorldScene.ts        exploration, combat, interactions and camera
src/assets/manifest.ts               stable runtime asset keys
src/assets/generated.ts              procedural placeholder texture painters
tests/game-state.test.ts             party rules
tests/combat-system.test.ts          reaction rules
tests/quest-system.test.ts           quest flow rules
public/assets/generated/             processed image2 PNG files
assets/source/                       original image2 output PNG files
```

## Task 1: Scaffold the TypeScript Game

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`

- [ ] **Step 1: Create the package manifest**

```json
{
  "name": "windrise-rpg",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc --noEmit && vite build",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "phaser": "^3.90.0"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vite": "^6.3.5",
    "vitest": "^3.1.4"
  }
}
```

- [ ] **Step 2: Add strict TypeScript and Vite configuration**

Use `ES2022`, DOM libraries, bundler module resolution, `strict: true`, and a Vitest Node environment.

- [ ] **Step 3: Add the page shell**

Create `#game-root` for Phaser and `#hud-root` for the DOM overlay. Import `src/main.ts` as the module entrypoint.

- [ ] **Step 4: Install dependencies**

Run: `npm install`

Expected: package installation completes and creates `package-lock.json`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src/main.ts
git commit -m "chore: scaffold windrise rpg"
```

## Task 2: Implement Party State with TDD

**Files:**
- Create: `src/game/systems/types.ts`
- Create: `src/game/systems/GameState.ts`
- Create: `tests/game-state.test.ts`

- [ ] **Step 1: Write failing party tests**

```ts
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
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- tests/game-state.test.ts`

Expected: FAIL because `GameState` does not exist.

- [ ] **Step 3: Add minimal serializable party rules**

Define `CharacterId = "ayaka" | "furina"`, party members with HP, stamina, and cooldowns, and methods `switchCharacter(now)`, `damageActiveCharacter(amount)`, `tick(deltaMs)`, and `reset()`.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `npm test -- tests/game-state.test.ts`

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/game/systems tests/game-state.test.ts
git commit -m "feat: add party state rules"
```

## Task 3: Implement Freeze Combat with TDD

**Files:**
- Create: `src/game/systems/CombatSystem.ts`
- Create: `tests/combat-system.test.ts`

- [ ] **Step 1: Write failing reaction tests**

```ts
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
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- tests/combat-system.test.ts`

Expected: FAIL because `CombatSystem` does not exist.

- [ ] **Step 3: Add elemental combat rules**

Implement enemy creation, HP changes, timed Hydro and Cryo attachment, normal-enemy Freeze, boss slowdown, and boss stagger. Keep the system independent from Phaser.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `npm test -- tests/combat-system.test.ts`

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/game/systems/CombatSystem.ts tests/combat-system.test.ts
git commit -m "feat: add freeze combat rules"
```

## Task 4: Implement Quest Progression with TDD

**Files:**
- Create: `src/game/systems/QuestSystem.ts`
- Create: `tests/quest-system.test.ts`

- [ ] **Step 1: Write failing quest tests**

```ts
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
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- tests/quest-system.test.ts`

Expected: FAIL because `QuestSystem` does not exist.

- [ ] **Step 3: Add the explicit quest state machine**

Define phases `meet-scout`, `investigate-ruin`, `clear-camp`, `defeat-boss`, `return-to-scout`, and `complete`. Each event advances only from its valid preceding phase and exposes a Chinese objective string.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `npm test -- tests/quest-system.test.ts`

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/game/systems/QuestSystem.ts tests/quest-system.test.ts
git commit -m "feat: add windrise quest flow"
```

## Task 5: Build the Phaser World and DOM HUD

**Files:**
- Create: `src/assets/manifest.ts`
- Create: `src/assets/generated.ts`
- Create: `src/game/config.ts`
- Create: `src/game/main.ts`
- Create: `src/game/data/actors.ts`
- Create: `src/game/data/map.ts`
- Create: `src/game/scenes/BootScene.ts`
- Create: `src/game/scenes/WorldScene.ts`
- Create: `src/ui/hud.ts`
- Create: `src/ui/styles.css`
- Modify: `src/main.ts`

- [ ] **Step 1: Add stable asset keys and procedural fallbacks**

Expose asset keys for both characters, five enemy types, environment props, attack FX, portraits, and HUD ornaments. Paint fallback textures with Phaser graphics in a consistent 32-bit palette.

- [ ] **Step 2: Add the world map and actors**

Define a `1600 x 1000` world with camp, ruin, outpost, Windrise tree, boss gate, collision rectangles, NPC positions, interactable positions, and enemy spawn groups.

- [ ] **Step 3: Wire exploration and combat**

Create the current player sprite, enemy sprites, collision adapters, camera follow, `WASD`, `J/K/L/Q/E/Space/Escape` actions, melee and ranged attacks, Furina salon summons, Ayaka burst, boss attacks, health changes, status FX, and quest-event integration.

- [ ] **Step 4: Add the DOM HUD**

Render the Chinese objective, area chip, active portrait, HP, stamina, cooldown buttons, dialog box, pause panel, Freeze onboarding toast, and fan-project notice.

- [ ] **Step 5: Run static verification**

Run: `npm run typecheck`

Expected: no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src index.html
git commit -m "feat: add playable phaser windrise world"
```

## Task 6: Generate and Integrate image2 Art

**Files:**
- Create: `assets/source/characters/ayaka.png`
- Create: `assets/source/characters/furina.png`
- Create: `assets/source/enemies/windrise-enemies.png`
- Create: `assets/source/environment/windrise-environment.png`
- Create: `public/assets/generated/ayaka.png`
- Create: `public/assets/generated/furina.png`
- Create: `public/assets/generated/windrise-enemies.png`
- Create: `public/assets/generated/windrise-environment.png`
- Modify: `src/assets/manifest.ts`

- [ ] **Step 1: Generate four image2 sheets**

Generate project-bound sheets for Ayaka, Furina, the Windrise enemies, and the Windrise environment. Prompts must specify refined 32-bit pixel art, orthographic top-down RPG presentation, flat removable chroma-key background, no UI text, no watermark, and generous padding between assets.

- [ ] **Step 2: Persist source sheets**

Copy selected built-in image2 outputs into `assets/source/characters/`, `assets/source/enemies/`, and `assets/source/environment/`.

- [ ] **Step 3: Remove chroma-key backgrounds**

Run the installed `remove_chroma_key.py` helper with border auto-key sampling, soft matte, and despill. Save alpha PNG outputs under `public/assets/generated/`.

- [ ] **Step 4: Reference processed sheets**

Update the stable manifest so `BootScene` attempts to load the generated art. Preserve procedural fallbacks if an individual sheet fails.

- [ ] **Step 5: Commit**

```bash
git add assets/source public/assets/generated src/assets/manifest.ts
git commit -m "feat: integrate image2 windrise artwork"
```

## Task 7: Verify the Vertical Slice

**Files:**
- Modify only if verification exposes a defect.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run production verification**

Run: `npm run typecheck`

Expected: no TypeScript errors.

Run: `npm run build`

Expected: Vite produces `dist/` successfully.

- [ ] **Step 3: Run the game**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite serves the game on a local URL.

- [ ] **Step 4: Play through the browser**

Verify boot, scout dialog, ruin investigation, outpost clear, character switch, Hydro then Cryo Freeze, boss gate unlock, boss fight, return dialog, pause panel, and restart after party defeat.

- [ ] **Step 5: Capture representative screenshots**

Capture exploration, normal combat with Freeze, Boss battle, and ending dialog. Check HUD overlap, sprite scale, map readability, and skill-effect readability.

- [ ] **Step 6: Commit verification fixes**

```bash
git add .
git commit -m "fix: polish windrise vertical slice"
```

