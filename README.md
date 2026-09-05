# Obligio

US-first, English-localized compliance calendar for small businesses. Track licences, insurance, filings, inspections, and the documents that evidence them — in one place, with deadlines that repeat on their own.

Built with React Native CLI (not Expo), Convex for the backend and file store, Clerk for authentication through a narrow native bridge, and RevenueCat for subscriptions.

## Status

This is pre-release. The client is wired end to end: onboarding, obligations, a month-grouped calendar, document evidence upload, recurring completion, deadline reminders, and the subscription paywall all talk to real backend functions.

Two things need owner credentials and are **not** complete:

| Area | State |
| --- | --- |
| **Subscriptions** | The paywall loads offerings, purchases, and restores through RevenueCat, but the store keys in `src/config.ts` are `null`. Until they are set, the paywall reports that plans are unavailable. |
| **Authentication** | The native `ObligioAuth` Clerk bridge exists on both platforms, but the native applications are not registered in Clerk production. Without a session the app shows clearly-labelled sample data and Convex returns nothing. See [docs/native-auth-bridge.md](docs/native-auth-bridge.md). |

Signed store binaries still require local signing assets. Deployment is not claimed complete.

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
| `src/theme.ts`, `src/designTokens.ts` | Shared styles and design tokens |
| `src/dates.ts` | Date parsing, validation, locale-aware formatting |
| `src/config.ts` | Convex URL and RevenueCat store keys |
| `src/nativeAuth.ts` | JS side of the Clerk native bridge |
| `src/billing.ts`, `src/notifications.ts`, `src/documentUpload.ts` | Platform integrations |
| `convex/` | Schema, queries, mutations, authorization helpers |
| `docs/` | Architecture, rules layer, auth bridge, RevenueCat, design strategy |
| `web/` | Privacy, terms, and support pages (deployed to Netlify) |
| `fastlane/` | Local build and release lanes |

## Conventions worth knowing

**Dates are always ISO.** Every `dueDate` is stored as `YYYY-MM-DD` with no time or zone. `src/dates.ts` parses what an owner types — `Oct 14, 2026`, `14 Oct 2026`, or locale-ordered slash dates — and refuses anything it cannot resolve rather than storing an unusable string. `convex/dates.ts` re-validates on the server. Display formatting follows the active locale and happens at the edge.

**Every public Convex function is gated.** Tenant data requires business ownership via `requireBusinessOwner`. The shared rules catalogue requires a session. `seedRules.addTemplate` is an *internal* mutation — seeding is operator tooling, so run it from the Convex dashboard or another Convex function, never from a client. The one deliberate exception is `businesses.getByOwner`, which returns `null` rather than throwing when there is no identity: it is the query the app subscribes to on launch, before the auth bridge has a token. It still fails closed.

**The client never sees a storage URL.** Evidence is uploaded to a Convex-generated upload URL and attached to the owning requirement by id.

## Localization

`en-US` and `en-GB`, switchable from the header. The locale drives spelling, date display order, and how typed slash dates are read — `03/04/2026` is March 4th to a US owner and 3rd April to a UK one.

## Disclaimer

Obligio provides organizational tools, not legal or tax advice.
