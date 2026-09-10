package com.compliancecalendar

import androidx.compose.ui.graphics.Color
import com.clerk.api.ui.ClerkColors
import com.clerk.api.ui.ClerkTheme

/**
 * Obligio's palette for Clerk's sign-in screen.
 *
 * Sign-in is where the app asks for credentials, so it should look like the
 * app rather than like a third party. Left alone, Clerk draws it in its own
 * purple.
 *
 * Clerk's `border` outlines the input fields, and it maps to `textMuted` as the
 * strongest on-palette choice. It is still faint, and nothing here can fix
 * that: clerk-android-ui draws the unfocused outline at a hard-coded 11%
 * opacity (INPUT_BORDER_ALPHA), so it lands near 1.1:1 whatever colour is
 * passed -- below WCAG 1.4.11's 3:1, and just as faint in Clerk's stock theme.
 * The focused outline uses `primary` at full strength, which is plainly
 * visible, and the placeholder text carries the field's affordance until then.
 *
 * Every value here is copied from `src/designTokens.ts`, which is the source of
 * truth. `__tests__/clerkTheme.test.ts` fails if they drift apart -- a colour
 * reached for from the wrong palette is exactly how the welcome logo once went
 * invisible in dark mode.
 */
val ObligioClerkTheme = ClerkTheme(
  lightColors = ClerkColors(
    primary = Color(0xFF163E31),           // brandDeep
    primaryForeground = Color(0xFFFFFFFF), // onBrandDeep
    background = Color(0xFFF7F8F6),        // background
    input = Color(0xFFFFFFFF),             // surface
    inputForeground = Color(0xFF13251D),   // textPrimary
    foreground = Color(0xFF13251D),        // textPrimary
    mutedForeground = Color(0xFF587064),   // textSecondary
    border = Color(0xFF66766C),            // textMuted
    neutral = Color(0xFFE0E7E2),           // border
    ring = Color(0xFF1B7F5B),              // brand
    danger = Color(0xFFB42318),            // danger
  ),
  darkColors = ClerkColors(
    // brand, not brandDeep: primary is also the focused field's outline, and
    // brandDeep on this background is two dark greens at 1.84:1 -- a focus
    // ring you cannot see. The mint accent is what the app uses in dark mode.
    primary = Color(0xFF5FD3A3),           // brand
    primaryForeground = Color(0xFF0E1714), // background
    background = Color(0xFF0E1714),        // background
    input = Color(0xFF17241F),             // surface
    inputForeground = Color(0xFFECF3EF),   // textPrimary
    foreground = Color(0xFFECF3EF),        // textPrimary
    mutedForeground = Color(0xFFA8BCB1),   // textSecondary
    border = Color(0xFF93A79C),            // textMuted
    neutral = Color(0xFF2A3B34),           // border
    ring = Color(0xFF5FD3A3),              // brand
    danger = Color(0xFFF0857A),            // danger
  ),
)
