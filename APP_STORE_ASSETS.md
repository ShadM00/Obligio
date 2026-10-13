# Obligio: Compliance Tracker — App Store asset brief

> Purpose: give a coding/design agent working in this repo everything it needs to rebuild this app's App Store assets. Data pulled from App Store Connect on 12 Oct 2026. Re-check live values before submitting.

## Snapshot

| | |
|---|---|
| App Store ID | 6808265621 |
| Status | 1.2 Ready for Distribution |
| Category | Productivity (primary), Business (secondary) |
| Age rating | 4+ |
| Locales | 2 (en-US, es-MX) |
| Traffic (Analytics overview, to 10 Oct) | **28 impressions** · not enough data for downloads or conversion |
| Priority tier | **3 — baseline; the problem is discovery** |

## Current listing (en-US)

- **Name:** Obligio: Compliance Tracker (es-MX: "Obligio: Plazos y documentos")
- **Subtitle:** License, Permit & Filing Dates (es-MX: "Licencias, permisos y seguros")
- **Promo text:** **empty in both locales**
- **Keywords (99/100):** renewal, expiration, reminder, due, insurance, inspection, certification, LLC, audit, calendar, deadline, OSHA
- **Description opens:** "Obligio helps small-business owners keep every license, permit, insurance renewal and filing deadline in one place." Reminders at 30, 14, 7 and 1 days.

## Current assets

- iPhone 6.7": 5 screenshots. Apple Watch Ultra: 2. No app previews.
- No custom product pages, events or header/search creative.
- Captions: Every obligation, one clear view · Grouped by month, never by surprise · Proof attached to the obligation · Federal deadlines, with the source · Mark it done, the next one is set

## Diagnosis

The assets are clean and competent: a soft green palette, two-line captions and real UI. With 28 impressions, **nobody is seeing them**, so creative work comes second to discovery.

1. **Discovery.**
   - "Compliance" is a low-intent search word for small-business owners. People search the *thing*: "business license renewal", "contractor license", "insurance expiry reminder".
   - The subtitle is good. The keywords spend characters on "audit, calendar, LLC", which have broad competition.
   - Test "contractor, permit, renewal reminder, expiry, license tracker" (no duplicates with name/subtitle).
2. **Shot 4 is US-federal specific** (Form 941, OSHA 300A). That's right for en-US, but the es-MX listing needs Mexican examples or a generic frame.
3. **No promo text** — fill it.
4. **Shot 1 says "33% Compliance health".** A low score is a strong hook ("you're not as covered as you think"), but make sure it's clearly sample data.

## Search landscape (App Store search, US storefront, 12 Oct 2026)

How to read it: these are the first 11–12 iPhone results the App Store website shows for each search. The number in brackets is the competitor's rating count; "—" means too few ratings to show. It's a snapshot and will drift, and real device search is personalised. These are real ranks, though, not estimates.

**Your ratings: None visible in search (the public lookup cut off before Obligio; confirm in App Store Connect).** The rows of stars next to competitors in search are social proof your listing can't show yet. Ask for a rating with `SKStoreReviewController` / `requestReview` right after a success moment, and never on first launch or after an error. It may move conversion more than any screenshot change.

| Search term | Your position | Top results (rating count) |
|---|---|---|
| license renewal reminder | not in top 12 | Licence Renewal Reminder AU (—) · Renewal Reminder App (—) · CertPro (—) · Expiry Watch (—) |
| compliance tracker | not in top 12 | SPECTRUM Compliance (105) · Ownar – Compliance Tracker (—) · Star Compliance (—) · 1Place (3) |

**What this means**
- **Obligio doesn't appear even for "compliance tracker"**, its own name phrase, while apps with no ratings do. With only 28 impressions in the analytics, Apple has barely indexed it as relevant. This supports the diagnosis: discovery before design.
- **"license renewal reminder" results are personal-licence apps** (driver's licences, nursing CEUs). Business-licence searchers are a different audience. Keywords like "business license", "contractor license" and "permit renewal" match Obligio better.
- **Ownar ("Never miss a filing deadline") is the closest positioning.** Your subtitle should claim small-business licences and permits, not just "filing dates", so you don't overlap with it.

## Action plan

1. **Keywords/subtitle iteration first.** Re-check impressions after 2–3 weeks before any design spend.
2. **Promo text,** e.g. "Never miss a license, permit or insurance renewal. Reminders at 30, 14, 7 and 1 days."
3. **Universal creative (low effort):** a single obligation card with "Renews in 14 days" and a check mark. The idea: "the deadline you'd have missed".
4. **es-MX:** localize shot 4 or swap it for a non-federal frame.

---

## Apple asset rules that apply to every change in this file

Source: Apple, *App Store asset best practices* (developer.apple.com/app-store/asset-best-practices), read 12 Oct 2026. Treat these as hard constraints when generating or editing any App Store image, video or copy for this app.

**Asset types**
- **Creative assets: product page header + search results.** New for iOS 27 / iPadOS 27 and later. Apple suggests one *universal* creative used for both, to keep the brand consistent. The header slot in App Store Connect only picks from **approved** assets, so submit through **Asset Library** first, separately from app versions, so a rejection can't block a release. If no search-results asset is set, Apple shows In-App Events, app previews and screenshots instead.
- **Screenshots.** Up to 10 per product page. Depending on orientation, **up to 3 appear in search results**, so shots 1–3 must make sense on their own.
- **App previews (video).** Up to 3. Real UI only. Assume the audio is muted. The opening must hook. The video must loop cleanly, and you choose its poster frame deliberately.
- **iPhone Duo.** From **April 2027**, screenshots are required for any build made with the iOS 27.1 SDK or later. Do this as part of the next screenshot redo.

**Never put in any asset**
- Prices, discounts, URLs or the © symbol
- Claims nobody can verify, such as awards, "#1" or invented counts
- Other companies' logos or names, platforms or marketplaces (other brands, retailers, messaging apps)
- Apple badges such as Editor's Choice or App of the Day
- Anything above a **4+** rating, even if the app itself is rated higher
- Misquoted or inaccurate scripture, or inflammatory religious commentary
- Test or placeholder data (example.test emails, "screenshothost", YYYY-MM-DD hints)

**How to compose**
- **Header:** one clear idea, aimed at someone seeing the app for the first time.
- **Search asset:** makes the app's purpose obvious at a glance and shows real UI.
- **Text:** a short phrase that *adds* to the visual rather than describing it. It must be readable at thumbnail size and localized for every locale.
- **Composition:** keep the focal point centred, inside the safe area. Check the result in App Store Connect's **Preview** tool before submitting.
- **Consistency:** all assets share one palette, typeface and tone.

**Specs.** Use Apple's universal templates (Figma, Photoshop, Pixelmator, Sketch), linked from the best-practices page. Take exact pixel sizes from App Store Connect Help: *Screenshot specifications* and *App preview specifications*. Don't guess dimensions.


---

## Implementation status (13 Oct 2026)

| Item | Status |
|---|---|
| Promo text | **Live** on 1.2 in en-US and es-MX (restored from `fastlane/metadata`). |
| Keywords (en-US) | New set in `fastlane/metadata/en-US/keywords.txt`, 94/100. **Ships with the next version**: keywords cannot change on a live version. |
| Subtitle | Unchanged; already claims licences and permits. |
| Rating prompt | Built (`src/review.ts`, wired in `App.tsx`): after a successful completion on the phone, account at least 7 days old, at least 3 obligations, once per session; the OS rate-limits the rest. Compiles on iOS and Android. **Ships with the next version.** |
| es-MX screenshots | The old files were raw captures with no background or caption. `scripts/build-store-screenshots.py` now composes per locale with Spanish captions; the federal-forms frame is left out of es-MX (4 shots). **Upload with the next version.** |
| "Sample data" label | Added under every phone frame, in both locales. **Upload with the next version.** |
| Universal creative ("Renews in 14 days") | **Not started.** New design asset, submitted separately through Asset Library. |
| Re-check impressions | Due 2-3 weeks after the keyword change is live. |

`fastlane/screenshots` is git-ignored (generated); rebuild with the compositor script.
