# Analytics, crash reporting and what they change for privacy

Added 2 October 2026: Firebase Analytics and Firebase Crashlytics, in the existing
`royal-nation-llc` Firebase project. Nothing below has been submitted to either
store. **The public privacy policy, Apple's App Privacy label and Google Play's
Data Safety form all have to be updated before a build containing this ships.**

## What leaves the device

Three things, deliberately few:

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

Line 40 currently says: *"Obligio does not use advertising or general-purpose
behavioral analytics software."* That is no longer true. Suggested replacement
(your wording to approve; this is a legal page and has not been edited):

> Obligio uses Google's Firebase Analytics to count how often a few actions
> happen (saving an obligation, opening the subscription screen) and Firebase
> Crashlytics to receive crash reports. They process an app-instance
> identifier, device and operating-system model, app version, the approximate
> region derived from a masked IP address, and crash diagnostics. We do not
> send them your obligation titles, business details, dates or documents, we do
> not use the advertising identifier, and we do not use this data for
> advertising or share it with other apps or websites.

Also update the "providers" list in the same page to name Google (Firebase).

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

## Not done: push notifications (OneSignal)

No OneSignal App ID exists in the repository or environment and the OneSignal
dashboard could not be inspected, so push was not wired. See the report for
what is needed.
