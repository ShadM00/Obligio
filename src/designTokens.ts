export const colors = {
  forest900: '#13251D',
  forest800: '#163E31',
  forest600: '#1B7F5B',
  mint100: '#D8F1E2',
  sage500: '#587064',
  amber700: '#B76A00',
  red700: '#B42318',
  canvas: '#F7F8F6',
  white: '#FFFFFF',
} as const;

export const radii = {card: 20, control: 16, pill: 18} as const;

export const spacing = {xs: 4, sm: 8, md: 16, lg: 24, xl: 32} as const;

export const typography = {
  display: {fontSize: 44, lineHeight: 48, fontWeight: '800' as const},
  title: {fontSize: 32, lineHeight: 38, fontWeight: '800' as const},
  section: {fontSize: 20, lineHeight: 26, fontWeight: '800' as const},
  body: {fontSize: 16, lineHeight: 22, fontWeight: '400' as const},
  meta: {fontSize: 13, lineHeight: 18, fontWeight: '500' as const},
} as const;
