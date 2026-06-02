# Windrise RPG Art Pack

This folder is the shareable art package for the browser-game prototype.

## Structure

- `source-atlases/characters`: original image2 character sheets with chroma-key backgrounds.
- `source-atlases/enemies`: original image2 enemy sheets with chroma-key backgrounds.
- `source-atlases/skills`: original image2 elemental effect sheets with chroma-key backgrounds.
- `source-atlases/environment`: original image2 Windrise environment prop sheet.
- `game-ready/characters`: transparent runtime character frames, organized by character.
- `game-ready/enemies`: transparent runtime enemy frames, organized by enemy type.
- `game-ready/skills`: transparent runtime skill-effect sprites.
- `game-ready/environment`: transparent runtime environment props.

## Animation Naming

Character movement:

```text
<character>-<direction>-<frame>.png
```

Character normal attack:

```text
<character>-attack-<direction>-<frame>.png
```

Enemy animation:

```text
<enemy>-<idle|walk|attack>-<frame>.png
```

## Rebuild

Run this from the project root after replacing an image2 source atlas:

```powershell
python scripts\process_generated_assets.py
```

The script refreshes runtime PNGs and copies the categorized deliverables into this folder.
