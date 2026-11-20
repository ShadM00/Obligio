/*
 * Renewal reminder dates, the same rule the Obligio app uses: a reminder a
 * fixed number of calendar days before the due date. No business-day
 * shifting: a reminder that lands on a weekend is flagged, not moved.
 * Pure functions, shared by the page and the tests.
 */
(function (root) {
  var DEFAULT_LEADS = [30, 14, 7, 1];
  var DAY = 86400000;
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /** "2027-03-15" -> UTC midnight ms, or null when it is not a real date. */
  function parseIsoDate(text) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text || '').trim());
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    var t = Date.UTC(y, mo - 1, d);
    var back = new Date(t);
    if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
    return t;
  }

  function iso(t) { return new Date(t).toISOString().slice(0, 10); }

  /** "30, 14, 7, 1" -> [30, 14, 7, 1]: whole days 1..730, unique, largest first. */
  function parseLeads(text) {
    var seen = {};
    var out = [];
    String(text == null ? '' : text).split(/[\s,;]+/).forEach(function (part) {
      if (!/^\d+$/.test(part)) return;
      var n = +part;
      if (n >= 1 && n <= 730 && !seen[n]) { seen[n] = true; out.push(n); }
    });
    return out.sort(function (a, b) { return b - a; });
  }

  /**
   * Reminder dates for a due date. `today` (ISO) marks the ones already past.
   * Returns null when the due date is not a real date.
   */
  function reminderPlan(dueIso, leads, todayIso) {
    var due = parseIsoDate(dueIso);
    if (due === null) return null;
    var today = todayIso ? parseIsoDate(todayIso) : null;
    var list = (leads && leads.length ? leads : DEFAULT_LEADS).slice().sort(function (a, b) { return b - a; });
    return {
      due: iso(due),
      dueWeekday: WEEKDAYS[new Date(due).getUTCDay()],
      daysUntilDue: today === null ? null : Math.round((due - today) / DAY),
      reminders: list.map(function (lead) {
        var t = due - lead * DAY;
        var day = new Date(t).getUTCDay();
        return {
          lead: lead,
          date: iso(t),
          weekday: WEEKDAYS[day],
          weekend: day === 0 || day === 6,
          passed: today !== null && t < today,
        };
      }),
    };
  }

  function icsEscape(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
  }

  /**
   * An all-day iCalendar event on the due date with one alarm per lead.
   * repeatYears: 0 for none, 1 yearly, 2 every two years.
   */
  function buildIcs(opts) {
    var due = parseIsoDate(opts.due);
    if (due === null) return null;
    var title = (opts.title || 'Business deadline').slice(0, 120);
    var next = iso(due + DAY).replace(/-/g, '');
    var stamp = (opts.stamp || new Date().toISOString()).replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Obligio//Renewal reminder calculator//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + iso(due).replace(/-/g, '') + '-' + Math.abs(hash(title)) + '@obligio.com',
      'DTSTAMP:' + stamp,
      'DTSTART;VALUE=DATE:' + iso(due).replace(/-/g, ''),
      'DTEND;VALUE=DATE:' + next,
      'SUMMARY:' + icsEscape(title),
      'DESCRIPTION:' + icsEscape('Due date added with the Obligio renewal reminder calculator. Check the issuing authority for the current rules.'),
    ];
    if (opts.repeatYears === 1) lines.push('RRULE:FREQ=YEARLY');
    if (opts.repeatYears === 2) lines.push('RRULE:FREQ=YEARLY;INTERVAL=2');
    (opts.leads && opts.leads.length ? opts.leads : DEFAULT_LEADS).forEach(function (lead) {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEscape(title + ' is due in ' + lead + (lead === 1 ? ' day' : ' days')), 'TRIGGER:-P' + lead + 'D', 'END:VALARM');
    });
    lines.push('END:VEVENT', 'END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
  }

  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h;
  }

  var api = { DEFAULT_LEADS: DEFAULT_LEADS, parseIsoDate: parseIsoDate, parseLeads: parseLeads, reminderPlan: reminderPlan, buildIcs: buildIcs };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ObligioReminders = api;
})(this);
