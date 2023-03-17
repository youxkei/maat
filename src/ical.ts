import ICal from "ical.js";

export type SummerizedEvent = {
  summary: string;
  startDate: Date;
  meetUrl: string;
};

function summerizeEvent(event: ICal.Event) {
  return {
    summary: event.summary,
    startDate: event.startDate.toJSDate(),
    meetUrl: event.component.getFirstPropertyValue("x-google-conference"),
  };
}

export function parseAndGetEventsInTimeRange(
  input: string,
  minDate: Date,
  maxDate: Date
) {
  const vevents = new ICal.Component(ICal.parse(input)).getAllSubcomponents(
    "vevent"
  );

  const eventsInTimeRange = [] as SummerizedEvent[];
  const minTime = minDate.getTime();
  const maxTime = maxDate.getTime();

  for (const vevent of vevents) {
    const event = new ICal.Event(vevent);
    const startTime = event.startDate.toJSDate().getTime();

    if (maxTime < startTime) {
      continue;
    }

    if (minTime <= startTime && startTime <= maxTime) {
      eventsInTimeRange.push(summerizeEvent(event));
      continue;
    }

    if (event.isRecurring()) {
      const iterator = event.iterator();
      let next;

      while ((next = iterator.next())) {
        const nextStartDate = event.getOccurrenceDetails(next).startDate;
        const nextStartTime = nextStartDate.toJSDate().getTime();

        if (maxTime < nextStartTime) {
          break;
        }

        if (minTime <= nextStartTime && nextStartTime <= maxTime) {
          event.startDate = nextStartDate;
          eventsInTimeRange.push(summerizeEvent(event));

          break;
        }
      }
    }
  }

  return eventsInTimeRange;
}
