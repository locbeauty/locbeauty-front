"use client";

import { cn } from "@/lib/utils";
import {
  formatTime,
  getMonthDays,
  isSameDay,
  isToday,
  CalendarEvent,
  getEventBasicInfo,
} from "./bookingViewHelpers";
import { CalendarMonthHeader } from "./CalendarMonthHeader";
import { MobileMonthView } from "./MobileMonthView";
import { Checkout } from "@/utils/@types/checkouts";
import { Training } from "@/utils/@types/training";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  openDetails: (_event: CalendarEvent) => void;
}

export function MonthView({
  currentDate,
  events,
  openDetails,
}: MonthViewProps) {
  const daysInCurrentMonth = getMonthDays(currentDate);

  return (
    <>
      <MobileMonthView
        events={events}
        currentDate={currentDate}
        openDetails={openDetails}
      />
      <div className="hidden md:block min-w-full">
        <CalendarMonthHeader />

        <div className="grid grid-cols-7">
          {daysInCurrentMonth.map((day, index) => {
            const dayEvents = events.filter((event) => {
              const { startDate } = getEventBasicInfo(event);
              return isSameDay(startDate, day);
            });

            const isCurrentMonth = day.getMonth() === currentDate.getMonth();

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[120px] border-r border-b p-1 relative max-h-[100px]",
                  dayEvents.length > 3 && "overflow-y-scroll",
                  isToday(day) ? "bg-primary/90" : "",
                  !isCurrentMonth ? "bg-gray-100 text-red-300" : ""
                )}
              >
                <div
                  className={cn(
                    "text-right p-1 font-medium text-sm",
                    isToday(day) ? "text-white font-extrabold" : ""
                  )}
                >
                  {day.getDate()}
                </div>

                <div className="space-y-1 mt-1">
                  {dayEvents
                    .sort((a, b) => {
                      const { startDate: dateA } = getEventBasicInfo(a);
                      const { startDate: dateB } = getEventBasicInfo(b);
                      return dateA.getTime() - dateB.getTime();
                    })
                    .map((event) => {
                      const {
                        isTraining,
                        id,
                        title,
                        durationInHours,
                        startDate,
                      } = getEventBasicInfo(event);

                      return (
                        <div
                          key={id}
                          className={cn(
                            "text-xs p-1 rounded border-l-2 cursor-pointer truncate",
                            isTraining
                              ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-500"
                              : cn(
                                  "bg-unknown-duration-background text-unknown-duration-text border-unknown-duration-border",
                                  durationInHours === 4 &&
                                    "bg-4h-duration-background text-4h-duration-text border-4h-duration-border",
                                  durationInHours === 6 &&
                                    "bg-6h-duration-background text-6h-duration-text border-6h-duration-border",
                                  durationInHours >= 8 &&
                                    durationInHours <= 12 &&
                                    "bg-8h-12h-duration-background text-8h-12h-duration-text border-8h-12h-duration-border"
                                )
                          )}
                          onClick={() => openDetails(event)}
                          title={`${formatTime(startDate)} - ${title}`}
                        >
                          {formatTime(startDate)} - {title}
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
