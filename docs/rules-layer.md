# The rules layer

The rules table is a shared catalogue of obligations that commonly apply to a
given `(country, region, industry)`. It is reference data, not tenant data: the
same row is read by every business that matches its jurisdiction.

## What a rule is, and is not

A rule says **what** to track and **how often**. It never carries a due date.

That is deliberate. A real deadline depends on entity type, fiscal year, filing
history, headcount, and sometimes on notices the IRS or a state agency has sent
that particular business. An app that asserted "your Form 941 is due on the
30th" would be wrong for a large share of its users and confidently so. Instead
the owner supplies the date when they adopt a template, and the app explains
why it is asking.

Every rule therefore carries:

| Field | Purpose |
| --- | --- |
| `title`, `description`, `category` | What the obligation is, and who it applies to |
| `recurrence` | `monthly`, `quarterly`, `annual`, or absent for one-off |
| `sourceName`, `sourceUrl` | The authority, so an owner can check rather than trust |
| `effectiveFrom` | When the rule started applying |
| `reviewedAt` | When an operator last checked the entry against its source |

`reviewedAt` is surfaced in the app next to each suggestion. A stale catalogue
is visibly stale rather than silently wrong.

## Reading

`rules.listTemplates` requires a session and is keyed on the business's own
country, region, and industry, which onboarding collects. `TemplatePicker`
renders them, and `requirementsMutations.createFromTemplate` copies the
template's wording, category, cadence, and source URL onto a new requirement
with the date the owner chose.

## How a rule reaches a business

A rule is stored as narrowly as it applies: federal rules under an empty
region, rules that hold for any trade under industry `General`. The index on
(country, region, industry) matches all three exactly, so `listTemplates` asks
for every scope that covers the business rather than only its own triple —
`coveringScopes` in `src/jurisdictions.ts`, unit tested there.

Without that widening a shop in (US, WA, FoodService) matches nothing, because
the catalogue is broadest at the country-wide and general end. Anything seeded
under a specific state or industry is additive on top.

## Seeding

Seeding is operator tooling. `seedRules.addTemplate` and
`seedRules.seedUnitedStatesFederal` are **internal** mutations, so they are
unreachable from the app and from anyone holding the deployment URL. Run them
from the Convex dashboard, from another Convex function, or from the CLI:

```sh
npx convex run seedRules:seedUnitedStatesFederal '{"reviewedAt":"YYYY-MM-DD"}' --prod
npx convex run catalogue:review --prod
```

Both seed entry points are idempotent — re-running reports what it skipped
rather than inserting a second copy that owners would see twice with no way to
tell them apart.

## Reviewing what is already there

`reviewedAt` records that a person checked an entry against its authority on a
date, and that is the whole basis for showing it to an owner. It decays:
thresholds and deadlines change, so an entry nobody has re-checked in a year is
a claim nobody currently stands behind.

```sh
npx convex run catalogue:review --prod
npx convex run catalogue:review '{"staleAfterDays":180}' --prod
```

It groups the catalogue by scope and lists each entry with its authority, its
review date and how old that is, oldest first — which is the order to work
through when re-checking.

`reviewedAt` is a required argument rather than a baked-in constant, because
running the seed asserts that someone checked the catalogue on that date. The
mutation is idempotent — it skips titles already present for the jurisdiction —
and returns `{inserted, skipped}`.

> **The shipped catalogue is a draft and has not been reviewed against its
> sources.** It was drafted from well-known federal obligations and every entry
> links to its authority, but no one has yet verified it end to end. Read it,
> correct it, and only then seed it with the date you reviewed it. Owners will
> treat what this catalogue says as authoritative; it should earn that.

### What production holds

Seeded on 2026-09-06 with `reviewedAt: "2026-09-06"`: the 8 US federal
entries, all at scope `US / (country-wide) / General`, which the widening above
makes visible to a US business in any state and any industry.

There are no GB rules, so onboarding no longer offers the United Kingdom --
`COUNTRIES` in `src/jurisdictions.ts` lists only the jurisdictions whose
catalogue has been reviewed. The GB type, regions and copy all remain, so
restoring it is a one-line change once a catalogue exists.

## Coverage today

`US / (federal) / General` only — eight entries covering federal income tax,
estimated payments, Forms 941, 940, W-2/1099-NEC, the FinCEN beneficial
ownership report, the OSHA 300A posting, and a workers' compensation review.

Two entries deserve particular scrutiny before seeding. The FinCEN reporting
requirement has changed more than once and exempts some categories of company.
Workers' compensation is state-regulated, so the entry describes a review
prompt rather than a federal rule.

State and industry catalogues (`region: 'CA'`, `industry: 'FoodService'`, and so
on) are not written. The vocabulary they must use is in `src/jurisdictions.ts`.

## Draft catalogue review notes

`convex/catalogueUs.ts` holds a draft beyond the federal-general set, written
2026-09-11. **None of it is seeded.** It is research, and seeding is the
attestation that someone checked it.

| Set | Scope | Entries |
| --- | --- | --- |
| `US_STATE_REPORTS` | `US / <state> / General` | 50, across 49 jurisdictions — California has two, because its LLCs file every two years and its corporations every year |
| `US_FEDERAL_INDUSTRY` | `US / (country-wide) / <industry>` | 7 — Transport (4), Construction (1), Healthcare (2) |

The state entries are the periodic report every state asks of its
corporations and LLCs — the one deadline nearly every small business has, and
the one that makes the state answer in onboarding actually change what is
suggested. The industry entries do the same for the trade answer.

### How to review

Open each entry's `sourceUrl` and check the description against it. Then seed
**only what you reviewed** — the seeds require the list, and reject a name with
no draft entries so a typo cannot pass for a completed review:

```sh
npx convex run seedRules:seedUnitedStatesStates \
  '{"reviewedAt":"YYYY-MM-DD","regions":["WA","OR","CA"]}' --prod
npx convex run seedRules:seedUnitedStatesIndustries \
  '{"reviewedAt":"YYYY-MM-DD","industries":["Transport","Construction","Healthcare"]}' --prod
npx convex run catalogue:review --prod
```

Doing it a few states at a time is fine and honest; each run is idempotent.

### How it was researched, and why that is not enough

Each state was checked with a web search restricted to that state's own
domain, and where the result was ambiguous the primary page, PDF or statute
was read directly — Kansas's 2024 change from the Secretary of State's own
flyer, Idaho from § 30-21-213, North Dakota, Nebraska, Missouri and South
Carolina from their pages. Search summaries paraphrase, and a paraphrase is
where a date quietly shifts. That is precisely what the review is for.

### Gaps found while drafting

Settle these before seeding the affected entries:

- **New Mexico — excluded, because the sources conflict.** Statute text for
  § 53-5-2 NMSA, as quoted in a 2018 bill, puts the biennial corporate report
  on the fifteenth day of the *third* month after the tax year; filed reports
  say April 15, the *fourth*. The 2018 bill may be what changed it, and the
  Legislature's site refuses automated access. Read the current statute
  before writing this entry.
- **Ohio — excluded, correctly.** Ohio requires no annual report from
  corporations or LLCs (Secretary of State FAQ).
- **Missouri — corporations only.** Whether Missouri LLCs file a periodic
  report was not confirmed from an official page. Suggestive, not conclusive:
  the Secretary of State's own filing guide shows registration reports offered
  for corporations and nonprofits, but not under LLC filings.
- **Virginia — resolved.** The SCC's pages refuse automated access, but Code
  of Virginia § 13.1-775 is in force and requires corporations to file an
  annual report by the end of the anniversary month, so the entry now covers
  the report as well as the registration fee. The fee rules are on the SCC's
  [Annual Registration Fees](https://www.scc.virginia.gov/businesses/business-faqs/annual-registration-fees/)
  page; whether LLCs also file a report was not confirmed either way.
- **Illinois — corporations.** The LLC rule is confirmed. The corporation
  rule is described as tied to the anniversary month with an optional
  extended filing month, which is what the forms support; the exact wording
  page was blocked.
- **Wisconsin — resolved.** Wis. Stat. § 180.1622 confirms domestic
  corporations file during the calendar quarter matching their anniversary,
  the same rule DFI's instructions give for LLCs.
- **IFTA.** The entry deliberately gives no dates. IFTA, Inc.'s carrier page
  leaves the schedule to each base jurisdiction.

### Industries with no entry

Food service, childcare, beauty, fitness, professional services and retail are
regulated almost entirely by states and localities. The federal rule people
reach for first often does not apply — FDA food facility registration exempts
restaurants — so they have no entry rather than a wrong one. The next useful
wave is state-level: workers' compensation and sales tax permits, both of
which vary by state and apply across trades.

### Multi-year cadences

Several entries repeat every two, three or five years, so `biennial`,
`triennial` and `quinquennial` were added to the recurrence model, the
picker, and the "Repeats …" label. A client older than that change shows the
raw value — "Repeats biennial" — and still schedules correctly, because the
next date is computed on the server.
