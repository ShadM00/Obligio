export type Locale = 'en-US' | 'en-GB';

type Copy = {
  appName: string;
  dashboard: string;
  calendar: string;
  documents: string;
  settings: string;
  businessProfile: string;
  privacyAndData: string;
  helpAndSupport: string;
  deleteAccount: string;
  deleteAccountHint: string;
  deleteAccountTitle: string;
  deleteAccountBody: string;
  deleteAccountConfirm: string;
  deleteAccountCancel: string;
  deleteAccountFailed: string;
  complianceHealth: string;
  scoreHintClear: string;
  scoreHint: (outstanding: number) => string;
  current: string;
  upcoming: string;
  overdue: string;
  attention: string;
  viewAll: string;
  addRequirement: string;
  disclaimer: string;
  sampleData: string;
  signInRequired: string;
  signIn: string;
  tryAgain: string;
  close: string;
  noRequirements: string;
  organisational: string;
  documentsHelper: string;
  signInTitle: string;
  signInBody: string;
  signInCta: string;
  signingIn: string;
  authUnavailable: string;
  authUnavailableBody: string;
  signOut: string;
  checkingSession: string;
  onboardingTitle: string;
  onboardingBody: string;
  businessName: string;
  country: string;
  region: string;
  industry: string;
  createBusiness: string;
  creatingBusiness: string;
  suggested: string;
  suggestedTitle: string;
  suggestedBody: string;
  suggestedEmpty: string;
  suggestedDateHint: string;
  trackThis: string;
  source: string;
  reviewed: string;
  editRequirement: string;
  saveRequirement: string;
  saving: string;
  removing: string;
  uploading: string;
  opening: string;
  viewEvidence: string;
  attachEvidence: string;
  replaceEvidence: string;
  markDoneNext: string;
  markCurrent: string;
  deleteObligation: string;
  noEvidence: string;
  plusRequired: string;
  freeLimitReached: (limit: number) => string;
  evidenceIsPlus: string;
  recurrenceIsPlus: string;
  plusActive: string;
  upgrade: string;
};

const shared = {
  appName: 'OBLIGIO',
  dashboard: 'Your dashboard',
  calendar: 'Calendar',
  documents: 'Documents',
  settings: 'Settings',
  businessProfile: 'Business profile',
  privacyAndData: 'Privacy & data',
  helpAndSupport: 'Help & support',
  deleteAccount: 'Delete account',
  deleteAccountHint: 'Permanently removes your businesses, obligations and documents',
  deleteAccountTitle: 'Delete your account?',
  deleteAccountBody:
    'This permanently deletes your businesses, every obligation you track and every document you have attached. It cannot be undone.\n\nA paid subscription is billed by the App Store or Google Play, so cancel it there as well — deleting your account here does not stop it.',
  deleteAccountConfirm: 'Delete everything',
  deleteAccountCancel: 'Cancel',
  deleteAccountFailed: 'Your account could not be deleted. Nothing has been removed — please try again.',
  complianceHealth: 'Compliance health',
  scoreHintClear: 'Everything is on track.',
  scoreHint: (outstanding: number) =>
    `Fix ${outstanding} item${outstanding === 1 ? '' : 's'} to reach 100%`,
  current: 'Current',
  upcoming: 'Upcoming',
  overdue: 'Overdue',
  attention: 'Needs attention',
  viewAll: 'View all',
  addRequirement: 'Add requirement',
  sampleData: 'Sample data — sign in to track your own obligations.',
  signInRequired: 'Sign in to set up your business.',
  signIn: 'Sign in',
  tryAgain: 'Try again',
  close: 'Close',
  noRequirements: 'No obligations tracked yet. Add your first one to get started.',
  signInTitle: 'Your business obligations, under control.',
  signInCta: 'Sign in to get started',
  signingIn: 'Opening sign-in…',
  authUnavailable: 'Sign-in is unavailable in this build',
  authUnavailableBody:
    'This build has no authentication module, so it cannot reach your data. Everything below is sample data.',
  signOut: 'Sign out',
  checkingSession: 'Checking your session…',
  onboardingTitle: 'Tell us about your business',
  onboardingBody:
    'Your location and industry decide which obligations Obligio suggests, so these can be changed later.',
  businessName: 'Business name',
  country: 'Country',
  region: 'State or region',
  industry: 'Industry',
  createBusiness: 'Create my business',
  creatingBusiness: 'Creating…',
  suggested: 'Suggested for you',
  suggestedTitle: 'Suggested obligations',
  suggestedBody:
    'Common obligations for your location and industry. Each links to the authority it comes from — check that source before you rely on it.',
  suggestedEmpty:
    'No suggestions are published for your location and industry yet. You can still add obligations yourself.',
  suggestedDateHint: 'Deadlines vary by entity type and filing history, so you set the date that applies to you.',
  trackThis: 'Track this',
  source: 'Source',
  reviewed: 'reviewed',
  editRequirement: 'Edit requirement',
  saveRequirement: 'Save requirement',
  saving: 'Saving…',
  removing: 'Removing…',
  uploading: 'Uploading…',
  opening: 'Opening…',
  viewEvidence: 'View evidence',
  attachEvidence: 'Attach evidence',
  replaceEvidence: 'Replace evidence',
  markDoneNext: 'Mark done & schedule next',
  markCurrent: 'Mark as current',
  deleteObligation: 'Delete obligation',
  noEvidence: 'This obligation has no evidence attached.',
  plusRequired: 'Obligio Plus',
  freeLimitReached: (limit: number) =>
    `Free accounts track up to ${limit} obligations. Upgrade for unlimited.`,
  evidenceIsPlus: 'Attaching evidence is part of Obligio Plus.',
  recurrenceIsPlus: 'Recurring obligations are part of Obligio Plus.',
  plusActive: 'Obligio Plus is active',
  upgrade: 'Upgrade',
} as const;

export const locales: Record<Locale, Copy> = {
  'en-US': {
    ...shared,
    organisational: 'organizational',
    disclaimer: 'Obligio provides organizational tools, not legal or tax advice.',
    signInBody: 'Track licenses, insurance, filings, inspections, and documents in one calm place.',
    documentsHelper:
      'Upload insurance certificates, licenses, permits, and training records. They stay linked to the obligation they support — open an obligation to attach its evidence.',
  },
  'en-GB': {
    ...shared,
    organisational: 'organisational',
    disclaimer: 'Obligio provides organisational tools, not legal or tax advice.',
    signInBody: 'Track licences, insurance, filings, inspections, and documents in one calm place.',
    documentsHelper:
      'Upload insurance certificates, licences, permits, and training records. They stay linked to the obligation they support — open an obligation to attach its evidence.',
  },
};

/** Placeholder shown in the due-date field, in the locale's own date order. */
export function dueDatePlaceholder(locale: Locale): string {
  return locale === 'en-GB' ? 'Due date (e.g. 14 Oct 2026)' : 'Due date (e.g. Oct 14, 2026)';
}
