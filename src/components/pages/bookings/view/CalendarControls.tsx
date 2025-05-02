import { Button } from "@/components/ui/button";
import { formatMonthYear, goToToday, nextDay, nextWeek, prevDay, prevWeek } from "@/components/pages/bookings/view/bookingViewHelpers";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SelectCalendarViewType } from "./SelectCalendarViewType";
import { Dispatch, SetStateAction } from "react";

interface CalendarControlsProps {
    setCurrentDate: Dispatch<SetStateAction<Date>>
    currentDate: Date
    viewType: "dia" | "semana" | "mes"
    setViewType: Dispatch<SetStateAction<"dia" | "semana" | "mes">>
}

export function CalendarControls({ currentDate, setCurrentDate, viewType, setViewType }: CalendarControlsProps) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Button variant="outlineMobile" size="icon" onClick={ () => viewType === "dia" ? prevDay(currentDate, setCurrentDate) : prevWeek(currentDate, setCurrentDate) }>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outlineMobile" onClick={ () => goToToday(setCurrentDate) }>
                        Hoje
                </Button>
                <Button variant="outlineMobile" size="icon" onClick={ () => viewType === "dia" ? nextDay(currentDate, setCurrentDate) : nextWeek(currentDate, setCurrentDate) }>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">{ formatMonthYear(currentDate) }</h2>
            </div>
            <div className="hidden md:flex items-center gap-2">
                <SelectCalendarViewType viewType={ viewType } setViewType={ setViewType } />
            </div>
        </div>
    );
}