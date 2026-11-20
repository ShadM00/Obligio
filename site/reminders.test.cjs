const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const r = require('../web/assets/reminders.js');

test('uses the same reminder leads as the app', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'notifications.ts'), 'utf8');
  const m = /REMINDER_LEAD_DAYS[^=]*=\s*\[([^\]]+)\]/.exec(src);
  assert.ok(m, 'REMINDER_LEAD_DAYS not found in src/notifications.ts');
  const app = m[1].split(',').map((x) => +x.trim()).sort((a, b) => b - a);
  assert.deepStrictEqual(r.DEFAULT_LEADS.slice().sort((a, b) => b - a), app);
});

test('reminder dates count calendar days back from the due date', () => {
  const plan = r.reminderPlan('2027-03-15', [30, 14, 7, 1], '2027-01-01');
  assert.strictEqual(plan.dueWeekday, 'Monday');
  assert.strictEqual(plan.daysUntilDue, 73);
  assert.deepStrictEqual(plan.reminders.map((x) => x.date), ['2027-02-13', '2027-03-01', '2027-03-08', '2027-03-14']);
  assert.deepStrictEqual(plan.reminders.map((x) => x.weekend), [true, false, false, true]);
});

test('crosses month, year and leap-day boundaries', () => {
  assert.strictEqual(r.reminderPlan('2028-03-01', [1]).reminders[0].date, '2028-02-29');
  assert.strictEqual(r.reminderPlan('2027-03-01', [1]).reminders[0].date, '2027-02-28');
  assert.strictEqual(r.reminderPlan('2027-01-05', [30]).reminders[0].date, '2026-12-06');
});

test('marks reminders already passed', () => {
  const plan = r.reminderPlan('2027-01-10', [30, 1], '2027-01-01');
  assert.deepStrictEqual(plan.reminders.map((x) => x.passed), [true, false]);
});

test('rejects impossible dates and junk', () => {
  for (const bad of ['', '2027-02-30', '2027-13-01', '15/03/2027', 'abc', null]) assert.strictEqual(r.reminderPlan(bad), null);
});

test('parses lead lists leniently and safely', () => {
  assert.deepStrictEqual(r.parseLeads('7, 30;1 14 14'), [30, 14, 7, 1]);
  assert.deepStrictEqual(r.parseLeads('0, -3, 1.5, 999, x'), []);
  assert.deepStrictEqual(r.parseLeads(''), []);
});

test('builds an all-day iCalendar event with one alarm per lead', () => {
  const ics = r.buildIcs({ title: 'Texas report; franchise', due: '2027-05-15', leads: [30, 7], repeatYears: 1, stamp: '2026-11-20T00:00:00.000Z' });
  assert.match(ics, /DTSTART;VALUE=DATE:20270515\r\n/);
  assert.match(ics, /DTEND;VALUE=DATE:20270516\r\n/);
  assert.ok(ics.includes('SUMMARY:Texas report' + String.fromCharCode(92) + '; franchise' + String.fromCharCode(13, 10)), 'escaped summary');
  assert.match(ics, /RRULE:FREQ=YEARLY\r\n/);
  assert.strictEqual((ics.match(/BEGIN:VALARM/g) || []).length, 2);
  assert.match(ics, /TRIGGER:-P30D/);
  assert.match(ics, /DTSTAMP:20261120T000000Z/);
  assert.strictEqual(r.buildIcs({ due: 'nope' }), null);
});
