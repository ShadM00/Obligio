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
