(function () {
  var R = window.ObligioReminders;
  var form = document.getElementById('reminder-tool');
  var out = document.getElementById('rt-result');
  if (!R || !form || !out) return;
  var f = form.elements;
  var params = new URLSearchParams(location.search);
  if (params.get('title')) f.title.value = params.get('title').slice(0, 120);
  if (params.get('due') && R.parseIsoDate(params.get('due')) !== null) f.due.value = params.get('due');

  function todayIso() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function el(tag, text, cls) { var n = document.createElement(tag); if (text != null) n.textContent = text; if (cls) n.className = cls; return n; }
  function pretty(isoDate, weekday) {
    var p = isoDate.split('-');
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return weekday + ' ' + (+p[2]) + ' ' + months[+p[1] - 1] + ' ' + p[0];
  }

  function render() {
    out.textContent = '';
    var due = f.due.value;
    if (!due) { out.appendChild(el('p', 'Enter a due date to see the reminder dates.', 'note')); return; }
    var leads = R.parseLeads(f.leads.value);
    if (!leads.length) { out.appendChild(el('p', 'Enter at least one whole number of days, from 1 to 730.', 'error')); return; }
    var plan = R.reminderPlan(due, leads, todayIso());
    if (!plan) { out.appendChild(el('p', 'That is not a real date. Use the date picker or the format YYYY-MM-DD.', 'error')); return; }
    var title = f.title.value.trim() || 'Business deadline';
    var head = el('p', null, 'answer');
    var when = plan.daysUntilDue === 0 ? 'today' : plan.daysUntilDue > 0 ? 'in ' + plan.daysUntilDue + (plan.daysUntilDue === 1 ? ' day' : ' days') : plan.daysUntilDue * -1 + ' days ago';
    head.textContent = title + ' is due ' + pretty(plan.due, plan.dueWeekday) + ' (' + when + ').';
    out.appendChild(head);
    var table = el('table', null, 'grid');
    var thead = table.createTHead().insertRow();
    ['Reminder', 'Date', ''].forEach(function (t) { var th = el('th', t); th.scope = 'col'; thead.appendChild(th); });
    var body = table.createTBody();
    plan.reminders.forEach(function (r) {
      var row = body.insertRow();
      row.insertCell().textContent = r.lead + (r.lead === 1 ? ' day before' : ' days before');
      row.insertCell().textContent = pretty(r.date, r.weekday);
      row.insertCell().textContent = r.passed ? 'Already passed' : r.weekend ? 'Weekend' : '';
    });
    var wrap = el('div', null, 'wrap'); wrap.appendChild(table); out.appendChild(wrap);
    var repeat = +f.repeat.value;
    var ics = R.buildIcs({ title: title, due: plan.due, leads: leads, repeatYears: repeat });
    var actions = el('div', null, 'actions');
    var dl = el('a', 'Download calendar file (.ics)', 'button');
    dl.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    dl.download = title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase().slice(0, 60) + '.ics';
    actions.appendChild(dl);
    var next = new Date(Date.parse(plan.due + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10).replace(/-/g, '');
    var g = el('a', 'Add to Google Calendar', 'textlink');
    g.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) +
      '&dates=' + plan.due.replace(/-/g, '') + '/' + next +
      (repeat ? '&recur=' + encodeURIComponent('RRULE:FREQ=YEARLY' + (repeat === 2 ? ';INTERVAL=2' : '')) : '');
    g.target = '_blank'; g.rel = 'noopener';
    actions.appendChild(g);
    out.appendChild(actions);
    out.appendChild(el('p', 'The calendar file includes an alert for each reminder. Google Calendar links carry the date only; set alerts there yourself.', 'note'));
  }
  form.addEventListener('submit', function (ev) { ev.preventDefault(); render(); });
  form.addEventListener('reset', function () { setTimeout(function () { out.textContent = ''; }, 0); });
  if (f.due.value) render();
})();
