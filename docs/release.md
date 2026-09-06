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
git config core.hooksPath scripts/git-hooks   # refuses to commit private keys
```

Keep every credential outside the repository, or in `secrets/`, which is
ignored wholesale. Filename rules alone are not enough — a Google Cloud
service-account key downloads as `<project>-<keyid>.json`, which no pattern
predicts — so `scripts/git-hooks/pre-commit` scans staged *content* for private
key material and refuses the commit regardless of filename.

Fill in `ASC_ISSUER_ID` (Users and Access → Integrations → App Store Connect API, shown once at the top of the page and shared by every key), then `ASC_KEY_ID` and `ASC_KEY_FILEPATH` for a key with **App Manager** or **Admin** access, and `PLAY_JSON_KEY_FILE` for a Play service account with **Release manager**. `fastlane/.env` is gitignored, and `**/AuthKey_*.p8` is ignored too. **This repository is public — no private key or service-account JSON may ever be committed.**

## Lanes

The iOS lane needs an App Store Connect API key with **Admin** access, not
App Manager. Creating a distribution signing certificate and provisioning
profile is "cloud signing", and App Manager cannot do it — the export fails
with `Cloud signing permission error` followed by `No profiles for
'com.obligio.app' were found`, even though the archive itself succeeds and the
key authenticates fine.

```sh
bundle exec fastlane ios release        # archive, sign, upload to TestFlight
bundle exec fastlane android release    # bundleRelease, upload to the internal track as a draft
bundle exec fastlane ios metadata       # push App Store listing text only
bundle exec fastlane ios screenshots    # push App Store screenshots only
bundle exec fastlane android metadata   # push Play listing text, images and screenshots
```

`ios screenshots` is deliberately separate from `ios metadata`. Uploading
listing text for an app whose first version has never been submitted ends in
spaceship raising `No data` — after the text has landed, but before deliver
reaches the screenshots. Bundled together, the screenshots would never upload
at all. Run the text lane, ignore that crash, then run the screenshot lane.

`supply` has no equivalent split, so `android metadata` carries the Play
images and screenshots alongside the text.

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

## What the subscription unlocks

Obligio Plus gates three things, defined in `src/entitlements.ts`:

| | Free | Plus |
| --- | --- | --- |
| Obligations tracked | 3 | unlimited |
| Document evidence | — | ✓ |
| Recurring obligations | — | ✓ |

`FREE_REQUIREMENT_LIMIT` is a pricing decision expressed as one constant.
Competitors give one or two items free; three is slightly more generous
because a compliance tracker only looks useful once it holds a real picture.

Two things to know about how this is enforced:

- **The check is client-side.** It decides what the UI offers, not what the
  backend permits. Convex does not know the entitlement state, so a modified
  client could exceed the limit. That is normal for this class of app, but if
  the limit ever needs to be real, RevenueCat webhooks into Convex are the
  route.
- **A build with no store key is not gated.** It cannot sell anything, so
  gating would leave features permanently unreachable with no way to buy
  them. Production always carries a key, so this never relaxes a real
  customer's limits.

## Export compliance

`ITSAppUsesNonExemptEncryption` is declared `false` in `ios/ComplianceCalendar/Info.plist`.

Obligio uses only encryption exempt under US export regulations — HTTPS/TLS
provided by the operating system, through Convex, Clerk, and RevenueCat. It
implements no proprietary cryptography and bundles no crypto library.

Without that key, App Store Connect marks every uploaded build **Missing
Compliance** and will not release it to testers until someone answers the
question by hand. Builds uploaded before the key was added still need
answering once in App Store Connect; later builds clear automatically.

## Before the first submission

Neither store can accept a build until these are done, and none of them can be done from this repository.

### RevenueCat — complete

| Field | Value |
| --- | --- |
| Project | Obligio, `388c935c` |
| App Store app | `app3b3ac2cefb` — key `appl_SIBIzGDFokrIPHVzuFUEEaDSbLl` |
| Play Store app | `app6413bd9f3e` — key `goog_joeqthkYcqpkIIwTHgTAPyWmFPT` |
| In-app purchase key | `UD463F4JM7` ("RevenueCat IAP Key"), team-scoped |
| Entitlement | `obligio_plus`, 4 products |
| Offering | `default` ("Obligio Plus"), 2 packages, marked current |

#### Product identifiers differ by store

| Package | App Store | Google Play |
| --- | --- | --- |
| `$rc_monthly` | `obligio_plus_monthly` | `obligio_plus_monthly:monthly` |
| `$rc_annual` | `obligio_plus_annual` | `obligio_plus_annual:annual` |

Play identifies a purchasable thing as `<product>:<base_plan>`, so the
identifiers are not comparable across platforms. Select by **package** —
`$rc_monthly` and `$rc_annual` are identical on both stores. `src/billing.ts`
deliberately declares no product-id constants for this reason.

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
- **Category** — primary is Productivity; no secondary is set. A secondary category is free ASO surface, and Business fits the listing.
- **Subtitle** — set to "License, Permit & Filing Dates" (30/30). The app name is "Obligio: Compliance Tracker" (27/30) on both stores.
- **App Privacy** — the questionnaire must be completed before review.
- **Screenshots** — five 1290x2796 images are live, pushed by `ios screenshots`. The release lanes still leave them untouched.

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

## Capturing screenshots

`src/screenshots/` renders the real screens against fixture data, for store
listings and the per-product review screenshot App Store Connect requires.

```sh
# 1. in src/screenshots/config.ts: SCREENSHOT_MODE = true, AUTO_ADVANCE_MS = 3500
# 2. run this project's Metro and install the app on a booted simulator
npx react-native start --port 8082
RCT_METRO_PORT=8082 npx react-native run-ios --udid <udid> --port 8082 --no-packager
# 3. if 8081 is taken by another project, point the app at the right bundler --
#    otherwise it will happily load that project's bundle and fail on a native
#    module this app has never depended on
xcrun simctl spawn <udid> defaults write com.obligio.app RCT_jsLocation "localhost:8082"
# 4. capture both appearances, then compose the listing images
python3 scripts/capture-screenshots.py <udid> /tmp/captures
python3 scripts/build-store-screenshots.py /tmp/captures /tmp/store
cp /tmp/store/light-*.png fastlane/screenshots/en-US/
cp /tmp/store/light-*.png fastlane/metadata/android/en-US/images/phoneScreenshots/
# 5. set SCREENSHOT_MODE back to 0/false before committing
```

`capture-screenshots.py` drives the gallery instead of anyone tapping it, so a
re-capture after a copy change is reproducible. Three things about it are worth
knowing before changing either script:

- It relaunches with `--terminate-running-process`. A bare `simctl launch` on a
  running app only foregrounds it, so the gallery keeps its frame index and
  every caption ends up attached to the wrong screen.
- It groups samples into runs and filters them by **elapsed time**, not by how
  many samples a run collected. A `simctl` screenshot costs a few hundred
  milliseconds more than the sample interval, so a count threshold drops a real
  frame on a loaded machine and shifts the whole set by one.
- The gallery holds its first frame for two steps. That frame is on screen from
  first paint rather than from mount, so a cold bundle load can shrink it to
  almost nothing; being the longest run is also how the script finds where the
  cycle starts, rather than assuming the first thing it sees is frame one.

`index.js` only consults the flag behind `__DEV__`, so Metro strips the
harness and its fixtures from release bundles whatever the flag says. That is
verified by bundling with `--dev false` and grepping for fixture strings.

The fixture prices mirror App Store Connect ($9.99 monthly, $79.99 annual) so
a review screenshot shows a reviewer the same figures as the product.

Listing images are composed at **1290x2796**. Apple accepts that for the 6.9"
slot and scales it up, and it is the largest iPhone size fastlane 2.229 knows
about — deliver rejects a 1320x2868 file outright as an invalid screen size,
before it uploads anything. Play takes the same file as a phone screenshot.

Captures come from an iPhone 17 Pro Max at 1320x2868 and are scaled into that
canvas. An iPhone 17 Pro captures at 1206x2622, which suits the subscription
review screenshot but is too small for the listing.

Play additionally requires a 512x512 icon and a 1024x500 feature graphic, both
built from the shipping icon and palette by `scripts/build-play-graphics.py`.
