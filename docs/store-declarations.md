# Store content declarations

Draft answers for the Play Console questionnaires, derived from what the code
actually does rather than from what a template suggests. **Review before
submitting** — these are declarations made under your developer identity, and
you are the one accountable for them.

Use the application code, backend schema, SDK disclosures and actual service
configuration as evidence. The iOS privacy manifest alone does not prove the
Google Play form or Apple privacy label is complete.

Re-checked against the code on 2026-09-06: no analytics, advertising or
crash-reporting package is present; `PrivacyInfo.xcprivacy` is in place; the
app opens source links with `Linking.openURL`, which hands off to the system
browser rather than embedding one, so the content-rating answer below holds;
and `obligio.com/privacy` and `/support` both return 200.

## Data safety

**Does your app collect or share any of the required user data types?** Yes,
collects. **Is all of the user data collected by your app encrypted in
transit?** Yes. **Do you provide a way for users to request that their data is
deleted?** Yes — `privacy@obligio.com`, stated on the privacy policy page.

| Data type | Collected | Shared | Purpose | Optional? |
| --- | --- | --- | --- | --- |
| Personal info → Email address | Yes | No | Account management | Required |
| Personal info → User IDs | Yes | No | Account management, App functionality | Required |
| Financial info → Purchase history | Yes | No | App functionality, Analytics | Required |
| Device or other IDs | Yes | No | Account management, App functionality, Fraud prevention/security | Required |
| Location → Approximate location | Yes | No | Account management, Fraud prevention/security | Required |
| Files and docs | Yes | No | App functionality | Optional |
| Photos and videos → Photos, Videos | Yes | No | App functionality | Optional |
| Audio files → Voice or sound recordings, Music files, Other audio files | Yes | No | App functionality | Optional |
| App activity → Other user-generated content | Yes | No | App functionality | Required for business setup; obligations entered voluntarily |
| App activity → Other actions | No | — | — | — |
| App info and performance → Crash logs | No | — | — | — |
| App info and performance → Diagnostics | No | — | — | — |

Notes on the ones people usually get wrong:

- **September 17 correction:** business profile and obligation title, category,
  due date, recurrence and status are stored in Convex (`convex/schema.ts`).
  These are not merely on-device fields. The proposed “Other user-generated
  content” classification follows Google's definition for user-entered content;
  confirm its presentation in the final console form. No device calendar is read.
- RevenueCat's published instructions require purchase-history purposes to
  include **App functionality and Analytics**. This is subscription analytics,
  even though there is no separate general analytics SDK. The local privacy policy and iOS manifest now include subscription analytics.
  Publish the policy and reconcile the Apple console label before submission.
- Authentication-provider collection still needs its final mapping: Clerk's
  DPA describes configurable IP/device and usage data. Do not infer that
  absence of an advertising SDK means there are no authentication identifiers.

- **Crash logs and diagnostics are "No".** The app has no analytics,
  advertising, or crash-reporting SDK. The npm dependency set is notifee, the
  document picker, Convex, RevenueCat and safe-area-context; Clerk is a native
  pod (ClerkKit) rather than an npm package, and it is the component that
  actually handles the email address, so do not overlook it when reasoning
  about who processes what. Declaring collection you do not perform is as
  wrong as omitting collection you do.
- **User IDs is "Yes".** `convex/businesses.ts` stores the Clerk subject as
  `businesses.ownerId`, and RevenueCat now identifies the signed-in customer with that Clerk subject after onboarding.
- **Files and docs is optional**, because evidence upload is a feature the
  owner may never use.
- **Nothing is shared**, in Play's sense of transfer to a third party for
  their own use. Processors acting on your behalf are not "sharing".

## Content rating

Answer the IARC questionnaire as no objectionable content in every category:
no violence, sexuality, profanity, controlled substances, gambling,
simulated gambling, or user-to-user communication. The app has no social
features, no chat, no user-generated content shared between users, and no
in-app browser.

Expected outcome: the equivalent of the 4+ rating already assigned by Apple.

Declare in-app purchases: **Yes** — `obligio_plus_monthly` and
`obligio_plus_annual`.

## Target audience and content

- **Target age groups:** 18 and over only. Obligio is a tool for business
  owners; nothing about it is directed at children.
- **Appeals to children:** No.
- **Ads:** the app contains no ads.

## Government apps, financial features, health

- **Government app:** No.
- **Financial features:** No. The app tracks tax *deadlines*; it does not
  provide banking, lending, investment, or payment services. Subscriptions are
  billed by the store, not by Obligio.
- **Health apps:** No.

## News, COVID-19, data deletion

- **News app:** No.
- **COVID-19 contact tracing or status:** No.
- **Account deletion:** the app now deletes accounts **in app** — Settings →
  Delete account, backed by `convex/account.ts`, which removes the owner's
  businesses, every obligation under them and every stored document, then deletes the Clerk sign-in account and signs out. The updated native
  deletion path still needs an end-to-end authenticated device test before submission. Answer that an in-app route exists, and give
  `https://obligio.com/privacy` as the supporting web URL.

  Two things the answer should reflect honestly: deletion does not cancel a
  store subscription, because neither store lets an app do that, and the
  confirmation dialog says so; and the privacy-page source now describes the in-app route plus email fallback.
  That page change has not yet been deployed; publish it with the verified release.

## Sources checked September 17, 2026

- [Google data types, optionality and SDK disclosure rules](https://support.google.com/googleplay/android-developer/answer/10787469)
- [RevenueCat Google Play Data Safety instructions](https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety)
- [Clerk data processing scope](https://clerk.com/legal/dpa)

This file remains a draft. On September 17, the Google Play Data Safety draft
was saved with collection and transit encryption set to Yes, username/password
account creation, the published privacy URL for deletion, and six data types:
email, user IDs, purchase history, files/docs, other user-generated content and
device IDs. The console confirmed “Your changes have been saved.” After browser
extension access failed, native Chrome control recovered the saved draft.
Three handling sections are now saved and confirmed by the console: email
(required, non-ephemeral, account management), user IDs (required,
non-ephemeral, account management and app functionality), and files/docs
(optional, non-ephemeral, app functionality). Each is collected and not shared.
The other three handling sections were subsequently saved and confirmed:
purchase history (required, non-ephemeral, app functionality and analytics),
other user-generated content (required, non-ephemeral, app functionality), and
device IDs (required, non-ephemeral, app functionality, account management and
fraud prevention/security). All six sections show completed. The preview lists
the six types, no sharing, encrypted transit, and the deletion URL. The final
Save on the preview has not been clicked: authentication-related IP/approximate
location, supported account-creation methods, and media accepted by the generic
document picker still need reconciliation. This is not a submitted declaration.

Apple purchase-history guidance: https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy

## Console updates at 20:17 Perth, September 17

Google Play Health apps: selected no health features and saved; console showed
“Change saved. Send for review in Publishing overview.”
Financial features: selected no financial features and saved with the same
confirmation. Neither declaration has been sent for review yet. Content rating,
target audience and Data Safety remain outstanding.

### Native authentication evidence

The pinned Clerk iOS checkout sends `UIDevice.current.identifierForVendor` as
`x-native-device-id`, plus device type/model, OS version and app version in
ClerkHeaderRequestMiddleware. This proves iOS device-identifier transmission;
the app privacy manifest now declares Device ID linked to the user for app
functionality, without tracking. The local policy describes this collection.
Android SDK behavior still requires separate verification; do not infer it
from iOS. Clerk's production telemetry collector is disabled, which is separate
from these authentication headers. Store-console privacy labels remain pending.

Android verification: inspected the pinned `clerk-android-api:1.0.16` AAR.
VersioningUserAgentMiddleware calls DeviceIdGenerator and sends
`x-native-device-id`; DeviceIdGenerator loads or generates a UUID and persists
it to SDK storage. Google Data Safety must therefore include Device or other
IDs. Local disassembly evidence: `build/release-review/clerk-android-device-headers.txt`.
This is a persisted authentication identifier, not the advertising ID.

### Production session and sign-up verification

The production Clerk reviewer profile's Devices table shows an Obligio session
with an IP address and city/country. This confirms actual approximate-location
collection, beyond the SDK's optional field definitions. Do not copy the actual
IP into release documentation. Clerk's [SessionActivity documentation](https://clerk.com/docs/reference/backend/types/backend-session-activity)
identifies these fields as IP-derived location. Local privacy HTML and the iOS
manifest now disclose this; the uploaded iOS build predates this correction and
requires a rebuilt candidate. Google and Apple console labels still need updating.

Production authentication settings: email is required, verification at sign-up
is on using email codes, password is required at sign-up, and email-code sign-in
is enabled. The Google draft's password-only account-creation answer needs to
include the additional verification method. No authentication settings were changed.

Follow-up: the Google draft now selects “Username, password and other
authentication” for account creation, replacing password-only. Approximate
location was added as required, non-ephemeral collection (not shared), for
account management and fraud prevention/security. All seven handling sections
are complete in the draft, and the console confirmed the save. Media-file
classification remains under review before the declaration is finalized.

Media reconciliation: `App.tsx` uses `types.allFiles`; `src/documentUpload.ts`
uploads the selected bytes without filtering MIME types. Therefore voluntarily
selected photos, videos and audio are included in the upload feature and must
be disclosed as optional, non-ephemeral collection for app functionality, not
sharing. No camera/microphone capture or whole-library access is implemented.
The local iOS manifest now adds PhotosorVideos and AudioData; the Google draft
still needs the five media subtypes and their handling details. This conclusion
uses the specific media types in the official Google and Apple definitions,
rather than assuming Files and docs subsumes them.
