import Phaser from "phaser";

type Action =
  | "up"
  | "down"
  | "left"
  | "right"
  | "attack"
  | "skill"
  | "burst"
  | "switch"
  | "interact"
  | "dash"
  | "pause";

const KEY_CODES: Record<Action, number> = {
  up: Phaser.Input.Keyboard.KeyCodes.W,
  down: Phaser.Input.Keyboard.KeyCodes.S,
  left: Phaser.Input.Keyboard.KeyCodes.A,
  right: Phaser.Input.Keyboard.KeyCodes.D,
  attack: Phaser.Input.Keyboard.KeyCodes.J,
  skill: Phaser.Input.Keyboard.KeyCodes.K,
  burst: Phaser.Input.Keyboard.KeyCodes.L,
  switch: Phaser.Input.Keyboard.KeyCodes.Q,
  interact: Phaser.Input.Keyboard.KeyCodes.E,
  dash: Phaser.Input.Keyboard.KeyCodes.SPACE,
  pause: Phaser.Input.Keyboard.KeyCodes.ESC,
};

export class InputMap {
  private readonly keys: Record<Action, Phaser.Input.Keyboard.Key>;

  constructor(keyboard: Phaser.Input.Keyboard.KeyboardPlugin) {
    this.keys = Object.fromEntries(
      Object.entries(KEY_CODES).map(([action, keyCode]) => [
        action,
        keyboard.addKey(keyCode),
      ]),
    ) as Record<Action, Phaser.Input.Keyboard.Key>;
  }

  down(action: Action): boolean {
    return this.keys[action].isDown;
  }

  pressed(action: Action): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys[action]);
  }
}
