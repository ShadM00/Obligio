export type Locale = 'en-US' | 'en-GB';

type Copy = {
  appName: string;
  dashboard: string;
  calendar: string;
  documents: string;
  settings: string;
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
};

const shared = {
  appName: 'OBLIGIO',
  dashboard: 'Your dashboard',
  calendar: 'Calendar',
  documents: 'Documents',
  settings: 'Settings',
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
} as const;

export const locales: Record<Locale, Copy> = {
  'en-US': {
    ...shared,
    organisational: 'organizational',
    disclaimer: 'Obligio provides organizational tools, not legal or tax advice.',
  },
  'en-GB': {
    ...shared,
    organisational: 'organisational',
    disclaimer: 'Obligio provides organisational tools, not legal or tax advice.',
  },
};

/** Placeholder shown in the due-date field, in the locale's own date order. */
export function dueDatePlaceholder(locale: Locale): string {
  return locale === 'en-GB' ? 'Due date (e.g. 14 Oct 2026)' : 'Due date (e.g. Oct 14, 2026)';
}
