# Release preparation — September 17, 2026

Neither store has been submitted for production review in this pass.

## Latest verification

- Production Clerk session metadata confirms IP-derived city/country collection. Local iOS privacy manifest now includes coarse location and passes `plutil -lint`; build 202609172014 predates this correction, so another iOS candidate is required before submission. Store privacy labels must also include this collection. Password plus email-code verification is enabled at registration, so Google's draft authentication-method answer needs correction.
- Evidence replacement retention bug fixed and deployed to production: replacing an attachment deletes the superseded file; retries preserve the currently attached file. A live CLI test using synthetic files verified old URL rejection, correct new-file content, and retry safety, then removed its synthetic requirement and attachment. This is backend verification, not a pass for the iPhone browser-handoff issue. Evidence: `build/release-review/evidence-replacement-live-check.log`.
- After this fix, all **242 tests across 19 suites**, TypeScript and changed-file lint pass. Historical orphaned files and uploads abandoned before attachment are not covered by the fix.
- Fresh Apple API readback confirms PREPARE_FOR_SUBMISSION, attached build 202609172014 VALID, reviewer username and notes present, and reviewer password absent. The App Store Connect browser session is at `/login`; user sign-in has been requested.
- Apple's current first-subscription workflow requires the app version, new subscription group and subscriptions in the same draft submission. Its API guide explicitly directs first submissions through App Store Connect; do not use a standalone subscription-submission endpoint as a workaround. See [Apple's submission instructions](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/) and [API guide](https://developer.apple.com/documentation/appstoreconnectapi/submitting-subscriptions-and-subscription-groups-for-app-review). Products were re-read successfully; evidence: `build/release-review/apple-products-current.jsonlog`.
- Full regression suite rerun after the edit-sheet fix: **238 tests across 18 suites passed**. Evidence: `build/release-review/final-regression-suite.log`.
- Current iOS candidate is **202609172014**, processed VALID and attached; Android candidate is **11**, uploaded to internal draft. Earlier build references below are historical.
- Physical iPhone create/edit/recurrence, suggestions controls and active-Plus display now pass. Evidence viewing remains unresolved; upload and direct Safari retrieval pass.
- Google target audience was saved as 18 and over. IARC agreement approval and completion of Data Safety remain pending.
- Updated production privacy HTML was retrieved from `https://obligio.com/privacy` and matched `web/privacy.html` byte for byte, including authentication identifiers, subscription analytics and in-app deletion instructions. Netlify deployment `6aabe2a45948e6d25554ae72` completed successfully; production responds HTTP 200.

## Current store state

- Apple: version 1.0 remains in submission preparation; build 202609171528 was attached. Build 202609171946 uploaded successfully at 20:03 Perth time. It does not include the subsequent modal stacking/edit-flow fixes or the corrected purchase-analytics privacy manifest, so it is not the final candidate.
- Google Play: last API readback shows internal draft 10, completed internal 9, and production draft 7. Build 10 also predates the latest modal changes.
- Apple review contact, reviewer username and instructions are saved. The reviewer password field remains blank.
- Reviewer authentication, business onboarding and Plus activation passed on the physical iPhone. Google review credentials and instructions still need completing; Android login remains unverified.
- Google Government apps = No, Advertising ID = No, and Business category saved. Content rating, target audience, Data safety, financial/health declarations and listing contact details still need completion. Browser control disconnected during console work.

## Completed work and validation

- Native Clerk account deletion added after app-data deletion, with retry messaging that acknowledges possible partial deletion. Both native implementations compile; authenticated end-to-end deletion remains untested.
- Added iOS keychain entitlements after reproducing a Clerk startup crash with OSStatus -34018. A fresh simulator build opened successfully afterward.
- RevenueCat now identifies the signed-in customer using the authenticated business owner's Clerk subject. Serialized identity transitions and purchase/restore guards prevent use before that identity is ready. This supports a reviewer grant that follows the same account across devices instead of an anonymous installation.
- Scrollable, bounded-width sign-in content added for smaller screens and larger text.
- TypeScript and 235 tests across 18 suites passed. Changed billing/auth UI files pass lint. Both signed native release builds completed and uploaded.
- Both store descriptions now state the actual live coverage: selected US federal obligations, with state/local/industry obligations added manually. Description readback matched on both stores. Apple keywords and promotional text also matched.
- English (US) remains the only store locale. No translated listing has been added.
- Five iPhone screenshots were visually checked, uploaded, deduplicated and ordered. All report COMPLETE.
- Five Android screenshots were captured at 1080x1920, visually checked, exported as opaque RGB PNG and uploaded. API readback confirmed five files with matching hashes in the intended order: dashboard, calendar, documents, suggestions, paywall.
- Android initially froze with a System UI ANR. Host GPU rendering resolved the capture problem. Startup/loading frames were rejected; targeted recapture with a longer wait produced valid images. Emulator display overrides were reset, the emulator was stopped and screenshot mode restored to false.
- Apple and Google US subscription prices were verified as $9.99 monthly and $79.99 annual. Apple products are READY_TO_SUBMIT. Play base plans and both 14-day free-trial offers are ACTIVE. This is configuration verification, not a purchase/restore test.
- Live privacy, support and terms URLs return HTTP 200. Updated privacy text is available on a Netlify draft preview; it has not been deployed to production.

## Rules audit

[Audit of 57 draft entries](rules-audit-2026-09-17.md): 12 correction findings, 9 core matches, 19 partial and 17 unresolved. These are audit findings, not 57 verified rules.

Six corrections were applied to the draft catalogue: AL exemptions, KS fixed deadlines, ND entity-specific dates, SC return scope, TX no-tax-due reporting and WV June 30 timing. TypeScript passed and the Convex deployment completed. A read-only catalogue check confirms only eight federal templates remain live. No draft entries were seeded or assigned a new reviewed date; all draft seed approvals remain false. The JSON audit preserves original and corrected descriptions.

## Reviewer access and remaining gates

See [reviewer-access.md](reviewer-access.md) and [physical-device results](iphone11-device-test-2026-09-17.md). The production reviewer account and Plus grant exist. Password entry in the store consoles remains outstanding.

1. Verify modal safe-area/scrolling/stacking fixes and the active-Plus screen on rebuilt devices. Opening Edit now hides the detail sheet until edit cancellation, so the form is not covered.

2. Verify both platforms: sign-in, onboarding, obligations, evidence, recurrence, reminders, account switching, purchase and restore. Test deletion on a separate disposable account.
3. Complete and verify store declarations, public listing contact details, reviewer credentials and premium access. Check any unresolved Play payment/account requirements in the console.
4. Produce and attach the final iOS build after Apple processing, publish the verified privacy-page update, and submit both stores. Verify actual review states afterward.

## Watch provision

There is no watchOS target or Wear OS module. Phone reminders can be mirrored to paired watches according to platform settings, permissions and connectivity; this has not been tested on paired hardware. Do not advertise a standalone watch app.

- Apple notification routing: https://support.apple.com/en-gb/108369
- Android notification bridging: https://developer.android.com/training/wearables/notifications
- Dedicated watch apps would require their own screens, authenticated synchronization, complications/tiles and store assets. Clerk's iOS Watch Connectivity documentation is a possible integration path, subject to pinned SDK support: https://clerk.com/docs/reference/ios/watch-connectivity

## Supporting documentation

- RevenueCat account identity: https://www.revenuecat.com/docs/customers/identifying-customers
- Google Play screenshot requirements: https://support.google.com/googleplay/android-developer/answer/9866151

## Later release progress (20:35 Perth)

- iOS build 202609172014 uploaded at 20:31; development export installed on the physical iPhone. Archive privacy manifest includes device IDs and purchase analytics.
- Android build 11 uploaded; API confirms internal draft 11 and completed internal 9. Production remains draft 7.
- Updated iPhone suggestions screenshot uploaded. Reconciled upload retry duplicates against current local checksums; final API readback reports exactly five COMPLETE images in dashboard/calendar/documents/suggestions/paywall order.
- Google Health and Financial features declarations saved (no applicable features).
- Physical iPhone create, edit and monthly completion/next-occurrence workflows now pass; see device report.
- Neither store has been submitted.

At 20:37, Apple processing reported build 202609172014 VALID and it was
attached to the submission draft. Both modal/Plus fixes pass on physical
iPhone 11. Evidence upload succeeds, but in-app View evidence fails despite
the URL opening directly in Safari; investigation and direct-phone check
remain outstanding.


### Release continuation — 21:33 Perth

- Google Play Data Safety: completed and saved final declaration (console confirmed saved; sending for review remains separate). Includes optional photo, video, voice/sound, music, and other-audio uploads; collected, not shared, not ephemeral, app functionality. Previously completed identity, purchase, location, files, user content, and device-ID disclosures retained.
- Published updated privacy policy describing selected document/photo/video/audio uploads. Live https://obligio.com/privacy byte-matches web/privacy.html. Deployment record: build/release-review/privacy-media-production-deploy.json.
- iOS build 202609172122 successfully archived and uploaded to App Store Connect at 21:30:58. First API check found no processed build yet; attachment still pending. Existing attached build remains 202609172014.
- Neither store has been submitted for review. Reviewer passwords, Apple browser sign-in, IARC terms decision, remaining device-flow checks, and Apple privacy console reconciliation remain outstanding.

- Follow-up: Apple API reports build 202609172122 VALID; selected successfully for iOS version de9e9315-8647-49e1-a4ed-470ab3c5275e. App Store Connect browser session is now signed in.

- Google Play Store Listing contact details saved and published; UI readback confirms admin@royalnationllc.com, +61461481991, https://obligio.com and Change published. Before this change setup checklist showed 9/11 complete, with content rating and contact details outstanding. This publishes contact metadata only; app release not submitted.

- Google reviewer guidance corrected from hosted browser flow to actual Android in-app Clerk flow; username admin@royalnationllc.com added. Console confirmed saved. Password still blank and fresh Android sign-in remains unverified. Dashboard confirms 10/11 setup tasks complete; content rating is remaining setup declaration.

- Visually inspected all five local Android store screenshot assets. Suggestions title and Close are fully visible; paywall title, plan prices, Subscribe and Restore are readable. Dashboard, calendar and documents are populated fixture captures, not reviewer-account evidence. Paywall capture represents the unpaid state and does not prove active-Plus behavior. No visible screenshot defect requires replacing these assets from this inspection. Runtime Android sign-in, purchase and restore remain unverified.

- Physical iPhone reconnected after earlier in-use blocker. Reopened Obligio through Spotlight; authenticated dashboard loaded in dark mode with Review workflow test due Nov 15, 2026, 1 Current / 1 Upcoming / 0 Overdue. Confirms persisted session and existing recurring test data after reconnect; does not resolve evidence-opening, notification, purchase/restore, deletion or Android test gaps.

- 21:53 physical iPhone Mirroring: opened recurring Review workflow test, tapped View evidence. Loading resolved to Unable to open URL for existing synthetic storage attachment. Reproduced after reconnect; direct unlocked-phone check remains necessary to distinguish Mirroring handoff from app failure. Do not mark evidence viewing passed.

- User restored Apple sign-in and added reviewer password. Apple API verifies both reviewer username and password present (values not logged). Authenticated in-app browser release page shows attached build 202609172122. Corrected inaccurate no-analytics claim in local Apple and Android descriptions; Apple description updated via API. Android corrected copy still needs upload. Remaining device checks and submission gates are not complete.

- Apple App Privacy finalized and published: eight categories (email, user ID, coarse location, device ID, other user content, purchase history, photos/videos, audio). All linked to identity, app functionality, no tracking; purchases additionally analytics. Final console readback has no unfinished Set Up warning. Removed obsolete crash/performance/product-interaction declarations. Google privacy listing copy correction committed without sending for review. Neither app release submitted.

- Apple Add for Review validation identified missing app download price tier. Set USA base $0.00 with corresponding free worldwide tiers, confirmed and saved; Current Price readback shows USA $0.00. No app submission created by failed validation; subscription setup remains pending.

- Apple review draft created successfully after pricing fix. Draft started 22:14 Perth contains four items ready to submit: iOS 1.0 build 202609172122, Obligio Plus group 22361193, monthly and annual subscriptions. Final dialog shows Items Ready to Submit (4), Subscriptions (2), enabled Submit for Review and no validation error. Final submission NOT clicked: device test gates remain unresolved.

- User added Google reviewer password. Saved outer Sign-in details declaration; console confirms username/phone number, password, instructions and Your change has been saved, with Save disabled. Password not read or logged. Both stores now have reviewer credentials saved; actual fresh Android login still unverified.

- User confirmed direct unlocked iPhone View evidence opened expected synthetic verification document; direct-device evidence viewing passes, mirrored URL handoff remains limitation observed. User enabled notifications through Obligio and locked phone. Reconnected and verified Settings displays Deadline reminders are on (22:31 Perth). This verifies permission, not delivered notifications. Production reminders schedule at 09:00 local, 30/14/7/1 days before due date; delivery test remains outstanding.

- 22:33 Perth: created Reminder delivery test through physical iPhone UI, category Review, one-off due 2026-09-19, after confirming notification permission enabled. Dashboard confirms saved. Normal scheduler should arm remaining 1-day lead reminder for 2026-09-18 09:00 Australia/Perth; no native pending-trigger inspection or actual delivery observed yet. Do not classify as delivery passed.

- Connected physical Samsung SM-A315G authorized for USB debugging. Installed signed Android release APK successfully; package readback confirms versionName 1.0/versionCode 11. scrcpy mirror launched, but CUA app discovery does not expose its window, so automated phone UI control is not yet available. Android sign-in and workflow tests remain unverified.

## Android physical verification — 22:59 Perth

User explicitly authorized ADB screen capture and taps/swipes for ongoing Android testing. Samsung Galaxy A31 (Android 12) was reviewed while signed into the reviewer account.

- Build 11: dashboard, Calendar, Documents and Settings load saved reviewer data. Plus active and deadline reminders on. Active Plus sheet has Done and Close controls.
- Found and fixed bottom navigation overlapping Samsung's system buttons: positioned absolute navigation above the safe-area bottom inset.
- Found and fixed evidence opening falsely failing the `canOpenURL` check: added the Android HTTPS VIEW query declaration.
- Built signed APK and AAB versionCode 12; installed APK with `adb install -r`, preserving login. Physical screenshots verify readable navigation labels above system controls, persisted account, Plus active, and evidence opening in Chrome with the exact synthetic document contents.
- Validation: TypeScript and ESLint pass; seven targeted App/gating tests pass after supplying the real SafeAreaProvider context used by the app root.
- Brief free-plan banner observed immediately after relaunch before entitlement loaded; later Settings confirms Plus active. Loading presentation remains a polish item.
- Artifacts: build/release-review/android-build12-{home,evidence,settings}.png and android-build12.log. AAB is local only, not uploaded to Play. Shared navigation change also requires a new iOS build before release.
- Not yet verified on Android: create/edit/complete, upload replacement, notification delivery, purchase/restore, account deletion. IARC approval remains pending. Neither store submitted.

## Production review submissions — 23:24 Perth

User instructed proceeding until both production submissions were sent. Android ADB authorization remains in force.

- Google Play: uploaded signed AAB versionCode 12, replaced production draft 7, selected US and UK, saved release 1.0 (12). No blocking validation errors; optional missing deobfuscation file warning only. Sent 10 changes for review including production rollout, countries, listing, content rating, privacy/data safety and declarations. Console shows Changes in review; automated checks still running (up to four minutes remaining at 23:23). Managed publishing is off.
- Content rating was already completed in the refreshed console (submission 22:34, Everyone/PEGI 3). The old questionnaire tab was stale and a new attempted save returned an unexpected error; refreshed authoritative state confirmed Completed. No further rating action needed.
- Apple: built, uploaded and attached VALID build 202609172310. Configured US and UK availability, confirmed both Available on App Release. Submitted all four items: iOS 1.0, Plus group, Monthly and Annual subscriptions. App Review now explicitly shows Waiting for Review for all four. Submission ID 6249c12d-8301-4753-aa75-17146f34a9b1, submitted Sep 17 2026 at 11:22 PM.
- Android physical workflow now passes create, edit (Oct 14 to Oct 15), synthetic-file upload, viewing uploaded bytes in Chrome, and marking current. Synthetic obligation Android test evidence retained for review, with attachment. Screenshots in build/release-review/android-{created,uploaded,upload-roundtrip,completed}.png.
- Final automated suite: 19 suites, 242 tests passed. TypeScript and targeted ESLint passed earlier for the final change. Android APK/AAB build12 succeeded. Final iOS development export installed successfully on iPhone11 after initial wireless tunnel timeout; mirrored UI recheck still pending.
- Remaining verification limits: actual scheduled notification delivery, end-to-end store purchase/restore, disposable-account deletion, and Android replacement/recurring workflows are not newly verified. This submission does not claim these tests passed. Earlier iPhone recurrence and backend evidence-replacement checks passed.
- English ASO and five screenshots per store included; no additional translated locales or dedicated watch app are part of this release.

- Final Google verification: automated checks completed; console explicitly states Your changes are now in review for Production 1.0 (12). Both production review submissions are now confirmed.
