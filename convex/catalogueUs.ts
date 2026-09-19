import type { Recurrence } from './dates';

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
    'Alabama Business Privilege Tax return',
    "Corporations and limited liability entities file an annual Business Privilege Tax return with the Department of Revenue. A C-corporation's is due three and a half months into its tax year (April 15 for a calendar year; two and a half months for a June 30 year end); a limited liability entity's, two and a half months in (March 15 for a calendar year). From tax years beginning in 2024, a taxpayer owing $100 or less is exempt and files nothing. Alabama no longer requires a separate Secretary of State annual report.",
    'Alabama Department of Revenue — When is the Business Privilege Tax return due?',
    'https://www.revenue.alabama.gov/faqs/when-is-the-alabama-business-privilege-tax-return-due/',
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
    'Arizona corporations file an annual report with the Arizona Corporation Commission each year by their assigned due date, and can file up to 90 days before it. A for-profit corporation that files late pays a monthly penalty, and one that stays delinquent is administratively dissolved. Arizona LLCs are not required to file an annual report.',
    'Arizona Corporation Commission — Business Services FAQs',
    'https://azcc.gov/faqs/BusinessServicesFAQs',
  ),
  report(
    'AR',
    'Arkansas annual franchise tax report',
    'Corporations and LLCs registered in Arkansas file an annual franchise tax report and pay the tax to the Secretary of State by May 1. Late reports or payments incur penalties and interest, and the tax keeps accruing until the entity is dissolved or withdrawn.',
    'Arkansas Secretary of State — Franchise Tax / Annual Report',
    'https://www.sos.arkansas.gov/business-commercial-services-bcs/franchise-tax-report-forms/',
  ),
  report(
    'CA',
    'California Statement of Information (LLCs)',
    'California LLCs file a Statement of Information within 90 days of registering, then every two years, in even or odd years matching the year of registration. Each filing is due by the end of the calendar month of original registration, within a six-month window ending that month. File an updated statement sooner if the information changes. After a delinquency notice and 60 more days, the Franchise Tax Board assesses a penalty, and the LLC can be suspended or forfeited.',
    'California Secretary of State — Business Entities FAQs',
    'https://www.sos.ca.gov/business-programs/business-entities/faqs',
    'biennial',
  ),
  report(
    'CA',
    'California Statement of Information (corporations)',
    'California stock corporations and registered foreign corporations file a Statement of Information within 90 days of registering, then every year by the end of the calendar month of original registration, within a six-month window ending that month. File an updated statement sooner if the information changes. After a delinquency notice and 60 more days, the Franchise Tax Board assesses a penalty, and the corporation can be suspended or forfeited.',
    'California Secretary of State — Business Entities FAQs',
    'https://www.sos.ca.gov/business-programs/business-entities/faqs',
  ),
  report(
    'CO',
    'Colorado periodic report',
    "Colorado corporations and LLCs file a periodic report every year. Each entity's periodic report month is shown on its record with the Secretary of State. Filing opens two months before that month, and the report is due by the last day of the second month after it — a January month means a March 31 deadline. A report not filed by then makes the entity delinquent.",
    'Colorado Secretary of State — Periodic reports FAQ',
    'https://www.sos.state.co.us/pubs/business/FAQs/reports.html',
  ),
  report(
    'CT',
    'Connecticut annual report',
    'Connecticut LLCs file an annual report between January 1 and March 31 each year. Corporations file by the last day of the anniversary month of their formation or registration, and can file up to one month early. There is no late fee, but an entity behind on its reports cannot get a certificate of legal existence, and one more than a year in default can be administratively dissolved.',
    'Connecticut Secretary of the State — Annual Report Frequently Asked Questions',
    'https://portal.ct.gov/-/media/SOTS/Business-Services/BSD-Forms/llc-2017/ANNUAL-REPORT-FREQUENTLY-ASKED-QUESTIONS.pdf',
  ),
  report(
    'DE',
    'Delaware annual franchise tax',
    'Delaware corporations file an annual report and pay franchise tax by March 1; missing it adds a $200 penalty plus 1.5% interest a month. LLCs formed or registered in Delaware file no report but pay a flat annual tax by June 1, with the same $200 penalty and 1.5% monthly interest if late. Foreign corporations registered in Delaware file an annual report by June 30 instead.',
    'Delaware Division of Corporations — Annual Report and Tax Instructions',
    'https://corp.delaware.gov/paytaxes/',
  ),
  report(
    'DC',
    'District of Columbia biennial report',
    'Corporations and LLCs registered in DC file a biennial report — the first by April 1 of the year after registering, then by April 1 every two years. Reports filed after April 1 incur a late fee.',
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
    'Georgia corporations and LLCs file an annual registration between January 1 and April 1 each year. Registrations can be filed up to three years in advance. A late registration adds a $25 penalty, and an entity that does not file can be administratively dissolved, or have its authority revoked if it is foreign.',
    'Georgia Secretary of State — How to File Annual Registration',
    'https://sos.ga.gov/how-to-guide/how-file-annual-registration',
  ),
  report(
    'HI',
    'Hawaii annual business report',
    'Hawaii corporations and LLCs file an annual business report each year during the calendar quarter set by their registration date, by the last day of that quarter. Late reports incur a $10 fee for each year delinquent.',
    'Hawaii DCCA Business Registration Division — Third Quarter Annual Business Reports Due',
    'https://cca.hawaii.gov/breg/third-quarter-hawaii-annual-business-reports-due-2026/',
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
    'Iowa Secretary of State — What happens if my business misses the deadline to file a Biennial Report?',
    'https://help.sos.iowa.gov/what-happens-if-my-business-misses-deadline-file-biennial-report',
    'biennial',
  ),
  report(
    'KS',
    'Kansas information report',
    'Kansas registered businesses file an information report every two years. Businesses formed in even-numbered years report in even years; those formed in odd-numbered years report in odd years. For-profit business reports are due April 15 and not-for-profit reports June 15. An entity that remains delinquent for three months after its due date may forfeit its registration.',
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
    'Louisiana corporations and LLCs file an annual report each year on or before the anniversary of their incorporation or organization. The report can be filed up to four weeks before the due date. After a notice of intent to revoke, an entity has 30 days (60 if foreign) to file before its charter is revoked.',
    'Louisiana Secretary of State — Business Filings Frequently Asked Questions',
    'https://www.sos.la.gov/business-services/frequently-asked-questions',
  ),
  report(
    'ME',
    'Maine annual report',
    'Maine corporations and LLCs file an annual report between January 1 and June 1 each year, starting the year after formation. A late report incurs a penalty, and not paying it leads to administrative dissolution or revocation.',
    'Maine Secretary of State — Filing Requirement Reminders',
    'https://www.maine.gov/sos/corporations-commissions/incorporating-resources/corporations-commissions/filing-requirement-reminders',
  ),
  report(
    'MD',
    'Maryland annual report',
    'Every corporation and LLC formed, qualified or registered in Maryland files an Annual Report with the Department of Assessments and Taxation by April 15, starting the year after formation. Depending on the business, it may also need to file a Personal Property Tax Return. Late filings incur penalties, and a business that loses good standing and does not fix it is forfeited and cannot legally operate in Maryland.',
    'Maryland Business Express — Maintain Good Standing Status',
    'https://businessexpress.maryland.gov/manage/maintain-good-standing-status',
  ),
  report(
    'MA',
    'Massachusetts annual report',
    'Massachusetts LLCs file an annual report on or before the anniversary of their formation filing; a foreign LLC, on or before the anniversary of its registration. Corporations file within two and a half months of their fiscal year end — around March 15 for a calendar year.',
    'Mass.gov — Reminders Regarding your Annual Report',
    'https://www.mass.gov/info-details/dcms-tip-sheet-volume-5-edition-13-reminders-regarding-your-annual-report',
  ),
  report(
    'MI',
    'Michigan annual statement or report',
    'Michigan LLCs file an annual statement by February 15 each year; an LLC formed after September 30 skips the February immediately following. Corporations file an annual report by May 15, and one filed late pays a penalty that rises each month. An entity that does not file is dissolved or revoked, or loses good standing, after a two-year grace period (one year for foreign corporations).',
    'Michigan LARA — Annual Reports and Annual Statements',
    'https://www.michigan.gov/lara/bureau-list/cscl/corps/michigan-business-roadmap/annual-reports-and-annual-statements',
  ),
  report(
    'MN',
    'Minnesota annual renewal',
    'Minnesota corporations and LLCs file an annual renewal with the Secretary of State by December 31 each year, and can file any time during the calendar year. One that does not renew is administratively dissolved.',
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
    'Missouri corporations file an annual registration report each year, due by the end of the month in which they incorporated or qualified. A corporation that existed before July 1, 2003 uses the month shown on its last report. A late report adds a fee for each 30 days it is late, and not filing leads to administrative dissolution of a domestic corporation or revocation of a foreign corporation’s certificate of authority.',
    'Missouri Secretary of State — Filings Required of General Business Corporations',
    'https://www.sos.mo.gov/business/corporations/filings',
  ),
  report(
    'MT',
    'Montana annual report',
    'Montana corporations and LLCs file an annual report each year. It renews the registration record rather than reporting earnings. The filing fee is waived for reports filed between January 1 and April 15; a report filed after April 15 incurs a late fee. The final deadline is November 1 for foreign entities and December 1 for domestic entities.',
    'Montana Secretary of State — How do I file my annual report?',
    'https://help.sosmt.gov/en-us/article/how-do-i-file-my-annual-report-ywawrv/',
  ),
  report(
    'NE',
    'Nebraska biennial report',
    'Nebraska corporations file a biennial occupation tax report by March 1 of even-numbered years; LLCs file a biennial report by April 1 of odd-numbered years. Reports become delinquent after April 15 for corporations and June 16 for LLCs, and a report not filed by the delinquency date leads to administrative dissolution or revocation.',
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
    'New Hampshire corporations and LLCs file an annual report by April 1 each year, starting the year after registration. A report filed after April 1 incurs a late fee, which cannot be waived, and the business falls out of good standing. A domestic business that fails to file for two consecutive years is administratively dissolved; a foreign one that misses the current year is administratively suspended.',
    'New Hampshire Secretary of State — Business FAQs',
    'https://www.sos.nh.gov/corporations-0/business-faqs',
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
    'North Dakota annual reports are first due the year after registration. Domestic corporations generally report by August 1, foreign corporations by May 15, and LLCs by November 15; farm, ranch and livestock entities by April 15. Confirm the deadline the Secretary of State shows for your entity. A business that does not file loses good standing, and one still not filed within 6 to 12 months is typically terminated or, if foreign, has its authority revoked.',
    'North Dakota Secretary of State — Maintain Registration',
    'https://www.sos.nd.gov/business/business-services/maintain-registration',
  ),
  report(
    'OK',
    'Oklahoma LLC annual certificate',
    'Oklahoma LLCs, domestic and foreign, file an annual certificate each year on the anniversary of their registration, confirming the business is active and giving its principal place of business. An LLC that has not filed within 60 days after the due date ceases to be in good standing. (Oklahoma corporation franchise tax returns ended after tax year 2023.)',
    'Oklahoma Secretary of State — LLC Annual Certificate',
    'https://www.sos.ok.gov/forms/Llcannualcertificate.PDF',
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
    "South Carolina's corporate annual report is Schedule D of the applicable corporate income tax return. Filing obligations and due dates depend on the entity's tax classification and fiscal year; dormant corporations can still have filing obligations. LLCs not taxed as corporations and other specifically exempt entities are excluded. Check the Department of Revenue guidance for the applicable corporate return and license-fee requirements.",
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
    'Tennessee corporations and LLCs file an annual report by the first day of the fourth month after their fiscal year ends — April 1 for a calendar year. A business that does not file can be administratively dissolved.',
    'Tennessee Secretary of State — Frequently Asked Questions for Businesses',
    'https://sos.tn.gov/businesses/faqs',
  ),
  report(
    'TX',
    'Texas franchise tax and Public Information Report',
    'Texas franchise tax reports are generally due May 15, or the next business day. From report year 2024, entities at or below the no-tax-due threshold no longer file a No Tax Due Report but generally still file a Public Information or Ownership Information Report. Confirm your threshold, entity classification and forms with the Comptroller. Each late report incurs a penalty even when no tax is due, and continued non-filing leads to forfeiture of the right to do business in Texas.',
    'Texas Comptroller — Franchise Tax',
    'https://comptroller.texas.gov/taxes/franchise/',
  ),
  report(
    'UT',
    'Utah annual renewal',
    'From October 1, 2026, Utah corporations, LLCs and registered foreign entities file an annual report with the Division of Corporations by the last day of their anniversary month — the month they formed or registered — and may file up to 60 days early. The division can administratively dissolve a domestic entity whose report is more than 60 days late. The division may set a different period by rule.',
    'Utah Legislature — S.B. 40 (2026), Utah Code § 16-1a-212 and § 16-1a-602',
    'https://le.utah.gov/Session/2026/bills/enrolled/SB0040.pdf',
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
    'Virginia annual report and registration fee',
    'Virginia corporations file an annual report with the State Corporation Commission and pay the annual registration fee by the last day of their anniversary month; the report can be filed up to three months early. A domestic corporation that has not filed and paid by the end of the fourth month after is automatically terminated. LLCs pay the registration fee by the same date, and a domestic LLC that has not paid by the end of the third month after is automatically cancelled.',
    'Code of Virginia § 13.1-775 — Annual report of corporations',
    'https://law.lis.virginia.gov/vacode/title13.1/chapter9/section13.1-775/',
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
    'West Virginia annual reports are filed between January 1 and June 30, beginning in the year after registration. Failure to file by June 30 may result in penalties, administrative dissolution or revocation. Confirm the report obligation for your registered entity with the Secretary of State.',
    'West Virginia Secretary of State — Annual Reports',
    'https://sos.wv.gov/business/updates-and-changes/annual-reports',
  ),
  report(
    'WI',
    'Wisconsin annual report',
    'Wisconsin domestic corporations and LLCs file an annual report each year, during the calendar quarter that contains the anniversary of their registration, starting the year after registration. Foreign corporations and LLCs file during the first calendar quarter, by March 31, starting the year after they register. An entity that does not file goes delinquent and risks administrative dissolution; a foreign entity that has not filed within four months of March 31 can have its registration revoked.',
    'Wisconsin Department of Financial Institutions — Business Entity FAQ',
    'https://dfi.wi.gov/Pages/BusinessServices/BusinessEntities/FAQ.aspx',
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
      'Every entity with a USDOT number updates its registration with FMCSA every two years, even if nothing has changed. The last digit of the USDOT number sets the month, and the update is due by the last day of that month; an odd next-to-last digit means odd-numbered years, an even one even years. Missing it deactivates the USDOT number and can bring civil penalties.',
    sourceName: '49 CFR 390.19T — Filing schedule',
    sourceUrl:
      'https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-390/subpart-E/section-390.19T',
    recurrence: 'biennial',
  },
  {
    region: '',
    industry: 'Transport',
    category: 'Registration',
    title: 'Unified Carrier Registration (UCR)',
    description:
      'Motor carriers, brokers, freight forwarders and leasing companies operating in interstate commerce register and pay UCR fees for each registration year, which runs with the calendar year. Registration for a year opens on October 1 of the year before, and states enforce it from January 1 of the registration year; penalties for not registering are set by each state. Carriers that operate only within one state, and private carriers of passengers, do not register.',
    sourceName: 'Unified Carrier Registration Plan',
    sourceUrl: 'https://plan.ucr.gov/',
    recurrence: 'annual',
  },
  {
    region: '',
    industry: 'Transport',
    category: 'Tax',
    title: 'Heavy Highway Vehicle Use Tax (Form 2290)',
    description:
      'If you operate a highway vehicle with a taxable gross weight of 55,000 pounds or more, file Form 2290 and pay the tax for each tax period, which runs from July 1 to June 30. For vehicles in use in July the return is due August 31; a vehicle first used later in the period is due by the last day of the month after its first use. A due date on a Saturday, Sunday or legal holiday moves to the next business day.',
    sourceName: 'IRS — When Form 2290 taxes are due',
    sourceUrl:
      'https://www.irs.gov/businesses/small-businesses-self-employed/when-form-2290-taxes-are-due',
    recurrence: 'annual',
  },
  {
    region: '',
    industry: 'Transport',
    category: 'Tax',
    title: 'IFTA quarterly fuel tax return',
    description:
      'If you run a qualified motor vehicle — two axles over 26,000 pounds, three or more axles, or a combination over 26,000 pounds — in two or more jurisdictions, you hold an IFTA license and file a quarterly fuel tax return with your base jurisdiction. Every member jurisdiction uses the same due dates: April 30, July 31, October 31 and January 31, or the next business day. A return is due even with no miles. A late return can be charged $50 or 10% of the tax due, whichever is greater, plus interest.',
    sourceName: 'IFTA, Inc. — Articles of Agreement (R930, R960, R1220)',
    sourceUrl:
      'https://www.iftach.org/manuals/2026/AA/Articles%20of%20Agreement%20-%2003-11-2026.pdf',
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
    sourceUrl:
      'https://www.epa.gov/lead/renovation-repair-and-painting-program-firm-certification',
    recurrence: 'quinquennial',
  },
  {
    region: '',
    industry: 'Healthcare',
    category: 'Licenses',
    title:
      'DEA controlled substance registration (practitioners, pharmacies, hospitals and clinics)',
    description:
      'Practitioners, pharmacies and hospitals or clinics that handle controlled substances hold a DEA registration, renewed online every three years, no earlier than 60 days before it expires. A renewal filed before expiry lets you keep operating until DEA acts on it. An expired registration can be reinstated only within one calendar month, after which a new application is needed; handling controlled substances while expired is prohibited. Manufacturers and distributors renew yearly and are not covered.',
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
    sourceUrl:
      'https://www.cms.gov/medicare/quality/clinical-laboratory-improvement-amendments/apply',
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
    throw new Error(
      `Name the ${key === 'region' ? 'regions' : 'industries'} you reviewed.`,
    );
  }
  const available = new Set(templates.map(template => template[key]));
  const unknown = reviewed.filter(name => !available.has(name));
  if (unknown.length > 0) {
    throw new Error(`No draft entries for: ${unknown.join(', ')}.`);
  }
  const wanted = new Set(reviewed);
  return templates.filter(template => wanted.has(template[key]));
}
