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

## After moving the project directory

Android and iOS build state records **absolute** paths, so a moved checkout keeps building against the old location until the derived directories are purged. This bit the project twice already — `android/build/generated/autolinking/autolinking.json` still pointed at a `SBA_Compliance` path from two moves ago and made every Gradle task fail at configuration time.

```sh
(cd android && ./gradlew --stop)
rm -rf android/build android/app/build android/app/.cxx android/.gradle android/.kotlin ios/build
rm -rf node_modules/*/android/build node_modules/@*/*/android/build \
       node_modules/@react-native/gradle-plugin/.gradle
```

Auditing for leftovers needs care: `grep` on a developer machine is often a wrapper that honours `.gitignore`, and every one of these files is gitignored. Use the real binary:

```sh
/usr/bin/grep -rla "<old/path>" --exclude-dir=.git .
```

## Build verification

The Android release pipeline has been run end to end against a disposable throwaway key: `bundleRelease` completes in about two minutes and produces a ~43 MB bundle for `com.obligio.app` containing the Hermes JS bundle and 44 native libraries. ProGuard and the native release build are therefore known-good; the only thing between here and an internal-track upload is real key material.

Never upload a bundle signed with anything but the real upload key — the first upload permanently binds the signing certificate for the package.

## Before the first submission

Neither store can accept a build until these are done, and none of them can be done from this repository.

### RevenueCat — complete

| Field | Value |
| --- | --- |
| Project | Obligio, `388c935c` |
| App Store app | `app3b3ac2cefb` — key `appl_SIBIzGDFokrIPHVzuFUEEaDSbLl` |
| Play Store app | `app6413bd9f3e` — key `goog_joeqthkYcqpkIIwTHgTAPyWmFPT` |
| In-app purchase key | `UD463F4JM7` ("RevenueCat IAP Key"), team-scoped |
| Entitlement | `obligio_plus`, 2 products |
| Offering | `default` ("Obligio Plus"), 2 packages, marked current |

Both keys are in `src/config.ts`, so billing is enabled on both platforms.
The identifiers match `src/billing.ts`, and `getAvailablePackages` reads
`offerings.current`, which resolves to `default`.

#### Android is keyed but not yet transacting

The Play Store app configuration has a public SDK key but **no service-account
credentials**, so RevenueCat cannot reach Google Play. Until the JSON key is
uploaded to that configuration:

- RevenueCat cannot fetch Play product metadata, so `offerings.current`
  returns no packages on Android;
- the paywall therefore renders "No subscription plans are currently offered",
  which is the safe degraded state — a purchase cannot be started, so nobody
  can be charged for an entitlement RevenueCat could not then validate.

Shipping an Android build before that JSON lands gives users a paywall with
nothing in it. It does not give them a broken purchase, but it is not
sellable either.

#### Both iOS products show Missing Metadata

RevenueCat reports this when it cannot fetch price and duration from App Store
Connect, which happens while the ASC product itself is incomplete. The paywall
renders `product.title`, `product.description`, and `product.priceString`, so
those stay blank until ASC is satisfied.

With pricing and localizations already set, the remaining ASC requirement is
the per-product **review screenshot**. That creates a circular dependency
worth naming: the screenshot should show the paywall, the paywall shows
nothing until metadata syncs, and metadata will not sync until the screenshot
is uploaded. Break it by capturing the paywall against representative package
data rather than live store data — the same component and styling a reviewer
will see.

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
- Create an upload keystore. The signing config in `android/app/build.gradle` is already wired and validated — `validateObligioUploadSigning` fails the build with a named list of anything missing, and refuses debug credentials for a release. Only the key material is absent:

  ```sh
  keytool -genkeypair -v -storetype PKCS12 \
    -keystore ~/keys/obligio-upload.jks -alias obligio-upload \
    -keyalg RSA -keysize 2048 -validity 10000
  ```

  Then export the four values it reads, from the environment or from `~/.gradle/gradle.properties` (never from a file in this repository):

  | Variable | Value |
  | --- | --- |
  | `OBLIGIO_UPLOAD_STORE_FILE` | absolute path to the `.jks` |
  | `OBLIGIO_UPLOAD_STORE_PASSWORD` | keystore password |
  | `OBLIGIO_UPLOAD_KEY_ALIAS` | `obligio-upload` |
  | `OBLIGIO_UPLOAD_KEY_PASSWORD` | key password |

  Keep the keystore backed up and outside the repository; `*.jks` and `*.keystore` are gitignored. Losing it means losing the ability to update the app unless Play App Signing is enabled.
- Complete the Play Console content declarations (data safety, content rating, target audience).

### Authentication

The native Clerk applications are still not registered in Clerk production; see [native-auth-bridge.md](native-auth-bridge.md). Without that, a signed build has no session and the app shows only its labelled sample data.
