# Obligio

US-first, English-localized compliance calendar for small businesses. Built with React Native CLI (not Expo), Convex, RevenueCat-ready subscription integration, and local Fastlane deployment lanes.

## Status

The app shell, localization, Convex schema and functions, document evidence upload, recurring-deadline scheduling, reminder notifications, store metadata, privacy/support pages, icon source, and Fastlane lanes are prepared and wired end to end in the client.

Two things still require owner credentials and are not claimed complete:

- **Subscriptions.** The paywall loads offerings, purchases, and restores through RevenueCat, but the store keys in `src/config.ts` are `null`. Until they are set the paywall reports that plans are unavailable.
- **Authentication.** The native `ObligioAuth` Clerk bridge exists on both platforms, but the native applications are not registered in Clerk production. Without a session the app shows clearly-labelled sample data and Convex returns nothing. See [docs/native-auth-bridge.md](docs/native-auth-bridge.md).

Signed store binaries still require local signing assets; deployment is not claimed complete.

## Setup

```sh
npm install
cd ios && bundle exec pod install && cd ..
npx react-native start
npx react-native run-ios
```

## Checks

```sh
npx tsc --noEmit
npm test
npm run lint
```

## Seeding the rules catalogue

`seedRules.addTemplate` is an internal mutation, so it is not callable from the app. Run it from the Convex dashboard or from another Convex function.
