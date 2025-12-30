import {
    getDayIndex,
    getWeekDays,
    groupOverlappingEvents,
    isAgendamentoInWeek,
    workingHours,
    CalendarEvent,
} from "./bookingViewHelpers";
import { CalendarWeekHeader } from "./CalendarWeekHeader";
import { MultipleEventBox } from "./MultipleEventBox";
import { SingleEventBox } from "./SingleEventBox";
import { MobileWeekView } from "./MobileWeekView";
import { Checkout } from "@/utils/@types/checkouts";
import { Training } from "@/utils/@types/training";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  openDetails: (_event: CalendarEvent) => void;
}

export function WeekView({ currentDate, events, openDetails }: WeekViewProps) {
    const weekDays = getWeekDays(currentDate);

    return (
        <>
            <MobileWeekView
                events={ events }
                currentDate={ currentDate }
                openDetails={ openDetails }
            />
            <div className="hidden md:block min-w-full">
                <CalendarWeekHeader weekDays={ weekDays } />

                <div className="relative">
                    {workingHours.map((hour) => (
                        <div
                            key={ hour }
                            className="grid border-b h-[64px]"
                            style={ { gridTemplateColumns: "100px repeat(7, 1fr)" } }
                        >
                            <div className="p-2 border-r text-xs text-muted-foreground text-right pr-2">{`${hour}:00`}</div>
                            {weekDays.map((_, dayIndex) => (
                                <div key={ dayIndex } className="h-16 border-r relative" />
                            ))}
                        </div>
                    ))}

                    {(() => {
                        // Agrupa bookings por dia
                        const eventsByDay: Record<number, CalendarEvent[]> = {};
                        events.forEach((event) => {
                            if (!isAgendamentoInWeek(event, weekDays)) return;
                            const date =
                "trainingId" in event
                    ? new Date(event.dueDate)
                    : new Date(event.date);
                            const dayIndex = getDayIndex(date, weekDays);
                            if (dayIndex === -1) return;

                            if (!eventsByDay[dayIndex]) eventsByDay[dayIndex] = [];
                            eventsByDay[dayIndex].push(event);
                        });

                        return Object.entries(eventsByDay).flatMap(
                            ([ dayIndexStr, dayEvents ]) => {
                                const dayIndex = Number(dayIndexStr);

                                // Agrupa eventos sobrepostos
                                const eventGroups = groupOverlappingEvents(dayEvents);
                                return eventGroups?.flatMap((group) => {
                                    const firstEvent = group[0];
                                    const key =
                    "trainingId" in firstEvent
                        ? (firstEvent as Training).trainingId
                        : (firstEvent as Checkout).checkoutId;

                                    return group.length === 1 ? (
                                        <SingleEventBox
                                            key={ key }
                                            dayIndex={ dayIndex }
                                            group={ group }
                                            openDetails={ openDetails }
                                        />
                                    ) : (
                                        <MultipleEventBox
                                            key={ key }
                                            dayIndex={ dayIndex }
                                            group={ group }
                                            openDetails={ openDetails }
                                        />
                                    );
                                });
                            }
                        );
                    })()}
                </div>
            </div>
        </>
    );
}
