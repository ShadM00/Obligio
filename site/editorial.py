#!/usr/bin/env python3
"""Editorial pass over site/states.json, run after site/import_verified.py.

    python3 site/editorial.py

Edits change wording only: they remove researcher notes from published
sentences and make attribution read naturally ("the state's page"). They never
add a fact; every fact still rests on the snippet stored beside it. Exclusions
withhold a state whose evidence does not answer the question it is used for.
"""
from __future__ import annotations

import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent

# State: reason. These are withheld even though their snippets were found.
EXCLUDE = {
    "OK": "who files is inferred from an answer about entities that lost good standing, "
          "not stated directly; read the Secretary of State's page before publishing",
}

# (region, entry index, field): replacement wording, same facts.
REWORD = {
    ("NJ", 0, "who_files"): "Every business in New Jersey, including LLCs and corporations",
    ("MN", 0, "who_files"): "Most business entities registered in Minnesota; the state's page does not list the entity types",
    ("CA", 0, "fee"): "$20 or $25; the state's page gives both amounts without saying which applies to which entity type",
    ("CA", 1, "fee"): "$20 or $25; the state's page gives both amounts without saying which applies to which entity type",
    ("NV", 0, "who_files"): "Title 7 entities, whose State Business License renewal falls due with the Annual List of "
                            "Officers (the state's page does not list which entity types are Title 7). Sole proprietors "
                            "and partnerships renew the license by the expiration date on it instead",
    ("DC", 0, "consequence"): "Filing the biennial report, and keeping a registered agent, is required to stay in active "
                              "and good standing status; the state's page does not set out a specific penalty",
}

FIELDS = ("who_files", "due_rule", "fee", "late_penalty", "consequence")


def tidy(text: str) -> str:
    text = re.sub(r"\(the page's example: ", "(for example, ", text)
    text = re.sub(r"\bon (this|these) pages?\b", "on the state's page", text)
    text = re.sub(r"\b(T|t)he page\b", lambda m: ("The" if m.group(1) == "T" else "the") + " state's page", text)
    return text.replace("the state's page also says", "it also says")


def main() -> None:
    path = ROOT / "site" / "states.json"
    data = json.loads(path.read_text())
    kept = []
    for s in data["states"]:
        if s["region"] in EXCLUDE:
            data["not_published"] = sorted(set(data["not_published"]) | {s["state"]})
            data.setdefault("withheld", {})[s["region"]] = EXCLUDE[s["region"]]
            continue
        for i, x in enumerate(s["entries"]):
            for k in FIELDS:
                if x.get(k):
                    x[k] = tidy(REWORD.get((s["region"], i, k), x[k]))
        kept.append(s)
    data["states"] = kept
    path.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    print(f"{len(kept)} states after editorial pass; withheld: {', '.join(sorted(EXCLUDE))}")


if __name__ == "__main__":
    main()
