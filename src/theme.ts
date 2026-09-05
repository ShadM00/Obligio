import {useColorScheme, StyleSheet} from 'react-native';
import {darkColors, lightColors, type Palette} from './designTokens';

/** Every style in the app, resolved against one palette. */
function createStyles(c: Palette) {
  return StyleSheet.create({
    safe: {flex: 1, backgroundColor: c.background},
    container: {padding: 24, paddingBottom: 100},
    top: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24},
    eyebrow: {fontSize: 13, fontWeight: '700', letterSpacing: 1.4, color: c.textSecondary},
    title: {fontSize: 32, fontWeight: '800', color: c.textPrimary, marginTop: 5},
    locale: {borderWidth: 1, borderColor: c.border, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8},
    localeText: {fontWeight: '700', color: c.textSecondary},

    scoreCard: {
      backgroundColor: c.brandDeep,
      borderRadius: 24,
      padding: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    score: {fontSize: 50, fontWeight: '800', color: c.onBrandDeep},
    scoreLabel: {fontSize: 16, fontWeight: '700', color: c.onBrandDeepMuted, marginTop: -4},
    darkMuted: {fontSize: 13, color: c.onBrandDeepMuted, marginTop: 4},
    ring: {
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 7,
      borderColor: c.ring,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringText: {fontSize: 32, color: c.onBrandDeep},

    stats: {flexDirection: 'row', backgroundColor: c.surface, borderRadius: 18, padding: 18, marginTop: 14, marginBottom: 30},
    stat: {flex: 1},
    statValue: {fontSize: 24, fontWeight: '800'},
    muted: {fontSize: 13, color: c.textMuted, marginTop: 4},

    sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
    sectionTitle: {fontSize: 20, fontWeight: '800', color: c.textPrimary},
    monthHeading: {fontSize: 14, fontWeight: '800', color: c.textSecondary, letterSpacing: 0.6, marginTop: 18, marginBottom: 8},
    link: {fontSize: 14, fontWeight: '700', color: c.brand},
    linkSpaced: {fontSize: 14, fontWeight: '700', color: c.brand, marginTop: 8},
    centeredLink: {fontSize: 14, fontWeight: '700', color: c.brand, textAlign: 'center', marginTop: 18},
    noticeText: {fontSize: 13, marginTop: 4, color: c.brand, fontWeight: '700'},
    sourceLine: {fontSize: 12, color: c.textSecondary, marginBottom: 10},

    item: {flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: 16, padding: 16, marginBottom: 10},
    dot: {width: 10, height: 10, borderRadius: 5, marginRight: 14},
    currentDot: {backgroundColor: c.statusCurrent},
    upcomingDot: {backgroundColor: c.statusUpcoming},
    overdueDot: {backgroundColor: c.statusOverdue},
    itemBody: {flex: 1},
    itemTitle: {fontSize: 16, fontWeight: '700', color: c.textPrimary},
    chevron: {fontSize: 28, color: c.textMuted},
    paperclip: {fontSize: 14, color: c.brand, marginRight: 8},

    primary: {backgroundColor: c.brandSoft, borderRadius: 16, alignItems: 'center', padding: 17, marginTop: 10},
    primaryText: {color: c.onBrandSoft, fontSize: 16, fontWeight: '800'},
    primaryDisabled: {opacity: 0.5},
    secondary: {borderWidth: 1, borderColor: c.brand, borderRadius: 16, alignItems: 'center', padding: 16, marginTop: 10},
    secondaryText: {color: c.brand, fontSize: 16, fontWeight: '800'},
    destructiveText: {color: c.danger, fontSize: 15, fontWeight: '700', textAlign: 'center', marginTop: 16},
    signOutText: {color: c.danger},

    disclaimer: {fontSize: 11, color: c.textMuted, textAlign: 'center', lineHeight: 16, marginTop: 22},
    banner: {backgroundColor: c.warningSurface, borderRadius: 12, padding: 12, marginBottom: 16},
    bannerText: {fontSize: 13, color: c.onWarningSurface, fontWeight: '600'},
    errorBox: {backgroundColor: c.dangerSurface, borderRadius: 12, padding: 14, marginTop: 14},
    errorText: {fontSize: 14, color: c.danger, fontWeight: '600'},

    welcome: {flex: 1, padding: 28, justifyContent: 'center'},
    logo: {width: 72, height: 72, alignItems: 'center', justifyContent: 'center', marginBottom: 28},
    logoText: {fontSize: 40, color: c.brandSoft},
    welcomeTitle: {letterSpacing: -2, color: c.textPrimary, marginTop: 14},
    welcomeBody: {color: c.textSecondary, lineHeight: 28, marginTop: 24, marginBottom: 28},

    nav: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 78,
      backgroundColor: c.surface,
      borderTopWidth: 1,
      borderTopColor: c.border,
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 10,
    },
    navItem: {alignItems: 'center', flex: 1},
    navIcon: {fontSize: 22, color: c.textMuted},
    navLabel: {fontSize: 11, color: c.textMuted, marginTop: 3},
    navActive: {color: c.brand, fontWeight: '800'},

    helper: {fontSize: 15, color: c.textMuted, lineHeight: 23, marginBottom: 18},
    helperSpaced: {fontSize: 15, color: c.textMuted, lineHeight: 23, marginBottom: 18, marginTop: 12},
    empty: {backgroundColor: c.surface, borderRadius: 20, padding: 24, alignItems: 'center'},
    emptyIcon: {fontSize: 42, color: c.brand, marginBottom: 10},
    setting: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 18,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    modal: {position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(6,12,10,.6)', justifyContent: 'flex-end'},
    modalCard: {backgroundColor: c.background, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 24, paddingBottom: 34},
    input: {backgroundColor: c.surfaceAlt, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 12, color: c.textPrimary},
    inputInvalid: {borderWidth: 1, borderColor: c.danger},
    detailTitle: {fontSize: 28, fontWeight: '800', color: c.textPrimary, marginTop: 14, marginBottom: 10},
    detailStatus: {fontSize: 15, fontWeight: '700', color: c.warning, marginBottom: 8},
    detailStatusCurrent: {color: c.brand},
    detailCard: {backgroundColor: c.surface, borderRadius: 16, padding: 16, marginTop: 8},
    choice: {backgroundColor: c.surface, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    choiceSelected: {borderWidth: 2, borderColor: c.brand},
    chip: {borderWidth: 1, borderColor: c.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8},
    chipSelected: {backgroundColor: c.brandSoft, borderColor: c.brand},
    chipText: {fontSize: 13, fontWeight: '700', color: c.textSecondary},
    row: {flexDirection: 'row', flexWrap: 'wrap'},
  });
}

export type AppTheme = {s: ReturnType<typeof createStyles>; colors: Palette; isDark: boolean};

// Both sheets are built once at module load rather than per render.
const lightTheme: AppTheme = {s: createStyles(lightColors), colors: lightColors, isDark: false};
const darkTheme: AppTheme = {s: createStyles(darkColors), colors: darkColors, isDark: true};

/**
 * Resolves the theme from the OS setting.
 *
 * Deliberately not backed by a context provider: the app renders `App`
 * directly in tests, and a missing provider would either crash or silently
 * fall back. Reading the scheme where it is used keeps every component correct
 * on its own.
 */
export function useAppTheme(): AppTheme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}
