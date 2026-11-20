# obligio.com search growth log

## 2026-11-20: programmatic state pages, tool, hubs (lessons from KingdomBibleQuiz)

**Evidence.** KingdomBibleQuiz went from ~0 to 1.64k Google clicks / 39.6k impressions
(3 months to 17 Nov 2026; Bing 114 clicks, 447 keywords) almost entirely from 84 generated
pages, one per Bible book, each titled for an exact query ("Luke Bible Quiz: 20 Questions with
Answers"), ~1,850 words of answers, Quiz + BreadcrumbList schema, ~37 internal links, plus
audience hubs. 793 distinct Google queries.

**Baseline obligio.com (28 days to 17 Nov 2026).** Google: 11 clicks, 460 impressions, 21
queries, 10 brand clicks ("obligio"); guides earning first impressions (ASIC 56, calendar 49).
Bing: 0 clicks, 39 impressions, no sitemap on file. 13 URLs in the sitemap, 11 discovered.
Audit before: 0 FAIL, 9 WARN (`audit-before-2026-11-19.txt`).

**Change.**
- 41 state pages `/annual-report-due-dates/<state>/` + hub table, from `site/states.json`
  (facts with verbatim snippets from the official page, read 2026-11-20; CONTENT_RULES.md).
- Free tool `/renewal-reminder-calculator/` (reminder dates + .ics).
- `/guides/` hub; breadcrumbs, related links and wider footer on every guide.
- sitemap with real lastmod, llms.txt, llms-full.txt, feed.xml, 1200x630 share image,
  structured data on legal pages, support FAQ, IndexNow key.
- Audit after (live): 0 FAIL, 1 WARN (terms page is short) (`audit-after-2026-11-20.txt`).

**Commissioning.** Google: sitemap resubmitted, 57 discovered. Request-indexing quota was
exhausted on 2026-11-20: request `/annual-report-due-dates/`, `/renewal-reminder-calculator/`
and `/guides/` on the next day. Bing: sitemap submitted (processing). IndexNow: 57 URLs, HTTP 202.

**Re-read on 2026-12-18 (do not retitle before).** Google queries/pages for
`/annual-report-due-dates/*`, impressions per state page, Bing keywords and AI Performance,
and rerun `crawl_audit.py`. Keep pages that earn impressions; look at which query shapes appear
("<state> annual report due date", "<filing name> due date") and match titles to them.

## How to rebuild

    python3 site/import_verified.py <research-dir>   # only when re-reading sources
    python3 site/editorial.py
    python3 site/build.py
    python3 site/test_site.py && node --test site/reminders.test.cjs
    netlify deploy --prod --dir=web --no-build
    INDEXNOW_KEY=$(cat site/indexnow-key.txt) node ~/.claude/skills/web-excellence/scripts/indexnow.mjs https://obligio.com

Re-check every state's source at least every six months (next: 2027-05-20).

## 2026-11-20 (later): held-back states read in the owner's browser

Tennessee published for corporations (42 states). Still held: Iowa (help pages give January 2 to
March 30 and January 1 to April 1), Louisiana and South Dakota (no due date stated), Oklahoma (who
files only implied), Massachusetts (only a 2022 fee schedule), Illinois and Indiana (sites refuse
the connection even in a normal browser), Idaho (statute site would not load). Quotes now name the
source page each snippet came from.
