"use client";

import { cn } from "@/lib/utils";
import {
  formatTime,
  getMonthDays,
  isSameDay,
  isToday,
  CalendarEvent,
  getEventBasicInfo,
  isDateInRange,
} from "./bookingViewHelpers";
import { CalendarMonthHeader } from "./CalendarMonthHeader";
import { MobileMonthView } from "./MobileMonthView";

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
        events={ events }
        currentDate={ currentDate }
        openDetails={ openDetails }
      />
      <div className="hidden md:block min-w-full">
        <CalendarMonthHeader />

        <div className="grid grid-cols-7">
          {daysInCurrentMonth.map((day, index) => {
            const dayEvents = events.filter((event) => {
              const { startDate, endDate } = getEventBasicInfo(event);
              return isDateInRange(day, startDate, endDate);
            });

            const isCurrentMonth = day.getMonth() === currentDate.getMonth();

            return (
              <div
                key={ index }
                className={ cn(
                  "min-h-[200px] border-r border-b p-1 relative",
                  isToday(day) ? "bg-primary/90" : "",
                  !isCurrentMonth ? "bg-gray-100 text-red-300" : "",
                ) }
              >
                <div
                  className={ cn(
                    "text-right p-1 font-medium text-sm",
                    isToday(day) ? "text-white font-extrabold" : "",
                  ) }
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
                        isBirthday,
                        isNotice,
                        id,
                        title,
                        durationInHours,
                        startDate,
                        paymentStatus,
                        isPast,
                      } = getEventBasicInfo(event);

                      const isCheckout =
                        !isTraining && !isBirthday && !isNotice;
                      const isPaid = paymentStatus === "Pago";
                      const isOverdue = isPast && !isPaid;

                      let dotClass = "bg-gray-400";
                      let containerClass =
                        "bg-gray-100 text-gray-700 border-gray-400";

                      if (isCheckout) {
                        if (durationInHours >= 8 && durationInHours <= 12) {
                          dotClass = "bg-green-500";
                          containerClass =
                            "bg-green-100 text-green-700 border-green-300";
                        } else if (durationInHours === 4) {
                          dotClass = "bg-yellow-300"; // Light Yellow
                          containerClass =
                            "bg-yellow-50 text-yellow-900 border-yellow-200";
                        } else if (
                          durationInHours >= 5 &&
                          durationInHours <= 6
                        ) {
                          dotClass = "bg-yellow-600"; // Dark Yellow
                          containerClass =
                            "bg-yellow-200 text-yellow-900 border-yellow-400";
                        }

                        // Override background if Paid or Overdue
                        if (isPaid) {
                          containerClass =
                            "bg-green-800 text-white border-green-900";
                        } else if (isOverdue) {
                          containerClass =
                            "bg-red-800 text-white border-red-900";
                        }
                      }

                      return (
                        <div
                          key={ id }
                          className={ cn(
                            "p-1 rounded border-l-2",
                            isTraining
                              ? "bg-purple-500 dark:bg-purple-900/20 text-white dark:text-purple-300 border-purple-500 text-sm truncate cursor-pointer"
                              : isNotice
                                ? "bg-blue-800 text-white border-blue-900 text-sm truncate cursor-pointer"
                                : isBirthday
                                  ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-500 text-sm font-semibold whitespace-normal h-auto"
                                  : cn(
                                    containerClass,
                                    "flex items-center gap-1 text-sm cursor-pointer truncate",
                                  ),
                          ) }
                          onClick={ () => openDetails(event) }
                          title={ `${
                            !isBirthday ? formatTime(startDate) + " - " : ""
                          }${title}` }
                        >
                          {isCheckout && (
                            <div
                              className={ cn(
                                "w-2 h-2 rounded-full shrink-0",
                                dotClass,
                              ) }
                            />
                          )}
                          <div className={ cn(isCheckout ? "truncate" : "") }>
                            {!isBirthday && !isNotice && (
                              <>{formatTime(startDate)} - </>
                            )}
                            {title}
                          </div>
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
