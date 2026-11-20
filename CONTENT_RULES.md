# Website content rules (obligio.com)

Business deadlines are legal facts. A wrong date can cost an owner a penalty or
their good standing, so every page follows these rules, and `site/test_site.py`
enforces the mechanical ones.

TOPIC:            legal / regulatory (business filing deadlines, licences, fees)
NEVER SAY:        what a reader's own deadline is; that they are or are not required
                  to file; guarantees ("you will avoid penalties"); legal or tax advice;
                  facts not on a fetched official page; ratings, reviews or user counts
ALLOWED REGISTER: general (identical for every reader), descriptive ("the Secretary of
                  State says the report is due by ..."), attributed to the official source
REQUIRED NOTES:   every deadline page shows its official source link, the date the
                  source was read, and "Organisational guidance, not legal or tax
                  advice. Check the official page before you file."
EXPERT REVIEW:    waived by the owner (Shad Mamhute) on 2026-11-20 for the US state
                  report pages, on the basis of a fresh machine check: each page is
                  built only from facts that carry a verbatim snippet found in the
                  official page as fetched on the read date. Unreadable states are
                  not published.

## Scope of that waiver

It covers the public website only. The in-app catalogue
(`convex/catalogueUs.ts`) is still unseeded: `reviewedAt` there records a
person's read date and the on-hold decision of 2026-09-19 stands
(docs/catalogue-seed-checklist.md).

## Re-checking

`site/states.json` stores each fact with its source, its snippet and the read
date. Re-run the check at least every six months, and whenever a state changes
its law (Utah, 1 October 2026), then rebuild with `python3 site/build.py`.
