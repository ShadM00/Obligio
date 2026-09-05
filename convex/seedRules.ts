import {internalMutation} from './_generated/server';
import {v} from 'convex/values';
import {assertIsoDate} from './dates';

/**
 * Seeds the jurisdiction rules catalogue.
 *
 * This is operator tooling, not a client capability: the rules table is shared
 * reference data, so an internal mutation keeps it reachable from the Convex
 * dashboard and from other Convex functions while remaining unreachable from
 * the app (and from anyone who knows the deployment URL).
 */
export const addTemplate = internalMutation({
  args: {
    country: v.string(),
    region: v.string(),
    industry: v.string(),
    category: v.string(),
    title: v.string(),
    description: v.string(),
    sourceName: v.string(),
    sourceUrl: v.string(),
    effectiveFrom: v.string(),
    reviewedAt: v.string(),
    recurrence: v.optional(v.string()),
  },
  returns: v.id('rules'),
  handler: async (ctx, args) => {
    assertIsoDate(args.effectiveFrom, 'effectiveFrom');
    assertIsoDate(args.reviewedAt, 'reviewedAt');
    return ctx.db.insert('rules', args);
  },
});

/**
 * A draft catalogue of federal obligations that commonly apply to US small
 * businesses.
 *
 * Deliberate constraints on this content:
 *
 * - A template says *what* to track and *how often*. It never asserts a due
 *   date, because the real date depends on entity type, fiscal year, and
 *   filing history. The owner supplies the date when they adopt a template.
 * - Every entry names its authority and links to it, so an owner can check the
 *   claim rather than trust the app.
 * - Applicability is described, not assumed. Several of these apply only to
 *   employers, or only above a size threshold.
 *
 * `reviewedAt` is a required argument rather than a baked-in constant: whoever
 * seeds the catalogue is asserting the date on which they checked it against
 * the sources. Do not pass a date you have not actually reviewed.
 */
const US_FEDERAL_GENERAL = [
  {
    category: 'Tax',
    title: 'Federal income tax return',
    description:
      'Every business files an annual federal income tax return. The form and deadline depend on your entity type — sole proprietorship, partnership, S corporation, or C corporation — and on your fiscal year. Check the IRS business tax calendar for the date that applies to you.',
    sourceName: 'IRS — Business Tax Calendar',
    sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/online-tax-calendar',
    recurrence: 'annual',
  },
  {
    category: 'Tax',
    title: 'Estimated tax payments',
    description:
      'If you expect to owe tax of $1,000 or more when your return is filed ($500 for corporations), federal tax is generally paid in four instalments across the year rather than in one payment.',
    sourceName: 'IRS — Estimated Taxes',
    sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/estimated-taxes',
    recurrence: 'quarterly',
  },
  {
    category: 'Tax',
    title: "Form 941 — Employer's Quarterly Federal Tax Return",
    description:
      'Applies if you pay wages. Reports income tax, Social Security, and Medicare withheld from employee pay. Some very small employers file Form 944 annually instead — the IRS notifies you if that applies.',
    sourceName: 'IRS — About Form 941',
    sourceUrl: 'https://www.irs.gov/forms-pubs/about-form-941',
    recurrence: 'quarterly',
  },
  {
    category: 'Tax',
    title: 'Form 940 — Federal Unemployment (FUTA) Tax Return',
    description:
      'Applies if you paid $1,500 or more in wages in any calendar quarter, or had an employee for any part of a day in 20 or more different weeks. Filed once a year.',
    sourceName: 'IRS — About Form 940',
    sourceUrl: 'https://www.irs.gov/forms-pubs/about-form-940',
    recurrence: 'annual',
  },
  {
    category: 'Tax',
    title: 'W-2 and 1099-NEC information returns',
    description:
      'Applies if you paid employees or non-employee contractors. Copies go to the recipient and to the Social Security Administration or IRS. Both the recipient copy and the filed copy have deadlines.',
    sourceName: 'IRS — Information Returns',
    sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/information-returns',
    recurrence: 'annual',
  },
  {
    category: 'Registration',
    title: 'Beneficial Ownership Information report',
    description:
      'Many companies report who ultimately owns or controls them to FinCEN. Reporting requirements and deadlines for this rule have changed more than once, and some categories of company are exempt — confirm your current obligation with FinCEN directly before relying on this entry.',
    sourceName: 'FinCEN — Beneficial Ownership Information',
    sourceUrl: 'https://www.fincen.gov/boi',
    recurrence: undefined,
  },
  {
    category: 'Safety',
    title: 'OSHA Form 300A — post the annual summary',
    description:
      'Applies to employers required to keep OSHA injury and illness records — generally those with more than ten employees, outside of lower-hazard industries. The summary is posted in the workplace for a set period each year, and larger employers may also have to submit it electronically.',
    sourceName: 'OSHA — Injury and Illness Recordkeeping',
    sourceUrl: 'https://www.osha.gov/recordkeeping',
    recurrence: 'annual',
  },
  {
    category: 'Insurance',
    title: "Workers' compensation coverage review",
    description:
      "Workers' compensation is regulated by each state, not federally, so both the requirement and the renewal cycle depend on where you operate and how many people you employ. Review your policy annually against your state's rules.",
    sourceName: 'US Department of Labor — State Workers’ Compensation',
    sourceUrl: 'https://www.dol.gov/agencies/owcp/wc',
    recurrence: 'annual',
  },
] as const;

export const seedUnitedStatesFederal = internalMutation({
  args: {
    /** The date you checked this catalogue against its sources. */
    reviewedAt: v.string(),
    effectiveFrom: v.optional(v.string()),
  },
  returns: v.object({inserted: v.number(), skipped: v.number()}),
  handler: async (ctx, args) => {
    assertIsoDate(args.reviewedAt, 'reviewedAt');
    const effectiveFrom = args.effectiveFrom ?? args.reviewedAt;
    assertIsoDate(effectiveFrom, 'effectiveFrom');

    const existing = await ctx.db
      .query('rules')
      .withIndex('by_jurisdiction_and_industry', q =>
        q.eq('country', 'US').eq('region', '').eq('industry', 'General'),
      )
      .collect();
    const seen = new Set(existing.map(row => row.title));

    let inserted = 0;
    let skipped = 0;
    for (const template of US_FEDERAL_GENERAL) {
      // Re-running the seed must not duplicate the catalogue.
      if (seen.has(template.title)) {
        skipped += 1;
        continue;
      }
      await ctx.db.insert('rules', {
        country: 'US',
        region: '',
        industry: 'General',
        category: template.category,
        title: template.title,
        description: template.description,
        sourceName: template.sourceName,
        sourceUrl: template.sourceUrl,
        effectiveFrom,
        reviewedAt: args.reviewedAt,
        recurrence: template.recurrence,
      });
      inserted += 1;
    }
    return {inserted, skipped};
  },
});
