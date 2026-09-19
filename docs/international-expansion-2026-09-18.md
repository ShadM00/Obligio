# International expansion assessment

Status: implementation in progress. Backend deployed; updated phone binaries and store expansion pending. See progress below.

## Confirmed gaps

Onboarding currently offers only US. GB vocabulary exists but is not offered. Business profiles store country, region and industry, but not municipality or structured eligibility facts. Rules match country/region/industry. Languages currently include en-US, en-GB and es-US; Spanish UI does not constitute Spain or Mexico compliance coverage.

## Proposed sequence

1. Australia, UK and Canada: country and subdivision setup, local-authority coverage boundaries, English and Canadian French. Retain US coverage.
2. Spain and Mexico with distinct Spanish rule packs; France with French; Germany with German; Brazil with Brazilian Portuguese.
3. Additional markets, including New Zealand, Ireland and Singapore, based on source-review capacity and measured activation, subscriptions and retention.

This is an implementation priority proposal, not a measured revenue ranking.

## Product requirements

- Separate interface language, registered jurisdiction, operating locations, store availability and billing currency.
- Collect entity type and only the eligibility facts required for relevant rules. Missing facts mean unknown applicability.
- Match national, subdivision and municipal rules without crossing country boundaries. Do not equate an unspecified region with absence of regional obligations.
- Show official source, jurisdiction, applicability, effective dates, verification date and coverage limits on each suggestion.
- Treat official discovery portals as research entry points, not verified rule catalogues.
- Retain user-entered deadlines unless a sourced calculation has sufficient business facts. Never silently overwrite existing obligations after a catalogue change.
- Allow manual tracking with explicit coverage gaps; never substitute US rules for unsupported countries.
- Translate onboarding, errors, reminders, billing, restore, account deletion, store metadata, screenshots and support. Preserve original official sources alongside translated explanations.

## Official research entry points checked 18 September 2026

- Australia: https://business.gov.au/Registrations/Register-licences-and-permits and https://ablis.business.gov.au/
- Canada: https://www.canada.ca/en/services/business/permits.html
- UK: https://www.gov.uk/find-licences (explicitly not exhaustive)
- France: https://entreprendre.service-public.fr/

Each individual obligation still requires review before publication.

## Acceptance before each release

Test jurisdiction isolation, same-language users in different countries, local rules, unknown eligibility, locale formatting, translation fallback and stale sources. Verify local subscription availability/pricing, purchase/restore, notifications, screenshots and store declarations. Record store expansion, catalogue activation and binary release separately. Investigate the existing payments alert independently; published availability does not prove working billing.


## Implementation progress — 18 September 2026

Implemented in source:
- US/UK/Australia/Canada onboarding; all eight AU and thirteen CA subdivisions; UK constituent nations.
- Entity selection and a canonical City of Perth council selector. Other municipalities are explicitly uncovered, not inferred from free text.
- Existing owners can edit profiles without altering already-tracked obligations.
- Server validates profile combinations, checks ownership and rejects adoption of mismatched country/region/industry/locality/entity templates.
- Canadian French interface, persistence on both native platforms, ISO French date entry with localized display, translated notification headings and Spanish expansion controls.
- All nine new international catalogue rows have French and Spanish title/description translations. Untranslated legacy US entries retain English, with a visible fallback notice.
- Clickable official source links and coverage warnings in suggestions.

Deployed and seeded in production Convex: nine selected rows (seven distinct topics, including three nation-specific copies of FSA food registration): ASIC company annual review; WA food registration/notification; City of Perth food premises; Companies House confirmation statement; food-business registration in England, Wales and Northern Ireland; Canadian federal corporation annual return; BC company annual report. Official sources are stored in convex/catalogueInternational.ts. Reviewed 2026-09-18. effectiveFrom currently means catalogue publication date, not the commencement of the legislation.

Live smoke checks: AU/WA/City of Perth food company returns three relevant entries; Canadian BC provincial corporation returns BC annual report; Scottish sole-trader food profile returns no England/Wales/NI food rule. Empty results explicitly do not mean no duties.

Coverage limits: this is a small reviewed starter catalogue, not exhaustive country/state/council coverage. One registered jurisdiction per business; additional operating locations remain manually tracked. Unknown entity eligibility is not inferred. Source translations still need native-speaker release QA. Native authentication, store-supplied product text and watch screens are not fully French-localized.

Google API verified production version 12 is completed, countries GB/US. Monthly and annual base plans ACTIVE and available to new subscribers in AU and CA: AUD 14.99 / 119.99; CAD 13.99 / 109.99. These are configured prices, not verified successful purchases. Existing account-level payments warning remains unresolved.

Apple availability remains GBR/USA; no expansion submitted. Google distribution also unchanged. New country availability should ship with updated onboarding binary, not the old US-only onboarding.

Release constraints: only 1.6 GiB free disk, no external volume, and no Android device attached during checks. Signed release builds, device QA, French screenshots, store product localization and country expansion remain pending. French listing draft and rollout manifest are under docs/international-release-drafts/. Do not treat these drafts as live metadata.

Evidence: build/release-review/international-*.json and international-convex-deploy.log. Final automated verification: TypeScript, ESLint and Jest (see latest task report for count).
