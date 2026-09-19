# Reviewer access — completion checklist

Keep credentials in the two store consoles and a private password manager, never in this repository.

## Current status — September 18, 2026

Reviewer credentials were subsequently completed in both consoles and both original production releases were submitted for review. Login persistence and promotional Plus were verified on iPhone and Samsung. The older September 17 checklist below records the earlier setup stage; its outstanding console fields are no longer current. See `production-submission-2026-09-17.md` and `followup-release-2026-09-18.md` for the current release record.

Purchase/restore testing requires a separate free account, not this lifetime-Plus reviewer account. Do not revoke the reviewer's entitlement for billing tests. Use the license-test Google account already verified on the Samsung; confirm the store purchase sheet explicitly identifies a test purchase before proceeding. Record activation and restore separately, and verify the same Clerk identity remains associated with the RevenueCat customer. Apple sandbox purchase/restore is also outstanding.

## Verified progress — September 17, 2026

- Production reviewer account exists with a verified email and saved password.
- Clerk's Convex integration is enabled; managed session tokens contain the required `aud: convex` claim. This resolved the physical iPhone's `businesses:create` authentication error.
- The reviewer completed onboarding on the iPhone 11. `Review Demo LLC` exists in production and its owner ID matches the Clerk user linked to RevenueCat.
- RevenueCat's `obligio_plus` promotional entitlement has unlimited duration. The physical iPhone Settings screen displays “Obligio Plus is active”.
- A per-user Device Trust exception is saved for this reviewer account. Android sign-in and fresh-device access remain unverified.
- Apple reviewer username and app-navigation instructions are saved and independently read back through App Store Connect. Its password field is still empty. Google reviewer credentials, functional release tests, and submission are still pending. See `iphone11-device-test-2026-09-17.md` for device findings.

1. Create or identify a dedicated account in the production Clerk application used by Obligio. Use sample business data. Confirm reusable password sign-in, without an inaccessible one-time code or second factor.
2. Sign in to the new build on both platforms. iOS presents Clerk hosted authentication; Android presents Clerk AuthView. Complete onboarding. Verify the RevenueCat customer is identified by the Clerk user ID (the business ownerId).
3. Grant that customer the `obligio_plus` promotional entitlement in the Obligio RevenueCat project. Refresh or relaunch and verify unlimited obligations, document evidence and recurring completion without a store purchase. Verify the same login on another device.
4. Populate Apple and Google review username/password fields. Replace the Google instruction template only after the preceding checks pass. The currently saved Google notes are not evidence of a functioning account.
5. Test account deletion on a separate disposable account, leaving the reviewer account available. Verify reminders, upload/access to evidence, recurrence, purchase and restore, sign-out and account switching.

## Review instructions after verification

Apple: Tap “Sign in to get started”, then enter the supplied credentials in the hosted sign-in page. The sample business is ready to inspect. The dedicated account has Obligio Plus access without a purchase.

Google Play: Tap “Sign in to get started”, then enter the supplied credentials in the sign-in screen. The sample business is ready to inspect. The dedicated account has Obligio Plus access without a purchase.

Add claims about no OTP, no MFA and no location restrictions only after testing those settings. Preserve access throughout review and subsequent updates.
