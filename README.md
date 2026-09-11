# Obligio

US-first, English-localized compliance calendar for small businesses. Track licences, insurance, filings, inspections, and the documents that evidence them — in one place, with deadlines that repeat on their own.

Built with React Native CLI (not Expo), Convex for the backend and file store, Clerk for authentication through a narrow native bridge, and RevenueCat for subscriptions.

## Status

This is pre-release. The client is wired end to end: onboarding, obligations, a
month-grouped calendar, document evidence upload, recurring completion, deadline
reminders, and the subscription paywall all talk to real backend functions.

Verified against both stores and the production backend on 2026-09-08:

| Area | State |
| --- | --- |
| **Backend** | `greedy-parakeet-883` is current with `main`. The rules catalogue holds 8 US federal entries, reviewed 2026-09-06. |
| **Subscriptions** | RevenueCat keys are set for both platforms. `obligio_plus_monthly` and `obligio_plus_annual` are *Ready to Submit* with review screenshots attached. |
| **Authentication** | The native `ObligioAuth` Clerk bridge is live on both platforms and Convex is configured against the Clerk instance. See [docs/native-auth-bridge.md](docs/native-auth-bridge.md). |
| **App Store** | 1.0 *Prepare for Submission*, build `202609112039` attached, listing and screenshots live. Not submitted. |
| **Play** | Internal track, version code 7, completed. No closed, open or production track. Listing, screenshots, feature graphic and icon live. |

**Sign-in works on both platforms as of 2026-09-10**, verified on device
through to Clerk's credential screen. Nobody has yet completed a sign-in
against production — the `businesses` table is still empty. Several
console-side declarations are also outstanding on both stores. Deployment is
not claimed complete; [docs/roadmap.md](docs/roadmap.md) is the ordered list of
what is left.

## Getting started

```sh
git clone https://github.com/ShadM00/Obligio.git
cd Obligio
npm install
```

iOS additionally needs CocoaPods:

```sh
bundle install
cd ios && bundle exec pod install && cd ..
```

Run it:

```sh
npx react-native start
npx react-native run-ios      # or: npx react-native run-android
```

Convex functions run against the deployment named in `.env.local` (not committed):

```sh
npx convex dev
```

## Moved the checkout?

Gradle, CMake, and React Native autolinking all record **absolute** paths in their build output. After moving or copying this directory, purge the derived state or every Gradle task will fail while still pointing at the old location — see [docs/release.md](docs/release.md#after-moving-the-project-directory).

## Before your first commit

```sh
git config core.hooksPath scripts/git-hooks
```

This repository is public. The hook refuses to commit private key material by
inspecting staged content, so a renamed credential cannot slip past the
filename-based ignore rules.

## Checks

```sh
npx tsc --noEmit
npm test
npm run lint
```

All three are expected to pass with zero errors and zero warnings.

## Project layout

| Path | What lives there |
| --- | --- |
| `App.tsx` | Composition root — tabs, top-level state, mutation wiring |
| `src/screens.tsx` | Welcome, Home, Calendar, Documents, Settings |
| `src/modals.tsx` | Add requirement, obligation detail, paywall |
| `src/theme.ts`, `src/designTokens.ts` | Themed stylesheets and semantic colour tokens (light and dark) |
| `src/session.ts` | Native Clerk session state, and keeping Convex auth in step |
| `src/jurisdictions.ts` | Countries, regions, and industries the rules catalogue is keyed on |
| `scripts/generate-icons.py` | Renders the app icon into both platforms' icon sets |
| `src/dates.ts` | Date parsing, validation, locale-aware formatting |
| `src/config.ts` | Convex URL and RevenueCat store keys |
| `src/nativeAuth.ts` | JS side of the Clerk native bridge |
| `src/billing.ts`, `src/notifications.ts`, `src/documentUpload.ts` | Platform integrations |
| `convex/` | Schema, queries, mutations, authorization helpers |
| `docs/` | Architecture, release runbook, rules layer, auth bridge, RevenueCat, design strategy |
| `web/` | Privacy, terms, and support pages (deployed to Netlify) |
| `fastlane/` | Build and release lanes, plus store listing metadata for both platforms |

## Conventions worth knowing

**Dates are always ISO.** Every `dueDate` is stored as `YYYY-MM-DD` with no time or zone. `src/dates.ts` parses what an owner types — `Oct 14, 2026`, `14 Oct 2026`, or locale-ordered slash dates — and refuses anything it cannot resolve rather than storing an unusable string. `convex/dates.ts` re-validates on the server. Display formatting follows the active locale and happens at the edge.

**Every public Convex function is gated.** Tenant data requires business ownership via `requireBusinessOwner`. The shared rules catalogue requires a session. `seedRules.addTemplate` is an *internal* mutation — seeding is operator tooling, so run it from the Convex dashboard or another Convex function, never from a client. The one deliberate exception is `businesses.getByOwner`, which returns `null` rather than throwing when there is no identity: it is the query the app subscribes to on launch, before the auth bridge has a token. It still fails closed.

**The client never sees a storage URL.** Evidence is uploaded to a Convex-generated upload URL and attached to the owning requirement by id.

## Releasing

```sh
cp fastlane/.env.example fastlane/.env   # fill in the API key ids and paths
bundle exec fastlane ios release
bundle exec fastlane android release
```

Authentication uses an App Store Connect API key, so the lanes are non-interactive and 2FA-proof. Secrets stay outside the repository — see [docs/release.md](docs/release.md) for the full runbook and the pre-submission checklist.

## Theming and accessibility

The app follows the OS light/dark setting. Colour tokens are semantic
(`surface`, `textMuted`, `brand`) rather than literal, because each role takes
a different value per scheme.

`__tests__/theme.test.ts` asserts WCAG AA contrast — 4.5:1 for body text, 3:1
for indicators — across every documented colour pair in both schemes, and that
the two palettes define the same tokens. Adding a token to one scheme and
forgetting it in the other renders as undefined, which React Native ignores
silently, so the parity check is load-bearing.

## Localization

`en-US` and `en-GB`, switchable from the header. The locale drives spelling, date display order, and how typed slash dates are read — `03/04/2026` is March 4th to a US owner and 3rd April to a UK one.

## Disclaimer

Obligio provides organizational tools, not legal or tax advice.

## End-to-end

`e2e/smoke.yaml` is a [Maestro](https://maestro.mobile.dev) launch flow. Boot a
device or emulator, install a debug build, then:

```sh
maestro test e2e/smoke.yaml
```

It asserts the welcome screen renders *and* that the session resolves, so it
fails while authentication is broken. See [docs/roadmap.md](docs/roadmap.md).
