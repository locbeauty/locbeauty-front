"use client";

import { cn } from "@/lib/utils";
import {
    formatTime,
    getMonthDays,
    isSameDay,
    isToday,
    CalendarEvent,
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
                events={ events }
                currentDate={ currentDate }
                openDetails={ openDetails }
            />
            <div className="hidden md:block min-w-full">
                <CalendarMonthHeader />

                <div className="grid grid-cols-7">
                    {daysInCurrentMonth.map((day, index) => {
                        const dayEvents = events.filter((event) => {
                            const date =
                "trainingId" in event
                    ? new Date((event as Training).dueDate)
                    : new Date((event as Checkout).date);
                            return isSameDay(date, day);
                        });

                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                        return (
                            <div
                                key={ index }
                                className={ cn(
                                    "min-h-[120px] border-r border-b p-1 relative max-h-[100px]",
                                    dayEvents.length > 3 && "overflow-y-scroll",
                                    isToday(day) ? "bg-primary/90" : "",
                                    !isCurrentMonth ? "bg-gray-100 text-red-300" : ""
                                ) }
                            >
                                <div
                                    className={ cn(
                                        "text-right p-1 font-medium text-sm",
                                        isToday(day) ? "text-white font-extrabold" : ""
                                    ) }
                                >
                                    {day.getDate()}
                                </div>

                                <div className="space-y-1 mt-1">
                                    {dayEvents
                                        .sort((a, b) => {
                                            const dateA =
                        "trainingId" in a
                            ? new Date((a as Training).dueDate)
                            : new Date((a as Checkout).date);
                                            const dateB =
                        "trainingId" in b
                            ? new Date((b as Training).dueDate)
                            : new Date((b as Checkout).date);

                                            // Ideally we sort by time if possible, but Training date includes time if `hourInMinutes` is applied.
                                            // Let's assume date object is not enough for checkout since it is just YYYY-MM-DD usually (or ISO timestamp).
                                            // But for sort, we can construct full Date object.

                                            const getFullDate = (evt: CalendarEvent, d: Date) => {
                                                const fullDate = new Date(d);
                                                if ("trainingId" in evt) {
                                                    const t = evt as Training;
                                                    fullDate.setHours(Math.floor(t.hourInMinutes / 60));
                                                    fullDate.setMinutes(t.hourInMinutes % 60);
                                                } else {
                                                    const c = evt as Checkout;
                                                    fullDate.setHours(
                                                        Math.floor(c.startHourInMinutes / 60)
                                                    );
                                                    fullDate.setMinutes(c.startHourInMinutes % 60);
                                                }
                                                return fullDate;
                                            };

                                            return (
                                                getFullDate(a, dateA).getTime() -
                        getFullDate(b, dateB).getTime()
                                            );
                                        })
                                        .map((event) => {
                                            const isTraining = "trainingId" in event;
                                            let durationInHours = 0;
                                            let startDate: Date;
                                            let title = "";
                                            let key = "";

                                            if (isTraining) {
                                                const training = event as Training;
                                                key = training.trainingId;
                                                durationInHours = 2; // Default
                                                startDate = new Date(training.dueDate);
                                                startDate.setHours(
                                                    Math.floor(training.hourInMinutes / 60)
                                                );
                                                startDate.setMinutes(training.hourInMinutes % 60);
                                                title = training.Gear.gearName;
                                            } else {
                                                const checkout = event as Checkout;
                                                key = checkout.checkoutId;
                                                durationInHours = checkout.totalDurationInMinutes / 60;
                                                startDate = new Date(checkout.date);
                                                startDate.setHours(
                                                    Math.floor(checkout.startHourInMinutes / 60)
                                                );
                                                startDate.setMinutes(checkout.startHourInMinutes % 60);
                                                title = checkout.Bookings.filter(
                                                    (b) => b.status === "ACTIVE"
                                                )
                                                    .map((b) => b.Gear.gearName)
                                                    .join(", ");
                                            }

                                            return (
                                                <div
                                                    key={ key }
                                                    className={ cn(
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
                                                    ) }
                                                    onClick={ () => openDetails(event) }
                                                    title={ `${formatTime(startDate)} - ${title}` }
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
