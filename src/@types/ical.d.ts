const opaqueSymbol: unique symbol;

declare module "ical.js" {
  declare type JCal = { readonly [opaqueSymbol]: "JCal" };

  declare class Time {
    toJSDate(): Date;
  }

  declare class Component {
    jCal: JCal;
    constructor(jcal: JCal);

    getAllSubcomponents(name: string): Component[];
    getFirstPropertyValue(name: string): string | null;
  }

  declare class Event {
    component: Component;
    attendees: Property[];

    uid: string | null;
    recurrenceId: Time | null;
    summary: string | null;
    startDate: Time | null;

    constructor(component: Component);
    isRecurring(): boolean;
    iterator(): RecurExpansion;
    getOccurrenceDetails(time: Time): OccurrenceDetails;
  }

  declare class OccurrenceDetails {
    startDate: Time;
  }

  declare class RecurExpansion {
    next(): Time;
  }

  declare class Propery {
    getFirstValue(): string;
    getParameter(name: string): string;
  }

  declare function parse(input: string): JCal;
}
