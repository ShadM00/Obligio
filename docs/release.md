# Release runbook

## Identifiers

| Thing | Value |
| --- | --- |
| iOS bundle ID / Android applicationId | `com.obligio.app` |
| Apple Developer team | Royal Nation LLC — `2KBXMW6U9N` |
| App Store Connect app (Apple ID) | `6808265621`, SKU `obligio-ios-001` |
| Play Console app | `4972270178712028511` (developer `6522086200763164145`) |
| Marketing / support / privacy | `obligio.com`, `/support`, `/privacy` |

The bundle identifier matches on both platforms and matches the App Store Connect record. `DEVELOPMENT_TEAM` is set to the Royal Nation LLC team in both iOS build configurations with automatic signing, so archiving no longer requires manual selection in Xcode.

## One-time local setup

```sh
cp fastlane/.env.example fastlane/.env
```

Fill in `ASC_ISSUER_ID` (Users and Access → Integrations → App Store Connect API, shown once at the top of the page and shared by every key), then `ASC_KEY_ID` and `ASC_KEY_FILEPATH` for a key with **App Manager** or **Admin** access, and `PLAY_JSON_KEY_FILE` for a Play service account with **Release manager**. `fastlane/.env` is gitignored, and `**/AuthKey_*.p8` is ignored too. **This repository is public — no private key or service-account JSON may ever be committed.**

## Lanes

```sh
bundle exec fastlane ios release        # archive, sign, upload to TestFlight
bundle exec fastlane android release    # bundleRelease, upload to the internal track as a draft
bundle exec fastlane ios metadata       # push App Store listing text only
bundle exec fastlane android metadata   # push Play listing text only
```

Both release lanes skip metadata and screenshots so a build upload never silently rewrites a live listing. Push listing changes deliberately with the `metadata` lanes.

Listing text lives in `fastlane/metadata/` (App Store, `en-US`) and `fastlane/metadata/android/en-US/` (Play). These are the only source of truth; the former `store/metadata/` directory was merged into them because `supply` never read it.

## Before the first submission

Neither store can accept a build until these are done, and none of them can be done from this repository.

### RevenueCat — blocking for the paywall

There is **no Obligio project in RevenueCat**. Until there is, `src/config.ts` keeps null keys and the paywall reports that plans are unavailable.

1. Create an Obligio project; add the iOS app (`com.obligio.app`, App Store Connect API key) and the Android app (`com.obligio.app`, Play service account).
2. Copy each app's **public SDK key** into `REVENUECAT_KEYS` in `src/config.ts` — `appl_…` for iOS, `goog_…` for Android. These are publishable and safe to commit.
3. Create the entitlement `obligio_plus` and attach the products `obligio_plus_monthly` and `obligio_plus_annual`, then add them to the current offering. The identifiers are already referenced in `src/billing.ts`.

### App Store Connect

The app sits at **1.0 Prepare for Submission**. Outstanding:

- **Subscriptions** — no subscription group exists. Create one, then create `obligio_plus_monthly` and `obligio_plus_annual` inside it. RevenueCat cannot sell products that do not exist here.
- **Age rating** — not set up.
- **Content rights** — not declared.
- **Category** — no primary category chosen; Business with a Productivity secondary matches the listing.
- **Subtitle** — currently empty. `fastlane ios metadata` would set it to "Compliance calendar for SMBs". The app name stays "Obligio"; the longer "Obligio: Compliance Calendar" is the Play title only.
- **App Privacy** — the questionnaire must be completed before review.
- **Screenshots** — none are managed here yet; both `metadata` lanes leave screenshots untouched.

### Google Play

The app entry exists with nothing released.

- The package name binds on the **first bundle upload**, so `com.obligio.app` is not reserved until then. Upload the first internal-track build before anyone else can claim it.
- Create the Play **service account** (Setup → API access → grant Release manager) and point `PLAY_JSON_KEY_FILE` at its JSON.
- Create an upload keystore and wire `android/app/build.gradle` signing configs; the release lane currently produces an unsigned-for-upload bundle without one. Keystores are gitignored (`*.jks`, `*.keystore`).
- Complete the Play Console content declarations (data safety, content rating, target audience).

### Authentication

The native Clerk applications are still not registered in Clerk production; see [native-auth-bridge.md](native-auth-bridge.md). Without that, a signed build has no session and the app shows only its labelled sample data.
