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

interface MobileMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  openDetails: (_event: CalendarEvent) => void;
}

export function MobileMonthView({
    currentDate,
    events,
    openDetails,
}: MobileMonthViewProps) {
    const daysInCurrentMonth = getMonthDays(currentDate);

    return (
        <div className="md:hidden block min-w-full">
            <CalendarMonthHeader />

            <div className="grid grid-cols-7 gap-px bg-gray-200">
                {daysInCurrentMonth.map((day, index) => {
                    const dayEvents = events.filter((event) => {
                        const { startDate } = getEventBasicInfo(event);
                        return isSameDay(startDate, day);
                    });
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                        <div
                            key={ index }
                            className={ cn(
                                "bg-white min-h-[80px] p-1 relative flex flex-col",
                                isToday(day) && "bg-primary/5",
                                !isCurrentMonth && "bg-gray-50 text-gray-400"
                            ) }
                        >
                            <div
                                className={ cn(
                                    "text-xs font-medium mb-1 text-center",
                                    isToday(day) && "text-primary font-bold",
                                    !isCurrentMonth && "text-gray-400"
                                ) }
                            >
                                {day.getDate()}
                            </div>

                            <div className="flex-1 space-y-0.5">
                                {dayEvents.length > 0 && (
                                    <>
                                        {dayEvents.slice(0, 2).map((event) => {
                                            const {
                                                isTraining,
                                                isBirthday,
                                                id,
                                                title,
                                                durationInHours,
                                                startDate,
                                            } = getEventBasicInfo(event);

                                            return (
                                                <div
                                                    key={ id }
                                                    className={ cn(
                                                        "h-1.5 rounded-full transition-all hover:h-2",
                                                        !isBirthday && "cursor-pointer",
                                                        isTraining
                                                            ? "bg-blue-400"
                                                            : isBirthday
                                                                ? "bg-green-400"
                                                                : cn(
                                                                    "bg-gray-400",
                                                                    durationInHours === 4 && "bg-blue-400",
                                                                    durationInHours === 6 && "bg-green-400",
                                                                    durationInHours >= 8 &&
                                    durationInHours <= 12 &&
                                    "bg-purple-400"
                                                                )
                                                    ) }
                                                    onClick={ () => openDetails(event) }
                                                    title={ `${
                                                        !isBirthday ? formatTime(startDate) + " - " : ""
                                                    }${title}` }
                                                />
                                            );
                                        })}

                                        {dayEvents.length > 2 && (
                                            <div className="text-[10px] text-gray-500 text-center font-medium">
                        +{dayEvents.length - 2} mais
                                            </div>
                                        )}
                                    </>
                                )}

                                {dayEvents.length > 0 && (
                                    <div className="sm:hidden flex justify-center mt-1">
                                        <div className="flex space-x-0.5">
                                            {Array.from({
                                                length: Math.min(dayEvents.length, 4),
                                            }).map((_, i) => (
                                                <div
                                                    key={ i }
                                                    className={ cn(
                                                        "w-1 h-1 rounded-full",
                                                        dayEvents[i] ? "bg-primary" : "bg-gray-300"
                                                    ) }
                                                />
                                            ))}
                                            {dayEvents.length > 4 && (
                                                <div className="text-[8px] text-gray-500 ml-1">+</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-700 mb-2">Legenda:</div>
                <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-1.5 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-600">Treinamento / 4h</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="text-gray-600">6h</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-1.5 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-600">8-12h</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-1.5 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-600">Outros</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
