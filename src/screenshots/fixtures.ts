import type {PurchasesPackage} from 'react-native-purchases';
import type {Requirement, RuleTemplate} from '../types';

/**
 * Representative data for screenshots.
 *
 * The prices mirror what is configured in App Store Connect so a review
 * screenshot shows a reviewer the same figures they will see on the product,
 * and the obligations are the kind a small business actually tracks.
 */

export const screenshotRequirements: Requirement[] = [
  {_id: null, title: 'General liability insurance', category: 'Insurance', dueDate: '2026-10-14', status: 'upcoming', recurrence: 'annual', hasDocument: true},
  {_id: null, title: 'Estimated federal tax payment', category: 'Tax', dueDate: '2026-09-15', status: 'upcoming', recurrence: 'quarterly', hasDocument: false},
  {_id: null, title: 'Business licence renewal', category: 'Licences', dueDate: '2026-12-31', status: 'current', recurrence: 'annual', hasDocument: true},
  {_id: null, title: 'Food handler certification', category: 'Safety', dueDate: '2026-08-28', status: 'overdue', recurrence: 'annual', hasDocument: false},
  {_id: null, title: 'Fire safety inspection', category: 'Safety', dueDate: '2026-11-09', status: 'upcoming', recurrence: 'annual', hasDocument: false},
  {_id: null, title: "Workers' compensation review", category: 'Insurance', dueDate: '2027-01-20', status: 'current', recurrence: 'annual', hasDocument: true},
];

export const screenshotTemplates: RuleTemplate[] = [
  {
    _id: 'rule_941' as RuleTemplate['_id'],
    category: 'Tax',
    title: "Form 941 — Employer's Quarterly Federal Tax Return",
    description:
      'Applies if you pay wages. Reports income tax, Social Security, and Medicare withheld from employee pay.',
    sourceName: 'IRS — About Form 941',
    sourceUrl: 'https://www.irs.gov/forms-pubs/about-form-941',
    reviewedAt: '2026-09-05',
    recurrence: 'quarterly',
  },
  {
    _id: 'rule_300a' as RuleTemplate['_id'],
    category: 'Safety',
    title: 'OSHA Form 300A — post the annual summary',
    description:
      'Applies to employers required to keep OSHA injury and illness records. The summary is posted in the workplace for a set period each year.',
    sourceName: 'OSHA — Injury and Illness Recordkeeping',
    sourceUrl: 'https://www.osha.gov/recordkeeping',
    reviewedAt: '2026-09-05',
    recurrence: 'annual',
  },
];

function fixturePackage(identifier: string, title: string, description: string, priceString: string): PurchasesPackage {
  // Only the fields the paywall renders are populated; the rest of the
  // RevenueCat shape is irrelevant to a screenshot.
  return {
    identifier,
    product: {title, description, priceString},
  } as unknown as PurchasesPackage;
}

export const screenshotPackages: PurchasesPackage[] = [
  fixturePackage('$rc_monthly', 'Obligio Plus — Monthly', 'Free for the first 2 weeks, then billed monthly.', '$9.99'),
  fixturePackage('$rc_annual', 'Obligio Plus — Annual', 'Free for the first 2 weeks, then billed yearly.', '$79.99'),
];
