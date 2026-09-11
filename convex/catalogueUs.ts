import type {Recurrence} from './dates';

/**
 * Draft US catalogue beyond the federal-general set: the periodic report every
 * state asks of its corporations and LLCs, and federal obligations that apply
 * to a whole trade.
 *
 * Drafted 2026-09-11 from each state's or agency's own page, with the page
 * linked on every entry. Nothing here has been seeded: a draft is research,
 * and research is not the attestation `reviewedAt` records. Read an entry
 * against its source before seeding it; `seedUnitedStatesStates` takes the
 * regions you actually reviewed, so a review can be done a few states at a
 * time and still be honest. Gaps found while drafting are listed in
 * docs/rules-layer.md under "Draft catalogue review notes".
 *
 * The same constraints as the federal set apply:
 *
 * - A template describes the rule and the cadence. It never asserts the
 *   owner's own date, which depends on formation date, fiscal year and entity
 *   type; the owner sets it when adopting the template.
 * - Where corporations and LLCs are treated differently, the entry says so.
 *   Where they repeat on different cadences, they are separate entries,
 *   because one row can only repeat one way.
 * - Fees are left out. They change more often than the rules and are what
 *   an owner checks on the source page anyway. Late penalties stay where the
 *   source states them, because they are why the date matters.
 */

export type CatalogueTemplate = {
  /** Two-letter state or DC code, or '' for country-wide. */
  region: string;
  /** A value from INDUSTRIES in src/jurisdictions.ts. */
  industry: string;
  category: string;
  title: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  recurrence?: Recurrence;
};

const report = (
  region: string,
  title: string,
  description: string,
  sourceName: string,
  sourceUrl: string,
  recurrence: Recurrence = 'annual',
): CatalogueTemplate => ({
  region,
  industry: 'General',
  category: 'Registration',
  title,
  description,
  sourceName,
  sourceUrl,
  recurrence,
});

/**
 * The periodic state report for corporations and LLCs.
 *
 * Ohio is absent because it requires none. New Mexico is absent because an
 * official page confirming its current rule could not be reached; see the
 * review notes.
 */
export const US_STATE_REPORTS: readonly CatalogueTemplate[] = [
  report(
    'AL',
    'Alabama Business Privilege Tax return and annual report',
    'Every corporation and LLC organized, registered or doing business in Alabama files a Business Privilege Tax return and annual report with the Department of Revenue, due on the same date as its federal income tax return — Form PPT for LLCs and S corporations, Form CPT for C corporations. It stays due every year until the entity is formally dissolved or withdrawn, active or not. Since 2024 a corporation files its Secretary of State annual report separately.',
    'Alabama Department of Revenue — Business Privilege Tax',
    'https://www.revenue.alabama.gov/faqs/what-taxpayers-must-file-an-alabama-business-privilege-tax-return/',
  ),
  report(
    'AK',
    'Alaska biennial report',
    'Alaska corporations and LLCs file a biennial report every two years, due January 2. An entity formed in an even-numbered year files in even years; one formed in an odd-numbered year, in odd years. Filing opens three months before the due date, and reports filed after February 1 incur a late fee.',
    'Alaska Division of Corporations — Biennial Reports',
    'https://www.commerce.alaska.gov/web/cbpl/corporations/biennialreports.aspx',
    'biennial',
  ),
  report(
    'AZ',
    'Arizona corporation annual report',
    'Arizona corporations file an annual report with the Arizona Corporation Commission each year by their designated due date. Arizona LLCs are not required to file an annual report.',
    'Arizona Corporation Commission — Business Services FAQs',
    'https://azcc.gov/faqs/BusinessServicesFAQs',
  ),
  report(
    'AR',
    'Arkansas annual franchise tax report',
    'Corporations and LLCs registered in Arkansas file an annual franchise tax report and pay the tax to the Secretary of State by May 1. Late reports or payments incur penalties and interest.',
    'Arkansas Secretary of State — Franchise Tax / Annual Report',
    'https://www.sos.arkansas.gov/business-commercial-services-bcs/franchise-tax-report-forms/',
  ),
  report(
    'CA',
    'California Statement of Information (LLCs)',
    'California LLCs file a Statement of Information within 90 days of registering, then every two years in the calendar month of their original registration. File an updated statement sooner if the information changes.',
    'California Secretary of State — Statements of Information',
    'https://www.sos.ca.gov/business-programs/business-entities/statements',
    'biennial',
  ),
  report(
    'CA',
    'California Statement of Information (corporations)',
    'California stock corporations and registered foreign corporations file a Statement of Information within 90 days of registering, then every year before the end of the calendar month of their original registration.',
    'California Secretary of State — Statements of Information',
    'https://www.sos.ca.gov/business-programs/business-entities/statements',
  ),
  report(
    'CO',
    'Colorado periodic report',
    "Colorado corporations and LLCs file a periodic report every year. It is due by the last day of the second month after the entity's periodic report month, shown on its record with the Secretary of State — a January month means a March 31 deadline. A late report makes the entity noncompliant and adds a late fee.",
    'Colorado Secretary of State — Periodic reports FAQ',
    'https://www.sos.state.co.us/pubs/business/FAQs/reports.html',
  ),
  report(
    'CT',
    'Connecticut annual report',
    'Connecticut LLCs file an annual report between January 1 and March 31 each year. Corporations and other business entities file on the anniversary of their formation or registration. All annual reports are filed online.',
    'Business.CT.gov — Annual Report Due Date',
    'https://business.ct.gov/knowledge-base/articles/annual-report/annual-report-due-date',
  ),
  report(
    'DE',
    'Delaware annual franchise tax',
    'Delaware corporations file an annual report and pay franchise tax by March 1. Delaware LLCs file no report but pay a flat annual tax by June 1; missing it adds a $200 penalty plus monthly interest. This applies to entities formed in Delaware, wherever they operate.',
    'Delaware Division of Corporations — Annual Report and Tax Instructions',
    'https://corp.delaware.gov/paytaxes/',
  ),
  report(
    'DC',
    'District of Columbia biennial report',
    'Corporations and LLCs registered in DC file a biennial report — the first by April 1 of the year after registering, then by April 1 every two years. Reports filed after April 1 incur a late fee, and not receiving a reminder does not excuse a late filing.',
    'DC Department of Licensing and Consumer Protection — Business Registration FAQs',
    'https://dlcp.dc.gov/page/corporations-division-business-registration-faqs',
    'biennial',
  ),
  report(
    'FL',
    'Florida annual report',
    'Florida corporations and LLCs file an annual report between January 1 and May 1 each year. Profit corporations and LLCs that file after May 1 pay a $400 late fee.',
    'Florida Division of Corporations — File Annual Report',
    'https://dos.fl.gov/sunbiz/manage-business/efile/annual-report/',
  ),
  report(
    'GA',
    'Georgia annual registration',
    'Georgia corporations and LLCs file an annual registration between January 1 and April 1, starting the year after formation. Registrations can be filed up to three years in advance. An LLC that does not file can be administratively dissolved.',
    'Georgia Secretary of State — How to File Annual Registration',
    'https://sos.ga.gov/how-to-guide/how-file-annual-registration',
  ),
  report(
    'HI',
    'Hawaii annual business report',
    'Hawaii corporations and LLCs file an annual business report each year during the calendar quarter in which they registered, by the last day of that quarter. Late reports incur a penalty for each year delinquent.',
    'Hawaii Business Registration Division — Annual Business Filings',
    'https://hbe.ehawaii.gov/annuals/',
  ),
  report(
    'ID',
    'Idaho annual report',
    'Idaho corporations and LLCs file an annual report every year by the last day of the month in which they were formed or registered, starting the year after formation.',
    'Idaho Code § 30-21-213 — Annual report for Secretary of State',
    'https://legislature.idaho.gov/statutesrules/idstat/title30/t30ch21/sect30-21-213/',
  ),
  report(
    'IL',
    'Illinois annual report',
    'Illinois LLCs file an annual report before the first day of their anniversary month — the month they were organized. After 60 days late an LLC pays a $100 penalty, and one that stays delinquent is administratively dissolved. Corporations also file an annual report tied to their anniversary month, and may elect an extended filing month; the pre-filled report the Secretary of State sends shows the date.',
    'Illinois Secretary of State — File an Annual Report',
    'https://www.ilsos.gov/departments/business-services/annual-reports.html',
  ),
  report(
    'IN',
    'Indiana business entity report',
    'Indiana corporations and LLCs file a business entity report every two years, by the end of the month in which they were formed. An entity formed in an even year files in even years; one formed in an odd year, in odd years. It is due even if the business is not operating.',
    'Indiana INBiz — Business Entity Reports',
    'https://inbiz.in.gov/business-filings/business-entityreport',
    'biennial',
  ),
  report(
    'IA',
    'Iowa biennial report',
    'Iowa LLCs file a biennial report in odd-numbered years, and for-profit corporations in even-numbered years, between January 1 and April 1. An entity that still has not filed by August is dissolved, or has its authority revoked if it is foreign.',
    'Iowa Secretary of State — How do I file a Biennial Report?',
    'https://help.sos.iowa.gov/how-do-i-file-biennial-report',
    'biennial',
  ),
  report(
    'KS',
    'Kansas information report',
    'Since 2024, Kansas corporations and LLCs file an information report every two years instead of every year. A business formed in an even year files in even years; one formed in an odd year, in odd years. The month and day it is due did not change: the fifteenth day of the fourth month after the tax year ends — April 15 for a calendar year.',
    'Kansas Secretary of State — Information Reports',
    'https://www.sos.ks.gov/businesses/information-reports.html',
    'biennial',
  ),
  report(
    'KY',
    'Kentucky annual report',
    'Kentucky corporations and LLCs file an annual report between January 1 and June 30 each year. A Kentucky entity that misses June 30 is administratively dissolved until it reinstates.',
    'Kentucky Secretary of State — Annual Reports',
    'https://www.sos.ky.gov/bus/business-filings/Pages/Annual-Reports.aspx',
  ),
  report(
    'LA',
    'Louisiana annual report',
    'Louisiana corporations and LLCs file an annual report each year by the anniversary of their formation. The Secretary of State sends a renewal notice beforehand, and the report can only be filed close to that renewal date.',
    'Louisiana Secretary of State — Annual Report Filing Instructions',
    'https://www.sos.la.gov/BusinessServices/HTMLPages/AnnualReportFilingInstructions.htm',
  ),
  report(
    'ME',
    'Maine annual report',
    'Maine corporations and LLCs file an annual report between January 1 and June 1 each year, starting the year after formation. A late report incurs a penalty, and not paying it leads to administrative dissolution.',
    'Maine Secretary of State — Filing an Annual Report',
    'https://www.maine.gov/sos/corporations-commissions/filing-an-annual-report',
  ),
  report(
    'MD',
    'Maryland annual report',
    'Every corporation and LLC formed, qualified or registered in Maryland files an Annual Report (Form 1) with the Department of Assessments and Taxation by April 15, starting the year after formation. A business that owns or uses personal property in Maryland also files its personal property return on the same form. Not filing can forfeit the charter or the right to do business in Maryland.',
    'Maryland Business Express — Maintain Good Standing Status',
    'https://businessexpress.maryland.gov/manage/maintain-good-standing-status',
  ),
  report(
    'MA',
    'Massachusetts annual report',
    'Massachusetts LLCs file an annual report on or before the anniversary of their formation filing. Corporations file within two and a half months of their fiscal year end — around March 15 for a calendar year.',
    'Mass.gov — Reminders Regarding your Annual Report',
    'https://www.mass.gov/info-details/dcms-tip-sheet-volume-5-edition-13-reminders-regarding-your-annual-report',
  ),
  report(
    'MI',
    'Michigan annual statement or report',
    'Michigan LLCs file an annual statement by February 15 each year; an LLC formed after September 30 skips the February immediately following. Corporations file an annual report by May 15. An LLC statement received after February 15 incurs a penalty.',
    'Michigan LARA — Annual Reports and Annual Statements',
    'https://www.michigan.gov/lara/bureau-list/cscl/corps/michigan-business-roadmap/annual-reports-and-annual-statements',
  ),
  report(
    'MN',
    'Minnesota annual renewal',
    'Minnesota corporations and LLCs file an annual renewal with the Secretary of State by December 31 each year, starting the year after formation. There is no fee for an entity in good standing, but one that does not renew is dissolved by statute.',
    'Minnesota Secretary of State — Renewing your Business',
    'https://www.sos.mn.gov/business-liens/renewals',
  ),
  report(
    'MS',
    'Mississippi annual report',
    'Mississippi corporations and LLCs file an annual report online between January 1 and April 15 each year. A corporation that does not file is administratively dissolved.',
    'Mississippi Secretary of State — Annual Reports',
    'https://www.sos.ms.gov/business-services/annual-reports',
  ),
  report(
    'MO',
    'Missouri annual registration report (corporations)',
    'Missouri corporations file an annual registration report each year, due by the end of the month in which they incorporated or qualified. A corporation that existed before July 1, 2003 uses the month shown on its last report.',
    'Missouri Secretary of State — Filings Required of General Business Corporations',
    'https://www.sos.mo.gov/business/corporations/filings',
  ),
  report(
    'MT',
    'Montana annual report',
    'Montana corporations and LLCs file an annual report between January 1 and April 15 each year. It renews the registration record rather than reporting earnings, and filing after April 15 costs more.',
    'Montana Secretary of State — How do I file my annual report?',
    'https://help.sosmt.gov/en/articles/13265408-how-do-i-file-my-annual-report',
  ),
  report(
    'NE',
    'Nebraska biennial report',
    'Nebraska corporations file a biennial occupation tax report by March 1 of even-numbered years; LLCs file a biennial report by April 1 of odd-numbered years. Reports become delinquent after April 15 for corporations and June 16 for LLCs.',
    'Nebraska Secretary of State — Annual/Biennial Reporting',
    'https://sos.nebraska.gov/business-services/annualbiennial-reporting',
    'biennial',
  ),
  report(
    'NV',
    'Nevada annual list and state business license',
    'Nevada corporations and LLCs file an annual list of officers or managers and renew their state business license together, by the last day of the month in which they were formed. Filing late adds a penalty.',
    'Nevada Secretary of State — State Business License FAQ',
    'https://www.nvsos.gov/licensing/state-business-license/state-business-license-faq',
  ),
  report(
    'NH',
    'New Hampshire annual report',
    'New Hampshire corporations and LLCs file an annual report by April 1 each year. Reports and fees received after April 1 incur a late fee.',
    'New Hampshire Secretary of State — File an Annual Report',
    'https://www.sos.nh.gov/corporations-0/file-annual-report',
  ),
  report(
    'NJ',
    'New Jersey annual report',
    'New Jersey corporations and LLCs file an annual report every year by the last day of the month in which they were formed. The business is responsible even if no notice arrives, and not filing can lead to revocation.',
    'Business.NJ.gov — Taxes and Annual Report',
    'https://business.nj.gov/pages/filings-and-accounting',
  ),
  report(
    'NY',
    'New York biennial statement',
    'New York corporations and LLCs file a biennial statement every two years, during the calendar month in which they were originally formed or authorized. It cannot be filed before that month.',
    'New York Department of State — Biennial Statements',
    'https://dos.ny.gov/biennial-statements-business-corporations-and-limited-liability-companies',
    'biennial',
  ),
  report(
    'NC',
    'North Carolina annual report',
    'North Carolina LLCs file an annual report by April 15 each year, starting the year after formation. Corporations file by the fifteenth day of the fourth month after their fiscal year ends — April 15 for a calendar year. A business that does not file can be administratively dissolved.',
    'North Carolina Secretary of State — Annual Report Due Dates',
    'https://www.sosnc.gov/divisions/business_registration/annual_report_due_dates',
  ),
  report(
    'ND',
    'North Dakota annual report',
    'North Dakota LLCs file an annual report by November 15 each year, and business corporations by August 1. A business that does not file loses good standing and can be involuntarily terminated if the report stays overdue for 6 to 12 months.',
    'North Dakota Secretary of State — LLC Annual Report',
    'https://sos.nd.gov/business/business-services/business-structures/limited-liability-companies/limited-liability-company-llc/llc-annual-report',
  ),
  report(
    'OK',
    'Oklahoma LLC annual certificate',
    'Oklahoma LLCs file an annual certificate each year on the anniversary of their formation, confirming the business is active and its principal address. (Oklahoma corporation franchise tax returns ended after tax year 2023.)',
    'Oklahoma Secretary of State — Business Services',
    'https://www.sos.ok.gov/corp/',
  ),
  report(
    'OR',
    'Oregon annual report',
    'Oregon corporations and LLCs renew with an annual report each year, due on the anniversary of their original filing. The Secretary of State sends a renewal notice about 45 days before.',
    'Oregon Secretary of State — Annual Report or Renewal',
    'https://sos.oregon.gov/business/Pages/obr-annual-report-renewal.aspx',
  ),
  report(
    'PA',
    'Pennsylvania annual report',
    'Since 2025 Pennsylvania requires an annual report from corporations and LLCs. Corporations file by June 30; LLCs file between January 1 and September 30. From reports due in 2027, an entity that does not file is dissolved or terminated six months after the due date.',
    'Pennsylvania Department of State — Annual Reports',
    'https://www.pa.gov/agencies/dos/programs/business/types-of-filings-and-registrations/annual-reports',
  ),
  report(
    'RI',
    'Rhode Island annual report',
    'Rhode Island corporations and LLCs file an annual report between February 1 and May 1 each year, starting the year after registration. Filing late adds a fee.',
    'Rhode Island Department of State — File Your Annual Business Report',
    'https://www.sos.ri.gov/divisions/business-services/ri-business/file-your-annual-report',
  ),
  report(
    'SC',
    'South Carolina corporation annual report',
    'South Carolina corporations file an annual report (Schedule D) with the Department of Revenue alongside the corporate income tax return, by the same due date — April 15 for a calendar year. An LLC taxed as a corporation files it too; an LLC taxed as a partnership or disregarded entity does not.',
    'South Carolina Department of Revenue — Corporate FAQs',
    'https://dor.sc.gov/business-income-taxes/corporate/corporate-faqs',
  ),
  report(
    'SD',
    'South Dakota annual report',
    'South Dakota corporations and LLCs file an annual report by the first day of their anniversary month each year — a company formed on June 11 files by June 1. Late fees start two months after the due date.',
    'South Dakota Secretary of State — Business FAQs',
    'https://sdsos.gov/Division%20of%20Business%20Services/FAQs/default.aspx',
  ),
  report(
    'TN',
    'Tennessee annual report',
    'Tennessee corporations and LLCs file an annual report by the first day of the fourth month after their fiscal year ends — April 1 for a calendar year.',
    'Tennessee Secretary of State — Frequently Asked Questions for Businesses',
    'https://sos.tn.gov/businesses/faqs',
  ),
  report(
    'TX',
    'Texas franchise tax and Public Information Report',
    'Texas corporations and LLCs file an annual franchise tax report with the Comptroller by May 15, together with a Public Information Report or Ownership Information Report. Even an entity that owes no tax must file the information report, or it can forfeit its right to do business in Texas.',
    'Texas Comptroller — Franchise Tax',
    'https://comptroller.texas.gov/taxes/franchise/',
  ),
  report(
    'UT',
    'Utah annual renewal',
    'Utah corporations and LLCs renew with the Division of Corporations every year by the anniversary of their registration. The renewal window opens 60 days before, when a notice goes to the registered agent.',
    'Utah Division of Corporations — Renewal Process',
    'https://commerce.utah.gov/corporations/renewal-process/',
  ),
  report(
    'VT',
    'Vermont annual report',
    'Vermont LLCs file an annual report within three months after the end of the fiscal year on record, and corporations within two and a half months.',
    'Vermont Secretary of State — Annual/Biennial Reports',
    'https://sos.vermont.gov/business-services/business-filings/annualbiennial-reports',
  ),
  report(
    'VA',
    'Virginia annual registration fee',
    'Virginia corporations and LLCs pay an annual registration fee to the State Corporation Commission by the last day of the month in which they were formed; the SCC sends the assessment two months before. An LLC that has not paid by the end of the third month after the due date is automatically cancelled.',
    'Virginia SCC — Annual Registration Fees',
    'https://www.scc.virginia.gov/businesses/business-faqs/annual-registration-fees/',
  ),
  report(
    'WA',
    'Washington annual report',
    'Washington corporations and LLCs file an annual report by the last day of their anniversary month each year. A business that misses it goes delinquent and can be administratively dissolved.',
    'Washington Secretary of State — Annual Reports',
    'https://www.sos.wa.gov/corporations-charities/business-entities/maintain-business-compliance/annual-reports',
  ),
  report(
    'WV',
    'West Virginia annual report',
    'West Virginia corporations and LLCs file an annual report between January 1 and June 30 each year, starting the year after registration. Filing after the July 1 deadline adds a late fee.',
    'West Virginia Secretary of State — Annual Reports',
    'https://sos.wv.gov/business/updates-and-changes/annual-reports',
  ),
  report(
    'WI',
    'Wisconsin annual report',
    'Wisconsin corporations and LLCs file an annual report each year, during the calendar quarter that contains the anniversary of their formation, starting the year after formation.',
    'Wisconsin Department of Financial Institutions — Annual Report Instructions',
    'https://dfi.wi.gov/Documents/BusinessServices/BusinessEntities/Forms/CORP5i.pdf',
  ),
  report(
    'WY',
    'Wyoming annual report and license tax',
    'Wyoming corporations and LLCs file an annual report and pay license tax by the first day of their anniversary month — a company formed on May 15 files by May 1. An entity that has not paid within 60 days of the due date is subject to dissolution.',
    'Wyoming Secretary of State — Annual Report',
    'https://wyobiz.wyo.gov/Business/AnnualReport.aspx',
  ),
];

/**
 * Federal obligations that apply to a whole trade, wherever it operates.
 *
 * Only trades with a genuinely federal, dated obligation are here. Food
 * service, childcare, beauty, fitness, professional services and retail are
 * regulated almost entirely by states and localities, and the federal rule
 * people reach for first often does not apply — FDA food facility
 * registration, for one, exempts restaurants. Better an industry with no
 * entry than one with a wrong one.
 */
export const US_FEDERAL_INDUSTRY: readonly CatalogueTemplate[] = [
  {
    region: '',
    industry: 'Transport',
    category: 'Registration',
    title: 'USDOT biennial update (Form MCS-150)',
    description:
      'Every entity with a USDOT number updates its registration with FMCSA every two years, even if nothing has changed. The last digit of the USDOT number sets the month; an odd next-to-last digit means odd-numbered years, an even one even years. Missing it deactivates the USDOT number and can bring civil penalties.',
    sourceName: 'FMCSA — When am I required to file a biennial update?',
    sourceUrl: 'https://www.fmcsa.dot.gov/faq/when-am-i-required-file-biennial-update',
    recurrence: 'biennial',
  },
  {
    region: '',
    industry: 'Transport',
    category: 'Registration',
    title: 'Unified Carrier Registration (UCR)',
    description:
      'Motor carriers, brokers, freight forwarders and leasing companies operating in interstate commerce register and pay UCR fees for each registration year, which runs with the calendar year. Registration for a year opens in the autumn before it, so register before operating in that year.',
    sourceName: 'FMCSA — Unified Carrier Registration',
    sourceUrl: 'https://www.fmcsa.dot.gov/ucr',
    recurrence: 'annual',
  },
  {
    region: '',
    industry: 'Transport',
    category: 'Tax',
    title: 'Heavy Highway Vehicle Use Tax (Form 2290)',
    description:
      'If you operate a highway vehicle with a taxable gross weight of 55,000 pounds or more, file Form 2290 and pay the tax each year. For vehicles in use in July the return is due August 31; a vehicle first used later in the year is due by the last day of the month after its first use.',
    sourceName: 'IRS — When Form 2290 taxes are due',
    sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/when-form-2290-taxes-are-due',
    recurrence: 'annual',
  },
  {
    region: '',
    industry: 'Transport',
    category: 'Tax',
    title: 'IFTA quarterly fuel tax return',
    description:
      'If you run a qualified motor vehicle — two axles over 26,000 pounds, three or more axles, or a combination over 26,000 pounds — in two or more jurisdictions, you hold an IFTA license and file a quarterly fuel tax return with your base jurisdiction. It sends the return and rates each quarter and sets when they are due.',
    sourceName: 'IFTA, Inc. — Carrier Information',
    sourceUrl: 'https://www.iftach.org/Carriers/',
    recurrence: 'quarterly',
  },
  {
    region: '',
    industry: 'Construction',
    category: 'Licenses',
    title: 'EPA Lead-Safe firm certification (RRP)',
    description:
      'Firms, including sole proprietors, doing renovation, repair or painting in housing or child-occupied facilities built before 1978 must be EPA Lead-Safe certified. Certification lasts five years; apply to recertify at least 90 days before it expires to keep working without a gap.',
    sourceName: 'US EPA — RRP Program: Firm Certification',
    sourceUrl: 'https://www.epa.gov/lead/renovation-repair-and-painting-program-firm-certification',
    recurrence: 'quinquennial',
  },
  {
    region: '',
    industry: 'Healthcare',
    category: 'Licenses',
    title: 'DEA controlled substance registration',
    description:
      'Practitioners who prescribe, administer or dispense controlled substances hold a DEA registration, renewed every three years online, no more than 60 days before it expires. Handling controlled substances under an expired registration is prohibited.',
    sourceName: 'DEA Diversion Control Division — Registration',
    sourceUrl: 'https://www.deadiversion.usdoj.gov/drugreg/registration.html',
    recurrence: 'triennial',
  },
  {
    region: '',
    industry: 'Healthcare',
    category: 'Licenses',
    title: 'CLIA certificate',
    description:
      'A practice that tests human specimens — including only FDA-waived tests — needs a CLIA certificate. Every certificate type is effective for two years, and its fees are paid every two years to keep it.',
    sourceName: 'CMS — Apply for a CLIA Certificate',
    sourceUrl: 'https://www.cms.gov/medicare/quality/clinical-laboratory-improvement-amendments/apply',
    recurrence: 'biennial',
  },
];

/**
 * Picks the templates for the scopes someone actually reviewed.
 *
 * The list is required and names every scope explicitly, because seeding is
 * an attestation: one command should not be able to vouch for fifty states
 * nobody read. A name with no draft entries is an error rather than a silent
 * no-op, so a typo cannot pass for a completed review.
 */
export function selectReviewed(
  templates: readonly CatalogueTemplate[],
  key: 'region' | 'industry',
  reviewed: string[],
): CatalogueTemplate[] {
  if (reviewed.length === 0) {
    throw new Error(`Name the ${key === 'region' ? 'regions' : 'industries'} you reviewed.`);
  }
  const available = new Set(templates.map(template => template[key]));
  const unknown = reviewed.filter(name => !available.has(name));
  if (unknown.length > 0) {
    throw new Error(`No draft entries for: ${unknown.join(', ')}.`);
  }
  const wanted = new Set(reviewed);
  return templates.filter(template => wanted.has(template[key]));
}
