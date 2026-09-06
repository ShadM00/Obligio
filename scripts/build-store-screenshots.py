#!/usr/bin/env python3
"""Composite App Store / Play listing screenshots from real device captures.

App Store guideline 2.3.3 requires screenshots to show the app as it actually
runs, so the device capture underneath is never redrawn or faked. What is added
here is the marketing treatment around it — brand background, a caption, and a
rounded device frame — which is what every competitor in this category does and
where the conversion difference lives.

    python3 scripts/build-store-screenshots.py <captures-dir> <output-dir>

Captures are expected at 6.9" resolution (1320x2868), named
<scheme>-<n>-<slug>.png as produced by the screenshot harness.
"""
from __future__ import annotations

import pathlib
import sys

from PIL import Image, ImageDraw, ImageFont

# 6.7" (1290x2796). Apple accepts this for the 6.9" slot and scales it up,
# and it is the largest iPhone size fastlane's deliver knows about -- deliver
# rejects a 1320x2868 file outright as an invalid screen size. Play takes it
# as a phone screenshot unchanged.
CANVAS = (1290, 2796)

# The layout below was drawn against this canvas; everything derives from it
# so the composition holds if CANVAS changes again.
DESIGN = (1320, 2868)
SCALE = CANVAS[1] / DESIGN[1]

FONT_BOLD = "/System/Library/Fonts/Helvetica.ttc"

# Brand palette, matching src/designTokens.ts.
LIGHT = {"bg": (0xD8, 0xE9, 0xDF), "ink": (0x13, 0x25, 0x1D), "sub": (0x3F, 0x5A, 0x4C)}
DARK = {"bg": (0x14, 0x2A, 0x22), "ink": (0xEC, 0xF3, 0xEF), "sub": (0x8F, 0xB8, 0xA2)}

# Caption per frame slug. Kept short: on a store card these are read at a
# glance, at roughly a third of this size.
CAPTIONS = {
    "dashboard": ("Every obligation,", "one clear view"),
    "calendar": ("Grouped by month,", "never by surprise"),
    "documents": ("Proof attached", "to the obligation"),
    "suggested": ("Federal deadlines,", "with the source"),
    "paywall": ("Three free to start,", "unlimited with Plus"),
}

CAPTION_TOP = round(150 * SCALE)
CAPTION_SIZE = round(92 * SCALE)
CAPTION_GAP = round(112 * SCALE)
DEVICE_INSET = round(96 * SCALE)   # side margin for the device
DEVICE_TOP = round(560 * SCALE)    # where the device starts
CORNER = round(56 * SCALE)


def rounded(image: Image.Image, radius: int) -> Image.Image:
    mask = Image.new("L", image.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *[d - 1 for d in image.size]), radius=radius, fill=255)
    out = image.convert("RGBA")
    out.putalpha(mask)
    return out


def compose(capture: pathlib.Path, slug: str, scheme: str) -> Image.Image:
    palette = DARK if scheme == "dark" else LIGHT
    canvas = Image.new("RGB", CANVAS, palette["bg"])
    draw = ImageDraw.Draw(canvas)

    line1, line2 = CAPTIONS[slug]
    font = ImageFont.truetype(FONT_BOLD, CAPTION_SIZE, index=1)  # Helvetica Bold
    for i, line in enumerate((line1, line2)):
        width = draw.textbbox((0, 0), line, font=font)[2]
        colour = palette["ink"] if i == 0 else palette["sub"]
        draw.text(((CANVAS[0] - width) // 2, CAPTION_TOP + i * CAPTION_GAP), line, font=font, fill=colour)

    # The real capture, scaled to the available width and clipped at the
    # bottom of the canvas rather than squashed.
    shot = Image.open(capture).convert("RGB")
    target_w = CANVAS[0] - DEVICE_INSET * 2
    scale = target_w / shot.width
    shot = shot.resize((target_w, int(shot.height * scale)), Image.LANCZOS)
    available = CANVAS[1] - DEVICE_TOP
    if shot.height > available:
        shot = shot.crop((0, 0, shot.width, available))

    framed = rounded(shot, CORNER)
    canvas.paste(framed, (DEVICE_INSET, DEVICE_TOP), framed)
    return canvas


def main() -> None:
    src = pathlib.Path(sys.argv[1])
    dest = pathlib.Path(sys.argv[2])
    dest.mkdir(parents=True, exist_ok=True)

    built = 0
    for capture in sorted(src.glob("*-*-*.png")):
        scheme, _order, slug = capture.stem.split("-", 2)
        if slug not in CAPTIONS:
            continue
        out = dest / f"{scheme}-{_order}-{slug}.png"
        compose(capture, slug, scheme).save(out)
        built += 1
    print(f"composed {built} store screenshots into {dest}")


if __name__ == "__main__":
    main()
