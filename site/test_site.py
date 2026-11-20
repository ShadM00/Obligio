#!/usr/bin/env python3
"""Checks for the built site. Run after site/build.py:  python3 site/test_site.py"""
from __future__ import annotations

import html
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from import_verified import official  # noqa: E402  (one definition of "official")

ROOT = pathlib.Path(__file__).resolve().parent.parent
WEB = ROOT / "web"
SITE = "https://obligio.com"
NOTE = "Organisational guidance, not legal or tax advice."
# Directive or guaranteeing language that CONTENT_RULES.md forbids.
BANNED = re.compile(r"\b(you (must|need to|are required to|have to) file|your (deadline|due date) is|"
                    r"guarantee[sd]?|you will (avoid|not be)|we file|legal advice from)\b", re.I)

failures: list[str] = []


def fail(msg: str) -> None:
    failures.append(msg)


def file_for(path: str) -> pathlib.Path:
    if path == "/":
        return WEB / "index.html"
    p = path.strip("/")
    return WEB / p / "index.html" if (WEB / p / "index.html").exists() else WEB / f"{p}.html"


def main() -> None:
    sitemap = (WEB / "sitemap.xml").read_text()
    urls = re.findall(r"<loc>([^<]+)</loc>", sitemap)
    lastmods = re.findall(r"<lastmod>([^<]+)</lastmod>", sitemap)
    if len(urls) != len(lastmods):
        fail("sitemap: every <url> needs a <lastmod>")
    llms = (WEB / "llms.txt").read_text()
    titles, descs = {}, {}
    states = json.loads((ROOT / "site" / "states.json").read_text())["states"]
    state_paths = {f"/annual-report-due-dates/{s['slug']}/" for s in states}
    for url in urls:
        path = url.replace(SITE, "")
        f = file_for(path)
        if not f.exists():
            fail(f"{path}: no file")
            continue
        h = f.read_text()
        get = lambda p: (m.group(1) if (m := re.search(p, h, re.S)) else None)
        title = html.unescape(get(r"<title>(.*?)</title>") or "")
        desc = html.unescape(get(r'<meta name="description" content="(.*?)"') or "")
        if not 25 <= len(title) <= 70:
            fail(f"{path}: title length {len(title)}")
        if path not in ("/terms",) and not 70 <= len(desc) <= 165:
            fail(f"{path}: description length {len(desc)}")
        if title in titles:
            fail(f"{path}: duplicate title with {titles[title]}")
        if desc in descs:
            fail(f"{path}: duplicate description with {descs[desc]}")
        titles[title], descs[desc] = path, path
        if len(re.findall(r"<h1[\s>]", h)) != 1:
            fail(f"{path}: needs exactly one h1")
        if get(r'<link rel="canonical" href="([^"]+)"') != url:
            fail(f"{path}: canonical does not match sitemap URL")
        if 'og:image" content="https://obligio.com/assets/og.png"' not in h:
            fail(f"{path}: missing share image")
        for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
            try:
                json.loads(block)
            except json.JSONDecodeError as err:
                fail(f"{path}: JSON-LD does not parse ({err})")
        if path != "/" and path not in ("/privacy", "/terms", "/support") and url not in llms:
            fail(f"{path}: not in llms.txt")
        for link in set(re.findall(r'href="(/[^"#?]*)', h)):
            if link.startswith(("/assets/", "/favicon", "/apple-touch", "/styles.css", "/feed.xml")):
                continue
            target = WEB / link.lstrip("/")
            if "." in link.rsplit("/", 1)[-1] and target.is_file():
                continue
            if not file_for(link).exists():
                fail(f"{path}: broken internal link {link}")
        body = re.sub(r"<script.*?</script>", "", h, flags=re.S)
        if BANNED.search(html.unescape(re.sub(r"<[^>]+>", " ", body))):
            fail(f"{path}: banned phrasing {BANNED.search(html.unescape(re.sub(r'<[^>]+>', ' ', body))).group(0)!r}")
        if path in state_paths:
            if NOTE not in h:
                fail(f"{path}: missing the required note")
            if "Read on " not in h:
                fail(f"{path}: missing the read date")
            state = next(x for x in states if f"/annual-report-due-dates/{x['slug']}/" == path)
            if not all(official(src["url"]) and f'href="{html.escape(src["url"])}"' in h for src in state["sources"]):
                fail(f"{path}: a source link is missing or not official")
    for s in states:
        for x in s["entries"]:
            for k in ("filing_name", "who_files", "due_rule"):
                if not x.get(k) or not x["evidence"].get(k):
                    fail(f"{s['state']}: {k} published without evidence")
        if not s.get("read_on"):
            fail(f"{s['state']}: no read date")
    missing = state_paths - {u.replace(SITE, "") for u in urls}
    if missing:
        fail(f"state pages missing from sitemap: {sorted(missing)}")
    print(f"checked {len(urls)} URLs, {len(states)} states")
    if failures:
        print("\n".join(f"FAIL {x}" for x in failures))
        sys.exit(1)
    print("all checks passed")


if __name__ == "__main__":
    main()
