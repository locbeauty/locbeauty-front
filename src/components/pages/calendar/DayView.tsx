"use client";

import {
    workingHours,
    groupOverlappingEvents,
    isSameDay,
    CalendarEvent,
} from "./bookingViewHelpers";
import { MobileDayView } from "./MobileDayView";
import { CalendarDayHeader } from "./CalendarDayHeader";
import { SingleEventBox } from "./SingleEventBox";
import { MultipleEventBox } from "./MultipleEventBox";
import { Checkout } from "@/utils/@types/checkouts";
import { Training } from "@/utils/@types/training";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  openDetails: (_event: CalendarEvent) => void;
}

export function DayView({ currentDate, events, openDetails }: DayViewProps) {
    const dayEvents = events.filter((event) => {
        const date =
      "trainingId" in event
          ? new Date((event as Training).dueDate)
          : new Date((event as Checkout).date);
        return isSameDay(date, currentDate);
    });

    const eventGroups = groupOverlappingEvents(dayEvents);

    return (
        <>
            <MobileDayView
                events={ dayEvents }
                currentDate={ currentDate }
                openDetails={ openDetails }
            />

            <div className="hidden md:block min-w-full">
                <CalendarDayHeader currentDate={ currentDate } />

                <div className="relative">
                    {workingHours.map((hour) => (
                        <div
                            key={ hour }
                            className="grid grid-cols-2 border-b h-[64px]"
                            style={ { gridTemplateColumns: "100px repeat(1, 1fr)" } }
                        >
                            <div className="p-2 border-r text-xs text-muted-foreground text-right pr-2">{`${hour}:00`}</div>
                            <div className="h-16 border-r relative"></div>
                        </div>
                    ))}

                    {eventGroups.flatMap((group) => {
                        const firstEvent = group[0];
                        const key =
              "trainingId" in firstEvent
                  ? (firstEvent as Training).trainingId
                  : (firstEvent as Checkout).checkoutId;

                        return group.length === 1 ? (
                            <SingleEventBox
                                key={ key }
                                dayIndex={ 0 }
                                group={ group }
                                openDetails={ openDetails }
                                totalColumns={ 1 }
                            />
                        ) : (
                            <MultipleEventBox
                                key={ key }
                                dayIndex={ 0 }
                                group={ group }
                                openDetails={ openDetails }
                                totalColumns={ 1 }
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );
}
