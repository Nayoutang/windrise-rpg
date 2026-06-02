from __future__ import annotations

from pathlib import Path
from shutil import copy2

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "assets" / "generated"
OUTPUT = ROOT / "public" / "assets" / "runtime"
ART_PACK = ROOT / "art-pack"
DIRECTIONS = ("down", "left", "right", "up")
ENEMIES = (
    ("hydro-slime", (92, 72)),
    ("cryo-slime", (92, 72)),
    ("hilichurl-fighter", (114, 96)),
    ("hilichurl-shooter", (114, 96)),
    ("mutated-mitachurl", (178, 158)),
)
ENEMY_ACTIONS = ("idle", "walk", "attack")
SKILL_EFFECTS = (
    ("cryo-fx", (96, 64)),
    ("hydro-fx", (64, 48)),
    ("freeze-fx", (68, 86)),
    ("salon-bubble-fx", (72, 76)),
    ("ayaka-skill-fx", (148, 148)),
    ("ayaka-burst-fx", (164, 148)),
    ("furina-skill-fx", (128, 118)),
    ("furina-burst-fx", (154, 138)),
)


def crop_asset(
    sheet_name: str,
    output_name: str,
    box: tuple[int, int, int, int],
    max_size: tuple[int, int],
) -> None:
    sheet = Image.open(SOURCE / sheet_name).convert("RGBA")
    asset = sheet.crop(box)
    alpha_box = asset.getchannel("A").getbbox()
    if alpha_box is None:
        raise ValueError(f"{output_name}: crop is fully transparent")
    asset = asset.crop(alpha_box)
    asset.thumbnail(max_size, Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", (asset.width + 8, asset.height + 8), (0, 0, 0, 0))
    canvas.alpha_composite(asset, (4, 4))
    canvas.save(OUTPUT / output_name)


def split_walk_sheet(sheet_name: str, character: str) -> None:
    sheet = Image.open(SOURCE / sheet_name).convert("RGBA")
    cell_width = sheet.width // 3
    cell_height = sheet.height // 4
    for row, direction in enumerate(DIRECTIONS):
        for frame in range(3):
            asset = sheet.crop(
                (
                    frame * cell_width,
                    row * cell_height,
                    (frame + 1) * cell_width,
                    (row + 1) * cell_height,
                )
            )
            alpha_box = asset.getchannel("A").getbbox()
            output_name = f"{character}-{direction}-{frame}.png"
            if alpha_box is None:
                raise ValueError(f"{output_name}: crop is fully transparent")
            asset = asset.crop(alpha_box)
            asset.thumbnail((62, 80), Image.Resampling.NEAREST)
            canvas = Image.new("RGBA", (72, 88), (0, 0, 0, 0))
            canvas.alpha_composite(asset, ((canvas.width - asset.width) // 2, canvas.height - asset.height - 4))
            canvas.save(OUTPUT / output_name)
            print(f"Wrote {OUTPUT / output_name}")


def split_attack_sheet(sheet_name: str, character: str) -> None:
    sheet = Image.open(SOURCE / sheet_name).convert("RGBA")
    cell_width = sheet.width // 3
    cell_height = sheet.height // 4
    for row, direction in enumerate(DIRECTIONS):
        for frame in range(3):
            asset = sheet.crop(
                (
                    frame * cell_width,
                    row * cell_height,
                    (frame + 1) * cell_width,
                    (row + 1) * cell_height,
                )
            )
            alpha_box = asset.getchannel("A").getbbox()
            output_name = f"{character}-attack-{direction}-{frame}.png"
            if alpha_box is None:
                raise ValueError(f"{output_name}: crop is fully transparent")
            asset = asset.crop(alpha_box)
            asset.thumbnail((112, 80), Image.Resampling.NEAREST)
            canvas = Image.new("RGBA", (120, 88), (0, 0, 0, 0))
            canvas.alpha_composite(asset, ((canvas.width - asset.width) // 2, canvas.height - asset.height - 4))
            canvas.save(OUTPUT / output_name)
            print(f"Wrote {OUTPUT / output_name}")


def save_fixed_canvas(
    asset: Image.Image,
    output_name: str,
    canvas_size: tuple[int, int],
    y_offset: int = 0,
) -> None:
    alpha_box = asset.getchannel("A").getbbox()
    if alpha_box is None:
        raise ValueError(f"{output_name}: crop is fully transparent")
    asset = asset.crop(alpha_box)
    asset.thumbnail((canvas_size[0] - 8, canvas_size[1] - 8), Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    canvas.alpha_composite(asset, ((canvas.width - asset.width) // 2, canvas.height - asset.height - 4 + y_offset))
    canvas.save(OUTPUT / output_name)
    print(f"Wrote {OUTPUT / output_name}")


def split_enemy_sheet() -> None:
    sheet = Image.open(SOURCE / "windrise-enemy-actions.png").convert("RGBA")
    cell_width = sheet.width // 3
    cell_height = sheet.height // 5
    for row, (enemy, canvas_size) in enumerate(ENEMIES):
        key_poses = [
            sheet.crop(
                (
                    column * cell_width,
                    row * cell_height,
                    (column + 1) * cell_width,
                    (row + 1) * cell_height,
                )
            )
            for column in range(3)
        ]
        sequences = {
            "idle": ((0, 0), (0, -1), (0, 0)),
            "walk": ((0, 0), (1, -3), (0, 0)),
            "attack": ((1, -2), (2, 0), (0, 0)),
        }
        for action, sequence in sequences.items():
            for frame, (pose, y_offset) in enumerate(sequence):
                save_fixed_canvas(key_poses[pose], f"{enemy}-{action}-{frame}.png", canvas_size, y_offset)


def split_skill_sheet() -> None:
    sheet = Image.open(SOURCE / "windrise-skill-effects.png").convert("RGBA")
    cell_width = sheet.width // 4
    cell_height = sheet.height // 2
    for index, (effect, canvas_size) in enumerate(SKILL_EFFECTS):
        row, column = divmod(index, 4)
        asset = sheet.crop(
            (
                column * cell_width,
                row * cell_height,
                (column + 1) * cell_width,
                (row + 1) * cell_height,
            )
        )
        save_fixed_canvas(asset, f"{effect}.png", canvas_size)


def copy_pattern(pattern: str, destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    for asset in OUTPUT.glob(pattern):
        copy2(asset, destination / asset.name)


def build_art_pack() -> None:
    for source, destination in (
        (ROOT / "assets" / "source" / "characters", ART_PACK / "source-atlases" / "characters"),
        (ROOT / "assets" / "source" / "enemies", ART_PACK / "source-atlases" / "enemies"),
        (ROOT / "assets" / "source" / "skills", ART_PACK / "source-atlases" / "skills"),
        (ROOT / "assets" / "source" / "environment", ART_PACK / "source-atlases" / "environment"),
    ):
        destination.mkdir(parents=True, exist_ok=True)
        for asset in source.glob("*.png"):
            copy2(asset, destination / asset.name)
    copy_pattern("ayaka*.png", ART_PACK / "game-ready" / "characters" / "ayaka")
    copy_pattern("furina*.png", ART_PACK / "game-ready" / "characters" / "furina")
    for enemy, _ in ENEMIES:
        copy_pattern(f"{enemy}*.png", ART_PACK / "game-ready" / "enemies" / enemy)
    for effect, _ in SKILL_EFFECTS:
        copy_pattern(f"{effect}.png", ART_PACK / "game-ready" / "skills")
    for name in ("tree", "tent", "crate", "ruin", "bush", "flower", "gate", "path"):
        copy_pattern(f"{name}.png", ART_PACK / "game-ready" / "environment")


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    assets = [
        ("ayaka.png", "ayaka.png", (120, 90, 710, 940), (58, 78)),
        ("furina.png", "furina.png", (160, 20, 860, 870), (58, 78)),
        ("windrise-enemies.png", "hydro-slime.png", (20, 400, 300, 840), (52, 48)),
        ("windrise-enemies.png", "cryo-slime.png", (280, 360, 610, 850), (54, 52)),
        ("windrise-enemies.png", "hilichurl-fighter.png", (560, 260, 930, 850), (58, 72)),
        ("windrise-enemies.png", "hilichurl-shooter.png", (870, 270, 1250, 850), (58, 72)),
        ("windrise-enemies.png", "mutated-mitachurl.png", (1180, 80, 1717, 900), (112, 126)),
        ("windrise-environment.png", "tree.png", (0, 0, 630, 760), (270, 300)),
        ("windrise-environment.png", "tent.png", (590, 0, 1120, 410), (150, 112)),
        ("windrise-environment.png", "crate.png", (1130, 40, 1510, 390), (66, 66)),
        ("windrise-environment.png", "ruin.png", (560, 330, 930, 780), (92, 132)),
        ("windrise-environment.png", "bush.png", (870, 400, 1270, 760), (96, 66)),
        ("windrise-environment.png", "flower.png", (1230, 370, 1536, 760), (34, 52)),
        ("windrise-environment.png", "gate.png", (80, 680, 650, 1024), (148, 104)),
        ("windrise-environment.png", "path.png", (650, 700, 1536, 1024), (260, 96)),
    ]
    for sheet, name, box, max_size in assets:
        crop_asset(sheet, name, box, max_size)
        print(f"Wrote {OUTPUT / name}")
    split_walk_sheet("ayaka-walk.png", "ayaka")
    split_walk_sheet("furina-walk.png", "furina")
    split_attack_sheet("ayaka-attack.png", "ayaka")
    split_attack_sheet("furina-attack.png", "furina")
    split_enemy_sheet()
    split_skill_sheet()
    build_art_pack()


if __name__ == "__main__":
    main()
