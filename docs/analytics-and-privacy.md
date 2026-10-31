# Analytics, crash reporting and what they change for privacy

Added 2 and 4 October 2026: Firebase Analytics and Firebase Crashlytics, in the
existing `royal-nation-llc` Firebase project, and push notifications (OneSignal until 1.3, Krontelli from 1.4). Nothing below has been submitted to either
store. **The public privacy policy, Apple's App Privacy label and Google Play's
Data Safety form all have to be updated before a build containing this ships.**

## What leaves the device

To Firebase, three things, deliberately few (OneSignal's push data is under
"Push notifications" below):

| What | Event | Parameters | When |
| --- | --- | --- | --- |
| An obligation was saved | `obligation_added` | `source`: `manual` or `template`; `recurring`: `0` or `1` | After the save succeeds |
| The Obligio Plus screen opened | `paywall_viewed` | `reason`: `free_limit`, `banner`, `evidence` or `settings` | When it opens |
| A crash or uncaught error | Crashlytics report | stack trace, device and OS model, app version, a fixed label for render errors | When it happens |

**First launch** is Firebase's automatic `first_open` event; it is not logged a
second time by the app. The SDK also sends its other automatic events:
`session_start`, `user_engagement`, `app_update`, `os_update`, and on Android
`app_clear_data`. It may log purchase events for store purchases on its own.
Automatic screen-view reporting is turned off (`firebase.json`).

Parameters are fixed words and numbers. **Never** an obligation title, business
name, email, date, document, or user id, and the app never calls `setUserId`.
`__tests__/analytics.test.ts` fails if an event carries any other parameter.

Debug builds report nothing: collection is switched off when `__DEV__` is true.

Crashlytics starts collecting when the JavaScript starts, not before: React
Native Firebase deliberately writes `FirebaseCrashlyticsCollectionEnabled = NO`
into the iOS Info.plist, and `initAnalytics` turns collection on in every
non-debug build. The setting then persists, so the only crash that can be
missed is one that happens before the JavaScript loads on the very first launch.

### Switched off on purpose (`firebase.json`, `ios/Podfile`)

- **Advertising ID / IDFA.** iOS links the analytics variant without ad-id
  support (`$RNFirebaseAnalyticsWithoutAdIdSupport`), so the app cannot read the
  IDFA at all and no App Tracking Transparency prompt is needed. Android's
  advertising ID collection is off.
- Ad storage, ad user data and ad personalization signals default to denied.
- Automatic screen reporting.

## Answers to change

These replace the "no analytics / crash reporting SDK" statements that were
true until now. They follow Firebase's published disclosures
([Apple](https://firebase.google.com/docs/ios/app-store-data-collection),
[Play](https://firebase.google.com/docs/android/play-data-disclosure),
[Google Analytics](https://support.google.com/analytics/answer/11582702)).
Declarations are made under your identity: check them before submitting.

### Apple — App Privacy

Tracking: **No.** No IDFA, no ATT prompt, nothing sent to ad networks or data
brokers. (Check one setting yourself: see "Property settings" below.)

Add, or add purposes to, these data types. Each is collected by the SDK, none
is used for tracking, and the app sets no user id, so they are not tied to an
account:

| Category → type | Purposes | Linked to you? |
| --- | --- | --- |
| Usage Data → Product Interaction (new) | Analytics | No |
| Diagnostics → Crash Data (new) | App Functionality, Analytics | No |
| Diagnostics → Performance Data (new) | App Functionality, Analytics | No |
| Diagnostics → Other Diagnostic Data (new) | App Functionality | No |
| Identifiers → Device ID (already declared) | add **Analytics** | Yes, already linked |
| Location → Coarse Location (already declared) | add **Analytics** | Yes, already linked |

Linked or not: Device ID and Coarse Location are already declared as *Linked*
(from sign-in, and `PrivacyInfo.xcprivacy` says so), so the Firebase use simply
adds the Analytics purpose to those same rows. The four new types are *not*
linked: the SDK's identifiers are per install, the app never calls `setUserId`,
and nothing joins them to an account. `ios/ComplianceCalendar/PrivacyInfo.xcprivacy`
now declares exactly this table. Apple, not this document, is the authority.

### Google Play — Data Safety

Nothing is *shared* (Google acts as a service provider for the app). All of it
is encrypted in transit. Advertising ID is **not** collected.

| Data type | Change | Purposes | Optional? |
| --- | --- | --- | --- |
| App activity → App interactions | **now Yes** (was "Other actions: No") | Analytics | Required: no in-app opt-out |
| App info and performance → Crash logs | **now Yes** (was No) | App functionality, Analytics | Required |
| App info and performance → Diagnostics | **now Yes** (was No) | App functionality, Analytics | Required |
| Device or other IDs (already Yes) | add purposes | **Analytics**, App functionality | Required |
| Location → Approximate location (already Yes) | add purpose | **Analytics** | Required |

### Public privacy policy (`web/privacy.html`)

Edited on 4 October 2026 to cover Firebase and OneSignal: two new paragraphs
under "What we collect" (usage and crash reports; push notifications), a
corrected "What we do not collect" (the old sentence said no behavioral
analytics), the two providers added to "Who processes your data", and the date.
It says OneSignal's software "may also record in-app purchase events", the
cautious reading of the purchase-tracker finding below.

**It is not live.** The site is deployed by hand, so the edit publishes only
when you run `netlify deploy --prod --dir=web --no-build`. Deploy it when the
build that contains Firebase and OneSignal is submitted, not before: until
then the live apps do not use either, and Apple compares the policy with what
the binary does.

### Property settings to check in Google Analytics

All of your apps share one Analytics property (`royal-nation-llc`). Two
property-level settings can widen what Google does with the data regardless of
what the app asks for: **Google signals** (Admin → Data collection) and
**data sharing settings** (Admin → Data sharing settings). The app's own
settings deny ad personalization, but if you want "Tracking: No" to rest on the
property as well, turn Google signals off.

## Configuration files

`google-services.json` (Android) and `GoogleService-Info.plist` (iOS) are
**git-ignored**: the repository is public and the Firebase project serves many
apps. Without them the app still builds and runs; Firebase just doesn't start
(`AppDelegate.swift` and `android/app/build.gradle` check for the file).
Regenerate them with the Firebase CLI, signed in to the account that owns
`royal-nation-llc`:

```bash
firebase apps:sdkconfig ANDROID 1:658707166921:android:4f06414ac90f41f04abf18 \
  --project royal-nation-llc --out android/app/google-services.json
firebase apps:sdkconfig IOS 1:658707166921:ios:3e02c47e485e90e14abf18 \
  --project royal-nation-llc --out ios/ComplianceCalendar/GoogleService-Info.plist
/usr/libexec/PlistBuddy -c "Set :IS_ANALYTICS_ENABLED true" ios/ComplianceCalendar/GoogleService-Info.plist
```

The last line matters: the CLI writes `IS_ANALYTICS_ENABLED` as `false` even
though the project has Google Analytics and both apps have data streams. Left
at `false`, the iOS app would not log events.

Firebase apps registered 2 October 2026 (display name "Obligio"): iOS
`com.obligio.app`, Android `com.obligio.app`. Data streams exist for both.
The `.screenshots` Android variant has a different applicationId and builds
with Firebase off.

## Building and shipping

- **Version.** Firebase and OneSignal first ship in iOS **1.2**. App Store
  Connect closes a version's train once it is submitted, so a new build for 1.1
  (in review) is refused with "must contain a higher version"; 1.2 is the next
  number. Create a 1.2 version record in App Store Connect when submitting.
- **Signing a release archive on this machine.** fastlane's archive step passes
  no API-key arguments, so after the cached provisioning profile is deleted
  (needed whenever a capability is added) it falls back to a wildcard profile
  with no entitlements and fails. Archive with the key passed once instead:
  `xcodebuild -workspace ios/ComplianceCalendar.xcworkspace -scheme ComplianceCalendar
  -configuration Release -destination generic/platform=iOS -archivePath <path>
  -allowProvisioningUpdates -authenticationKeyPath <p8> -authenticationKeyID <id>
  -authenticationKeyIssuerID <issuer> archive`, then `xcodebuild -exportArchive`
  with `method app-store-connect`, `signingStyle automatic` and the same three
  key arguments, then `bundle exec fastlane ios upload` with `IPA_PATH` set.
- **No location module.** OneSignal's SDK bundles a location module that links
  CoreLocation, and App Store Connect answered build 202610042310 with
  ITMS-90683 (missing `NSLocationWhenInUseUsageDescription`). The app never reads
  location, so `ios/Podfile` sets `ONESIGNAL_DISABLE_LOCATION` and
  `android/gradle.properties` sets `onesignal.disableLocation=true`; from build
  202610051205 the binary no longer links CoreLocation. No purpose string was
  added, because the app does not ask for location. After changing the flag,
  reinstall pods with `bundle exec pod install` (plain `pod install` is a
  different CocoaPods version and rewrites the whole lockfile).
- **Android advertising ID.** Firebase Analytics merges the `AD_ID` permission
  into the manifest. Play refuses a release that carries it while the Console
  declares that the app does not use an advertising ID ("Invalid request - This
  release includes the com.google.android.gms.permission.AD_ID permission").
  The app does not read it, so `android/app/src/main/AndroidManifest.xml` removes
  `AD_ID` and `ACCESS_ADSERVICES_AD_ID` with `tools:node="remove"`; keep the
  Console answer at "No". Check the merged manifest after adding an SDK.
- **Uploading to Play.** Use the service account in `PLAY_JSON_KEY_FILE`
  (`fastlane/.env`, outside the repository), not the console:
  `bundle exec fastlane run upload_to_play_store track:internal release_status:completed
  aab:android/app/build/outputs/bundle/release/app-release.aab skip_upload_metadata:true
  skip_upload_images:true skip_upload_screenshots:true skip_upload_changelogs:true`.
  A version code can be used once, even for a draft that was never rolled out.
- **Confirm the push entitlement before uploading.** The exported IPA should
  show `aps-environment` = `production` (`codesign -d --entitlements :-`).

## Push notifications (Krontelli)

Since 1.4 the app connects to Krontelli, our own push server (public key in `src/config.ts`; it can only register an
installation, and sending needs a server key that is not in this repository). The APNs key and Firebase service account
that deliver pushes are held by Krontelli. Crash reports also go to GlitchTip, our own error server (`src/errors.ts`):
no user, no breadcrumbs, no screenshots.

What the app does and does not do (`src/push.ts`):

- **Does not ask for permission.** Initialization never prompts. The existing reminder flow asks once
  (`prepareNotifications`), and the token is reported as soon as permission is granted.
- **Does not identify anyone.** It never calls `login`, so a device is not tied to the Clerk account or an email.
- **Sends no usage events** (`events.automatic` is false). The only records are whether a push arrived and was opened.
- **Does nothing in debug builds.**
- Local deadline reminders (Notifee) are untouched and need no network.

Krontelli receives a push token, a random installation id, OS and app version, language, time zone, and the marketing
opt-in. IP is used for rate limiting and not stored; traffic goes through Cloudflare.

**Store answers.** No new data types. The earlier notes about OneSignal's automatic purchase trackers no longer apply:
those SDKs are gone, and Krontelli is our own service, so nothing here is shared with a third party.

### Rules for sending pushes

- **Marketing needs consent in the app.** Apple's guideline 4.5.4 forbids using push for promotions unless people
  opted in through the app's own UI: Settings, "Product news and offers", off by default. Send promotions as a
  `campaign` message, which reaches only those who consented. Never send one as `transactional`.
- People who opted in under OneSignal are not carried over: the tag lived there. They are off until they opt in again.
- Push must never be required for the app to work: it isn't. Local reminders carry the core feature.
- Sending requires the Krontelli dashboard or server key. That key is never to be added to this repository.

### Before the first push is sent

Push entitlement is `development` in the source file; Xcode substitutes
`production` from the App Store provisioning profile. The App ID
`com.obligio.app` already has the Push Notifications capability. After any
change to capabilities, delete the cached profile for the app in
`~/Library/Developer/Xcode/UserData/Provisioning Profiles` before archiving
(see the note in `fastlane/Fastfile`).

## Correction: the consent defaults were not applied in 1.2

`firebase.json` first named the three consent defaults
`google_analytics_default_allow_ad_storage`, `..._ad_user_data` and
`..._ad_personalization_signals`. React Native Firebase reads them as
`analytics_default_allow_*` (no `google_analytics_` prefix) and silently ignores
a key it does not know, so on both platforms builds up to and including iOS 1.2
and Android 1.2 (15) ran with those three defaults at the SDK's own default,
"allowed". A Release run on the simulator showed `non_personalized_ads = 0` in
GA4 DebugView, which is how it was found.

What did not change: no advertising ID is read (the ad-ID subspec is excluded on
iOS, the `AD_ID` permission is removed on Android), Google signals is off on the
GA4 property, and the app is not linked to any Google Ads account, so the
App Privacy and Data Safety answers ("no tracking", no advertising ID) stay
true. What did: the SDK was not asking Google to treat ad storage, ad user data
and ad personalization as denied. The keys are fixed in `firebase.json` and take
effect from the next build, and `__tests__/firebaseConfig.test.ts` now fails if
any key in `firebase.json` is not one the installed SDK reads.
