# iPhone 11 device test — 2026-09-17

Physical iPhone 11, Obligio 1.0 build 202609171528, controlled through iPhone Mirroring. This is a partial device pass, not release sign-off.

## Verified on device

- Reviewer onboarding succeeded; production contains Review Demo LLC linked to the Clerk subject.
- Settings displays “Obligio Plus is active” after the RevenueCat promotional grant.
- Full app termination and relaunch preserves the signed-in dashboard.
- Home, Calendar, Documents and Settings navigation works. Calendar and Documents display their expected empty states.
- Suggested federal obligations load, including source labels and reviewed dates. Selecting Track this reveals the date field and keeps submission disabled for an incomplete date.
- Subscription packages load ($9.99 monthly and $79.99 annual as displayed).

## Findings

1. Suggested obligations sheet extends into the status bar on iPhone 11. Its heading and Close control are clipped; the Close control could not be activated via mirroring. App restart recovered the screen. Inspect ModalShell in src/modals.tsx and unbounded modalCard in src/theme.ts.
2. Subscription details offer Subscribe despite the reviewer already having active Plus. This is a confusing active-subscriber flow; no purchase was attempted.
3. Mirrored text entry dropped/reordered characters, and clipboard paste timed out. Whether this is mirroring automation or an app input issue remains unresolved. Unsaved test input was discarded through app restart. No obligation was created during this test pass.

### Follow-up physical-device observations

On the same installed build, entering each field after separately focusing it
worked: title Review, category Test, due date 2026-10-14; the UI parsed the date
as October 14, 2026. Monthly recurrence was selectable with the reviewer's Plus
access. This points to automation timing rather than an established app text
input defect.

Creation remains unverified: the bottom navigation overlays the Save button.
`App.tsx` renders the navigation after the absolute modal, and the modal has no
stacking priority. The final modal fix must also address this overlap. The
entered requirement is unsaved.

## Pending

### Follow-up implementation

The shared modal shell now applies safe-area insets and caps sheet height, with scrolling content beneath the header. The subscription screen receives current Plus status and shows active-access information instead of purchase controls. Successful purchase/restore also switches the screen to active access. TypeScript, changed-file lint and all 237 tests (18 suites) pass. These changes still require rebuilt-device verification; they do not retroactively change the findings from build 202609171528.

- Notification preferences opened the iOS permission prompt. Awaiting user approval before Allow; no permission choice made.
- Requirement create/edit/complete and recurrence generation are not passed.
- Document upload/download, reminder delivery, purchase/restore, account deletion, Android reviewer login, and paired-watch notification delivery are not passed.
- No store submission performed.

## Authentication configuration verified earlier in this session

Clerk production Convex integration is enabled, with managed session claim aud=convex. The reviewer account has a saved password and a per-user Device Trust exception. The reviewer Clerk subject is aliased to its RevenueCat customer; Obligio Plus is granted with unlimited duration. Credentials and private contact information are intentionally omitted from this report.

## Simulator follow-up (not physical-device sign-off)

Debug build succeeded after the modal changes. On iPhone 15 Pro Max simulator,
the actual components rendered with fixture data show the suggestions title
and Close control fully visible, and the active Plus screen shows access
details and Done without Subscribe. Evidence is saved locally under
`build/release-review/modal-safearea-verified.png` and
`build/release-review/plus-active-verified.png`.

Code review also found the detail sheet covering Edit. The detail sheet is now
hidden while editing; a regression test verifies opening Edit and cancelling
back to details. All six gating/edit tests, TypeScript and changed-file lint
passed. Screenshot mode and temporary Plus fixture override were restored.
Physical-device create/edit/save and other workflow tests remain pending.

## Physical iPhone follow-up — build 202609172014

The archive's original development profile omitted this already-registered
iPhone. A debugging export with automatic provisioning succeeded; the exported
app installed and launched without removing the reviewer session.

Verified on the phone:
- Add form and Save remain above the bottom navigation.
- Created Review workflow test, category Review, monthly, due October 14, 2026.
- Opened Edit, changed the due date to October 15, saved, and saw that date on the dashboard.
- Mark done & schedule next set the October item to Current and created an Upcoming November 15 item. Dashboard counts: one Current, one Upcoming.
- Native document picker opens; cancelling restores Attach evidence without an error.

Upload/download remain unverified: a synthetic text file was created in the
Mac's iCloud Drive, but the phone's picker search did not find it. No existing
personal document was selected. Reminder delivery, purchase/restore, separate
account deletion, Android login and watch delivery remain pending.

### Physical UI fix verification at 20:37

On build 202609172014, the live suggestions heading and Close button are fully
visible; Close returns to the dashboard. Settings → Subscription displays
“Obligio Plus is active”, access/management information and Done, without a
Subscribe button. Both originally reported UI defects now pass on iPhone 11.

### Evidence follow-up at 20:43

The synthetic test file appeared in iCloud Drive Browse (the earlier Recent
search missed it). Attachment succeeded: View evidence and Replace evidence
are shown. The stored text was retrieved intact both from the Mac and by
entering its URL directly in iPhone Safari.

View evidence from Obligio repeatedly fails at React Native Linking.openURL
with “Unable to open URL”. The same URL is valid. This is a browser-handoff
failure, not an upload/content failure. A direct unlocked-phone test was
requested to distinguish a Mirroring/locked-device limitation from an app
defect. Evidence viewing remains a release gate until resolved.
