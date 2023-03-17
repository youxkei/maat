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
    getFirstPropertyValue(name: string): string;
  }

  declare class Event {
    component: Component;
    summary: string;
    startDate: Time;

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

  declare function parse(input: string): JCal;
}
