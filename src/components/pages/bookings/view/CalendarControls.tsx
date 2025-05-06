import { Button } from "@/components/ui/button";
import {
    formatMonthYear,
    goToToday,
    nextDay,
    nextMonth,
    nextWeek,
    prevDay,
    prevMonth,
    prevWeek,
} from "@/components/pages/bookings/view/bookingViewHelpers";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SelectCalendarViewType } from "./SelectCalendarViewType";
import { Dispatch, SetStateAction } from "react";

interface CalendarControlsProps {
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  currentDate: Date;
  viewType: "dia" | "semana" | "mes";
  setViewType: Dispatch<SetStateAction<"dia" | "semana" | "mes">>;
}

export function CalendarControls({
    currentDate,
    setCurrentDate,
    viewType,
    setViewType,
}: CalendarControlsProps) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Button
                    variant="outlineMobile"
                    size="icon"
                    onClick={ () => {
                        if (viewType === "dia") {
                            prevDay(currentDate, setCurrentDate);
                        } else if (viewType === "semana") {
                            prevWeek(currentDate, setCurrentDate);
                        } else if (viewType === "mes") {
                            prevMonth(currentDate, setCurrentDate);
                        }
                    } }
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outlineMobile"
                    onClick={ () => goToToday(setCurrentDate) }
                >
          Hoje
                </Button>
                <Button
                    variant="outlineMobile"
                    size="icon"
                    onClick={ () => {
                        if (viewType === "dia") {
                            nextDay(currentDate, setCurrentDate);
                        } else if (viewType === "semana") {
                            nextWeek(currentDate, setCurrentDate);
                        } else if (viewType === "mes") {
                            nextMonth(currentDate, setCurrentDate);
                        }
                    } }
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                    { formatMonthYear(currentDate) }
                </h2>
            </div>
            <div className="hidden md:flex items-center gap-2">
                <SelectCalendarViewType viewType={ viewType } setViewType={ setViewType } />
            </div>
        </div>
    );
}
