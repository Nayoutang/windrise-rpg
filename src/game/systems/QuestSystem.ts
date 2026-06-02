export type QuestPhase =
  | "meet-scout"
  | "investigate-ruin"
  | "clear-camp"
  | "defeat-boss"
  | "return-to-scout"
  | "complete";

const OBJECTIVES: Record<QuestPhase, string> = {
  "meet-scout": "与营地中的冒险家协会调查员交谈",
  "investigate-ruin": "前往西南方的风之遗迹，调查异常冰雾",
  "clear-camp": "清理东侧丘丘人哨站，寻找元素紊乱的线索",
  "defeat-boss": "进入风起地树下，击败异常丘丘暴徒",
  "return-to-scout": "返回营地，将调查结果告诉协会调查员",
  complete: "调查完成：风起地恢复了平静",
};

export class QuestSystem {
  phase: QuestPhase = "meet-scout";

  get objective(): string {
    return OBJECTIVES[this.phase];
  }

  get canEnterBossArena(): boolean {
    return (
      this.phase === "defeat-boss" ||
      this.phase === "return-to-scout" ||
      this.phase === "complete"
    );
  }

  get isComplete(): boolean {
    return this.phase === "complete";
  }

  speakToScout(): boolean {
    return this.advance("meet-scout", "investigate-ruin");
  }

  investigateRuin(): boolean {
    return this.advance("investigate-ruin", "clear-camp");
  }

  clearCamp(): boolean {
    return this.advance("clear-camp", "defeat-boss");
  }

  defeatBoss(): boolean {
    return this.advance("defeat-boss", "return-to-scout");
  }

  returnToScout(): boolean {
    return this.advance("return-to-scout", "complete");
  }

  reset(): void {
    this.phase = "meet-scout";
  }

  private advance(from: QuestPhase, to: QuestPhase): boolean {
    if (this.phase !== from) {
      return false;
    }
    this.phase = to;
    return true;
  }
}
