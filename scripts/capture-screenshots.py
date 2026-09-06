#!/usr/bin/env python3
"""Capture the screenshot gallery from a booted simulator, in both appearances.

    python3 scripts/capture-screenshots.py <udid> <output-dir>

Requires src/screenshots/config.ts to have SCREENSHOT_MODE = true and
AUTO_ADVANCE_MS set, because simctl cannot tap.

If Metro is not on 8081 -- another project's dev server may already hold it --
point the installed app at the right one before running this, or it will
happily load the other project's bundle:

    xcrun simctl spawn <udid> defaults write com.obligio.app \
      RCT_jsLocation "localhost:8082"

Bundle-load time varies by seconds, so this does not sleep a fixed amount and
hope it lands on frame one. It samples the screen continuously for two full
cycles, groups consecutive identical samples into runs -- one run per frame,
since each frame holds still while it is shown -- and takes the middle sample
of each run. The first run is discarded: it is however much of a frame was
left when sampling started.
"""
from __future__ import annotations

import hashlib
import pathlib
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass

FRAMES = ["dashboard", "calendar", "documents", "suggested", "paywall"]
ADVANCE_S = 3.5
SAMPLE_S = 0.5
BUNDLE = "com.obligio.app"


@dataclass
class Sample:
    digest: str
    data: bytes
    at: float


def simctl(*args: str) -> None:
    subprocess.run(["xcrun", "simctl", *args], check=True, capture_output=True)


def sample(udid: str, path: pathlib.Path) -> str:
    simctl("io", udid, "screenshot", "--type", "png", str(path))
    return hashlib.sha256(path.read_bytes()).hexdigest()


def runs_of(samples: list[Sample]) -> list[list[Sample]]:
    """Group consecutive identical samples: one run per settled frame."""
    grouped: list[list[Sample]] = []
    for item in samples:
        if grouped and grouped[-1][0].digest == item.digest:
            grouped[-1].append(item)
        else:
            grouped.append([item])
    return grouped


def span_of(runs: list[list[Sample]], index: int) -> float:
    """How long a run held the screen, measured to the next run's first sample."""
    start = runs[index][0].at
    end = runs[index + 1][0].at if index + 1 < len(runs) else runs[index][-1].at
    return end - start


def capture(udid: str, scheme: str, dest: pathlib.Path) -> None:
    simctl("ui", udid, "appearance", scheme)
    # A ticking clock changes the screenshot, which would split one frame's
    # run in two. Apple's own marketing time also keeps the frames consistent.
    simctl(
        "status_bar", udid, "override",
        "--time", "9:41", "--dataNetwork", "wifi", "--wifiBars", "3",
        "--cellularBars", "4", "--batteryState", "charging", "--batteryLevel", "100",
    )
    # --terminate-running-process, not a bare launch: launching an app that is
    # already running only foregrounds it, so the gallery keeps its frame index
    # and every capture comes out shifted by however far it had already got.
    simctl("launch", "--terminate-running-process", udid, BUNDLE)

    # Two cycles: the first frame boundary is wherever the bundle finished
    # loading, so a whole clean cycle is only guaranteed after it.
    deadline = time.monotonic() + ADVANCE_S * (len(FRAMES) * 2 + 3)
    samples: list[Sample] = []
    with tempfile.TemporaryDirectory() as tmp:
        shot = pathlib.Path(tmp) / "shot.png"
        while time.monotonic() < deadline:
            digest = sample(udid, shot)
            samples.append(Sample(digest, shot.read_bytes(), time.monotonic()))
            time.sleep(SAMPLE_S)

    # Filter on how long a run held the screen, not on how many samples it
    # collected: a screenshot costs a few hundred milliseconds more than
    # SAMPLE_S, so the sample count per frame drifts with machine load, and a
    # count threshold silently drops a real frame and shifts every caption.
    grouped = runs_of(samples)
    stable = [
        ([item.data for item in run], span_of(grouped, index))
        for index, run in enumerate(grouped)
        if span_of(grouped, index) >= ADVANCE_S * 0.6
    ]

    if len(stable) < len(FRAMES):
        raise SystemExit(
            f"{scheme}: found {len(stable)} settled frames, need {len(FRAMES)}. "
            "Is SCREENSHOT_MODE on and AUTO_ADVANCE_MS set?"
        )

    # The gallery holds its first frame for two steps, so the longest run is
    # the start of a cycle. Anchoring there beats assuming the first settled
    # run is frame one: on a cold bundle load it often is not.
    start = max(range(len(stable)), key=lambda i: stable[i][1])
    cycle = stable[start:start + len(FRAMES)]
    if len(cycle) < len(FRAMES):
        raise SystemExit(
            f"{scheme}: cycle starts at run {start} but only {len(stable)} settled "
            "frames were captured; sample for longer."
        )

    for position, (name, (run, _)) in enumerate(zip(FRAMES, cycle), start=1):
        out = dest / f"{scheme}-{position}-{name}.png"
        out.write_bytes(run[len(run) // 2])
        print(f"captured {out.name}")


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: capture-screenshots.py <udid> <output-dir>")
    udid, dest = sys.argv[1], pathlib.Path(sys.argv[2])
    dest.mkdir(parents=True, exist_ok=True)
    for scheme in ("light", "dark"):
        capture(udid, scheme, dest)
    simctl("ui", udid, "appearance", "light")
    print(f"captures in {dest}")


if __name__ == "__main__":
    main()
