import { parse, Component, Event } from "ical.js";

const fiveMinutes = 5 * 60 * 1000;

async function task() {
  console.log("start", new Date());

  console.log("parsing", new Date());
  const res = await fetch(
    // URL of private URL of the target calendar
    "https://calendar.google.com/calendar/ical/example%40example.com/private-foobar/basic.ics"
  );
  const ical = await res.text();
  const jcal = parse(ical);
  const vevents = new Component(jcal).getAllSubcomponents("vevent");
  console.log("parsed", new Date());

  const now = Date.now();
  const fiveMinutesLater = now + fiveMinutes;

  for (const vevent of vevents) {
    const meetURL = vevent.getFirstPropertyValue("x-google-conference");
    if (!meetURL) {
      continue;
    }

    const event = new Event(vevent);
    const start = event.startDate.toJSDate().getTime();
    const summary = event.summary;

    if (now <= start && start <= fiveMinutesLater) {
      console.log(summary, new Date(start).toLocaleString());
    }

    if (event.isRecurring()) {
      const iterator = event.iterator();
      let next;

      while ((next = iterator.next())) {
        const nextStart = event
          .getOccurrenceDetails(next)
          .startDate.toJSDate()
          .getTime();

        if (nextStart > fiveMinutesLater) {
          break;
        }

        if (now <= nextStart && nextStart <= fiveMinutesLater) {
          console.log(
            summary,
            new Date(nextStart).toLocaleString(),
            `"${meetURL}"`
          );
          chrome.tabs.create({
            url: meetURL,
          });

          break;
        }
      }
    }
  }

  console.log("finish", new Date());
}

chrome.alarms.onAlarm.addListener(async function(alarm) {
  if (alarm.name == "maat") {
    await task();
  }
});

function register() {
  const start =
    Math.floor(Date.now() / fiveMinutes) * fiveMinutes + fiveMinutes / 2;
  chrome.alarms.create("maat", {
    when: start,
    periodInMinutes: 5,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("onInstalled");
  register();
});
chrome.runtime.onStartup.addListener(() => {
  console.log("onStartup");
  register();
});
