#!/usr/bin/env python3
"""Turn source-checked research into site/states.json.

    python3 site/import_verified.py <research-dir>

<research-dir> holds verified/<REGION>.json (one per state) and the official
pages as fetched, as plain text, under sources/. A fact is kept only if its
evidence snippet occurs in that saved text; everything else is dropped and
reported. A state is published only if its filing name, who files it and its
due rule all survive. See CONTENT_RULES.md.
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parent.parent
FACTS = ("filing_name", "who_files", "due_rule", "fee", "late_penalty", "consequence")
REQUIRED = ("filing_name", "who_files", "due_rule")
OFFICIAL = re.compile(r"(\.gov$|\.us$|^(www\.)?(sos\.ms|sos\.mo|sos\.la|sos\.wa|azcc|sunbiz|dos\.ny|bizfileonline\.sos\.ca|"
                      r"le\.utah|legis|legislature|flsenate|ilga|lis\.virginia|nmonesource|revisor)\.)")


def norm(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    text = text.replace("–", "-").replace("—", "-").replace(" ", " ")
    return re.sub(r"\s+", " ", text).strip().lower()


# State-run hosts outside .gov: Arkansas's state portal (ark.org) and the
# Tennessee Secretary of State's file server (tnsosfiles.com).
STATE_RUN = ("ark.org", "tnsosfiles.com")


def official(url: str) -> bool:
    host = re.sub(r"^https?://", "", url).split("/")[0].lower()
    if any(host == h or host.endswith("." + h) for h in STATE_RUN):
        return True
    return bool(re.search(r"\.gov$|\.us$", host)) or bool(OFFICIAL.search(host))


def slug(state: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", state.lower()).strip("-")


def main(research: pathlib.Path) -> None:
    states, log, not_published = [], [], []
    confirm = json.loads((ROOT / "site" / "browser-confirmed.json").read_text())
    for f in sorted((research / "verified").glob("*.json")):
        d = json.loads(f.read_text())
        name = d.get("state") or d["region"]
        sources = [s for s in d.get("sources", []) if s.get("url")]
        bad_hosts = [s["url"] for s in sources if not official(s["url"])]
        sources = [s for s in sources if official(s["url"])]
        corpus = ""
        for s in sources:
            p = research / (s.get("text_file") or "__none__")
            if p.is_file():
                corpus += " " + norm(p.read_text(errors="replace"))
        if bad_hosts:
            log.append(f"{d['region']}: dropped non-official sources {bad_hosts}")
        entries = []
        for x in d.get("entries", []):
            ev = x.get("evidence") or {}
            kept = {"evidence": {}}
            for k in FACTS:
                v, snip = x.get(k), ev.get(k)
                if v and snip and len(snip.split()) >= 3 and norm(snip) in corpus:
                    kept[k] = v.strip()
                    kept["evidence"][k] = snip.strip()
                else:
                    kept[k] = None
                    if v:
                        log.append(f"{d['region']}: dropped {k} (snippet {'missing' if not snip else 'not found in source'})")
            kept["frequency"] = x.get("frequency")
            fu = x.get("file_url")
            kept["file_url"] = fu if fu and official(fu) else None
            if all(kept.get(k) for k in REQUIRED):
                entries.append(kept)
        # The researcher's own status is a gate too: "partial" means the official
        # pages disagree or leave the due date out, and those states wait.
        status = ("verified" if d.get("status") == "verified" and entries and sources and corpus.strip()
                  else "not_published")
        if d["region"] in confirm["needs_confirmation"] and confirm["results"].get(d["region"], {}).get("result") != "all":
            status = "not_published"
            log.append(f"{d['region']}: not confirmed in a normal browser read")
        if status != "verified":
            not_published.append(name)
            log.append(f"{d['region']}: not published (research status {d.get('status')})")
            continue
        states.append({"region": d["region"], "state": name, "slug": slug(name), "status": status,
                       "entries": entries,
                       "sources": [{"name": s["name"], "url": s["url"], "source_updated": s.get("source_updated")}
                                   for s in sources],
                       "read_on": d.get("read_on"), "draft_differences": d.get("draft_differences")})
    out = {"_about": "Facts for the state pages on obligio.com. Each fact has a verbatim snippet that was found "
                     "in the official page as fetched on read_on. Built by site/import_verified.py; see CONTENT_RULES.md.",
           "states": states, "not_published": sorted(not_published)}
    (ROOT / "site" / "states.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    (ROOT / "site" / "import-log.txt").write_text("\n".join(log) + "\n")
    print(f"{len(states)} states published, {len(not_published)} not: {', '.join(sorted(not_published)) or '-'}")
    print(f"{len(log)} log lines in site/import-log.txt")


if __name__ == "__main__":
    main(pathlib.Path(sys.argv[1]))
