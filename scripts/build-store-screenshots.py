#!/usr/bin/env python3
"""Composite App Store / Play listing screenshots from real device captures.

App Store guideline 2.3.3 requires screenshots to show the app as it actually
runs, so the device capture underneath is never redrawn or faked. What is added
here is the marketing treatment around it — brand background, a caption, and a
rounded device frame — which is what every competitor in this category does and
where the conversion difference lives.

    python3 scripts/build-store-screenshots.py <captures-dir> <output-dir> [locale]

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

# Caption per locale and frame slug. Kept short: on a store card these are read
# at a glance, at roughly a third of this size. A frame with no caption here is
# not composed at all, which is how the paywall capture stays out of the
# listing: App Store guideline 2.3.7 treats prices, and "free", as metadata
# references.
CAPTIONS = {
    "en-US": {
        "dashboard": ("Every obligation,", "one clear view"),
        "calendar": ("Grouped by month,", "never by surprise"),
        "documents": ("Proof attached", "to the obligation"),
        "suggested": ("Federal deadlines,", "with the source"),
        "detail": ("Mark it done,", "the next one is set"),
    },
    "es-MX": {
        "dashboard": ("Cada obligación,", "en una vista clara"),
        "calendar": ("Agrupadas por mes,", "sin sorpresas"),
        "documents": ("La prueba adjunta", "a la obligación"),
        "detail": ("Márcala como hecha,", "la próxima queda lista"),
    },
}

# The suggestions frame shows US federal forms (Form 941, OSHA 300A). The
# catalogue has no Mexican entries, so the es-MX listing leaves that frame out
# rather than show content that does not apply to its audience.
SKIP = {"es-MX": {"suggested"}}

# Every frame shows fixture data, never an owner's real obligations. Said once,
# small, between the caption and the device.
SAMPLE_LABEL = {"en-US": "Sample data", "es-MX": "Datos de ejemplo"}

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


def draw_sample_label(canvas: Image.Image, palette: dict, locale: str) -> None:
    """Writes the sample-data note on the flat strip above the device."""
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype(FONT_BOLD, round(46 * SCALE), index=0)
    text = SAMPLE_LABEL[locale]
    width = draw.textbbox((0, 0), text, font=font)[2]
    y = DEVICE_TOP - round(110 * SCALE)
    draw.text(((CANVAS[0] - width) // 2, y), text, font=font, fill=palette["sub"])


def compose(capture: pathlib.Path, slug: str, scheme: str, locale: str) -> Image.Image:
    palette = DARK if scheme == "dark" else LIGHT
    canvas = Image.new("RGB", CANVAS, palette["bg"])
    draw = ImageDraw.Draw(canvas)

    line1, line2 = CAPTIONS[locale][slug]
    font = ImageFont.truetype(FONT_BOLD, CAPTION_SIZE, index=1)  # Helvetica Bold
    for i, line in enumerate((line1, line2)):
        width = draw.textbbox((0, 0), line, font=font)[2]
        colour = palette["ink"] if i == 0 else palette["sub"]
        draw.text(((CANVAS[0] - width) // 2, CAPTION_TOP + i * CAPTION_GAP), line, font=font, fill=colour)

    draw_sample_label(canvas, palette, locale)

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
    """compose <captures-dir> <output-dir> [locale]  or  --annotate <dir> [locale].

    --annotate adds only the sample-data label to screenshots that were already
    composed, for locales whose raw captures are no longer around.
    """
    args = sys.argv[1:]
    if args and args[0] == "--annotate":
        folder = pathlib.Path(args[1])
        locale = args[2] if len(args) > 2 else "en-US"
        done = 0
        for image_path in sorted(folder.glob("*-*-*.png")):
            scheme = image_path.stem.split("-", 1)[0]
            if scheme not in ("light", "dark"):
                continue  # the Watch frames are not phone listing shots
            palette = DARK if scheme == "dark" else LIGHT
            image = Image.open(image_path).convert("RGB")
            draw_sample_label(image, palette, locale)
            image.save(image_path)
            done += 1
        print(f"annotated {done} screenshots in {folder}")
        return

    src = pathlib.Path(args[0])
    dest = pathlib.Path(args[1])
    locale = args[2] if len(args) > 2 else "en-US"
    dest.mkdir(parents=True, exist_ok=True)

    built = 0
    for capture in sorted(src.glob("*-*-*.png")):
        scheme, _order, slug = capture.stem.split("-", 2)
        if slug in SKIP.get(locale, set()) or slug not in CAPTIONS[locale]:
            continue
        out = dest / f"{scheme}-{_order}-{slug}.png"
        compose(capture, slug, scheme, locale).save(out)
        built += 1
    print(f"composed {built} {locale} store screenshots into {dest}")


if __name__ == "__main__":
    main()
