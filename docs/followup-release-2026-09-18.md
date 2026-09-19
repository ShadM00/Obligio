# Obligio follow-up release — September 18, 2026

The original iOS 1.0 / Android 1.0 (12) production submissions remain in review. None of the additions below have replaced or withdrawn those submissions.

## Verified

- Android physical Samsung A31: a test reminder scheduled through the same Notifee timestamp/channel path as deadlines arrived after the phone was put to sleep. Notification shade screenshot: `build/release-review/android-notification-delivered.png`. Tapping it returned to Obligio (`android-notification-opened.png`). This does not prove delivery on every OS/power configuration.
- Added a Settings action to schedule a test reminder in one minute, with permission denial surfaced accurately.
- Apple Watch app compiles for watchOS device and simulator; native iPhone bridge compiles in the integrated iOS build.
- Wear OS release app and Android phone bridge compile.
- 252 automated tests passed, including reminder behavior, Spanish month/date round-trips, watch account/business isolation, and duplicate completion protection.
- Convex duplicate-completion guard deployed to `greedy-parakeet-883`. Replaying the already-completed synthetic Android evidence obligation succeeded without opening a new cycle.

## Implemented for next release

Apple Watch and Wear OS companion apps show the business, sync timestamp, obligation list, due dates and completion state. A confirmation precedes completion. The phone validates the current account/business and routes completion through its authenticated server flow, including recurring deadline reminders. No credentials or evidence files are copied to the watch. Connection failures ask the owner to open the phone app and refresh; actions are not silently queued for later execution.

The first implementation is phone-dependent, not an independent cellular watch app. Physical end-to-end sync, lost connection, account switch, and completion tests remain required. Native builds alone are not evidence those tests passed.

Spanish is the recommended first additional language because the launch markets are US and UK, the catalogue currently covers selected US federal obligations, and Spanish is the largest non-English language group in the US. Census source: https://www.census.gov/newsroom/press-releases/2025/2017-2021-acs-language-use-tables.html

Spanish phone UI, date entry/display and draft store ASO are prepared (`es-US` in-app/Google and `es-MX` Apple). Language selection persists through the native preferences module. The original English catalogue and official source documents remain explicitly identified as English. No new legal jurisdictions are implied. Five Spanish iPhone store screenshots are now captured and visually reviewed; Android screenshots and native authentication/store purchase text coverage still require review. Watch UI is currently English.

## Still required before calling these activities complete

- An eligible free test app account for real sandbox purchase/restore. Google Play account membership in the license-test list was confirmed on the Samsung and in the console. The store-review account has a promotional lifetime Plus entitlement and cannot prove store purchase activation.
- iPhone sandbox purchase/restore.
- Reachable, unlocked paired Apple Watch; a Wear OS watch (or usable emulator) for end-to-end testing.
- Final visual testing of Spanish phone flows and watch layouts; localized store screenshots.
- Physical watch installation, watch store declarations/screenshots, and subsequent store update submissions. Signed iPhone+watch development build and Android phone/Wear OS AAB packages have been produced.

Android reminder delivery was directly visible. On the physical iPhone, the Notifee delivered-notification API confirmed that the test reminder was present in Notification Centre at 00:28 Perth; this checks delivered OS notifications, not pending triggers. The transient banner itself was not observed through Mirroring. No real-money purchase has been made.

## Final device observations

- Android 1.1 (13): login and Plus survived upgrades; Spanish persisted across process restart; translated dashboard/settings and date formatting inspected. Longer dashboard text now wraps without crowding the status ring.
- iPhone 1.1: signed phone app with embedded Apple Watch companion installed successfully after retrying intermittent CoreDevice connection errors. Login and Plus retained. Test notification delivered (OS notification centre record confirmed).
- Apple Watch SE 40 mm simulator: sign-in/sync empty state rendered with readable text and Refresh action. Real paired-device data/action transport is still unverified.
- Android app bundle: `android/app/build/outputs/bundle/release/app-release.aab` (13).
- Wear OS bundle: `android/wear/build/outputs/bundle/release/wear-release.aab` (1000001).
- Both new bundles are local artifacts, not submitted updates.
- Original Apple/Google submissions remain unchanged; Google in-review status was rechecked during this turn.

## Screenshot follow-up (00:49 Perth)

- Added configurable screenshot locale and Spanish representative user-entered titles/categories. The official catalogue and store-provided product text retain their current English content.
- Captured and visually reviewed five Spanish iPhone screens at 1290 × 2796: dashboard, calendar, documents, suggestions, Plus. Files: `fastlane/screenshots/es-MX/`. These are local assets, not uploaded to the existing submission.
- Added opt-in Android debug application suffix (`-PobligioScreenshots=true`) so screenshot capture does not replace the reviewer installation. Debug APK compiled successfully. Isolated Metro uses port 8088.
- Samsung installation stalled twice after package verification. Cancelled only our two install sessions (1805901968 and 1403834860). Existing production-ID app/login remained intact. Android Spanish screenshots are not captured. A phone restart may resolve the package-installer stall; this has not been performed.
- Apple Watch remained unavailable. A read-only Wear OS emulator attempt stayed offline and was stopped as disk space fell to 1.5 GB. No new watch end-to-end results.
- Clerk browser access timed out; no local Clerk secret key is configured. No free billing-test account was created. User was asked to sign in to a separate free account and make watches available. No purchase was made.
- Screenshot mode restored to false and capture locale to en-US. Original store submissions unchanged.
- Follow-up validation: TypeScript, targeted screenshot-file ESLint, and git whitespace checks passed. Screenshot Metro stopped after restoring configuration.

## Screenshot and watch retry (00:58 Perth)

- Samsung screenshot APK installed successfully on retry. Captured and visually reviewed all five Spanish Android screens at 1080 × 2400, including a replacement for an initial loading-screen capture. Assets: `fastlane/metadata/android/es-US/images/phoneScreenshots/`. Spanish screenshot sets now exist for both phone platforms. Product names/descriptions and catalogue content retain the current English fallback; these assets are not uploaded.
- Restored screenshot configuration and returned the Samsung to its existing Obligio installation. Stopped the isolated Metro server.
- Apple Watch became discoverable. Direct developer install rejected the connection; `devicectl manage pair` reported success, but the subsequent installation timed out establishing the network tunnel. Found Obligio under Available Apps in the iPhone Watch app and initiated installation there. Installation/sync/completion verification is still pending.
- Free-account purchase/restore and Wear OS testing remain outstanding. No store submissions changed.

### Apple Watch signing correction (01:03 Perth)

The first iPhone-mediated installation failed. Inspection found that the embedded development profile omitted the physical Apple Watch UDID. Registered the watch, created the explicit `com.obligio.app.watchkitapp` identifier and a development profile containing the three existing test devices, and installed that profile locally for subsequent builds. Re-signed a copy of the development phone app and its embedded watch app; deep/strict code-sign verification passed. Installed this corrected copy on the physical iPhone successfully and retried installation through Watch → Available Apps → Obligio. Original submitted artifacts remain unchanged.

At 01:03 Perth the iPhone Watch app moved Obligio into **Installed on Apple Watch**, confirming physical installation after the signing correction. Opened the phone companion and asked the user to open Obligio/Refresh on the watch to verify real data sync. Watch completion and disconnected-state tests are not yet verified.

## Apple metadata rejection resolved — 12:17 Perth

Apple rejected iOS 1.0 (202609172310) under 3.1.2 because the product-page description omitted a functional Terms of Use (EULA) link. Confirmed no custom EULA was configured. Added `https://www.apple.com/legal/internet-services/itunes/dev/stdeula/` to the existing live en-US description and verified API readback (1836 characters). Updated the local English metadata and Spanish draft to retain the link in future uploads. No new locale or binary was submitted.

Used Update Review on the version and Resubmit to App Review for the existing four-item submission. API confirmed submission `6249c12d-8301-4753-aa75-17146f34a9b1` is WAITING_FOR_REVIEW at 2026-09-18 12:17:53 +08:00. Evidence: `build/release-review/eula-resubmission-result.json`. This is a successful resubmission, not approval. Google Play was not changed. `https://obligio.com/` and `/terms` responded successfully.
