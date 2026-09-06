#!/usr/bin/env python3
"""Build the two listing graphics Play requires beyond screenshots.

    python3 scripts/build-play-graphics.py

Play asks for a 512x512 app icon and a 1024x500 feature graphic. The icon is
the shipping app icon at Play's size; the feature graphic is a brand banner
built from the same mark and palette, so the listing, the icon and the
screenshots all read as one product.

Play crops the feature graphic on some surfaces, so nothing that carries
meaning sits near an edge.
"""
from __future__ import annotations

import pathlib

from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEST = ROOT / "fastlane/metadata/android/en-US/images"

# Same palette as scripts/generate-icons.py and src/designTokens.ts.
BACKGROUND = (0x16, 0x3E, 0x31)   # forest800
INK = (0xEC, 0xF3, 0xEF)          # mint50
SUB = (0x8F, 0xB8, 0xA2)          # mint300

FONT = "/System/Library/Fonts/Helvetica.ttc"
FEATURE = (1024, 500)


def font(size: int, index: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT, size, index=index)


def build_icon() -> pathlib.Path:
    master = ROOT / "ios/ComplianceCalendar/Images.xcassets/AppIcon.appiconset/icon-1024.png"
    out = DEST / "icon.png"
    # Play wants a square 512 PNG with no alpha, same as the App Store master.
    Image.open(master).convert("RGB").resize((512, 512), Image.LANCZOS).save(out)
    return out


def build_feature_graphic() -> pathlib.Path:
    canvas = Image.new("RGB", FEATURE, BACKGROUND)
    draw = ImageDraw.Draw(canvas)

    title_font, tagline_font = font(78, 1), font(40, 1)
    tagline = ("Never lose a license", "to a date you forgot.")

    mark = Image.open(DEST / "icon.png").convert("RGB").resize((228, 228), Image.LANCZOS)
    gap = 62
    text_width = max(
        draw.textlength("Obligio", font=title_font),
        *(draw.textlength(line, font=tagline_font) for line in tagline),
    )

    # Centre the mark-and-text group, so the crop Play applies on some
    # surfaces eats empty background rather than the wordmark.
    left = round((FEATURE[0] - (mark.size[0] + gap + text_width)) / 2)

    rounded = Image.new("L", mark.size, 0)
    ImageDraw.Draw(rounded).rounded_rectangle([0, 0, mark.size[0] - 1, mark.size[1] - 1], radius=50, fill=255)
    canvas.paste(mark, (left, (FEATURE[1] - mark.size[1]) // 2), rounded)

    x = left + mark.size[0] + gap
    draw.text((x, 168), "Obligio", font=title_font, fill=INK)
    for i, line in enumerate(tagline):
        draw.text((x, 268 + i * 50), line, font=tagline_font, fill=SUB)

    out = DEST / "featureGraphic.png"
    canvas.save(out)
    return out


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    for path in (build_icon(), build_feature_graphic()):
        size = Image.open(path).size
        print(f"{path.relative_to(ROOT)}  {size[0]}x{size[1]}")


if __name__ == "__main__":
    main()
