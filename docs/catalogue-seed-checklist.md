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
  both of its entries together, and Healthcare seeds DEA and CLIA together.
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

All ten rows are in production. Six carry `reviewedAt` 2026-09-18 and four
carry 2026-09-19 (Companies House, Corporations Canada, Scotland food, City of
Perth).

| Row | Status | Open item |
|---|---|---|
| AU-WA City of Perth food business registration | SEED (live) | Retitled and rewritten, listing fee types without amounts; synced in place on 19 Sep (same row, `reviewedAt` 2026-09-19). |
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
| AR | SEED | Now cites the Secretary of State's franchise tax filing system, which states "due on or before May 1 to avoid penalties". Who files (corporations and LLCs) is on the SOS forms page that links to it. The accrual sentence was dropped: only the forms page states it. |
| DC | SEED | Late-fee sentence dropped; the FAQ cited supports the rest. |
| UT | FIX, date-bound | Describes S.B. 40, which takes effect **1 Oct 2026**. Don't seed before then. Afterwards, swap `sourceUrl` from the enrolled bill to the codified § 16-1a-212 on le.utah.gov. |
| FL, ID, IL, IN, NV, MA, HI, TN | BLOCK | Refused by `UNVERIFIED_REGIONS`, with the reason shown. Read the official page yourself, correct the entry if needed, then remove the state from the list. |
| NM | BLOCK (absent) | No entry. Read NMSA 53-5-2 on NMOneSource; if it says the fourth month, draft a biennial entry. |
| OH | — | No periodic report required; deliberately absent. |

HI moved to BLOCK on 19 Sep: BREG states the rule only in dated quarterly
releases, the old portal only redirects, and the statute on
capitol.hawaii.gov is behind a Cloudflare check. TN moved to BLOCK the same
day: the annual report instructions return 403 to the browser and to plain
requests, and the FAQ cited doesn't state the due date.

## US federal industries

| Industry | Entries | Status | What is left |
|---|---|---|---|
| Construction | EPA RRP | SEED | None. |
| Healthcare | DEA, CLIA | SEED | DEA now cites 21 CFR 1301.13 and says only what it states: three years for practitioners, hospitals and clinics, retail pharmacies and teaching institutions; renewal no more than 60 days before expiry; one year for manufacturers, distributors and researchers. The DEA-page claims (online renewal, pending renewals, one-month reinstatement) were dropped. |
| Transport | MCS-150, UCR, Form 2290, IFTA | SEED | UCR now cites the UCR Handbook (effective 29 Feb 2024), which states: register and pay before January 1 of the registration year, after which states can enforce; states set penalties; private passenger carriers are excluded. The intrastate-only exemption sentence was dropped, because the plan.ucr.gov questionnaire that states it opens behind an acknowledgement. IFTA now cites the current-manuals index (iftach.org/manual2020.php), which links the current Articles of Agreement. |

## Suggested order

1. Seed the SEED states and Construction, after reading each source.
2. Read and seed AR, DC, Healthcare and Transport, now fixed in code.
3. After 1 October 2026: swap Utah's source and seed it.
4. Clear the BLOCK states one at a time, by reading the official page.
