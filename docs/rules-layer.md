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

## Seeding

Seeding is operator tooling. `seedRules.addTemplate` and
`seedRules.seedUnitedStatesFederal` are **internal** mutations, so they are
unreachable from the app and from anyone holding the deployment URL. Run them
from the Convex dashboard or another Convex function.

```
seedRules.seedUnitedStatesFederal({ reviewedAt: "YYYY-MM-DD" })
```

`reviewedAt` is a required argument rather than a baked-in constant, because
running the seed asserts that someone checked the catalogue on that date. The
mutation is idempotent — it skips titles already present for the jurisdiction —
and returns `{inserted, skipped}`.

> **The shipped catalogue is a draft and has not been reviewed against its
> sources.** It was drafted from well-known federal obligations and every entry
> links to its authority, but no one has yet verified it end to end. Read it,
> correct it, and only then seed it with the date you reviewed it. Owners will
> treat what this catalogue says as authoritative; it should earn that.

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
