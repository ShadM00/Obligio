# Obligio design strategy

## Product promise

Obligio is a calm business control center: it makes obligations visible, keeps evidence close, and turns risk into a clear next action. The experience should reduce uncertainty without minimizing consequences.

## Brand character

Calm, credible, practical, focused, and quietly confident. Copy is plain US English, specific about dates and actions, and never alarmist. Obligio organizes information; it does not provide legal, tax, accounting, or regulatory advice.

## Visual principles

1. **Clarity before decoration.** One primary action per surface, strong hierarchy, short labels, and generous spacing.
2. **Status is semantic.** Green means current, amber means upcoming action, and red means overdue. Never use color alone; pair it with text or an icon.
3. **Risk is actionable.** Every warning must answer what is due, when it is due, and what the owner can do next.
4. **Evidence stays connected.** Documents appear in the context of the obligation they support.
5. **Trust is earned.** Show source authority, effective dates, and review dates for templates. Avoid unsupported compliance claims.

## Design tokens

| Token | Value | Use |
|---|---|---|
| Forest 900 | `#13251D` | Primary text and high-contrast headings |
| Forest 800 | `#163E31` | Hero panels, brand surfaces |
| Forest 600 | `#1B7F5B` | Positive actions and current status |
| Mint 100 | `#D8F1E2` | Primary action backgrounds |
| Sage 500 | `#587064` | Secondary text |
| Amber 700 | `#B76A00` | Upcoming status |
| Red 700 | `#B42318` | Overdue status and destructive warnings |
| Canvas | `#F7F8F6` | App background |
| White | `#FFFFFF` | Cards and navigation |

Typography uses the platform system sans-serif: 44/48 for onboarding hero, 32/38 for screen titles, 20/26 for section headings, 16/22 for body and 13/18 for metadata. Font weights are 800 for display, 700 for labels, and 400–500 for body copy.

## Component rules

- Cards: 16–24 px radius, white surface, subtle border, no heavy shadow.
- Buttons: 16 px radius, 48 px minimum height, sentence case, explicit verb.
- Status rows: status marker, title, category/date metadata, and a clear affordance.
- Forms: visible labels, examples in placeholders, inline validation, and disabled submit until valid.
- Navigation: four primary destinations maximum; preserve the selected state with both color and weight.
- Accessibility: minimum 4.5:1 text contrast, 3:1 large text contrast, 44 px touch targets, dynamic type support, and VoiceOver/TalkBack labels for status icons.

## Core journeys

### First run

Welcome → business basics → jurisdiction and industry → suggested obligations → confirm inventory → dashboard. The user should see value before being asked to subscribe.

### Add an obligation

Add → title/category/due date → optional recurrence/source/document → review → save. Invalid dates and missing titles are explained inline.

### Resolve risk

Dashboard attention item → obligation detail → next action or upload evidence → mark current → schedule next recurrence.

### Subscription

Free tier explains the value of the inventory. The paywall appears after a meaningful limit or premium action, states monthly/annual terms clearly, supports restore purchases, and links to privacy and terms.

## State coverage

Every screen requires designed loading, empty, error, offline, permission-denied, and success states. Error messages explain recovery. Offline changes are clearly marked pending and must never appear silently synced.

## Store and marketing direction

Screenshots should follow a single narrative: **See risk → keep evidence → stay ready**. Use the same Forest/Mint visual language, real UI rather than abstract claims, short captions, and no unsupported regulatory promises.

## Localization

US English is the source locale. Dates, currency, pluralization, spelling, and regulatory terminology must come from locale data; never concatenate user-facing dates or assume US formatting in shared components.

## Definition of design complete

Design is complete when these tokens and rules are implemented in the app, every core journey has screens and states, accessibility checks pass on representative iOS and Android sizes, and store screenshots use the same approved narrative and visual system.
