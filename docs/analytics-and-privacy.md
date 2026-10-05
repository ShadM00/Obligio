# Analytics, crash reporting and what they change for privacy

Added 2 and 4 October 2026: Firebase Analytics and Firebase Crashlytics, in the
existing `royal-nation-llc` Firebase project, and OneSignal push notifications. Nothing below has been submitted to either
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

## Push notifications (OneSignal)

The app connects to the OneSignal app "Obligio" (id in `src/config.ts`; an app
id is public, sending needs a REST key that is not in this repository). The APNs
key and Firebase service account that deliver pushes were uploaded to OneSignal
in its dashboard and are not kept here.

What the app does and does not do (`src/push.ts`):

- **Does not ask for permission.** Initialization never prompts. The existing
  reminder flow asks once (`prepareNotifications`), the operating system has a
  single notification permission, and OneSignal registers a push token as soon
  as it is granted. Until then there is no push subscription.
- **Does not identify anyone.** It never calls `login`, so a device is not tied
  to the Clerk account or an email. Pushes go to all devices or to segments of
  devices, not to a named person.
- **Does nothing in debug builds.**
- Local deadline reminders (Notifee) are untouched and need no network.

What OneSignal collects by default, per its own disclosures
([Apple](https://documentation.onesignal.com/docs/en/apple-app-privacy-requirements),
[Play](https://documentation.onesignal.com/docs/en/google-play-data-safety-requirements)):
a push token and a OneSignal-assigned id (not linked to identity by default),
device type, OS and app version, language and time zone, session counts and
durations, and notification opens. It does not collect location, email or
contacts unless the app sends them, and the app does not.

### Further changes for push

**Apple App Privacy:** nothing new beyond the Firebase table above, because the
types are the same. Notification interactions fall under Usage Data → Product
Interaction (Analytics, already listed); the push token and OneSignal id fall
under Device ID (already declared, linked). Add the purpose **App Functionality**
to Product Interaction if you want delivery itself covered. Purchases: OneSignal
may record consumable purchase events; the subscriptions are not consumable, and
Purchase History already lists Analytics.

**Google Play Data Safety:** OneSignal's published guidance differs from the
Firebase case and from the answers already in the draft:

| Data type | OneSignal's guidance | Purposes |
| --- | --- | --- |
| App activity → App interactions | Collected **and shared** | Analytics, Developer communications |
| Financial info → Purchase history | OneSignal says collected and shared. **The app sends it nothing**; see "Purchases" below | Analytics |
| Device or other IDs | Collected (push token, OneSignal id) | App functionality, Analytics |

Judgment call: your draft says nothing is shared, on the reasoning that
processors acting on your behalf are not "sharing" in Play's sense, and that
reasoning is sound for a pure service provider. OneSignal's own documentation
nonetheless says Yes. Following the vendor's guidance is the conservative
choice; Google, not this document, decides what counts.

**Privacy policy:** add OneSignal to the list of providers and mention push
tokens alongside the Firebase wording above.

### Purchases: the app does not use OneSignal for them, but the SDKs may see them

The app never sends OneSignal a purchase, and subscriptions are handled by
RevenueCat. That is the intended design and it is accurate for the code in this
repository. One fact to know before answering the stores: **both OneSignal SDKs
carry their own automatic purchase tracker**, independent of anything the app
calls.

- iOS: `OneSignalTrackIAP` / `startTrackIAP` / `sendPurchases:` (StoreKit
  payment queue observer), present in `OneSignalFramework` in `ios/Pods`.
- Android: `TrackGooglePurchase` and `TrackPurchaseOperation` (Play Billing),
  present in `com.onesignal:core`.

No public setting turns either off. What is **not** established is whether they
actually capture the subscription purchases RevenueCat makes (RevenueCat uses
StoreKit 2 on iOS, which a StoreKit 1 queue observer may not see). Nobody has
made a purchase with this SDK present, so treat the question as open.

What it means for the answers:

- **Purchase History is already declared** on both stores, collected, with
  Analytics, because of RevenueCat. No new row is needed for OneSignal.
- The only open point is Play's **Shared** flag on that row. If you want the
  answer to rest on evidence rather than on the vendor's default, make one
  sandbox purchase on a release build, then check the device in OneSignal
  (Audience → Users & subscriptions) for any recorded purchase or amount spent.
  None recorded means your answer ("not used for purchases") holds for what
  actually happens; any recorded purchase means declare it shared, as OneSignal
  advises.

### Rules for sending pushes

- **Marketing needs consent in the app.** Apple's guideline 4.5.4 forbids using
  push for promotions or direct marketing unless people explicitly opted in
  through consent language shown in the app's own UI. Build 1.2 has no such
  switch, so **from 1.2 send deadline and service messages only**. The next
  release adds Settings → "Product news and offers": off by default, turning it
  on shows a dialog stating what is being agreed to (and asks for the system
  notification permission if it is not yet granted), and it tags the device
  `marketing_opt_in = true` in OneSignal (`src/push.ts`). Once that release is
  live, a promotional push must target only the segment
  "tag marketing_opt_in is true"; never send one to All Users. Devices on 1.2
  or earlier are not opted in and must never receive promotions.
- Push must never be required for the app to work: it isn't. Local reminders
  carry the core feature and need no network.
- Sending requires the OneSignal dashboard or REST key. That key is never to be
  added to this repository.

### Not included: Notification Service Extension

OneSignal's guide also lists a Notification Service Extension and an App Group.
They only add confirmed-delivery receipts, images in notifications and badge
counts. They need a new Xcode target and new Apple identifiers and profiles,
so they were left out. Plain text pushes work without them. Adding them later
is self-contained.

### Before the first push is sent

Push entitlement is `development` in the source file; Xcode substitutes
`production` from the App Store provisioning profile. The App ID
`com.obligio.app` already has the Push Notifications capability. After any
change to capabilities, delete the cached profile for the app in
`~/Library/Developer/Xcode/UserData/Provisioning Profiles` before archiving
(see the note in `fastlane/Fastfile`).
