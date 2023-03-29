import { parseAndExtractMeetingsInTimeRange } from "./meeting";

const fiveMinutesMs = 5 * 60 * 1000;

async function openMeetUrl() {
  const storage = await chrome.storage.local.get(["account", "calendarUrl"]);
  const account = storage.account as string | undefined;
  const calendarUrl = storage.calendarUrl as string | undefined;

  if (!account || !calendarUrl) return;

  const nowMs = Date.now();
  const fiveMinutesLaterMs = nowMs + fiveMinutesMs;

  console.log("fetching");
  console.time("fetched");
  const ical = await fetch(calendarUrl).then((response) => response.text());
  console.timeEnd("fetched");

  console.log("parsing");
  console.time("parsed");
  const meetings = parseAndExtractMeetingsInTimeRange(
    ical,
    account,
    nowMs,
    fiveMinutesLaterMs
  );
  console.timeEnd("parsed");

  console.log("result:", meetings);

  for (const meeting of meetings) {
    const meetUrl = meeting.meetUrl;
    if (!meetUrl) continue;

    switch (meeting.attendance) {
      case "ACCEPTED":
        chrome.tabs.create({
          url: meetUrl,
        });
    }
  }
}

function createAlarm() {
  const oneMinuteMs = 2 * 60 * 1000;

  const start =
    Math.floor(Date.now() / fiveMinutesMs) * fiveMinutesMs + oneMinuteMs;

  chrome.alarms.create("maat", {
    when: start,
    periodInMinutes: 5,
  });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name == "maat") {
    await openMeetUrl();
  }
});

chrome.runtime.onInstalled.addListener(() => {
  createAlarm();
});
chrome.runtime.onStartup.addListener(() => {
  createAlarm();
});
