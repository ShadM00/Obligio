import {darkColors, lightColors, type Palette} from '../src/designTokens';

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`not a 6-digit hex colour: ${hex}`);
  const [r, g, b] = [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.1 relative contrast, 1–21. */
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const schemes: [string, Palette][] = [
  ['light', lightColors],
  ['dark', darkColors],
];

test('both palettes define exactly the same tokens', () => {
  // A token added to one scheme and forgotten in the other would render as
  // undefined, which React Native silently ignores.
  expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
});

test('every colour is a 6-digit hex value', () => {
  for (const [name, palette] of schemes) {
    for (const [token, value] of Object.entries(palette)) {
      expect(`${name}.${token}=${value}`).toMatch(/[=]#[0-9a-fA-F]{6}$/);
    }
  }
});

describe.each(schemes)('%s scheme contrast', (_name, c) => {
  // WCAG AA: 4.5:1 for body text.
  test.each([
    ['primary text on the page', c.textPrimary, c.background],
    ['primary text on a card', c.textPrimary, c.surface],
    ['secondary text on the page', c.textSecondary, c.background],
    ['muted text on a card', c.textMuted, c.surface],
    ['primary button label', c.onBrandSoft, c.brandSoft],
    ['score card label', c.onBrandDeep, c.brandDeep],
    ['warning banner text', c.onWarningSurface, c.warningSurface],
  ])('%s meets AA for body text', (_label, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  // WCAG AA: 3:1 for large text and for non-text indicators.
  test.each([
    ['status dot: current', c.statusCurrent, c.surface],
    ['status dot: upcoming', c.statusUpcoming, c.surface],
    ['status dot: overdue', c.statusOverdue, c.surface],
    ['link colour', c.brand, c.background],
    ['destructive text', c.danger, c.background],
  ])('%s meets AA for large text and indicators', (_label, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(3);
  });
});
