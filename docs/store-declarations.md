# Store content declarations

Draft answers for the Play Console questionnaires, derived from what the code
actually does rather than from what a template suggests. **Review before
submitting** — these are declarations made under your developer identity, and
you are the one accountable for them.

The evidence for each claim is in `ios/ComplianceCalendar/PrivacyInfo.xcprivacy`
and matches the App Privacy label already published in App Store Connect, so
the two stores stay consistent.

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
| Financial info → Purchase history | Yes | No | App functionality | Required |
| Files and docs | Yes | No | App functionality | Optional |
| App activity → Other actions | No | — | — | — |
| App info and performance → Crash logs | No | — | — | — |
| App info and performance → Diagnostics | No | — | — | — |

Notes on the ones people usually get wrong:

- **Crash logs and diagnostics are "No".** The app has no analytics,
  advertising, or crash-reporting SDK. The npm dependency set is notifee, the
  document picker, Convex, RevenueCat and safe-area-context; Clerk is a native
  pod (ClerkKit) rather than an npm package, and it is the component that
  actually handles the email address, so do not overlook it when reasoning
  about who processes what. Declaring collection you do not perform is as
  wrong as omitting collection you do.
- **User IDs is "Yes".** `convex/businesses.ts` stores the Clerk subject as
  `businesses.ownerId`, and RevenueCat assigns its own app user id.
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
  businesses, every obligation under them and every stored document, then
  signs out. Answer that an in-app route exists, and give
  `https://obligio.com/privacy` as the supporting web URL.

  Two things the answer should reflect honestly: deletion does not cancel a
  store subscription, because neither store lets an app do that, and the
  confirmation dialog says so; and the privacy page still describes only the
  email route, so it is worth updating to mention the in-app one.
