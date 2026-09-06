/**
 * Screenshot capture mode.
 *
 * Flip to true locally, run the app in a simulator, and the root renders a
 * cycling gallery of real screens against fixture data instead of the app.
 * Set it back to false before committing.
 *
 * index.js only consults this behind `__DEV__`, so the harness and its
 * fixtures are stripped from release bundles regardless of this value.
 */
export const SCREENSHOT_MODE = false;

/**
 * Milliseconds between frames when capturing.
 *
 * 0 keeps the gallery tap-driven. Set it to a few seconds and the gallery
 * advances on its own, so `scripts/capture-screenshots.sh` can drive a whole
 * run with `simctl io screenshot` and no hand-tapping -- which is what makes
 * a re-capture reproducible after a copy change.
 */
export const AUTO_ADVANCE_MS = 0;
