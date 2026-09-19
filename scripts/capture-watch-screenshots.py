#!/usr/bin/env python3
"""Capture store screenshots of the watch apps from sample data.

    python3 scripts/capture-watch-screenshots.py watchos <simulator-udid> <out-dir>
    python3 scripts/capture-watch-screenshots.py wearos  <adb-serial>     <out-dir>

The watch apps show whatever the phone sends, so rather than pairing a phone
simulator, a debug build loads `scripts/watch-fixtures/<locale>.json` -- made by
the phone's own makeWatchSnapshot and kept honest by watchFixtures.test.ts.
Install a Debug build of the watch app first; release builds ignore fixtures.

Two screens per language: the list, and one obligation opened. The sync time
is stamped a few minutes back so the list reads "Synced 3 minutes ago" rather
than "in 0 seconds".
"""
from __future__ import annotations

import base64
import json
import os
import pathlib
import subprocess
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
FIXTURES = ROOT / "scripts" / "watch-fixtures"
LOCALES = ["en-US", "es-US"]
WATCHOS_BUNDLE = "com.obligio.app.watchkitapp"
WEAR_ACTIVITY = "com.obligio.app/com.obligio.watch.MainActivity"
# Seconds to let the app draw before capturing; raise it on a slow emulator.
SETTLE_S = float(os.environ.get("WATCH_SETTLE_S", "6"))


def fixture(locale: str) -> dict:
    data = json.loads((FIXTURES / f"{locale}.json").read_text())
    data["updatedAt"] = int((time.time() - 3 * 60) * 1000)
    return data


def run(*args: str, env: dict | None = None) -> None:
    subprocess.run(args, check=True, capture_output=True, env=env)


def watchos(udid: str, dest: pathlib.Path) -> None:
    for locale in LOCALES:
        data = fixture(locale)
        shots = [("1-list", None), ("2-detail", data["items"][0]["id"])]
        for name, open_id in shots:
            env = dict(os.environ)
            # simctl passes SIMCTL_CHILD_* through to the launched process.
            env["SIMCTL_CHILD_OBLIGIO_WATCH_FIXTURE"] = json.dumps(data, ensure_ascii=False)
            if open_id:
                env["SIMCTL_CHILD_OBLIGIO_WATCH_OPEN"] = open_id
            run("xcrun", "simctl", "launch", "--terminate-running-process", udid, WATCHOS_BUNDLE, env=env)
            time.sleep(SETTLE_S)
            out = dest / f"{locale}-watch-{name}.png"
            run("xcrun", "simctl", "io", udid, "screenshot", "--type", "png", str(out))
            print(f"captured {out.name}")


def wearos(serial: str, dest: pathlib.Path) -> None:
    for locale in LOCALES:
        data = fixture(locale)
        encoded = base64.b64encode(json.dumps(data, ensure_ascii=False).encode()).decode()
        shots = [("1-list", None), ("2-detail", data["items"][0]["id"])]
        for name, open_id in shots:
            extras = ["--es", "fixture64", encoded]
            if open_id:
                extras += ["--es", "open", open_id]
            run("adb", "-s", serial, "shell", "am", "force-stop", "com.obligio.app")
            # -W returns once the activity has drawn, so a slow emulator is not
            # captured on its launch splash.
            run("adb", "-s", serial, "shell", "am", "start", "-W", "-n", WEAR_ACTIVITY, *extras)
            time.sleep(SETTLE_S)
            out = dest / f"{locale}-wear-{name}.png"
            png = subprocess.run(["adb", "-s", serial, "exec-out", "screencap", "-p"], check=True, capture_output=True).stdout
            out.write_bytes(png)
            print(f"captured {out.name}")


def main() -> None:
    if len(sys.argv) != 4 or sys.argv[1] not in ("watchos", "wearos"):
        raise SystemExit(__doc__)
    platform, device, dest = sys.argv[1], sys.argv[2], pathlib.Path(sys.argv[3])
    dest.mkdir(parents=True, exist_ok=True)
    (watchos if platform == "watchos" else wearos)(device, dest)


if __name__ == "__main__":
    main()
