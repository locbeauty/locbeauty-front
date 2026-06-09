"use client";

import {
  workingHours,
  groupOverlappingEvents,
  isSameDay,
  CalendarEvent,
  getEventBasicInfo,
} from "./bookingViewHelpers";
import { MobileDayView } from "./MobileDayView";
import { CalendarDayHeader } from "./CalendarDayHeader";
import { CalendarNoticesBand } from "./CalendarNoticesBand";
import { SingleEventBox } from "./SingleEventBox";
import { MultipleEventBox } from "./MultipleEventBox";
import { Notice } from "@/utils/@types/notice";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  openDetails: (_event: CalendarEvent) => void;
}

export function DayView({ currentDate, events, openDetails }: DayViewProps) {
  const dayEvents = events.filter((event) => {
    const { startDate } = getEventBasicInfo(event);
    return isSameDay(startDate, currentDate);
  });

  // Avisos vão para uma faixa própria no topo, fora da grade de horários.
  const notices = events.filter(
    (event) => "noticeId" in event,
  ) as Notice[];
  const dayTimeEvents = dayEvents.filter((event) => !("noticeId" in event));

  const eventGroups = groupOverlappingEvents(dayTimeEvents);

  return (
    <>
      <MobileDayView
        events={ dayEvents }
        currentDate={ currentDate }
        openDetails={ openDetails }
      />

      <div className="hidden md:block min-w-full">
        <CalendarDayHeader currentDate={ currentDate } />

        <CalendarNoticesBand
          days={ [ currentDate ] }
          notices={ notices }
          openDetails={ openDetails }
          totalColumns={ 1 }
        />

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
            const { id: key } = getEventBasicInfo(firstEvent);

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
