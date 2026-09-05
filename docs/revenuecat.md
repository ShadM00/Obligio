# RevenueCat setup

Create products `obligio_plus_monthly` and `obligio_plus_annual` in App Store Connect and Google Play, then create the `obligio_plus` entitlement and default offering in RevenueCat. Add platform API keys through native build settings; do not commit them. The app integration entry point is `src/billing.ts`, which includes offerings, purchase, restore, and entitlement checks. Treat purchase cancellation and billing errors as recoverable UI states.
