from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "assets" / "generated"
OUTPUT = ROOT / "public" / "assets" / "runtime"


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


if __name__ == "__main__":
    main()
