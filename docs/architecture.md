# Obligio production architecture

The mobile client is React Native CLI. Convex is the shared backend and file store. Requirements are tenant-scoped by `businessId`, indexed by owner and due date. The jurisdiction/rules layer will remain separate from user-entered records so rules can be versioned and source-linked. RevenueCat remains the subscription system of record. Picked evidence files are uploaded to a Convex-generated URL and attached to the owning requirement; the client must never expose a public storage URL directly. Deadline notifications use a platform-native channel and timestamp trigger, with permission requested only when the user enables reminders.

Before production launch, replace the temporary onboarding owner token with a real auth provider and enforce identity checks in every public Convex function.
