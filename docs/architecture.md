# Obligio production architecture

The mobile client is React Native CLI. Convex is the shared backend and file store. Requirements are tenant-scoped by `businessId`, indexed by owner and due date. The jurisdiction/rules layer remains separate from user-entered records so rules can be versioned and source-linked. RevenueCat remains the subscription system of record. Picked evidence files are uploaded to a Convex-generated URL and attached to the owning requirement; the client must never expose a public storage URL directly. Deadline notifications use a platform-native channel and timestamp trigger, with permission requested only when the user enables reminders.

## Dates

Every `dueDate` is stored as an ISO calendar date (`YYYY-MM-DD`) with no time or zone component. Free-text dates never reach Convex: `src/dates.ts` parses what the owner types (`Oct 14, 2026`, `14 Oct 2026`, locale-ordered slash dates) into the canonical form and refuses to save anything it cannot resolve, and `convex/dates.ts` re-validates on the server. Display formatting is the client's job and follows the active locale. Recurrence arithmetic clamps to the end of shorter months, so a 31st becomes the 28th/30th rather than spilling into the following month.

## Authorization

Every public Convex function is gated:

- `businesses.create`, `requirements*`, `recurrence.*`, and `documents.*` require a session and, where a record is involved, business ownership via `requireBusinessOwner`.
- `rules.listTemplates` requires a session. The rules catalogue is shared reference data rather than tenant data, so it is gated on identity rather than on ownership.
- `seedRules.addTemplate` is an **internal** mutation. Seeding the catalogue is operator tooling, reachable from the Convex dashboard and from other Convex functions but not from any client.
- `businesses.getByOwner` is the one deliberate exception to throwing on a missing identity: it returns `null` instead. It is the query the app subscribes to on launch, before the native auth bridge has produced a token, and throwing there would park the whole UI in an error state rather than on the sign-in path. It still fails closed — no identity yields no data.

## Configuration

`src/config.ts` holds the Convex deployment URL and the per-store RevenueCat publishable keys. The RevenueCat keys are `null` until an owner fills them in; while they are null the app reports that plans are unavailable rather than configuring the SDK with a bad key.
