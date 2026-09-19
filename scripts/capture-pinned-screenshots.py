#!/usr/bin/env python3
"""Capture explicit development-gallery frames without inferring their order.

Run Metro and install the debug app first, then:
  python3 scripts/capture-pinned-screenshots.py ios DEVICE_ID OUTPUT_DIR
  python3 scripts/capture-pinned-screenshots.py android SERIAL OUTPUT_DIR

The debug app must already use this Metro server. This enables the development
harness temporarily, pins each frame, and restores config in a finally block.
An optional final argument selects one frame (0–4) for a targeted recapture.
Inspect every result before store upload: a slow/disconnected device can still
capture a loading screen. Run each platform separately to reduce memory pressure.
"""
from pathlib import Path
import os
import re
import subprocess
import sys
import time


def run(*args):
    return subprocess.run(args, check=True, capture_output=True, timeout=45).stdout


def main():
    if len(sys.argv) not in (4, 5) or sys.argv[1] not in ('ios', 'android'):
        raise SystemExit(__doc__)
    platform, device, output = sys.argv[1:4]
    app_id = os.environ.get('OBLIGIO_CAPTURE_APP_ID', 'com.obligio.app')
    locale = os.environ.get('OBLIGIO_CAPTURE_LOCALE', 'en-US')
    if locale not in ('en-US', 'en-GB', 'es-US', 'fr-CA'):
        raise SystemExit('Unsupported capture locale')
    only_frame = int(sys.argv[4]) if len(sys.argv) == 5 else None
    if only_frame is not None and only_frame not in range(5):
        raise SystemExit("Frame must be 0–4")
    root = Path(__file__).resolve().parents[1]
    config = root / 'src/screenshots/config.ts'
    original = config.read_text()
    output = Path(output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    base = re.sub(r'SCREENSHOT_MODE = (true|false)', 'SCREENSHOT_MODE = true', original)
    base = re.sub(r'AUTO_ADVANCE_MS = \d+', 'AUTO_ADVANCE_MS = 0', base)
    base = re.sub(r"(CAPTURE_LOCALE:.*?= )'[^']+'", rf"\g<1>'{locale}'", base)
    frames = ['dashboard', 'calendar', 'documents', 'suggested', 'paywall']
    try:
        for i, name in enumerate(frames):
            if only_frame is not None and i != only_frame:
                continue
            config.write_text(re.sub(r'CAPTURE_FRAME: number \| null = (null|\d+)', f'CAPTURE_FRAME: number | null = {i}', base))
            # Relaunch so captures do not depend on Fast Refresh being enabled.
            if platform == 'ios':
                run('xcrun', 'simctl', 'ui', device, 'appearance', 'light')
                run('xcrun', 'simctl', 'launch', '--terminate-running-process', device, app_id)
            else:
                run('adb', '-s', device, 'shell', 'cmd', 'uimode', 'night', 'no')
                run('adb', '-s', device, 'shell', 'am', 'force-stop', app_id)
                run('adb', '-s', device, 'shell', 'am', 'start', '-n', f'{app_id}/com.compliancecalendar.MainActivity')
            time.sleep(30)
            dest = output / f'light-{i+1}-{name}.png'
            if platform == 'ios':
                run('xcrun', 'simctl', 'io', device, 'screenshot', str(dest))
            else:
                dest.write_bytes(run('adb', '-s', device, 'exec-out', 'screencap', '-p'))
            print(dest, flush=True)
    finally:
        config.write_text(original)


if __name__ == '__main__':
    main()
