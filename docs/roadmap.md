# Roadmap

What is left, in the order it is worth doing. State verified against both
stores and the production backend on 2026-09-08.

## Where things actually stand

| | State |
| --- | --- |
| Backend | `greedy-parakeet-883` current with `main`; auth gate closed; 8 rules, **0 businesses** |
| App Store | 1.0 *Prepare for Submission*, build `202609102143` attached, export compliance carried in the binary |
| Play | internal track, version code 6, completed. No closed, open or production track |
| Listings | text, 5 screenshots, feature graphic and icon live on both stores |
| Subscriptions | `obligio_plus_monthly` / `obligio_plus_annual` **Ready to Submit**, review screenshots attached, RevenueCat keys set for both platforms |
| Tests | 164 unit tests, `tsc` clean. No end-to-end tests |

Neither store has been submitted.

## Phase 0 — Sign-in (resolved 2026-09-10)

Authentication was broken for three separate reasons, each hidden behind the
one before it. All three are fixed, and both platforms are verified on device
through to Clerk's credential screen.

1. **`clerk.obligio.com` did not resolve.** Five CNAME records were missing
   from the Hostinger zone; added additively, verified by Clerk, certificates
   issued for `clerk.` and `accounts.`.
2. **Android `signIn()` was a stub** that rejected unconditionally. It now
   presents Clerk's prebuilt flow, themed in the Obligio palette in both
   schemes (see [native-auth-bridge.md](native-auth-bridge.md)).
3. **The redirect allowlist was empty**, so Clerk rejected iOS hosted sign-in
   outright. `com.obligio.app://callback`, `clerk://com.obligio.app.callback`
   and `clerk://com.obligio.app.oauth` are now allowed.

Verifying it turned up one more thing: the iOS consent prompt read
'"ComplianceCalendar" Wants to Use "accounts.obligio.com" to Sign In', because
`CFBundleName` fell through to the Xcode project name. It now says Obligio.

Shipped as App Store build `202609101932`→`202609102143` and Play internal
version code 6.

**Not verified: completing a sign-in**, because that means entering
credentials. That is the first thing to do with the reviewer demo account.

**Still yours, in the Clerk dashboard:**

- **Branding.** There is no API for it. The hosted page on iOS uses Clerk's
  default purple, and both platforms show a generic building icon where the
  Obligio logo should be. Customization → Branding: upload the logo and set
  the primary colour to `#163E31`.
- **Google OAuth credentials.** Sign in with Google is enabled in production,
  where Clerk's shared development credentials do not work. Configure → SSO
  connections → Google needs your own client ID, or turn it off before
  review so a reviewer does not tap a button that fails.

## Phase 1 — Submit

Everything here blocks review. Most of it is console work under the owner's
identity rather than code.

1. **Create the reviewer demo account and prove the app works with it.** This
   is first because it is also the only end-to-end test that has ever been run
   against production: `businesses` is empty, so sign-in → onboarding →
   suggestions → add → evidence → recurring completion → paywall has never
   been exercised live by anyone. Do it as the reviewer will, on a real
   device, and grant the account a promotional Obligio Plus entitlement in
   RevenueCat.

   Two things to confirm while in there, both of which fail closed and would
   strand a reviewer:
   - **Clerk must allow password sign-in.** The app calls
     `startHostedAuth(mode: .signIn)`, so the reviewer gets Clerk's hosted
     page. If that instance is configured for email one-time codes, the
     reviewer cannot receive one and cannot contact you.
   - **The entitlement must actually resolve.** `src/subscription.ts` treats a
     failed lookup as *not* Plus, so a misconfigured grant shows the paywall
     the declaration promises they will not see.

2. **Play declarations** — app access sign-in details, content rating, target
   audience, data safety, and the government / financial / health questions.
   Draft answers derived from the code are in
   [store-declarations.md](store-declarations.md); the account-deletion answer
   is the weakest and is the one most likely to come back.

3. **App Store declarations** — age rating, App Privacy, content rights,
   advertising identifier, and pricing and availability.

4. **Play tax and payout information**, without which Play will not sell a
   subscription.

5. **Promote beyond internal testing.** Internal is not a review path. Closed
   testing first is the lower-risk route; production is the shorter one.

## Phase 2 — Deliver what the listing promises

The App Store description leads with **"SUGGESTED FOR YOUR STATE AND
INDUSTRY"**, and onboarding asks for both. Today every rule is stored at
`US / (country-wide) / General`, so those two answers change nothing: a food
business in Washington and a construction firm in Texas see the same 8 federal
obligations.

That is not a bug — [rules-layer.md](rules-layer.md) explains the scoping, and
the widening in `coveringScopes` is what makes federal rules visible at all —
but the differentiator the listing sells does not exist yet. Two honest ways
to close it, and the choice should be deliberate:

- **Write state and industry rules — drafted, awaiting review.** Chosen
  2026-09-11. `convex/catalogueUs.ts` has 48 state entries (the periodic
  corporate/LLC report, across 47 jurisdictions) and 7 federal industry
  entries (Transport, Construction, Healthcare), each linked to its official
  source. Nothing is seeded: the review and the `reviewedAt` are the owner's,
  and the seeds require naming the states and industries actually reviewed.
  The gaps found while drafting — New Mexico, Missouri LLCs, Virginia
  corporations and three more — are in
  [rules-layer.md](rules-layer.md#draft-catalogue-review-notes).
- ~~**Or soften the copy**~~ — not chosen.

Shipping Phase 1 without doing one of these means the first reviews say the
suggestions are generic.

## Phase 3 — Be able to operate it

None of this blocks submission; all of it is the difference between shipping
and running a product.

- **Crash reporting.** Still none, and still deliberately: the data-safety
  declaration says no crash logs are collected, and that stays true. Adding an
  SDK changes what both stores have to be told, so it is a decision to take
  openly rather than a side effect.

  What has changed is that a render error no longer leaves a blank screen.
  `src/ErrorBoundary.tsx` catches it, says plainly that nothing was lost —
  obligations and documents live on the server, not the device — and offers a
  retry that remounts the tree. It reports nowhere, so no declaration moves.
  The gap that remains is visibility: you still learn about crashes from
  reviews rather than from telemetry.
- **End-to-end tests.** Started: `e2e/smoke.yaml` is a Maestro launch flow,
  run with `maestro test e2e/smoke.yaml` against a booted device.

  **It fails today, and should** — it asserts the authentication session
  resolves, which is Phase 0. That is the flow doing its job: an earlier
  version of it passed on this same broken app because it checked for the
  error banner immediately, before Clerk had finished timing out.

  The free-limit gate is now covered where it actually lives, in
  `__tests__/gating.test.tsx`: the real App, driven with a signed-in business,
  checking that a free account meets the paywall at the limit and that a
  subscriber never does. Policy was already unit tested, but policy that is
  never consulted gates nothing.

  Upload, purchase and restore still need a device and a session, so they wait
  on Phase 0.
- ~~**In-app account deletion.**~~ Done: Settings → Delete account, backed by
  `convex/account.ts`. It removes the owner's businesses, obligations and
  stored documents, cancels the device reminders for them, and signs out. The
  confirmation says plainly that a store subscription is not cancelled by it.
  The privacy page still documents only the email route and should mention
  this one.
- **Android parity.** Partly done: the app builds, installs and runs on a
  dedicated `Obligio_API36` emulator, which is how Phase 0 and the invisible
  dark-mode logo were both found. Still iOS-only: the screenshot tooling, and
  any verification past the first screen — which needs Phase 0 fixed first.

  One thing seen on the emulator and not yet explained: RevenueCat logs
  `PurchasesError` there. That is expected on an emulator with no Play account
  signed in, so it is not evidence of a bug — but billing has never been
  exercised on Android and should not be assumed working.

## Phase 4 — Expand

Only when a catalogue exists and someone has reviewed it. `COUNTRIES` in
`src/jurisdictions.ts` lists only jurisdictions that can actually be advised
on; adding one is a one-line change once the rules exist.

- **United Kingdom** is much the cheapest: `GB_REGIONS` and the whole en-GB
  locale already exist, and most UK obligations are nation-wide, so a small
  country-wide set goes as far as the US federal one does.
- **Australia and New Zealand** are each roughly a day of research —
  English, nationally dominant filing regimes, few regions.
- **The EU is not a jurisdiction**, it is 27 of them, with different company
  law, filing calendars and languages. Pick one country and treat it as its
  own, rather than the bloc.

## Known smaller items

- There is no export feature. It was wrongly described as one in a draft Play
  declaration; if it is wanted, it is Phase 3 work, not a correction.
