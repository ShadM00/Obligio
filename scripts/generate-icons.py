#!/usr/bin/env python3
"""Render the Obligio app icon into the iOS and Android icon sets.

ImageMagick's built-in SVG renderer silently drops the stroked check path in
assets/icon.svg and emits a plain green square, so the mark is drawn here
directly from the same geometry. Supersampled 4x and downsampled for clean
antialiasing.

    python3 scripts/generate-icons.py
"""
from __future__ import annotations

import json
import pathlib

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Geometry mirrors assets/icon.svg (viewBox 0 0 1024 1024).
SIZE = 1024
CORNER_RADIUS = 220
BACKGROUND = (0x16, 0x3E, 0x31, 255)   # forest800
MARK = (0xD8, 0xF1, 0xE2, 255)         # mint100
CHECK_COLOUR = (0x5F, 0xD3, 0xA3, 255) # brand green
CHECK = [(356, 566), (440, 650), (630, 460)]
STROKE = 62
SS = 4  # supersampling factor


def draw_check(draw: ImageDraw.ImageDraw, points, width: int, colour) -> None:
    """A polyline with round caps and joins, which Pillow does not do natively."""
    draw.line(points, fill=colour, width=width, joint="curve")
    r = width // 2
    for x, y in points:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=colour)


def draw_mark(draw: ImageDraw.ImageDraw, scale: float = 1.0, offset: int = 0) -> None:
    """The calendar-and-check mark, optionally scaled about the canvas centre.

    `scale` below 1 is used for the Android adaptive foreground, whose art must
    sit inside the central 66% or launcher masks clip it.
    """
    c = SIZE * SS / 2

    def pt(x, y):
        return (c + (x * SS - c) * scale + offset, c + (y * SS - c) * scale + offset)

    def box(x0, y0, x1, y1):
        a, b = pt(x0, y0), pt(x1, y1)
        return (a[0], a[1], b[0], b[1])

    ring_w, ring_h, ring_r = 30, 112, 15
    for x in (322, 497, 672):
        draw.rounded_rectangle(box(x, 200, x + ring_w, 200 + ring_h),
                               radius=int(ring_r * SS * scale), fill=MARK)

    draw.rounded_rectangle(box(240, 272, 784, 784), radius=int(52 * SS * scale),
                           outline=MARK, width=max(1, int(34 * SS * scale)))
    draw.rounded_rectangle(box(240, 272, 784, 376), radius=int(52 * SS * scale), fill=MARK)
    draw.rectangle(box(240, 324, 784, 376), fill=MARK)

    draw_check(draw, [pt(x, y) for x, y in CHECK],
               max(1, int(STROKE * SS * scale)), CHECK_COLOUR)


def render(rounded: bool) -> Image.Image:
    canvas = SIZE * SS
    image = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    if rounded:
        draw.rounded_rectangle((0, 0, canvas - 1, canvas - 1), radius=CORNER_RADIUS * SS, fill=BACKGROUND)
    else:
        draw.rectangle((0, 0, canvas - 1, canvas - 1), fill=BACKGROUND)
    draw_mark(draw)
    return image.resize((SIZE, SIZE), Image.LANCZOS)


def render_foreground() -> Image.Image:
    """Android adaptive foreground: art only, inside the 66% safe zone."""
    canvas = SIZE * SS
    image = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    draw_mark(ImageDraw.Draw(image), scale=0.66)
    return image.resize((SIZE, SIZE), Image.LANCZOS)


def render_round() -> Image.Image:
    canvas = SIZE * SS
    image = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.ellipse((0, 0, canvas - 1, canvas - 1), fill=BACKGROUND)
    draw_mark(draw, scale=0.86)
    return image.resize((SIZE, SIZE), Image.LANCZOS)


# The project targets TARGETED_DEVICE_FAMILY "1,2", so iPad icons are
# required as well as iPhone. Omitting them still builds and signs, and only
# fails at App Store upload with "Missing required icon file ... 167x167".
IOS_ICONS = {
    ("iphone", "20x20", "2x"): ("icon-20@2x.png", 40),
    ("iphone", "20x20", "3x"): ("icon-20@3x.png", 60),
    ("iphone", "29x29", "2x"): ("icon-29@2x.png", 58),
    ("iphone", "29x29", "3x"): ("icon-29@3x.png", 87),
    ("iphone", "40x40", "2x"): ("icon-40@2x.png", 80),
    ("iphone", "40x40", "3x"): ("icon-40@3x.png", 120),
    ("iphone", "60x60", "2x"): ("icon-60@2x.png", 120),
    ("iphone", "60x60", "3x"): ("icon-60@3x.png", 180),
    ("ipad", "20x20", "1x"): ("icon-ipad-20.png", 20),
    ("ipad", "20x20", "2x"): ("icon-ipad-20@2x.png", 40),
    ("ipad", "29x29", "1x"): ("icon-ipad-29.png", 29),
    ("ipad", "29x29", "2x"): ("icon-ipad-29@2x.png", 58),
    ("ipad", "40x40", "1x"): ("icon-ipad-40.png", 40),
    ("ipad", "40x40", "2x"): ("icon-ipad-40@2x.png", 80),
    ("ipad", "76x76", "1x"): ("icon-ipad-76.png", 76),
    ("ipad", "76x76", "2x"): ("icon-ipad-76@2x.png", 152),
    ("ipad", "83.5x83.5", "2x"): ("icon-ipad-83.5@2x.png", 167),
    ("ios-marketing", "1024x1024", "1x"): ("icon-1024.png", 1024),
}

ANDROID_DENSITIES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}


def main() -> None:
    # iOS masks its own corners, so the icon is a full square with no alpha —
    # App Store Connect rejects a marketing icon that has an alpha channel.
    square = render(rounded=False).convert("RGB")
    appicon = ROOT / "ios/ComplianceCalendar/Images.xcassets/AppIcon.appiconset"
    appicon.mkdir(parents=True, exist_ok=True)
    for (name, px) in IOS_ICONS.values():
        square.resize((px, px), Image.LANCZOS).save(appicon / name)

    contents = {
        "images": [
            {"idiom": idiom, "size": size, "scale": scale, "filename": name}
            for (idiom, size, scale), (name, _px) in IOS_ICONS.items()
        ],
        "info": {"author": "xcode", "version": 1},
    }
    (appicon / "Contents.json").write_text(json.dumps(contents, indent=2) + "\n")

    # Android legacy icons are pre-shaped; adaptive icons (API 26+) are drawn
    # from the vector foreground and the background colour instead.
    res = ROOT / "android/app/src/main/res"
    rounded, circular, foreground = render(rounded=True), render_round(), render_foreground()
    for density, px in ANDROID_DENSITIES.items():
        out = res / f"mipmap-{density}"
        out.mkdir(parents=True, exist_ok=True)
        rounded.resize((px, px), Image.LANCZOS).save(out / "ic_launcher.png")
        circular.resize((px, px), Image.LANCZOS).save(out / "ic_launcher_round.png")
        # Adaptive foregrounds are 108dp where 72dp is the safe zone, so they
        # are generated at 1.5x the legacy density bucket.
        foreground.resize((int(px * 1.5), int(px * 1.5)), Image.LANCZOS).save(
            out / "ic_launcher_foreground.png")

    print(f"wrote {len(IOS_ICONS)} iOS icons and {len(ANDROID_DENSITIES) * 2} Android icons")


if __name__ == "__main__":
    main()
