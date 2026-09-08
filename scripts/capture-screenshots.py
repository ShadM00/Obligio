#!/usr/bin/env python3
"""Capture the screenshot gallery from a booted device, in both appearances.

    python3 scripts/capture-screenshots.py ios <udid> <output-dir>
    python3 scripts/capture-screenshots.py android <serial> <output-dir>

Requires src/screenshots/config.ts to have SCREENSHOT_MODE = true and
AUTO_ADVANCE_MS set, because neither simctl nor adb can tap. Set ADVANCE_S in
the environment to the same number of seconds:

    AUTO_ADVANCE_MS = 3500   ->  ADVANCE_S=3.5   (iOS)
    AUTO_ADVANCE_MS = 9000   ->  ADVANCE_S=9     (Android)

Android needs the longer dwell. Its scrolling calendar and its modals repaint
several times while settling, and each repaint ends a run -- at 3.5s those
screens never hold still long enough to be recognised as frames, and are
dropped. The run is refused rather than written when that happens.

The harness renders fixture data and needs no session, so this works even while
authentication is down.

If Metro is not on 8081 -- another project's dev server may already hold it --
point the installed app at the right one first, or it will happily load that
project's bundle:

    xcrun simctl spawn <udid> defaults write com.obligio.app \\
      RCT_jsLocation "localhost:8082"
    adb -s <serial> reverse tcp:8082 tcp:8082

Bundle-load time varies by seconds, so this does not sleep a fixed amount and
hope it lands on frame one. It samples the screen continuously for two full
cycles, groups consecutive identical samples into runs -- one run per frame,
since each frame holds still while it is shown -- and takes the middle sample
of each run.
"""
from __future__ import annotations

import hashlib
import os
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path

FRAMES = ["dashboard", "calendar", "documents", "suggested", "paywall"]
ADVANCE_S = float(os.environ.get("ADVANCE_S", "3.5"))
SAMPLE_S = 0.5
BUNDLE = "com.obligio.app"
ANDROID_ACTIVITY = "com.compliancecalendar.MainActivity"


@dataclass
class Sample:
    digest: str
    data: bytes
    at: float


def run(*args: str) -> bytes:
    return subprocess.run(args, check=True, capture_output=True).stdout


class Device:
    """The three things a capture needs of a platform, plus a way to tidy up."""

    def __init__(self, target: str) -> None:
        self.target = target

    def appearance(self, scheme: str) -> None:
        raise NotImplementedError

    def relaunch(self) -> None:
        raise NotImplementedError

    def screenshot(self) -> bytes:
        raise NotImplementedError

    def restore(self) -> None:
        self.appearance("light")


class IOSDevice(Device):
    def _simctl(self, *args: str) -> bytes:
        return run("xcrun", "simctl", *args)

    def appearance(self, scheme: str) -> None:
        self._simctl("ui", self.target, "appearance", scheme)
        # A ticking clock changes the screenshot, which would split one frame's
        # run in two. Apple's own marketing time also keeps frames consistent.
        self._simctl(
            "status_bar", self.target, "override",
            "--time", "9:41", "--dataNetwork", "wifi", "--wifiBars", "3",
            "--cellularBars", "4", "--batteryState", "charging", "--batteryLevel", "100",
        )

    def relaunch(self) -> None:
        # --terminate-running-process, not a bare launch: launching an app that
        # is already running only foregrounds it, so the gallery keeps its frame
        # index and every capture comes out shifted by however far it had got.
        self._simctl("launch", "--terminate-running-process", self.target, BUNDLE)

    def screenshot(self) -> bytes:
        with tempfile.TemporaryDirectory() as tmp:
            shot = Path(tmp) / "s.png"
            self._simctl("io", self.target, "screenshot", "--type", "png", str(shot))
            return shot.read_bytes()


class AndroidDevice(Device):
    # SystemUI demo mode is Android's answer to simctl's status bar override.
    # Without it the clock ticks and the wifi and battery icons drift, and every
    # such change splits a frame's run in two.
    DEMO = [
        ["command", "enter"],
        ["command", "clock", "hhmm", "0941"],
        ["command", "battery", "level", "100", "plugged", "false"],
        ["command", "network", "wifi", "show", "level", "4"],
        ["command", "network", "mobile", "show", "level", "4"],
        ["command", "notifications", "visible", "false"],
    ]

    def _adb(self, *args: str) -> bytes:
        return run("adb", "-s", self.target, *args)

    def _demo(self, pairs: list[str]) -> None:
        extras: list[str] = []
        for key, value in zip(pairs[::2], pairs[1::2]):
            extras += ["-e", key, value]
        self._adb("shell", "am", "broadcast", "-a", "com.android.systemui.demo", *extras)

    def appearance(self, scheme: str) -> None:
        self._adb("shell", "cmd", "uimode", "night", "yes" if scheme == "dark" else "no")
        self._adb("shell", "settings", "put", "global", "sysui_demo_allowed", "1")
        for command in self.DEMO:
            self._demo(command)

    def relaunch(self) -> None:
        # force-stop then start: `am start` on a running app resumes it, which
        # leaves the gallery on whatever frame it had already reached.
        self._adb("shell", "am", "force-stop", BUNDLE)
        self._adb("shell", "am", "start", "-n", f"{BUNDLE}/{ANDROID_ACTIVITY}")

    def screenshot(self) -> bytes:
        return self._adb("exec-out", "screencap", "-p")

    def restore(self) -> None:
        super().restore()
        self._demo(["command", "exit"])


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


def settled(grouped: list[list[Sample]]) -> list[tuple[list[bytes], float]]:
    """Runs that held the screen long enough to be a frame rather than a blink.

    Filtered on elapsed time, not on how many samples a run collected: a
    screenshot costs more than SAMPLE_S and that overhead differs by an order
    of magnitude between platforms, so a count threshold silently drops a real
    frame and shifts every caption by one.
    """
    return [
        ([item.data for item in run], span_of(grouped, index))
        for index, run in enumerate(grouped)
        if span_of(grouped, index) >= ADVANCE_S * 0.6
    ]


def capture(device: Device, scheme: str, dest: Path) -> None:
    device.appearance(scheme)
    device.relaunch()

    # Sample until enough settled frames exist to hold a whole cycle after the
    # longest run, rather than for a fixed stretch of time. An adb screencap
    # costs several times what simctl's does, so a duration tuned on a
    # simulator collects far too few frames on a device and the cycle runs off
    # the end of what was captured.
    hard_stop = time.monotonic() + ADVANCE_S * (len(FRAMES) * 2 + 3) * 4
    samples: list[Sample] = []
    while time.monotonic() < hard_stop:
        data = device.screenshot()
        samples.append(Sample(hashlib.sha256(data).hexdigest(), data, time.monotonic()))
        if len(settled(runs_of(samples))) >= len(FRAMES) * 2 + 1:
            break
        time.sleep(SAMPLE_S)

    grouped = runs_of(samples)
    stable = settled(grouped)

    if len(stable) < len(FRAMES):
        raise SystemExit(
            f"{scheme}: found {len(stable)} settled frames, need {len(FRAMES)}. "
            "Is SCREENSHOT_MODE on and AUTO_ADVANCE_MS set?"
        )

    # The gallery holds its first frame for two steps, so the longest run is
    # the start of a cycle. Anchoring there beats assuming the first settled run
    # is frame one: on a cold bundle load it often is not.
    start = max(range(len(stable)), key=lambda i: stable[i][1])
    cycle = stable[start:start + len(FRAMES)]
    if len(cycle) < len(FRAMES):
        raise SystemExit(
            f"{scheme}: cycle starts at run {start} but only {len(stable)} settled "
            "frames were captured; sample for longer."
        )

    chosen = [frames[len(frames) // 2] for frames, _ in cycle]

    # Every frame in the gallery shows a different screen, so two identical
    # captures mean the cycle was misread and the run is silently mislabelled --
    # captions attached to the wrong screenshots, which is exactly the kind of
    # thing that reaches a store listing unnoticed. Refuse rather than write it.
    digests = [hashlib.sha256(shot).hexdigest() for shot in chosen]
    if len(set(digests)) != len(FRAMES):
        repeated = [FRAMES[i] for i, d in enumerate(digests) if digests.count(d) > 1]
        raise SystemExit(
            f"{scheme}: captured {len(set(digests))} distinct frames for {len(FRAMES)} "
            f"slots; {', '.join(repeated)} are duplicates. The frames were misread, so "
            "the captions would be attached to the wrong screens. Raise AUTO_ADVANCE_MS "
            "so each frame settles for longer, and re-run."
        )

    for position, (name, shot) in enumerate(zip(FRAMES, chosen), start=1):
        out = dest / f"{scheme}-{position}-{name}.png"
        out.write_bytes(shot)
        print(f"captured {out.name}")


def main() -> None:
    if len(sys.argv) != 4 or sys.argv[1] not in {"ios", "android"}:
        raise SystemExit(
            "usage: capture-screenshots.py <ios|android> <udid-or-serial> <output-dir>"
        )
    platform, target, dest = sys.argv[1], sys.argv[2], Path(sys.argv[3])
    device: Device = IOSDevice(target) if platform == "ios" else AndroidDevice(target)

    dest.mkdir(parents=True, exist_ok=True)
    try:
        for scheme in ("light", "dark"):
            capture(device, scheme, dest)
    finally:
        device.restore()
    print(f"captures in {dest}")


if __name__ == "__main__":
    main()
