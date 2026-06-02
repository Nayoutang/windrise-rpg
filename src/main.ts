const gameRoot = document.querySelector<HTMLDivElement>("#game-root");

if (!gameRoot) {
  throw new Error("Missing #game-root");
}

gameRoot.textContent = "正在准备风起地...";
