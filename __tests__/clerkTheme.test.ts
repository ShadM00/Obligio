// Node types for this file only: it reads the Kotlin theme from disk. Kept
// out of tsconfig so app code cannot reach for Node APIs by accident.
/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';

import {darkColors, lightColors, type Palette} from '../src/designTokens';

/**
 * The Android sign-in theme is written in Kotlin, so it cannot import the
 * palette; it copies it. This keeps the copy honest.
 *
 * Each `Color(0xFF......), // token` line must match that token in
 * designTokens.ts. A palette change that forgets the Kotlin file fails here
 * instead of shipping a sign-in screen in last season's colours.
 */
function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const source = fs.readFileSync(
  path.join(__dirname, '../android/app/src/main/java/com/compliancecalendar/ObligioClerkTheme.kt'),
  'utf8',
);

function entries(block: string): [string, string][] {
  return [...block.matchAll(/Color\(0xFF([0-9A-Fa-f]{6})\),\s*\/\/\s*(\w+)/g)].map(
    ([, hex, token]) => [token, `#${hex.toUpperCase()}`],
  );
}

const lightBlock = source.slice(source.indexOf('lightColors'), source.indexOf('darkColors'));
const darkBlock = source.slice(source.indexOf('darkColors'));

describe.each([
  ['light', lightBlock, lightColors],
  ['dark', darkBlock, darkColors],
])('%s Clerk theme', (_name, block, palette: Palette) => {
  const pairs = entries(block);

  it('maps every colour it sets to a named token', () => {
    expect(pairs.length).toBeGreaterThanOrEqual(10);
  });

  it('outlines the focused field strongly enough to see', () => {
    // Only the focused outline is checked, because it is the only one that
    // renders at the colour given: Clerk draws it in `primary` at full
    // strength. The unfocused outline is `border` at a hard-coded 11% opacity
    // (INPUT_BORDER_ALPHA in clerk-android-ui), which no colour can lift to
    // 3:1 -- even the darkest text colour lands at 1.24:1. Asserting 3:1 on
    // the raw `border` value passed while the screen showed 1.14:1.
    const hexOf = (role: string) =>
      `#${new RegExp(`\\b${role} = Color\\(0xFF([0-9A-Fa-f]{6})\\)`).exec(block)![1]}`;
    expect(contrast(hexOf('primary'), hexOf('background'))).toBeGreaterThanOrEqual(3);
  });

  it.each(pairs)('%s matches designTokens.ts', (token, hex) => {
    const expected = (palette as Record<string, string>)[token];
    expect(expected).toBeDefined();
    expect(hex).toBe(expected.toUpperCase());
  });
});
