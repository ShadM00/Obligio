# ASO research

Competitor data gathered 2026-09-06 from live App Store listings. Everything
here is evidence from actual listings, not assumption — the previous metadata
in this repo was written from first principles and never validated.

## Direct competitors

| App | Title | Subtitle | Category | Price | Ratings |
| --- | --- | --- | --- | --- | --- |
| Permit-Pal | **Expiry Date Alert And Reminder** | Never Miss a Renewal | Productivity | Free + IAP ($89.99/yr, $39.99/6mo) | 0 |
| Goodstand | **Goodstand: LLC Compliance** | Annual Report & Filing Dates | Business | Free + Pro | 0 |

Others in the space: PermitKeep, PermitWise, ExpiryTrack, PermitPilot, HOSP
(hospitality-specific), HaulOpps (trucking-specific).

## What the data says

**1. Nobody in this niche has ratings.** Every competitor found shows 0
ratings. The category is unconsolidated — there is no incumbent to displace,
and ranking will be decided by keywords and conversion rather than social
proof.

**2. Our app name wastes 23 of its 30 characters.** "Obligio" alone carries no
keyword weight. Apple indexes the name most heavily of any field. Permit-Pal
went further than most and renamed itself to a pure keyword string, "Expiry
Date Alert And Reminder", abandoning its brand entirely. Goodstand's
"Brand: Category" pattern is the balanced version and is what is recommended
below.

**3. Every competitor is free with a paid tier. Obligio is not.** Permit-Pal
gives two permits free forever; Goodstand gives one entity free. Obligio is
$9.99/mo or $79.99/yr with a 14-day trial and no free tier at all. For an app
with zero ratings in a category where free entry is the norm, that is the
single biggest conversion risk on this list — bigger than any keyword choice.

**4. Our reminder cadence is thinner than theirs.** Goodstand alerts at 60,
30, 14, 7 and 1 days out plus the day itself, and argues the point explicitly
in its listing: "Sixty days is enough time to gather what you need. One day is
not." Obligio sends a single reminder 7 days out.

**5. Screenshot sequence.** Goodstand's filenames reveal a deliberate order:
deadlines → add → detail → lock → filed → paywall. Six screenshots, ending on
the paywall. Permit-Pal uses four.

**6. Category is contested.** Permit-Pal sits in Productivity, Goodstand in
Business. Obligio is currently Productivity. Business is the narrower, more
intent-matched category for a compliance tool aimed at owners.

## Recommended metadata

| Field | Was | Now | Why |
| --- | --- | --- | --- |
| Name | `Obligio` | `Obligio: Compliance Tracker` | 27/30 chars, keeps brand, adds the two strongest keywords |
| Subtitle | `Compliance calendar for SMBs` | `License, Permit & Filing Dates` | 30/30, three high-intent nouns; "for SMBs" was spending characters on an audience label that nobody searches |
| Keywords | overlapped name/subtitle | `renewal,expiry,expiration,reminder,due date,insurance,inspection,certification,LLC,filing,audit` | 95/100. Apple already indexes name and subtitle, so repeating "compliance", "license", "permit" there was wasted; these are the non-overlapping terms |

## Screenshots — what is and is not allowed

App Store screenshots must show the actual app. Apple's review guideline
2.3.3 requires them to accurately reflect the app in use; fabricating UI that
the app does not render is a rejection risk and, separately, misleads buyers.

So generated imagery cannot stand in for the screens. What generated or
designed assets *are* legitimately for is the marketing treatment **around**
a real capture: background, caption, device frame, colour. That is what every
competitor is doing, and it is where the conversion difference actually lives.

The ten captures already in this repo are raw device frames with no caption
or framing. They are honest but they do not sell. The work outstanding is a
caption per screenshot and a designed background, applied to the real
captures.

Suggested captions, matched to the frames already captured:

1. Dashboard — "Every obligation, one clear view"
2. Calendar — "Grouped by month, never by surprise"
3. Suggested — "Federal deadlines, with the source"
4. Documents — "Proof attached to the obligation"
5. Paywall — "Unlimited obligations and reminders"

## Store copy, by platform

The two stores index differently, so the listings are not the same text.

**Apple** weights the name, subtitle and the hidden keyword field. The
description is *not* indexed, so it is written to convert rather than to rank.

**Google Play** indexes the full description. `full_description.txt` therefore
repeats the terms that matter — license, permit, renewal, deadline, filing,
insurance — naturally through the body rather than in a keyword field Play
does not have.

Both en-US listings use American spelling. An earlier draft used "licence"
throughout, which is wrong for the locale and costs the exact-match term.

## Screenshots

`scripts/build-store-screenshots.py` composites the listing images from real
device captures: brand backdrop, two-line caption, rounded frame, 1320x2868.

The capture underneath is never redrawn. Guideline 2.3.3 requires screenshots
to show the app as it runs, so generated imagery is confined to the treatment
around a genuine screenshot.

One thing worth knowing if the backdrop is ever changed: the first version
used a near-white background almost identical to the app's own canvas
(#F7F8F6), which left the device with no visible edge on a store card. The
backdrop needs to contrast with the app, not match it.

## Not yet researched

- Search volume and difficulty per keyword. Requires a paid ASO data source;
  the terms above are reasoned from competitor listings, not measured.
- Google Play listing, which uses a different algorithm — Play indexes the
  full description, so keyword placement there is a separate exercise.
- Localisation beyond en-US.
