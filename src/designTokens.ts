/**
 * Design tokens.
 *
 * Colours are semantic rather than literal, because the same role takes a
 * different value in each scheme — `surface` is white in light mode and a
 * raised charcoal in dark mode. Naming them `white` would make the dark
 * palette read as a lie.
 *
 * The brand ramp (deep green, green, mint) is shared: it is the identity, so
 * it stays recognisable in both schemes, with only its contrast partners
 * changing.
 */

export type Palette = {
  /** Page background. */
  background: string;
  /** Cards and rows sitting on the background. */
  surface: string;
  /** Inputs and sheet backgrounds. */
  surfaceAlt: string;
  border: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  /** Deep brand green: the score card, the logo tile. */
  brandDeep: string;
  onBrandDeep: string;
  onBrandDeepMuted: string;
  /** Mid brand green: links and accents. */
  brand: string;
  /** Soft brand green: primary button fill. */
  brandSoft: string;
  onBrandSoft: string;
  ring: string;

  warning: string;
  danger: string;
  onWarningSurface: string;
  warningSurface: string;
  dangerSurface: string;

  statusCurrent: string;
  statusUpcoming: string;
  statusOverdue: string;
};

export const lightColors: Palette = {
  background: '#F7F8F6',
  surface: '#FFFFFF',
  surfaceAlt: '#FFFFFF',
  border: '#E0E7E2',

  textPrimary: '#13251D',
  textSecondary: '#587064',
  textMuted: '#66766C',

  brandDeep: '#163E31',
  onBrandDeep: '#FFFFFF',
  onBrandDeepMuted: '#BBD8C8',
  brand: '#1B7F5B',
  brandSoft: '#D8F1E2',
  onBrandSoft: '#14593E',
  ring: '#82C6A7',

  warning: '#B76A00',
  danger: '#B42318',
  warningSurface: '#FFF4E0',
  onWarningSurface: '#7A4E00',
  dangerSurface: '#FDECEA',

  statusCurrent: '#1B7F5B',
  statusUpcoming: '#C67C0A',
  statusOverdue: '#C6382B',
};

export const darkColors: Palette = {
  background: '#0E1714',
  surface: '#17241F',
  surfaceAlt: '#1D2B25',
  border: '#2A3B34',

  textPrimary: '#ECF3EF',
  textSecondary: '#A8BCB1',
  textMuted: '#93A79C',

  // The deep green reads as a flat panel against a dark page, so it lifts
  // slightly to stay distinguishable from the surface behind it.
  brandDeep: '#1B4B3B',
  onBrandDeep: '#F2FAF6',
  onBrandDeepMuted: '#A9CDBB',
  brand: '#5FD3A3',
  brandSoft: '#1F4A3A',
  onBrandSoft: '#BFEAD5',
  ring: '#5FD3A3',

  warning: '#E7A44A',
  danger: '#F0857A',
  warningSurface: '#3A2C15',
  onWarningSurface: '#F3D9AC',
  dangerSurface: '#3A1E1C',

  statusCurrent: '#5FD3A3',
  statusUpcoming: '#E7A44A',
  statusOverdue: '#F0857A',
};

export const radii = {card: 20, control: 16, pill: 18} as const;

export const spacing = {xs: 4, sm: 8, md: 16, lg: 24, xl: 32} as const;

export const typography = {
  display: {fontSize: 44, lineHeight: 48, fontWeight: '800' as const},
  title: {fontSize: 32, lineHeight: 38, fontWeight: '800' as const},
  section: {fontSize: 20, lineHeight: 26, fontWeight: '800' as const},
  body: {fontSize: 16, lineHeight: 22, fontWeight: '400' as const},
  meta: {fontSize: 13, lineHeight: 18, fontWeight: '500' as const},
} as const;
