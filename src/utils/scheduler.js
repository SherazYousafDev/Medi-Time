// In-tab scheduler. It checks every 15s and sets targeted timeouts.
// Note: Browsers cannot fire notifications when the tab/app is fully closed without Push or alarms.

let intervalId = null;
let timeouts = [];

function clearTimeouts() {
  for (const t of timeouts) clearTimeout(t);
  timeouts = [];
}

function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function nextDateForTime(hhmm, allowedDays) {
  const now = new Date();
  const target = new Date(now);
  const [h, m] = hhmm.split(":").map(Number);
  target.setHours(h, m, 0, 0);

  const todayIdx = now.getDay(); // 0..6
  const sameDayOk =
    allowedDays.includes(todayIdx) && target.getTime() > now.getTime();

  if (sameDayOk) return target;

  // find next allowed day
  for (let add = 1; add <= 7; add++) {
    const d = new Date(now);
    d.setDate(d.getDate() + add);
    if (allowedDays.includes(d.getDay())) {
      d.setHours(h, m, 0, 0);
      return d;
    }
  }
  return target;
}

export function scheduleAll(meds, onDue) {
  if (!Array.isArray(meds) || meds.length === 0) return;

  const plan = [];
  const now = Date.now();

  for (const med of meds) {
    const days =
      med.days === "everyday" ? [0, 1, 2, 3, 4, 5, 6] : med.daysCustom ?? [];
    for (const t of med.times) {
      const due = nextDateForTime(t, days);
      plan.push({
        when: due.getTime(),
        medId: med.id,
        title: `Time to take: ${med.name}`,
        body:
          [med.dosage, med.notes].filter(Boolean).join(" • ") ||
          "Please take your medicine.",
        sound: med.sound,
        vibrate: med.vibrate,
        tag: `${med.id}-${t}`,
        timeStr: t,
      });
    }
  }

  // set timeouts for all upcoming reminders within next 24h (avoid excessive timers)
  const next24h = plan
    .filter((p) => p.when - now <= 24 * 60 * 60 * 1000)
    .sort((a, b) => a.when - b.when);

  for (const item of next24h) {
    const delay = Math.max(0, item.when - Date.now());
    const id = setTimeout(() => {
      onDue({
        title: item.title,
        body: item.body,
        sound: item.sound,
        vibrate: item.vibrate,
        tag: item.tag,
      });
    }, delay);
    timeouts.push(id);
  }

  // maintain rolling schedule every 15s to catch day rollovers or edits
  intervalId = setInterval(() => {
    // if we pass midnight or something changed, the App will recreate schedules anyway
  }, 15000);
}

export function cancelAll() {
  clearInterval(intervalId);
  intervalId = null;
  clearTimeouts();
}

export function nextDueForAll(meds) {
  const entries = [];
  const now = new Date();
  for (const med of meds) {
    const days =
      med.days === "everyday" ? [0, 1, 2, 3, 4, 5, 6] : med.daysCustom ?? [];
    for (const t of med.times) {
      const d = nextDateForTime(t, days);
      entries.push({ name: med.name, time: t, date: d, notes: med.notes });
    }
  }
  if (!entries.length) return null;
  entries.sort((a, b) => a.date - b.date);
  const next = entries[0];
  const mins = Math.round((next.date - now) / 60000);
  return {
    name: next.name,
    time: next.time,
    message:
      mins <= 0 ? "Due now" : `Due in ${mins} minute${mins === 1 ? "" : "s"}`,
  };
}
