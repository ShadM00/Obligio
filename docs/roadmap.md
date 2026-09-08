# Roadmap

What is left, in the order it is worth doing. State verified against both
stores and the production backend on 2026-09-08.

## Where things actually stand

| | State |
| --- | --- |
| Backend | `greedy-parakeet-883` current with `main`; auth gate closed; 8 rules, **0 businesses** |
| App Store | 1.0 *Prepare for Submission*, build `202609062135` attached, export compliance carried in the binary |
| Play | internal track, version code 3, completed. No closed, open or production track |
| Listings | text, 5 screenshots, feature graphic and icon live on both stores |
| Subscriptions | `obligio_plus_monthly` / `obligio_plus_annual` **Ready to Submit**, review screenshots attached, RevenueCat keys set for both platforms |
| Tests | 164 unit tests, `tsc` clean. No end-to-end tests |

Neither store has been submitted.

## Phase 0 — Nobody can sign in

**Authentication is broken on both platforms, in the builds already on
TestFlight and Play.** This is why `businesses` is empty: it is not that
nobody has tried, it is that nobody can.

Both apps are built against Clerk production, whose frontend API is
`clerk.obligio.com` — the publishable key encodes that host, and Convex
verifies tokens against the same URL. That hostname **does not resolve**:

```
clerk.obligio.com           NXDOMAIN
accounts.obligio.com        NXDOMAIN
clkmail.obligio.com         NXDOMAIN
clk._domainkey.obligio.com  NXDOMAIN
clk2._domainkey.obligio.com NXDOMAIN
```

On Android this surfaces as "Unable to load the authentication session" over
four uncaught coroutine errors, with `ClerkLog: Failed to refresh client and
environment` in logcat. iOS fails the same way for the same reason.

The Clerk production instance itself is fine — it exists, and the key is
correct for it. What is missing is five CNAME records on `obligio.com`, whose
DNS is at Hostinger:

| Host | Target |
| --- | --- |
| `clerk` | `frontend-api.clerk.services` |
| `accounts` | `accounts.clerk.services` |
| `clkmail` | `mail.o90g9fmf2i15.clerk.services` |
| `clk._domainkey` | `dkim1.o90g9fmf2i15.clerk.services` |
| `clk2._domainkey` | `dkim2.o90g9fmf2i15.clerk.services` |

They are additive — every one of those subdomains is currently unused, and the
zone holds no MX records, so nothing that exists today is affected. Values come
from `clerk api /domains`; they validate against the Hostinger zone API.

A store reviewer hits this on the first screen, so nothing below matters until
it is fixed.

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

- **Write state and industry rules.** The highest-value slices are the ones
  with real per-state variation: workers' compensation, business licence
  renewal, food handler certification, contractor licensing. Each needs
  research and a `reviewedAt` attestation — the content and the attestation are
  the work; the tooling is not in the way. `seedRules.addTemplate` takes any
  country/region/industry and is now idempotent, and `catalogue:review` lists
  what is seeded with its authorities and review ages so a review, first or
  repeat, is something you can sit down and do.
- **Or soften the copy** until they exist, so the listing describes the
  federal catalogue it actually ships with.

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
