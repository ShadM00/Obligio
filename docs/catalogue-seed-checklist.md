# Catalogue seed checklist

Status of every catalogue entry as of 19 September 2026, against the code in
`convex/catalogueUs.ts` and `convex/catalogueInternational.ts`. The evidence
is in [catalogue-review-2026-09-19.md](catalogue-review-2026-09-19.md).

That review was machine-assisted. It is a worklist, not the attestation
`reviewedAt` records. **SEED** means the cited source, as read, supports the
entry as it now stands in code: a person still reads it, then seeds. **FIX**
means a specific change is due first. **BLOCK** means nobody has been able to
read the official source; `selectReviewed` refuses these (`UNVERIFIED_REGIONS`).

## How seeding works, and why it shapes the order

- **Seeding runs per state and per industry, not per entry.** California seeds
  both of its entries together. Healthcare seeds DEA and CLIA together, so
  CLIA waits for DEA's fix.
- **US seeding only inserts.** `insertTemplates` skips any title already in
  the table and never rewrites it; only `seedInternational:seed` syncs.
  Anything seeded before its fix lands needs a manual patch later, so finish
  the FIX items first.
- `reviewedAt` is the date the person doing the seeding read the sources.
  Pass that date, not this document's.

```bash
npx convex run --prod seedRules:seedUnitedStatesStates '{"reviewedAt":"YYYY-MM-DD","regions":["KS","KY"]}'
npx convex run --prod seedRules:seedUnitedStatesIndustries '{"reviewedAt":"YYYY-MM-DD","industries":["Construction"]}'
```

## International (already live, nothing to seed)

All ten rows are in production. Seven carry `reviewedAt` 2026-09-18 and three
carry 2026-09-19 (Companies House, Corporations Canada, Scotland food).

| Row | Status | Open item |
|---|---|---|
| AU-WA City of Perth food premises approval | FIX (live) | Not corrected yet. Retitle to "City of Perth food business registration" and say the City charges application, assessment and pre-inspection fees, then a fee for each routine inspection. Changes a live rule, so it needs the owner's go-ahead; `seedInternational:seed` would insert the retitled row, and the old row must then be deleted by hand. |
| CA-BC BC company annual report | SEED (live) | The URL is legacy Corporate Online help and may move to bcregistry.gov.bc.ca. Watch it. |
| AU ASIC company annual review | SEED (live) | Optional: the Form 485 notice within 7 days for a negative solvency resolution. |
| The other seven | SEED (live) | None. |

## US states

| State | Status | What is left |
|---|---|---|
| AK, KS, KY, MS, NJ, NY, OR, PA, RI, SC, SD, VT, WA, WV | SEED | Source matched as read. |
| AL | SEED | Now the Business Privilege Tax return only; the Secretary of State report was repealed from 1 Oct 2024. |
| AZ, CO, CT, DE, GA, LA, MD, ME, MI, MN, MO, MT, ND, NE, NH, OK, TX, WI | SEED | Rewritten 19 Sep; the cited source supports the new text. |
| CA (both entries) | SEED | The 90-day first filing rests on Corp. Code §§ 1502 and 17702.09, not the FAQ cited. |
| IA | SEED | The cited page gives the window and dissolution; the odd/even-year split is on help.sos.iowa.gov/how-do-i-file-biennial-report. Read both. |
| NC | SEED | Dissolution is stated on the SOS Administrative Dissolution pages, not the due-dates page cited. |
| WY | SEED | The 60-day dissolution rule is on the sos.wyo.gov Business FAQ, not the wyobiz page cited. |
| VA | SEED, after one check | § 13.1-914 is marked "effective until January 1, 2027". It sits in the Nonstock Corporation Act, so it probably doesn't touch this entry; confirm what replaces it. |
| AR | FIX | The cited forms page doesn't state May 1; the 2026 form does. Point `sourceUrl` at a page that states the date, or accept the forms index and read the current form. |
| DC | FIX | The late-fee sentence rests on the DLCP fee schedule, not the FAQ cited. Drop the sentence, or change the source. |
| HI | FIX | `sourceUrl` is the dated Q3 2026 release. Replace it with a durable BREG annual-filing page. |
| TN | FIX | The cited FAQ doesn't state the due-date rule. Read tnbear.tn.gov/Ecommerce/AnnualReportInstr.aspx in a browser and point `sourceUrl` at it. |
| UT | FIX, date-bound | Describes S.B. 40, which takes effect **1 Oct 2026**. Don't seed before then. Afterwards, swap `sourceUrl` from the enrolled bill to the codified § 16-1a-212 on le.utah.gov. |
| FL, ID, IL, IN, NV, MA | BLOCK | Refused by `UNVERIFIED_REGIONS`, with the reason shown. Read the official page yourself, correct the entry if needed, then remove the state from the list. |
| NM | BLOCK (absent) | No entry. Read NMSA 53-5-2 on NMOneSource; if it says the fourth month, draft a biennial entry. |
| OH | — | No periodic report required; deliberately absent. |

## US federal industries

| Industry | Entries | Status | What is left |
|---|---|---|---|
| Construction | EPA RRP | SEED | None. |
| Healthcare | DEA, CLIA | FIX | CLIA is ready. DEA's three-year cycle and 60-day window come from 21 CFR 1301.13, not the DEA page cited; consider citing the regulation. |
| Transport | MCS-150, UCR, Form 2290, IFTA | FIX | UCR: the January 1 state-enforcement date came from the review, not a page read; confirm it on plan.ucr.gov or drop it. IFTA: the Articles of Agreement URL is year-versioned; consider the manuals index instead. MCS-150 and Form 2290 are ready. |

## Suggested order

1. Seed the SEED states and Construction, after reading each source.
2. Fix AR, DC, HI, TN, Healthcare and Transport; then seed them.
3. After 1 October 2026: swap Utah's source and seed it.
4. Take the Perth fix to the owner (live rule).
5. Clear the BLOCK states one at a time, by reading the official page.
