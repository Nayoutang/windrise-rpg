import { GENERATED_ART } from "../assets/manifest";
import type { CharacterId } from "../game/systems/types";

export interface HudSnapshot {
  objective: string;
  activeId: CharacterId;
  activeName: string;
  hp: number;
  maxHp: number;
  stamina: number;
  switchCooldown: number;
  skillCooldown: number;
  burstCooldown: number;
  paused: boolean;
  bossHp: number | null;
  bossMaxHp: number | null;
}

export class Hud {
  private readonly root: HTMLElement;
  private dialogTimer = 0;
  private toastTimer = 0;

  constructor(root: HTMLElement) {
    this.root = root;
    this.root.innerHTML = `
      <section class="objective-panel pixel-panel">
        <span class="eyebrow">当前任务</span>
        <strong id="objective"></strong>
      </section>
      <section class="area-panel pixel-panel">
        <strong>蒙德 · 风起地</strong>
        <span>个人学习用非商业同人原型</span>
      </section>
      <section class="party-panel pixel-panel">
        <div id="portrait" class="portrait"></div>
        <div class="party-copy">
          <strong id="character-name"></strong>
          <span>生命</span><div class="meter"><i id="hp-bar"></i></div>
          <span>体力</span><div class="meter stamina"><i id="stamina-bar"></i></div>
        </div>
      </section>
      <section class="skills-panel">
        <div class="skill"><kbd>J</kbd><span>普攻</span></div>
        <div class="skill"><kbd>K</kbd><span id="skill-label">战技</span><small id="skill-cd"></small></div>
        <div class="skill"><kbd>L</kbd><span>爆发</span><small id="burst-cd"></small></div>
        <div class="skill"><kbd>Q</kbd><span>切换</span><small id="switch-cd"></small></div>
      </section>
      <section id="boss-panel" class="boss-panel pixel-panel hidden">
        <strong>异常丘丘暴徒</strong>
        <div class="meter boss"><i id="boss-hp"></i></div>
      </section>
      <section id="dialog" class="dialog pixel-panel hidden"></section>
      <section id="toast" class="toast pixel-panel hidden"></section>
      <section id="pause" class="pause pixel-panel hidden">
        <h2>暂停</h2>
        <p><kbd>WASD</kbd> 移动 · <kbd>Space</kbd> 冲刺 · <kbd>E</kbd> 交互</p>
        <p><kbd>J</kbd> 普攻 · <kbd>K</kbd> 元素战技 · <kbd>L</kbd> 元素爆发 · <kbd>Q</kbd> 切换角色</p>
        <p>衔接水元素与冰元素攻击，可以冻结普通敌人。</p>
      </section>
      <div class="controls-hint">按 <kbd>Esc</kbd> 查看操作 · 靠近目标后按 <kbd>E</kbd> 交互</div>
    `;
  }

  render(snapshot: HudSnapshot): void {
    this.setText("#objective", snapshot.objective);
    this.setText("#character-name", snapshot.activeName);
    this.setWidth("#hp-bar", snapshot.hp / snapshot.maxHp);
    this.setWidth("#stamina-bar", snapshot.stamina / 100);
    this.setWidth("#boss-hp", (snapshot.bossHp ?? 0) / (snapshot.bossMaxHp ?? 1));
    this.setText("#skill-cd", this.cooldownText(snapshot.skillCooldown));
    this.setText("#burst-cd", this.cooldownText(snapshot.burstCooldown));
    this.setText("#switch-cd", this.cooldownText(snapshot.switchCooldown));
    const portrait = this.root.querySelector<HTMLElement>("#portrait");
    if (portrait) {
      portrait.className = `portrait ${snapshot.activeId}`;
      portrait.style.backgroundImage = `url(${
        snapshot.activeId === "ayaka" ? GENERATED_ART.ayakaPortrait : GENERATED_ART.furinaPortrait
      })`;
    }
    this.toggle("#boss-panel", snapshot.bossHp !== null);
    this.toggle("#pause", snapshot.paused);
  }

  showDialog(speaker: string, text: string, durationMs = 4200): void {
    const dialog = this.root.querySelector<HTMLElement>("#dialog");
    if (!dialog) return;
    dialog.innerHTML = `<strong>${speaker}</strong><p>${text}</p>`;
    dialog.classList.remove("hidden");
    window.clearTimeout(this.dialogTimer);
    this.dialogTimer = window.setTimeout(() => dialog.classList.add("hidden"), durationMs);
  }

  showToast(text: string, durationMs = 2200): void {
    const toast = this.root.querySelector<HTMLElement>("#toast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.remove("hidden");
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => toast.classList.add("hidden"), durationMs);
  }

  private cooldownText(milliseconds: number): string {
    return milliseconds > 0 ? `${(milliseconds / 1000).toFixed(1)}s` : "";
  }

  private setText(selector: string, value: string): void {
    const element = this.root.querySelector<HTMLElement>(selector);
    if (element) element.textContent = value;
  }

  private setWidth(selector: string, ratio: number): void {
    const element = this.root.querySelector<HTMLElement>(selector);
    if (element) element.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  }

  private toggle(selector: string, visible: boolean): void {
    this.root.querySelector(selector)?.classList.toggle("hidden", !visible);
  }
}
