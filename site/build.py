#!/usr/bin/env python3
"""Build the generated parts of obligio.com from data.

    python3 site/build.py

Sources of truth:
  site/states.json       state filing facts, each with its official source,
                         a verbatim snippet and the date the source was read
                         (made by site/import_verified.py; rules in CONTENT_RULES.md)
  web/<guide>/index.html hand-written guides; their own <title>, description and
                         article:modified_time are read, never rewritten

Writes:
  web/annual-report-due-dates/            hub: every state, one table
  web/annual-report-due-dates/<state>/    one page per state
  web/renewal-reminder-calculator/        the free tool
  web/guides/                             hub of guides and tools
  web/sitemap.xml, llms.txt, llms-full.txt, feed.xml
and, idempotently between markers, adds breadcrumbs, related links, the share
image, the feed link and the wider footer to the hand-written pages.
"""
from __future__ import annotations

import datetime as dt
import html
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
WEB = ROOT / "web"
SITE = "https://obligio.com"
APPLE = "https://apps.apple.com/app/id6808265621"
PLAY = "https://play.google.com/store/apps/details?id=com.obligio.app"
OG = {"url": f"{SITE}/assets/og.png", "w": 1200, "h": 630,
      "alt": "Obligio: every business deadline, one calm calendar"}
ORG_ID = f"{SITE}/#organization"
NOTE = ("Organisational guidance, not legal or tax advice. "
        "Check the official page before you file.")
HAND_PAGES = ["privacy", "terms", "support"]  # served at /privacy etc.
GENERATED = {"annual-report-due-dates", "renewal-reminder-calculator", "guides"}

e = html.escape
FREQUENCY = {"annual": "every year", "annually": "every year", "yearly": "every year",
             "biennial": "every two years", "biennially": "every two years", "every two years": "every two years"}
NO_FEE = "The state's page we read does not state the fee. The state shows it when you file."
NO_LATE = "The state's page we read does not state a late penalty. Ask the filing office before the date passes."


def human_date(iso: str) -> str:
    d = dt.date.fromisoformat(iso)
    return f"{d.day} {d.strftime('%B')} {d.year}"


def play(campaign: str) -> str:
    return (f"{PLAY}&referrer=utm_source%3Dobligio.com%26utm_medium%3Dweb"
            f"%26utm_campaign%3D{campaign}")


def ld(data: dict) -> str:
    text = json.dumps(data, ensure_ascii=False).replace("<", "\\u003c")
    return f'<script type="application/ld+json">{text}</script>'


def breadcrumb_ld(trail: list[tuple[str, str]]) -> dict:
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": name, "item": f"{SITE}{path}"}
        for i, (name, path) in enumerate(trail)]}


def crumbs_html(trail: list[tuple[str, str]]) -> str:
    parts = []
    for i, (name, path) in enumerate(trail):
        if i == len(trail) - 1:
            parts.append(f'<span aria-current="page">{e(name)}</span>')
        else:
            parts.append(f'<a href="{path}">{e(name)}</a>')
    return f'<nav class="crumbs" aria-label="Breadcrumb">{" › ".join(parts)}</nav>'


FOOTER_LINKS = ('<div class="footer-links"><a href="/annual-report-due-dates/">Due dates by state</a>'
                '<a href="/renewal-reminder-calculator/">Reminder calculator</a>'
                '<a href="/guides/">Guides</a><a href="/support">Support</a>'
                '<a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>')
HEADER = ('<a class="skip-link" href="#main">Skip to content</a><header><nav aria-label="Main navigation">'
          '<a class="brand" href="/" aria-label="Obligio home"><img src="/assets/obligio-logo.png" '
          'width="44" height="44" alt=""><span>Obligio</span></a><div class="navlinks">'
          '<a href="/annual-report-due-dates/">Due dates</a><a href="/guides/">Guides</a>'
          '<a href="/support">Support</a></div></nav></header>')
FOOTER = ('<footer><div><a class="brand" href="/"><img src="/assets/obligio-logo.png" width="32" '
          'height="32" alt="">Obligio</a><p>© 2026 Royal Nation LLC. Organizational tools, not legal '
          f'or tax advice.</p></div>{FOOTER_LINKS}</footer>')


def page(*, title: str, desc: str, path: str, body: str, lds: list[dict],
         og_type: str = "website", modified: str | None = None, head_extra: str = "") -> str:
    url = f"{SITE}{path}"
    graph = {"@context": "https://schema.org", "@graph": lds}
    mod = f'<meta property="article:modified_time" content="{modified}">\n' if modified and og_type == "article" else ""
    return f"""<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#163e31">
<meta name="apple-itunes-app" content="app-id=6808265621">
<link rel="icon" type="image/png" sizes="80x80" href="/favicon.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="Obligio guides and due dates" href="/feed.xml">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="Obligio">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{OG['url']}">
<meta property="og:image:width" content="{OG['w']}">
<meta property="og:image:height" content="{OG['h']}">
<meta property="og:image:alt" content="{e(OG['alt'])}">
{mod}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{e(title)}">
<meta name="twitter:description" content="{e(desc)}">
<meta name="twitter:image" content="{OG['url']}">
<link rel="stylesheet" href="/styles.css">
{head_extra}{ld(graph)}
</head>
<body>{HEADER}<main id="main" class="page">
{body}
</main>{FOOTER}</body></html>
"""


def article_ld(*, headline: str, desc: str, path: str, published: str, modified: str,
               citations: list[dict] | None = None) -> dict:
    data = {"@type": "Article", "headline": headline, "description": desc,
            "datePublished": published, "dateModified": modified,
            "author": {"@id": ORG_ID}, "publisher": {"@id": ORG_ID},
            "image": OG["url"], "mainEntityOfPage": f"{SITE}{path}", "inLanguage": "en-US"}
    if citations:
        data["citation"] = [{"@type": "CreativeWork", "name": c["name"], "url": c["url"]} for c in citations]
    return data


def app_cta(campaign: str) -> str:
    return (f'<p>Obligio keeps dates like this on your phone with reminders 30, 14, 7 and 1 days before. '
            f'It is free for your first three obligations: <a href="{APPLE}">download on the App Store</a> '
            f'or <a href="{play(campaign)}">get it on Google Play</a>.</p>')


# ---------------------------------------------------------------- states

def load_states() -> list[dict]:
    path = ROOT / "site" / "states.json"
    if not path.exists():
        return []
    data = json.loads(path.read_text())
    return sorted([s for s in data["states"] if s["status"] == "verified"], key=lambda s: s["state"])


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def sentence(text: str) -> str:
    text = text.strip()
    if not text:
        return text
    text = text[0].upper() + text[1:]
    return text if text.endswith((".", "!", "?")) else text + "."


def quote(snippet: str | None, source: dict) -> str:
    if not snippet:
        return ""
    return (f'<p class="quote">The official page says: “{e(snippet)}” '
            f'(<a href="{e(source["url"])}">{e(source["name"])}</a>)</p>')


def state_title(s: dict) -> str:
    name = s["entries"][0]["filing_name"]
    base = f'{s["state"]} Annual Report Due Date'
    if "annual report" not in name.lower():
        full = f"{base}: {name}"
        if len(full) <= 65:
            return full
    has_fee = any(x.get("fee") for x in s["entries"])
    has_late = any(x.get("late_penalty") or x.get("consequence") for x in s["entries"])
    for extra in ([", Fee and Late Penalty"] if has_fee and has_late else []) + \
                 ([" and Late Penalty"] if has_late else []) + ([" and Fee"] if has_fee else []) + [" and Who Files"]:
        if len(base + extra) <= 65:
            return base + extra
    return base


def state_desc(s: dict) -> str:
    first = s["entries"][0]
    has_fee = any(x.get("fee") for x in s["entries"])
    has_late = any(x.get("late_penalty") or x.get("consequence") for x in s["entries"])
    parts = "who files it" + (", the fee" if has_fee else "") + (" and what happens if it is late" if has_late else "")
    read = human_date(s["read_on"])
    for name in (first["filing_name"], "the state's annual report"):
        d = f'When the {s["state"]} {name} is due, {parts}, from the official page read {read}.'
        if len(d) <= 160:
            return d
        d = f'When the {s["state"]} {name} is due and who files it, from the official page read {read}.'
        if len(d) <= 160:
            return d
    return d[:157].rsplit(" ", 1)[0] + "…"


def who_short(who: str) -> str:
    first = re.split(r"(?<=[a-z\)])[.;]\s", who.strip(), maxsplit=1)[0].rstrip(".;")
    return first if len(first) <= 80 else first[:77].rsplit(" ", 1)[0] + "…"


def label_entries(s: dict) -> list[str]:
    """Each entry's display name; repeated names are told apart by who files them."""
    names = [x["filing_name"] for x in s["entries"]]
    return [f"{n} ({who_short(x['who_files'])[0].lower() + who_short(x['who_files'])[1:]})" if names.count(n) > 1 else n
            for n, x in zip(names, s["entries"])]


def state_page(s: dict, states: list[dict]) -> tuple[str, str]:
    path = f'/annual-report-due-dates/{s["slug"]}/'
    src = s["sources"][0]
    title = state_title(s)
    desc = state_desc(s)
    h1 = f'{s["state"]} annual report due date'
    trail = [("Home", "/"), ("Annual report due dates", "/annual-report-due-dates/"), (s["state"], path)]
    body = [crumbs_html(trail), f'<p class="kicker">STATE FILING · {e(s["state"].upper())}</p>', f"<h1>{e(h1)}</h1>"]
    labels = label_entries(s)
    answer = [f'<strong>{e(lab)}</strong>: {e(sentence(x["due_rule"]))}' for lab, x in zip(labels, s["entries"])]
    body.append(f'<p class="answer">{"<br>".join(answer)}</p>')
    body.append(f'<p class="note">From the official {e(src["name"].split(" — ")[0])} page, read on '
                f'{human_date(s["read_on"])}. Your own date depends on when and how your business was formed.</p>')
    faq = []
    multi = len(s["entries"]) > 1
    st = s["state"]
    for x, name in zip(s["entries"], labels):
        ev = x.get("evidence") or {}
        freq = FREQUENCY.get((x.get("frequency") or "").strip().lower())
        due = sentence(x["due_rule"])
        if freq and freq not in due.lower():
            due += f" It is filed {freq}."
        late = " ".join(sentence(v) for v in (x.get("late_penalty"), x.get("consequence")) if v)
        if multi:
            body.append(f"<h2>{e(name)}</h2>")
            qs = [("Who files it", sentence(x["who_files"]), ev.get("who_files")),
                  ("When it is due", due, ev.get("due_rule")),
                  ("What it costs", sentence(x["fee"]) if x.get("fee") else NO_FEE, ev.get("fee") if x.get("fee") else None),
                  ("If it is late", late or NO_LATE, (ev.get("late_penalty") or ev.get("consequence")) if late else None)]
            faq_q = [f"Who files the {st} {name}?", f"When is the {st} {name} due?",
                     f"What does the {st} {name} cost?", f"What happens if the {st} {name} is late?"]
        else:
            qs = [(f"Who has to file the {st} {name}?", sentence(x["who_files"]), ev.get("who_files")),
                  (f"When is the {st} annual report due?", due, ev.get("due_rule")),
                  (f"How much does it cost to file in {st}?", sentence(x["fee"]) if x.get("fee") else NO_FEE,
                   ev.get("fee") if x.get("fee") else None),
                  (f"What happens if the {st} report is late?", late or NO_LATE,
                   (ev.get("late_penalty") or ev.get("consequence")) if late else None)]
            faq_q = [q for q, _, _ in qs]
        tag = "h3" if multi else "h2"
        for (q, a, snip), fq in zip(qs, faq_q):
            body.append(f"<{tag}>{e(q)}</{tag}><p>{e(a)}</p>{quote(snip, src)}")
            faq.append({"@type": "Question", "name": fq,
                        "acceptedAnswer": {"@type": "Answer", "text": f"{a} Source: {src['name']}, read {human_date(s['read_on'])}."}})
        if x.get("file_url"):
            body.append(f'<p>File online through <a href="{e(x["file_url"])}">the state\'s filing service</a>.</p>')
    q = f'?title={html.escape(s["entries"][0]["filing_name"], quote=True).replace(" ", "+")}'
    body.append(f'<h2>Put the date in your calendar</h2><p>Your own due date depends on when and how your '
                f'business was formed, so the state page is where you confirm it. Once you know it, the '
                f'<a href="/renewal-reminder-calculator/{q}">renewal reminder calculator</a> works out the '
                f'reminder dates and gives you a calendar file.</p>')
    body.append(app_cta(f'state-{s["slug"]}'))
    body.append('<h2>Sources</h2><ul class="sources-list">' + "".join(
        f'<li><a href="{e(x["url"])}">{e(x["name"])}</a>'
        + (f' (page updated {e(x["source_updated"])})' if x.get("source_updated") else "") + "</li>"
        for x in s["sources"]) + "</ul>")
    body.append(f'<p class="note">Read on {human_date(s["read_on"])}. Quotations are copied from the page as it '
                f'read that day. States change fees and rules; the official page is the authority. {NOTE}</p>')
    i = states.index(s)
    near = [states[(i + k) % len(states)] for k in (-3, -2, -1, 1, 2, 3)]
    body.append('<h2>Other states</h2><ul class="related">' + "".join(
        f'<li><a href="/annual-report-due-dates/{n["slug"]}/">{e(n["state"])} annual report due date</a></li>'
        for n in near) + '<li><a href="/annual-report-due-dates/">All states</a></li></ul>')
    lds = [article_ld(headline=h1, desc=desc, path=path, published=s["read_on"], modified=s["read_on"],
                      citations=s["sources"]),
           breadcrumb_ld(trail), {"@type": "FAQPage", "mainEntity": faq}]
    return path, page(title=title, desc=desc, path=path, body="\n".join(body), lds=lds,
                      og_type="article", modified=s["read_on"])


def states_hub(states: list[dict], skipped: list[str]) -> tuple[str, str]:
    path = "/annual-report-due-dates/"
    read = max(s["read_on"] for s in states)
    title = "Annual Report Due Dates by State (2026 Table)"
    desc = (f"When each state's annual or biennial report is due for corporations and LLCs, "
            f"from each state's official page read {human_date(read)}.")
    trail = [("Home", "/"), ("Annual report due dates", path)]
    rows = []
    for s in states:
        labels = label_entries(s)
        for j, x in enumerate(s["entries"]):
            cell = f'<a href="/annual-report-due-dates/{s["slug"]}/">{e(s["state"])}</a>' if j == 0 else ""
            rows.append(f'<tr><th scope="row">{cell}</th><td>{e(labels[j])}{"" if labels[j] != x["filing_name"] else "<br><small>" + e(who_short(x["who_files"])) + "</small>"}</td>'
                        f'<td>{e(sentence(x["due_rule"]))}</td></tr>')
    body = [crumbs_html(trail), '<p class="kicker">STATE FILINGS · CORPORATIONS AND LLCS</p>',
            "<h1>Annual report due dates by state</h1>",
            f'<p class="answer">Most states ask corporations and LLCs to file a short report every year or two to keep '
            f'their records current, and many dissolve or penalise a business that misses it. The table gives each '
            f'state\'s report and when it is due, taken from the state\'s own page and read on {human_date(read)}. '
            f'Open a state for who files it, the fee and the late penalty where the state states them, with the '
            f'official wording quoted.</p>',
            f'<p class="note">{NOTE} Your own date depends on when and how your business was formed.</p>',
            '<div class="wrap"><table class="grid states"><caption>Due rules as each state words them. '
            'Select a state for its sources.</caption><thead><tr><th scope="col">State</th>'
            '<th scope="col">Report and who files</th><th scope="col">When it is due</th></tr></thead><tbody>'
            + "".join(rows) + "</tbody></table></div>"]
    if skipped:
        body.append("<h2>States not on this page yet</h2><p>We publish a state only when its official page "
                    f"could be read and quoted. Not covered yet: {e(', '.join(skipped))}. Check those states' "
                    "Secretary of State websites directly.</p>")
    body.append('<h2>Turn a due date into reminders</h2><p>Once you know your date, the '
                '<a href="/renewal-reminder-calculator/">renewal reminder calculator</a> lists reminder dates and '
                'makes a calendar file, and the <a href="/guides/">guides</a> cover renewals, licences and '
                'compliance calendars.</p>')
    body.append(app_cta("state-hub"))
    items = [{"@type": "ListItem", "position": i + 1, "url": f'{SITE}/annual-report-due-dates/{s["slug"]}/',
              "name": f'{s["state"]} annual report due date'} for i, s in enumerate(states)]
    lds = [{"@type": "CollectionPage", "name": "Annual report due dates by state", "description": desc,
            "url": f"{SITE}{path}", "dateModified": read, "publisher": {"@id": ORG_ID},
            "mainEntity": {"@type": "ItemList", "itemListElement": items}},
           breadcrumb_ld(trail)]
    return path, page(title=title, desc=desc, path=path, body="\n".join(body), lds=lds)


# ---------------------------------------------------------------- tool

def tool_page() -> tuple[str, str]:
    path = "/renewal-reminder-calculator/"
    title = "Renewal Reminder Calculator: License and Permit Due Dates"
    desc = ("Enter a license, permit or filing due date to get reminder dates 30, 14, 7 and 1 days before, "
            "plus a calendar file. Free, no sign-up.")
    trail = [("Home", "/"), ("Guides and tools", "/guides/"), ("Renewal reminder calculator", path)]
    faq_items = [
        ("How are the reminder dates worked out?",
         "Each reminder is the due date minus that many calendar days. A reminder that lands on a weekend is "
         "marked, not moved, because rules on weekends and holidays differ by authority."),
        ("Does this store what I type?",
         "No. The dates are worked out in your browser and nothing is sent anywhere. The calendar file is "
         "made on your device."),
        ("Which reminder days should I use?",
         "The defaults, 30, 14, 7 and 1 days before, are the ones the Obligio app uses. Change them to any "
         "whole numbers of days up to 730."),
    ]
    body = f"""{crumbs_html(trail)}
<p class="kicker">FREE TOOL</p>
<h1>Renewal reminder calculator</h1>
<p class="answer">Enter the date a license, permit, insurance policy or state filing is due and this lists the days to be reminded: 30, 14, 7 and 1 days before by default, the same schedule as the Obligio app. It also makes a calendar file with those reminders built in. It runs in your browser; nothing you type is sent anywhere.</p>
<form class="tool" id="reminder-tool" novalidate>
<label for="rt-title">What is due</label>
<input id="rt-title" name="title" type="text" maxlength="120" placeholder="e.g. Business license renewal" autocomplete="off">
<label for="rt-due">Due date</label>
<input id="rt-due" name="due" type="date" required>
<label for="rt-leads">Remind me this many days before</label>
<input id="rt-leads" name="leads" type="text" inputmode="numeric" value="30, 14, 7, 1" aria-describedby="rt-leads-help">
<p class="note" id="rt-leads-help">Whole days, separated by commas. Up to 730.</p>
<label for="rt-repeat">Repeats</label>
<select id="rt-repeat" name="repeat"><option value="0">Does not repeat</option><option value="1">Every year</option><option value="2">Every two years</option></select>
<div class="actions"><button class="button" type="submit">Work out reminders</button><button class="textlink" type="reset">Reset</button></div>
</form>
<div id="rt-result" class="result" aria-live="polite"></div>
<noscript><p class="note">The calculator needs JavaScript. The rule is simple: subtract each reminder's number of days from the due date.</p></noscript>
<h2>How it works</h2>
<p>Reminder date = due date − reminder days, counted in calendar days. The calendar file is a standard .ics event on the due date with one alert per reminder, so Apple Calendar, Google Calendar and Outlook show the alerts without any app. If the date repeats, the file repeats it every year or every two years; check each new date with the issuing authority, because rules and dates change.</p>
<h2>Questions</h2>
{''.join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in faq_items)}
<h2>Related</h2>
<ul class="related"><li><a href="/annual-report-due-dates/">Annual report due dates by state</a></li><li><a href="/how-to-renew-a-business-license/">How to renew a business license</a></li><li><a href="/small-business-compliance-calendar/">Small business compliance calendar</a></li><li><a href="/guides/">All guides</a></li></ul>
{app_cta("reminder-calculator")}
<p class="note">The calculator does date arithmetic only. It does not know your deadline; the issuing authority does. {NOTE}</p>
<script src="/assets/reminders.js"></script><script src="/assets/reminder-tool.js"></script>"""
    lds = [{"@type": "WebApplication", "name": "Renewal reminder calculator", "url": f"{SITE}{path}",
            "applicationCategory": "BusinessApplication", "operatingSystem": "Any (web browser)",
            "description": desc, "isAccessibleForFree": True, "publisher": {"@id": ORG_ID},
            "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}},
           breadcrumb_ld(trail),
           {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q,
                                                "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq_items]}]
    return path, page(title=title, desc=desc, path=path, body=body, lds=lds)


# ---------------------------------------------------------------- guides

def read_meta(path: pathlib.Path) -> dict:
    h = path.read_text()
    get = lambda p: (m.group(1) if (m := re.search(p, h, re.S)) else None)
    title = html.unescape(get(r"<title>(.*?)</title>") or "")
    return {"title": title.replace(" | Obligio", ""),
            "desc": html.unescape(get(r'<meta name="description" content="(.*?)"') or ""),
            "modified": get(r'<meta property="article:modified_time" content="([\d-]+)"'),
            "h1": re.sub("<[^>]+>", "", get(r"<h1[^>]*>(.*?)</h1>") or "")}


def git_date(path: pathlib.Path) -> str:
    out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", str(path)], cwd=ROOT,
                         capture_output=True, text=True).stdout.strip()
    return out or dt.date.today().isoformat()


def guides() -> list[dict]:
    out = []
    for d in sorted(WEB.iterdir()):
        f = d / "index.html"
        if d.is_dir() and f.exists() and d.name not in GENERATED:
            m = read_meta(f)
            m["path"] = f"/{d.name}/"
            m["file"] = f
            m["modified"] = m["modified"] or git_date(f)
            out.append(m)
    return out


def guides_hub(gs: list[dict], states: list[dict]) -> tuple[str, str]:
    path = "/guides/"
    title = "Business License and Compliance Guides for Small Business"
    desc = ("Guides to renewing business licenses, compliance calendars and state filings, plus a free "
            "renewal reminder calculator. Sourced from official pages.")
    trail = [("Home", "/"), ("Guides and tools", path)]
    items = "".join(f'<li><a href="{g["path"]}">{e(g["h1"] or g["title"])}</a><br><small>{e(g["desc"])}</small></li>'
                    for g in gs)
    body = f"""{crumbs_html(trail)}
<p class="kicker">GUIDES AND TOOLS</p>
<h1>Business license and compliance guides</h1>
<p class="answer">Practical guides for small-business owners on keeping licenses, permits, insurance and state filings current, each written from the official pages it cites. Start with the tool if you already know a date, or with the state table if you need to find one.</p>
<h2>Tools and tables</h2>
<ul class="related"><li><a href="/renewal-reminder-calculator/">Renewal reminder calculator</a><br><small>Reminder dates and a calendar file for any due date.</small></li><li><a href="/annual-report-due-dates/">Annual report due dates by state</a><br><small>{len(states)} states, each from its official page.</small></li></ul>
<h2>Guides</h2>
<ul class="related guides-list">{items}</ul>
{app_cta("guides-hub")}"""
    lds = [{"@type": "CollectionPage", "name": "Business license and compliance guides", "url": f"{SITE}{path}",
            "description": desc, "publisher": {"@id": ORG_ID},
            "mainEntity": {"@type": "ItemList", "itemListElement": [
                {"@type": "ListItem", "position": i + 1, "url": f'{SITE}{g["path"]}', "name": g["h1"] or g["title"]}
                for i, g in enumerate(gs)]}},
           breadcrumb_ld(trail)]
    return path, page(title=title, desc=desc, path=path, body=body, lds=lds)


# ---------------------------------------------------------------- hand pages

def between(text: str, key: str, content: str, anchor_re: str, before: bool = True) -> str:
    """Replace the block between <!--gen:key--> markers, or insert it at the anchor."""
    block = f"<!--gen:{key}-->{content}<!--/gen:{key}-->"
    pat = re.compile(rf"<!--gen:{key}-->.*?<!--/gen:{key}-->", re.S)
    if pat.search(text):
        return pat.sub(lambda _: block, text)
    m = re.search(anchor_re, text)
    if not m:
        raise SystemExit(f"anchor {anchor_re!r} not found for {key}")
    i = m.start() if before else m.end()
    return text[:i] + block + text[i:]


def common_head_fixes(h: str) -> str:
    h = re.sub(r'<div class="footer-links">.*?</div>', FOOTER_LINKS, h, count=1, flags=re.S)
    h = h.replace('content="https://obligio.com/assets/obligio-logo.png"', f'content="{OG["url"]}"')
    h = re.sub(r'<meta property="og:image:width" content="\d+">', f'<meta property="og:image:width" content="{OG["w"]}">', h)
    h = re.sub(r'<meta property="og:image:height" content="\d+">', f'<meta property="og:image:height" content="{OG["h"]}">', h)
    h = re.sub(r'<meta property="og:image:alt" content="[^"]*">', f'<meta property="og:image:alt" content="{e(OG["alt"])}">', h)
    h = h.replace('<meta name="twitter:card" content="summary">', '<meta name="twitter:card" content="summary_large_image">')
    if 'type="application/rss+xml"' not in h:
        h = h.replace('<link rel="stylesheet" href="/styles.css">',
                      '<link rel="alternate" type="application/rss+xml" title="Obligio guides and due dates" '
                      'href="/feed.xml">\n<link rel="stylesheet" href="/styles.css">', 1)
    if 'name="apple-itunes-app"' not in h:
        h = h.replace('<meta name="theme-color" content="#163e31">',
                      '<meta name="theme-color" content="#163e31">\n<meta name="apple-itunes-app" content="app-id=6808265621">', 1)
    return h


def patch_guide(g: dict, gs: list[dict]) -> None:
    h = g["file"].read_text()
    trail = [("Home", "/"), ("Guides and tools", "/guides/"), (g["title"] or g["h1"], g["path"])]
    h = common_head_fixes(h)
    h = between(h, "crumbs", crumbs_html(trail), r'<main id="main" class="page">\s*', before=False)
    h = between(h, "breadcrumb-ld", ld({"@context": "https://schema.org", **breadcrumb_ld(trail)}), r"</head>")
    others = [x for x in gs if x["path"] != g["path"]]
    related = ('<h2>Related</h2><ul class="related">'
               + "".join(f'<li><a href="{x["path"]}">{e(x["h1"] or x["title"])}</a></li>' for x in others)
               + '<li><a href="/annual-report-due-dates/">Annual report due dates by state</a></li>'
               '<li><a href="/renewal-reminder-calculator/">Renewal reminder calculator</a></li></ul>')
    h = between(h, "related", related, r"</main>")
    g["file"].write_text(h)


def patch_home(states: list[dict]) -> None:
    f = WEB / "index.html"
    h = common_head_fixes(f.read_text())
    block = ('<section class="feature-section resources"><div class="section-heading"><p class="kicker">FREE RESOURCES'
             '</p><h2>Find a date. Keep it.</h2></div><div class="cards">'
             f'<article><span>TABLE</span><h3><a href="/annual-report-due-dates/">Annual report due dates by state</a></h3>'
             f'<p>{len(states)} states, each taken from the state\'s own page, with the official wording quoted.</p></article>'
             '<article><span>TOOL</span><h3><a href="/renewal-reminder-calculator/">Renewal reminder calculator</a></h3>'
             '<p>Reminder dates 30, 14, 7 and 1 days before any due date, and a calendar file. No sign-up.</p></article>'
             '<article><span>GUIDES</span><h3><a href="/guides/">Business license and compliance guides</a></h3>'
             '<p>Renewals, lookups, compliance calendars and what happens when a license lapses.</p></article>'
             '</div></section>')
    h = between(h, "resources", block, r'<section id="plans"')
    f.write_text(h)


def patch_legal() -> None:
    names = {"privacy": ("Privacy policy", "Obligio Privacy Policy: Account, Documents and Reports"),
             "terms": ("Terms of use", None), "support": ("Support", None)}
    for name, (label, new_title) in names.items():
        f = WEB / f"{name}.html"
        h = common_head_fixes(f.read_text())
        if new_title:
            h = re.sub(r"<title>.*?</title>", f"<title>{e(new_title)}</title>", h, count=1)
            h = re.sub(r'(<meta property="og:title" content=")[^"]*', rf"\g<1>{e(new_title)}", h, count=1)
            h = re.sub(r'(<meta name="twitter:title" content=")[^"]*', rf"\g<1>{e(new_title)}", h, count=1)
        desc = html.unescape(re.search(r'<meta name="description" content="(.*?)"', h).group(1))
        data = {"@context": "https://schema.org", "@graph": [
            {"@type": "ContactPage" if name == "support" else "WebPage", "name": label, "url": f"{SITE}/{name}",
             "description": desc, "publisher": {"@id": ORG_ID}, "inLanguage": "en-US"},
            breadcrumb_ld([("Home", "/"), (label, f"/{name}")])]}
        h = between(h, "page-ld", ld(data), r"</head>")
        f.write_text(h)


# ---------------------------------------------------------------- outputs

def text_of(markup: str) -> str:
    markup = re.sub(r"<script.*?</script>|<style.*?</style>|<header>.*?</header>|<footer>.*?</footer>|"
                    r'<nav class="crumbs".*?</nav>', "", markup, flags=re.S)
    markup = re.sub(r"<h([1-3])[^>]*>(.*?)</h\1>", lambda m: "\n\n" + "#" * int(m.group(1)) + " " + m.group(2) + "\n", markup, flags=re.S)
    markup = re.sub(r"<(?:p|li|tr|br)[^>]*>", "\n", markup)
    markup = html.unescape(re.sub(r"<[^>]+>", " ", markup))
    return re.sub(r"[ \t]+", " ", re.sub(r"\n\s*\n+", "\n\n", markup)).strip()


def write_outputs(entries: list[dict]) -> None:
    today = dt.date.today().isoformat()
    urls = "".join(f"  <url><loc>{SITE}{x['path']}</loc><lastmod>{x['modified']}</lastmod></url>\n" for x in entries)
    (WEB / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n'
                                     '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "</urlset>\n")
    groups = {"tool": "Tools", "hub": "Hubs", "state": "Annual report due dates by state", "guide": "Guides", "page": "About the app"}
    lines = ["# Obligio", "",
             "> Obligio is a mobile app (iPhone and Android) that keeps a small business's licences, permits, "
             "insurance renewals and filing deadlines in one calendar with reminders. This site has a free "
             "reminder calculator, a table of US state annual report due dates taken from each state's official "
             "page with the read date, and guides. Organisational guidance, not legal or tax advice.", ""]
    for key, label in groups.items():
        rows = [x for x in entries if x["kind"] == key]
        if rows:
            lines += [f"## {label}", ""] + [f"- [{x['title']}]({SITE}{x['path']}): {x['desc']}" for x in rows] + [""]
    lines += ["## App", "", f"- [Obligio on the App Store]({APPLE})", f"- [Obligio on Google Play]({PLAY})", ""]
    (WEB / "llms.txt").write_text("\n".join(lines))
    full = ["# Obligio: full text of the public guides, tools and state pages", "",
            f"Generated {today} from {SITE}. Each state section names its official source and the date it was read.", ""]
    for x in entries:
        if x["kind"] in ("tool", "hub", "state", "guide"):
            full += [f"---", "", f"URL: {SITE}{x['path']}", f"Updated: {x['modified']}", "", text_of(x["html"]), ""]
    (WEB / "llms-full.txt").write_text("\n".join(full))
    items = []
    for x in sorted([x for x in entries if x["kind"] in ("guide", "state", "tool", "hub")], key=lambda x: x["modified"], reverse=True)[:60]:
        d = dt.datetime.fromisoformat(x["modified"]).replace(hour=12, tzinfo=dt.timezone.utc)
        items.append(f"<item><title>{e(x['title'])}</title><link>{SITE}{x['path']}</link><guid>{SITE}{x['path']}</guid>"
                     f"<pubDate>{d.strftime('%a, %d %b %Y %H:%M:%S +0000')}</pubDate><description>{e(x['desc'])}</description></item>")
    (WEB / "feed.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>'
                                  f"<title>Obligio guides and due dates</title><link>{SITE}/</link>"
                                  "<description>Guides, tools and state filing due dates for small businesses.</description>"
                                  "<language>en-us</language>" + "".join(items) + "</channel></rss>\n")


def main() -> None:
    states = load_states()
    data_path = ROOT / "site" / "states.json"
    skipped = json.loads(data_path.read_text()).get("not_published", []) if data_path.exists() else []
    gs = guides()
    entries = []

    def add(kind, path, markup, title=None, desc=None, modified=None):
        out = WEB / path.strip("/") / "index.html" if path != "/" else WEB / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        if markup is not None:
            out.write_text(markup)
        meta = read_meta(out)
        entries.append({"kind": kind, "path": path, "html": out.read_text(),
                        "title": title or meta["title"], "desc": desc or meta["desc"],
                        "modified": modified or meta["modified"] or git_date(out)})

    patch_home(states)
    add("page", "/", None, modified=git_date(WEB / "index.html"))
    if states:
        hub_path, hub = states_hub(states, skipped)
        add("hub", hub_path, hub, modified=max(s["read_on"] for s in states))
        for s in states:
            p, markup = state_page(s, states)
            add("state", p, markup, modified=s["read_on"])
    tp, tool = tool_page()
    add("tool", tp, tool, modified="2026-11-20")
    gp, gh = guides_hub(gs, states)
    add("hub", gp, gh, modified=max(g["modified"] for g in gs))
    for g in gs:
        patch_guide(g, gs)
        add("guide", g["path"], None, modified=g["modified"])
    patch_legal()
    for name in HAND_PAGES:
        f = WEB / f"{name}.html"
        m = read_meta(f)
        entries.append({"kind": "page", "path": f"/{name}", "html": f.read_text(), "title": m["title"],
                        "desc": m["desc"], "modified": git_date(f)})
    write_outputs(entries)
    print(f"built {len(entries)} pages ({len(states)} states, {len(gs)} guides)")


if __name__ == "__main__":
    sys.exit(main())
