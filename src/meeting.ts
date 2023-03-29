import ICal from "ical.js";

export type Attendance =
  | "SOLO"
  | "ACCEPTED"
  | "DECLINED"
  | "TENTATIVE"
  | "NEEDS-ACTION";

export type Meeting = {
  id: string;
  summary: string;
  startDate: Date;
  attendance: Attendance;

  recurrenceId?: Date;
  meetUrl?: string;
};

function eventToMeeting(event: ICal.Event, account: string) {
  const mailto = `mailto:${account}`;
  let attendance: Attendance = "SOLO";

  for (const atendee of event.attendees) {
    if (atendee.getFirstValue() == mailto) {
      attendance = atendee.getParameter("partstat") as Attendance;
      break;
    }
  }

  return {
    id: event.uid!,
    summary: event.summary!,
    startDate: event.startDate!.toJSDate(),
    source: event.component.jCal,
    attendance,

    recurrenceId: event.recurrenceId?.toJSDate(),
    meetUrl:
      event.component.getFirstPropertyValue("x-google-conference") ?? undefined,
  };
}

export function parseAndExtractMeetingsInTimeRange(
  input: string,
  account: string,
  minTimeMs: number,
  maxTimeMs: number
) {
  const vevents = new ICal.Component(ICal.parse(input)).getAllSubcomponents(
    "vevent"
  );

  const meetings = [] as Meeting[];
  for (const vevent of vevents) {
    const event = new ICal.Event(vevent);
    const startTimeMs = event.startDate!.toJSDate().getTime();

    if (maxTimeMs < startTimeMs) {
      continue;
    }

    if (event.isRecurring()) {
      const iterator = event.iterator();
      let next;

      while ((next = iterator.next())) {
        const nextStartDate = event.getOccurrenceDetails(next).startDate;
        const nextStartTimeMs = nextStartDate.toJSDate().getTime();

        if (maxTimeMs < nextStartTimeMs) {
          break;
        }

        if (minTimeMs <= nextStartTimeMs && nextStartTimeMs <= maxTimeMs) {
          event.startDate = nextStartDate;
          meetings.push(eventToMeeting(event, account));

          break;
        }
      }
    } else {
      if (minTimeMs <= startTimeMs && startTimeMs <= maxTimeMs) {
        meetings.push(eventToMeeting(event, account));
      }
    }
  }

  const meetingMap = new Map<string, Meeting>();
  for (const meeting of meetings) {
    if (meetingMap.has(meeting.id)) {
      if (meeting.recurrenceId) {
        meetingMap.set(meeting.id, meeting);
      }
    } else {
      meetingMap.set(meeting.id, meeting);
    }
  }

  return [...meetingMap]
    .map(([_, meeting]) => meeting)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}
