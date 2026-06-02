import Phaser from "phaser";
import { TEXTURES } from "../../assets/manifest";
import { Hud } from "../../ui/hud";
import { ENEMY_SPAWNS, PLAYERS, type EnemySpawn } from "../data/actors";
import { LANDMARKS, WORLD_HEIGHT, WORLD_WIDTH } from "../data/map";
import { CombatSystem, type EnemyState } from "../systems/CombatSystem";
import { GameState } from "../systems/GameState";
import { InputMap } from "../systems/InputMap";
import { QuestSystem } from "../systems/QuestSystem";
import type { ElementType, EnemyType } from "../systems/types";

interface EnemyActor {
  sprite: Phaser.Physics.Arcade.Sprite;
  state: EnemyState;
  zone: EnemySpawn["zone"];
  nextAttackAt: number;
}

declare global {
  interface Window {
    __windriseDebug?: {
      snapshot: () => {
        player: { x: number; y: number };
        quest: string;
        activeCharacter: string;
        enemies: Array<{
          type: string;
          hp: number;
          defeated: boolean;
          zone: string;
          frozenUntil: number;
          slowedUntil: number;
          hydroUntil: number;
          cryoUntil: number;
          stagger: number;
        }>;
      };
      teleport: (x: number, y: number) => void;
      defeatBoss: () => void;
    };
  }
}

const ENEMY_TEXTURE: Record<EnemyType, string> = {
  "hydro-slime": TEXTURES.hydroSlime,
  "cryo-slime": TEXTURES.cryoSlime,
  "hilichurl-fighter": TEXTURES.hilichurlFighter,
  "hilichurl-shooter": TEXTURES.hilichurlShooter,
  "mutated-mitachurl": TEXTURES.mutatedMitachurl,
};

export class WorldScene extends Phaser.Scene {
  private readonly gameState = GameState.create();
  private readonly combat = new CombatSystem();
  private readonly quest = new QuestSystem();
  private inputMap!: InputMap;
  private hud!: Hud;
  private player!: Phaser.Physics.Arcade.Sprite;
  private scout!: Phaser.Physics.Arcade.Sprite;
  private enemies: EnemyActor[] = [];
  private paused = false;
  private dashUntil = 0;
  private attackReadyAt = 0;
  private skillReadyAt = 0;
  private burstReadyAt = 0;
  private salonUntil = 0;
  private salonNextAttackAt = 0;
  private restarting = false;

  constructor() {
    super("world");
  }

  create(): void {
    this.resetRuntime();
    this.drawMap();
    this.createActors();
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable");
    this.inputMap = new InputMap(keyboard);
    const hudRoot = document.querySelector<HTMLElement>("#hud-root");
    if (!hudRoot) throw new Error("Missing #hud-root");
    this.hud = new Hud(hudRoot);
    this.installDebugApi();
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.25);
    this.hud.showDialog("协会调查员", "风起地附近出现了异常冰雾。请先来营地和我谈谈。", 5200);
  }

  update(time: number, delta: number): void {
    if (this.inputMap.pressed("pause")) {
      this.paused = !this.paused;
      this.physics.world.isPaused = this.paused;
    }
    if (!this.paused) {
      this.gameState.tick(delta);
      this.updateMovement(time);
      this.handleActions(time);
      this.updateEnemies(time);
      this.updateSalon(time);
      this.resolveQuestProgress();
    }
    this.renderHud(time);
  }

  private resetRuntime(): void {
    this.gameState.reset();
    this.quest.reset();
    this.enemies = [];
    this.paused = false;
    this.dashUntil = 0;
    this.attackReadyAt = 0;
    this.skillReadyAt = 0;
    this.burstReadyAt = 0;
    this.salonUntil = 0;
    this.salonNextAttackAt = 0;
    this.restarting = false;
  }

  private installDebugApi(): void {
    if (!import.meta.env.DEV) return;
    window.__windriseDebug = {
      snapshot: () => ({
        player: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
        quest: this.quest.phase,
        activeCharacter: this.gameState.activeCharacter.id,
        enemies: this.enemies.map((enemy) => ({
          type: enemy.state.type,
          hp: enemy.state.hp,
          defeated: enemy.state.defeated,
          zone: enemy.zone,
          frozenUntil: enemy.state.status.frozenUntil,
          slowedUntil: enemy.state.status.slowedUntil,
          hydroUntil: enemy.state.status.hydroUntil,
          cryoUntil: enemy.state.status.cryoUntil,
          stagger: enemy.state.status.stagger,
        })),
      }),
      teleport: (x, y) => {
        this.player.setPosition(x, y);
      },
      defeatBoss: () => {
        const boss = this.enemies.find((enemy) => enemy.state.isBoss && !enemy.state.defeated);
        if (boss) this.damageEnemy(boss, boss.state.hp, "physical", this.time.now);
      },
    };
  }

  private drawMap(): void {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    for (let x = 0; x < WORLD_WIDTH; x += 32) {
      for (let y = 0; y < WORLD_HEIGHT; y += 32) {
        this.add.image(x, y, TEXTURES.grass).setOrigin(0);
      }
    }
    this.add.rectangle(760, 515, 1110, 106, 0xc9ad79, 0.94).setAngle(-8);
    this.add.rectangle(370, 610, 86, 370, 0xc9ad79, 0.94).setAngle(18);
    this.add.rectangle(1120, 555, 90, 490, 0xc9ad79, 0.94).setAngle(-19);
    this.add.image(174, 186, TEXTURES.tent);
    this.add.image(280, 206, TEXTURES.crate);
    this.add.image(314, 733, TEXTURES.ruin);
    this.add.image(372, 790, TEXTURES.ruin).setScale(0.8);
    this.add.image(1334, 730, TEXTURES.tree).setDepth(1);
    this.add.image(LANDMARKS.gate.x, LANDMARKS.gate.y, TEXTURES.gate).setDepth(2);
    for (const [x, y] of [
      [430, 430], [514, 690], [730, 460], [870, 530], [960, 275], [1210, 444], [1410, 590],
    ]) {
      this.add.image(x, y, TEXTURES.bush);
    }
    for (const [x, y] of [
      [272, 590], [410, 510], [570, 438], [795, 575], [925, 465], [1270, 620],
    ]) {
      this.add.image(x, y, TEXTURES.flower);
    }
    this.add.text(92, 115, "冒险家营地", this.labelStyle());
    this.add.text(260, 655, "风之遗迹", this.labelStyle());
    this.add.text(1032, 227, "丘丘人哨站", this.labelStyle());
    this.add.text(1270, 608, "风起地树下", this.labelStyle());
  }

  private createActors(): void {
    this.player = this.physics.add.sprite(226, 330, TEXTURES.ayaka).setDepth(5);
    this.player.setCollideWorldBounds(true);
    this.player.body?.setSize(20, 26).setOffset(6, 18);
    this.scout = this.physics.add.sprite(LANDMARKS.scout.x, LANDMARKS.scout.y, TEXTURES.scout).setDepth(4);
    this.scout.setImmovable(true);
    for (const spawn of ENEMY_SPAWNS) {
      const state = this.combat.createEnemy(spawn.type);
      const sprite = this.physics.add.sprite(spawn.x, spawn.y, ENEMY_TEXTURE[spawn.type]).setDepth(4);
      sprite.setCollideWorldBounds(true);
      if (state.isBoss) sprite.setAlpha(0.38);
      this.enemies.push({ sprite, state, zone: spawn.zone, nextAttackAt: 0 });
    }
  }

  private updateMovement(time: number): void {
    const velocity = new Phaser.Math.Vector2(
      Number(this.inputMap.down("right")) - Number(this.inputMap.down("left")),
      Number(this.inputMap.down("down")) - Number(this.inputMap.down("up")),
    );
    if (this.inputMap.pressed("dash") && this.gameState.consumeStamina(25)) {
      this.dashUntil = time + 340;
      this.flashAt(this.player.x, this.player.y, 0xe8ffff, 34);
    }
    const speed = PLAYERS[this.gameState.activeCharacter.id].moveSpeed * (time < this.dashUntil ? 1.9 : 1);
    velocity.normalize().scale(speed);
    this.player.setVelocity(velocity.x, velocity.y);
    if (velocity.x !== 0) this.player.setFlipX(velocity.x < 0);
  }

  private handleActions(time: number): void {
    if (this.inputMap.pressed("switch") && this.gameState.switchCharacter(time)) {
      this.player.setTexture(TEXTURES[this.gameState.activeCharacter.id]);
      this.hud.showToast(`切换为 ${this.gameState.activeCharacter.name}`);
      this.flashAt(this.player.x, this.player.y, 0xdffcff, 48);
    }
    if (this.inputMap.pressed("interact")) this.interact();
    if (this.inputMap.pressed("attack")) this.useAttack(time);
    if (this.inputMap.pressed("skill")) this.useSkill(time);
    if (this.inputMap.pressed("burst")) this.useBurst(time);
  }

  private useAttack(time: number): void {
    if (time < this.attackReadyAt) return;
    this.attackReadyAt = time + 380;
    if (this.gameState.activeCharacter.id === "ayaka") {
      this.damageNearest(105, 11, "physical", time);
      this.attackFx(TEXTURES.cryoFx, 0.64);
    } else {
      this.damageNearest(300, 9, "hydro", time);
      this.attackFx(TEXTURES.hydroFx, 1);
    }
  }

  private useSkill(time: number): void {
    if (time < this.skillReadyAt) return;
    this.skillReadyAt = time + 4600;
    if (this.gameState.activeCharacter.id === "ayaka") {
      this.damageArea(165, 21, "cryo", time);
      this.attackFx(TEXTURES.cryoFx, 1.35);
      this.hud.showToast("冰华斩 · 冰元素附着");
    } else {
      this.salonUntil = time + 8200;
      this.salonNextAttackAt = time;
      this.hud.showToast("沙龙成员登场 · 持续水元素攻击");
      for (const angle of [0, 120, 240]) {
        const member = this.add.circle(this.player.x, this.player.y, 8, 0x92e9ed).setDepth(6);
        this.tweens.add({
          targets: member,
          x: this.player.x + Math.cos(Phaser.Math.DegToRad(angle)) * 68,
          y: this.player.y + Math.sin(Phaser.Math.DegToRad(angle)) * 68,
          alpha: 0,
          duration: 8200,
          onComplete: () => member.destroy(),
        });
      }
    }
  }

  private useBurst(time: number): void {
    if (time < this.burstReadyAt) return;
    this.burstReadyAt = time + 11800;
    if (this.gameState.activeCharacter.id === "ayaka") {
      this.damageArea(280, 38, "cryo", time);
      this.hud.showToast("霜灭 · 冰风暴席卷前方");
      this.flashAt(this.player.x, this.player.y, 0xc8f4ff, 175);
    } else {
      this.damageArea(340, 28, "hydro", time);
      this.hud.showToast("众水的歌剧 · 水元素共鸣");
      this.flashAt(this.player.x, this.player.y, 0x65cce5, 210);
    }
  }

  private updateSalon(time: number): void {
    if (time >= this.salonUntil || time < this.salonNextAttackAt) return;
    this.salonNextAttackAt = time + 1100;
    this.damageNearest(360, 7, "hydro", time);
    this.flashAt(this.player.x + 42, this.player.y - 24, 0x8fe8ed, 20);
  }

  private updateEnemies(time: number): void {
    for (const enemy of this.enemies) {
      if (enemy.state.defeated || !enemy.sprite.active) continue;
      this.combat.tickEnemy(enemy.state, time);
      const bossLocked = enemy.zone === "boss" && !this.quest.canEnterBossArena;
      if (bossLocked) {
        enemy.sprite.setVelocity(0, 0);
        continue;
      }
      if (enemy.zone === "boss") enemy.sprite.setAlpha(1);
      if (this.combat.isImmobilized(enemy.state, time)) {
        enemy.sprite.setVelocity(0, 0);
        continue;
      }
      const distance = Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, this.player.x, this.player.y);
      if (distance < (enemy.state.isBoss ? 480 : 265)) {
        const direction = new Phaser.Math.Vector2(this.player.x - enemy.sprite.x, this.player.y - enemy.sprite.y)
          .normalize()
          .scale((enemy.state.isBoss ? 76 : 58) * this.combat.speedMultiplier(enemy.state, time));
        enemy.sprite.setVelocity(direction.x, direction.y);
      } else {
        enemy.sprite.setVelocity(0, 0);
      }
      if (distance < (enemy.state.isBoss ? 78 : 48) && time >= enemy.nextAttackAt) {
        enemy.nextAttackAt = time + (enemy.state.isBoss ? 1250 : 1650);
        this.gameState.damageActiveCharacter(enemy.state.isBoss ? 17 : 7);
        this.flashAt(this.player.x, this.player.y, 0xe98772, enemy.state.isBoss ? 54 : 30);
        if (enemy.state.isBoss) this.bossShockwave(enemy.sprite.x, enemy.sprite.y);
        if (this.gameState.isPartyDefeated && !this.restarting) this.restartAfterDefeat();
      }
    }
  }

  private damageNearest(range: number, damage: number, element: ElementType, time: number): void {
    const target = this.availableEnemies()
      .map((enemy) => ({
        enemy,
        distance: Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, this.player.x, this.player.y),
      }))
      .filter(({ distance }) => distance <= range)
      .sort((a, b) => a.distance - b.distance)[0]?.enemy;
    if (target) this.damageEnemy(target, damage, element, time);
  }

  private damageArea(range: number, damage: number, element: ElementType, time: number): void {
    for (const enemy of this.availableEnemies()) {
      if (Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, this.player.x, this.player.y) <= range) {
        this.damageEnemy(enemy, damage, element, time);
      }
    }
  }

  private damageEnemy(enemy: EnemyActor, damage: number, element: ElementType, time: number): void {
    const result = this.combat.hit(enemy.state, { damage, element }, time);
    enemy.sprite.setTint(element === "cryo" ? 0xbcefff : element === "hydro" ? 0x82eaf0 : 0xffffff);
    this.time.delayedCall(150, () => enemy.sprite.clearTint());
    if (result.reaction === "freeze") {
      this.hud.showToast(enemy.state.isBoss ? "冻结反应 · Boss 削韧并减速" : "冻结反应 · 敌人停止行动");
      const freezeFx = this.add.image(enemy.sprite.x, enemy.sprite.y - 16, TEXTURES.freezeFx).setDepth(8).setAlpha(0.86);
      this.tweens.add({ targets: freezeFx, alpha: 0, y: freezeFx.y - 14, duration: 980, onComplete: () => freezeFx.destroy() });
    }
    if (result.defeated) {
      enemy.sprite.setVelocity(0, 0);
      this.tweens.add({ targets: enemy.sprite, alpha: 0, duration: 250, onComplete: () => enemy.sprite.destroy() });
      if (enemy.zone === "boss" && this.quest.defeatBoss()) {
        this.hud.showDialog("芙宁娜", "元素紊乱平息了。精彩的谢幕，接下来该回营地报捷啦。", 5200);
      }
    }
  }

  private resolveQuestProgress(): void {
    if (
      this.quest.phase === "clear-camp" &&
      this.enemies.filter((enemy) => enemy.zone === "outpost").every((enemy) => enemy.state.defeated)
    ) {
      this.quest.clearCamp();
      this.hud.showDialog("神里绫华", "哨站已经清理完毕。风起地树下还有更强烈的元素波动。", 4600);
    }
  }

  private interact(): void {
    const scoutDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.scout.x, this.scout.y);
    if (scoutDistance < 92) {
      if (this.quest.speakToScout()) {
        this.hud.showDialog("协会调查员", "请调查西南方的遗迹。冰雾正从石柱之间涌出。", 4600);
      } else if (this.quest.returnToScout()) {
        this.hud.showDialog("协会调查员", "辛苦了！风起地重新恢复平静，这份调查记录会送回蒙德城。", 6200);
        this.hud.showToast("试玩完成 · 感谢游玩", 6200);
      } else {
        this.hud.showDialog("协会调查员", this.quest.objective);
      }
      return;
    }
    const ruinDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, LANDMARKS.ruin.x, LANDMARKS.ruin.y);
    if (ruinDistance < 112 && this.quest.investigateRuin()) {
      this.hud.showDialog("神里绫华", "这里同时残留着冰与水的气息。丘丘人哨站或许藏着线索。", 4800);
      return;
    }
    const gateDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, LANDMARKS.gate.x, LANDMARKS.gate.y);
    if (gateDistance < 125) {
      this.hud.showDialog(
        "风之遗迹石门",
        this.quest.canEnterBossArena ? "封锁已经消散。前方就是元素紊乱的源头。" : "石门被紊乱元素封锁。先完成当前调查目标。",
      );
      return;
    }
    this.hud.showToast("附近没有可交互目标");
  }

  private renderHud(time: number): void {
    const active = this.gameState.activeCharacter;
    const boss = this.enemies.find((enemy) => enemy.state.isBoss && !enemy.state.defeated)?.state ?? null;
    this.hud.render({
      objective: this.quest.objective,
      activeId: active.id,
      activeName: active.name,
      hp: active.hp,
      maxHp: active.maxHp,
      stamina: active.stamina,
      switchCooldown: this.gameState.getSwitchCooldown(time),
      skillCooldown: Math.max(0, this.skillReadyAt - time),
      burstCooldown: Math.max(0, this.burstReadyAt - time),
      paused: this.paused,
      bossHp: this.quest.canEnterBossArena && boss ? boss.hp : null,
      bossMaxHp: this.quest.canEnterBossArena && boss ? boss.maxHp : null,
    });
  }

  private availableEnemies(): EnemyActor[] {
    return this.enemies.filter(
      (enemy) => !enemy.state.defeated && enemy.sprite.active && (enemy.zone !== "boss" || this.quest.canEnterBossArena),
    );
  }

  private attackFx(texture: string, scale: number): void {
    const fx = this.add.image(this.player.x + (this.player.flipX ? -34 : 34), this.player.y, texture)
      .setFlipX(this.player.flipX)
      .setScale(scale)
      .setDepth(7);
    this.tweens.add({ targets: fx, alpha: 0, scale: scale * 1.35, duration: 210, onComplete: () => fx.destroy() });
  }

  private flashAt(x: number, y: number, color: number, radius: number): void {
    const flash = this.add.circle(x, y, radius, color, 0.45).setDepth(7);
    this.tweens.add({ targets: flash, alpha: 0, scale: 1.45, duration: 330, onComplete: () => flash.destroy() });
  }

  private bossShockwave(x: number, y: number): void {
    const ring = this.add.circle(x, y, 28).setStrokeStyle(6, 0xf2b06f, 0.84).setDepth(6);
    this.tweens.add({ targets: ring, scale: 3.4, alpha: 0, duration: 620, onComplete: () => ring.destroy() });
  }

  private restartAfterDefeat(): void {
    this.restarting = true;
    this.hud.showDialog("派蒙", "队伍暂时失去了战斗能力，正在返回营地休整……", 1800);
    this.time.delayedCall(1900, () => this.scene.restart());
  }

  private labelStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      color: "#efffe7",
      fontFamily: "Microsoft YaHei",
      fontSize: "18px",
      stroke: "#315145",
      strokeThickness: 4,
    };
  }
}
